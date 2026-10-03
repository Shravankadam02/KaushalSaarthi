import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const primaryClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const backupClient = process.env.GEMINI_BACKUP_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_BACKUP_API_KEY) : null;

const chatModelName = process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash';
const embeddingModelName = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const embeddingDimension = Number(process.env.EMBEDDING_DIM || 768);
const requestTimeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 25000);

function assertConfigured() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
}

function isRetryable(error) {
    const status = Number(error?.status || error?.response?.status);
    const msg = String(error?.message || '');
    return status === 429 || status >= 500 || msg.includes('429') || msg.includes('Quota exceeded');
}

async function withRetry(operation) {
    let lastError;
    let currentClient = primaryClient;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            return await operation(currentClient);
        } catch (error) {
            lastError = error;
            const status = Number(error?.status || error?.response?.status);
            const msg = String(error?.message || '');
            const isQuotaError = status === 429 || msg.includes('429') || msg.includes('Quota exceeded');
            
            if (isQuotaError && backupClient && currentClient === primaryClient) {
                console.warn('Quota exceeded on primary Gemini key. Switching to backup key...');
                currentClient = backupClient;
                continue;
            }

            if (!isRetryable(error) || attempt === 1) throw error;
        }
    }

    throw lastError;
}

function withTimeout(promise) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Gemini request timed out')), requestTimeoutMs);
        }),
    ]);
}

function toGeminiContents(messages) {
    return messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
    }));
}

export async function generateEmbedding(text) {
    assertConfigured();

    return withRetry(async (client) => {
        const model = client.getGenerativeModel({ model: embeddingModelName });
        const result = await withTimeout(model.embedContent({
            content: { role: 'user', parts: [{ text }] },
            outputDimensionality: embeddingDimension,
        }));
        const values = result.embedding?.values;

        if (!values?.length) {
            throw new Error('Gemini returned no embedding');
        }

        return values;
    });
}

export async function generateChat(messages, systemPrompt = '') {
    assertConfigured();

    return withRetry(async (client) => {
        const model = client.getGenerativeModel({
            model: chatModelName,
            ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        });
        const result = await withTimeout(
            model.generateContent({ contents: toGeminiContents(messages) })
        );
        const text = result.response?.text();

        if (!text) {
            throw new Error('Gemini returned no chat response');
        }

        return text.trim();
    });
}

function parseJsonResponse(text) {
    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');

    return JSON.parse(cleaned);
}

export async function generateJSON(messages, systemPrompt, schema) {
    assertConfigured();

    return withRetry(async (client) => {
        const model = client.getGenerativeModel({
            model: chatModelName,
            ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
            generationConfig: {
                responseMimeType: 'application/json',
                ...(schema ? { responseSchema: schema } : {}),
            },
        });
        const result = await withTimeout(
            model.generateContent({ contents: toGeminiContents(messages) })
        );
        const text = result.response?.text();

        if (!text) {
            throw new Error('Gemini returned no JSON response');
        }

        return parseJsonResponse(text);
    });
}