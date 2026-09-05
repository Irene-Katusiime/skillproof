import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the backend root folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ OPENAI_API_KEY is missing from environment variables.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-for-init', // Prevents hard crash on import if missing
});