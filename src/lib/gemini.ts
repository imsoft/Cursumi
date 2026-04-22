import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_client) {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) throw new Error("GOOGLE_GENAI_API_KEY no está configurada en las variables de entorno");
    _client = new GoogleGenAI({ apiKey: key });
  }
  return _client;
}

export const GEMINI_MODEL = "gemini-2.0-flash";
