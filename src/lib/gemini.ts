import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) throw new Error("GOOGLE_GENAI_API_KEY no está configurada");
    _client = new GoogleGenAI({ apiKey: key });
  }
  return _client;
}

export const gemini = new Proxy({} as GoogleGenAI, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target, prop: string) {
    return (getGeminiClient() as any)[prop];
  },
});

export const GEMINI_MODEL = "gemini-2.0-flash";
