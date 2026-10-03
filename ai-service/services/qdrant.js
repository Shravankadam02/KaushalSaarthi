import 'dotenv/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbedding } from './gemini.js';

const collectionName = process.env.QDRANT_COLLECTION || 'vocational_kb';
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
});

function normalizeLanguage(language) {
    const value = String(language || 'en').toLowerCase();
    if (value.startsWith('mr') || value.includes('marathi')) return 'mr';
    if (value.startsWith('hi') || value.includes('hindi')) return 'hi';
    return 'en';
}

async function searchByLanguage(vector, language) {
    const response = await qdrant.query(collectionName, {
        query: vector,
        limit: 5,
        with_payload: true,
        filter: {
            must: [{ key: 'language', match: { value: language } }],
        },
    });
    return response.points || response;
}

export async function retrieveKnowledgeContext(query, language) {
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) return [];

    try {
        const requestedLanguage = normalizeLanguage(language);
        const vector = await generateEmbedding(query);
        let results = await searchByLanguage(vector, requestedLanguage);

        if (results.length === 0 && requestedLanguage !== 'en') {
            results = await searchByLanguage(vector, 'en');
        }

        return results.map((result) => ({
            payload: result.payload,
            score: result.score,
        }));
    } catch (error) {
        console.error('Qdrant retrieval failed:', error.message);
        return [];
    }
}