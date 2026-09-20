// Sincroniza as variáveis de ambiente de PRODUÇÃO na Vercel.
//
// Os valores NÃO ficam neste arquivo: são lidos do `.env` local (ignorado pelo
// git) ou do ambiente do shell. Use o `.env.example` como modelo.
//
// Uso:  node set-env.mjs            → sincroniza todas as chaves preenchidas
//       node set-env.mjs DATABASE_URL RESEND_API_KEY   → só as chaves citadas
//
// Requer o CLI da Vercel autenticado no projeto (`npx vercel login && npx vercel link`).
import "dotenv/config"
import { execSync, spawnSync } from "child_process"

// Chaves sincronizadas com o ambiente de produção da Vercel.
const CHAVES = ["DATABASE_URL", "AUTH_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "RESEND_API_KEY", "RESEND_FROM"]

const pedidas = process.argv.slice(2)
const alvo = pedidas.length ? pedidas : CHAVES

const desconhecidas = alvo.filter(k => !CHAVES.includes(k))
if (desconhecidas.length) {
  console.error(`Chave(s) fora da lista suportada: ${desconhecidas.join(", ")}`)
  console.error(`Suportadas: ${CHAVES.join(", ")}`)
  process.exit(1)
}

const vars = {}
const faltando = []
for (const k of alvo) {
  const v = process.env[k]
  if (v && v.trim()) vars[k] = v.trim()
  else faltando.push(k)
}

if (faltando.length) {
  console.warn(`Ignoradas (sem valor no .env / ambiente): ${faltando.join(", ")}`)
}
if (!Object.keys(vars).length) {
  console.error("\nNenhuma variável para sincronizar. Preencha o .env local (veja .env.example).")
  process.exit(1)
}

console.log(`\nSincronizando em produção: ${Object.keys(vars).join(", ")}\n`)

// Remove as versões antigas primeiro (o `env add` não sobrescreve).
for (const key of Object.keys(vars)) {
  try {
    execSync(`npx --yes vercel env rm ${key} production --yes`, { stdio: "pipe" })
    console.log(`Removido: ${key}`)
  } catch {
    // ainda não existia em produção — segue o baile
  }
}

// Re-adiciona pelo stdin (Node garante UTF-8 sem BOM).
let erros = 0
for (const [key, value] of Object.entries(vars)) {
  const r = spawnSync("npx", ["--yes", "vercel", "env", "add", key, "production", "--yes"], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  })
  if (r.status === 0) {
    console.log(`✓ ${key}`)
  } else {
    erros++
    console.error(`✗ ${key} (exit ${r.status})`)
  }
}

console.log(erros ? `\nConcluído com ${erros} falha(s).` : "\nConcluído!")
process.exit(erros ? 1 : 0)
