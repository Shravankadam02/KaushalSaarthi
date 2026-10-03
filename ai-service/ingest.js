import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantClient } from '@qdrant/js-client-rest';
import csv from 'csv-parser';
import { generateEmbedding } from './services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'vocational_kb';
const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM || 768);

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

function readCsvRows(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

export async function ingest() {
  console.log('Setting up Qdrant collection...');

  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

  if (exists) {
    await qdrant.deleteCollection(COLLECTION_NAME);
    console.log('Cleared existing collection.');
  }

  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: EMBEDDING_DIM,
      distance: 'Cosine',
    },
  });
  await qdrant.createPayloadIndex(COLLECTION_NAME, {
    field_name: 'language',
    field_schema: 'keyword',
  });

  let pointId = 1;
  const points = [];

  // Read Trades
  const tradesPath = path.join(__dirname, '../server/data/demo_trades.csv');
  const tradeRows = await readCsvRows(tradesPath);
  for (const row of tradeRows) {
    const text = `Trade: ${row['Trade']}. Description: ${row['Description']}. Eligibility: ${row['Eligibility']}. Course Duration: ${row['Course Duration']}. NSQF Level: ${row['NSQF Level']}. Job Roles: ${row['Job Roles']}. Progression Pathway: ${row['Progression Pathway']}. Further Education: ${row['Further Education']}.`;
    const vector = await generateEmbedding(text);
    points.push({
      id: pointId++,
      vector,
      payload: {
        topic: row['Trade'],
        type: 'trade',
        language: 'en',
        text,
        source: 'Demo Dataset',
      },
    });
  }

  // Read Outcomes
  const outcomesPath = path.join(__dirname, '../server/data/demo_outcomes.csv');
  const outcomeRows = await readCsvRows(outcomesPath);
  for (const row of outcomeRows) {
    const text = `Outcome Data for Trade: ${row['Trade']}. Provider: ${row['Provider']}, Location: ${row['Location']}. Placement Rate: ${row['Placement Rate']}%. Reported Earnings Range: ₹${row['Earnings Min']} to ₹${row['Earnings Max']} per month. Sample Size: ${row['Sample Size']}. Source: ${row['Source']}.`;
    const vector = await generateEmbedding(text);
    points.push({
      id: pointId++,
      vector,
      payload: {
        topic: row['Trade'],
        type: 'outcome',
        language: 'en',
        text,
        source: row['Source'],
      },
    });
  }

  console.log(`Uploading ${points.length} points to Qdrant...`);

  await qdrant.upsert(COLLECTION_NAME, { points });

  console.log(`Ingestion complete. ${points.length} chunks indexed.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ingest().catch((err) => {
    console.error('Ingestion failed:', err);
    process.exit(1);
  });
}