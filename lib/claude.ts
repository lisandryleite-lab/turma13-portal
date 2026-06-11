import Anthropic from "@anthropic-ai/sdk"

// Cliente único da Anthropic. Lê a chave de ANTHROPIC_API_KEY (Vercel → Environment Variables).
export const anthropic = new Anthropic()

// Modelo padrão (padrão da skill /claude-api). Trocar aqui afeta todas as rotas de IA.
// Para reduzir custo em alto volume, pode-se usar "claude-sonnet-4-6".
export const MODEL = "claude-opus-4-8"

export const IA_HABILITADA = !!process.env.ANTHROPIC_API_KEY
