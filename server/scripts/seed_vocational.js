import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import connectDB from '../config/db.js';
import Trade from '../models/Trade.js';
import OutcomeData from '../models/OutcomeData.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedVocationalData = async () => {
  await connectDB();
  
  await Trade.deleteMany({});
  await OutcomeData.deleteMany({});
  console.log('Cleared existing trades and outcomes');

  const tradesMap = new Map();

  // Read Trades
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../data/demo_trades.csv'))
      .pipe(csv())
      .on('data', async (row) => {
        const trade = new Trade({
          name: row['Trade'],
          description: row['Description'],
          eligibility: row['Eligibility'],
          duration: row['Course Duration'],
          nsqfLevel: parseInt(row['NSQF Level'], 10),
          jobRoles: row['Job Roles'].split(',').map(r => r.trim()),
          progression: row['Progression Pathway']
        });
        tradesMap.set(trade.name, trade);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  const savedTrades = await Trade.insertMany(Array.from(tradesMap.values()));
  const savedTradesMap = new Map(savedTrades.map(t => [t.name, t._id]));
  console.log(`Inserted ${savedTrades.length} trades`);

  // Read Outcomes
  const outcomes = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../data/demo_outcomes.csv'))
      .pipe(csv())
      .on('data', (row) => {
        const tradeId = savedTradesMap.get(row['Trade']);
        if (tradeId) {
          outcomes.push({
            tradeId,
            provider: row['Provider'],
            location: row['Location'],
            placementRate: parseFloat(row['Placement Rate']),
            earningsMin: parseFloat(row['Earnings Min']),
            earningsMax: parseFloat(row['Earnings Max']),
            sampleSize: parseInt(row['Sample Size'], 10),
            source: row['Source']
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  await OutcomeData.insertMany(outcomes);
  console.log(`Inserted ${outcomes.length} outcome records`);

  console.log('Seeding complete!');
  process.exit(0);
};

seedVocationalData().catch(err => {
  console.error(err);
  process.exit(1);
});
