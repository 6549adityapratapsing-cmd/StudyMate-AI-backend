import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const isGeminiConfigured = () => {
  return (
    Boolean(apiKey) &&
    !apiKey.includes('your_gemini_api_key') &&
    apiKey.trim().length > 10
  );
};

if (!isGeminiConfigured()) {
  console.warn(`
⚠️ [AI Engine Warning]: GEMINI_API_KEY is not configured in backend/.env.
👉 Get a free Gemini API key in 10 seconds:
   1. Visit https://aistudio.google.com/app/apikey
   2. Click 'Create API key'
   3. Paste it into backend/.env as: GEMINI_API_KEY=AIzaSy...
  `);
}

// Initialize Google GenAI client
export const aiClient = new GoogleGenAI({
  apiKey: apiKey && isGeminiConfigured() ? apiKey : 'placeholder_key',
});

// Best model for fast, high-quality, structured study synthesis
export const STUDY_MODEL = 'gemini-2.5-flash';

export default aiClient;
