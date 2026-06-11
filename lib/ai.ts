import { GoogleGenAI } from "@google/genai"

// Cliente do Google Gemini (nível gratuito). Lê GEMINI_API_KEY (Vercel → Environment Variables).
// Chave gratuita criada em https://aistudio.google.com/apikey
export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

// Modelo padrão — Gemini 2.5 Flash (incluído no nível gratuito). Trocar aqui afeta todas as rotas.
export const MODEL = "gemini-2.5-flash"

export const IA_HABILITADA = !!process.env.GEMINI_API_KEY

// Extrai o primeiro bloco JSON de um texto (caso o modelo embrulhe em ```json … ```).
export function parseJsonLoose(texto: string): unknown {
  let t = (texto || "").trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) t = fence[1].trim()
  const start = t.indexOf("{")
  const end = t.lastIndexOf("}")
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  return JSON.parse(t)
}
