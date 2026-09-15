// ─────────────────────────────────────────────────────────────
//  147 JANDERSON — acesso ao Portal CFO (set/2026).
//
//  Pedido via WhatsApp: cadastrar/atualizar o e-mail e redefinir a senha
//  para o padrão do portal (senha inicial = a própria matrícula).
//
//  Não é do pelotão Turma 13 (consta no Mapa de Equipes da 1ª CIA, grupo
//  HOTEL — ver lib/escalas-cia.ts): entra com `turma13: false` e `turma: 3`,
//  ou seja, acessa apenas a área CFO — /inicio, /mementos, /questoes,
//  /ranking, /permutas, /documentos, /trocar-senha.
//
//  Idempotente: se já existir, atualiza o e-mail e redefine a senha; se não
//  existir, cria a conta. O aluno troca a senha em /trocar-senha.
//
//  Uso: npx tsx scripts/acesso-147-janderson.ts
//  (atrás de proxy HTTPS, prefixe com NODE_USE_ENV_PROXY=1 — o fetch nativo do
//  Node só lê HTTPS_PROXY com essa variável)
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

// Em ambientes cuja saída passa por um proxy HTTPS (ex.: runner do Claude Code
// na web), o upgrade WebSocket não atravessa o túnel CONNECT. Aí o driver faz
// as queries por HTTP, que o proxy atende normalmente. Na máquina local e na
// Vercel não existe HTTPS_PROXY, então nada muda: segue por WebSocket.
if (process.env.HTTPS_PROXY || process.env.https_proxy) {
  neonConfig.poolQueryViaFetch = true
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MATRICULA = 147
const NOME_GUERRA = "JANDERSON"
// nomeCompleto inferido do e-mail — conferir e ajustar em /admin se necessário.
const NOME_COMPLETO = "Janderson Farias de Sena"
const EMAIL = "jfsfariasdesena@gmail.com"

async function main() {
  const senha = String(MATRICULA) // padrão do portal: senha inicial = matrícula
  const hash = await bcrypt.hash(senha, 12)

  // e-mail é @unique: aborta em vez de estourar erro de constraint
  const emailEmUso = await prisma.user.findUnique({ where: { email: EMAIL } })
  if (emailEmUso && emailEmUso.matricula !== MATRICULA) {
    console.error(`✗ O e-mail ${EMAIL} já pertence à matrícula ${emailEmUso.matricula} (${emailEmUso.nomeGuerra}). Nada foi alterado.`)
    process.exit(1)
  }

  const existente = await prisma.user.findUnique({ where: { matricula: MATRICULA } })

  const u = existente
    ? await prisma.user.update({
        where: { matricula: MATRICULA },
        data: {
          email: EMAIL,
          password: hash,
          ativo: true,
          ...(existente.turma === null ? { turma: 3 } : {}),
        },
        select: { matricula: true, nomeGuerra: true, email: true, password: true, turma: true, turma13: true },
      })
    : await prisma.user.create({
        data: {
          matricula: MATRICULA,
          nomeGuerra: NOME_GUERRA,
          nomeCompleto: NOME_COMPLETO,
          email: EMAIL,
          password: hash,
          turma: 3,
          turma13: false, // não é do 1º Pelotão — só a área CFO
          ativo: true,
        },
        select: { matricula: true, nomeGuerra: true, email: true, password: true, turma: true, turma13: true },
      })

  const ok = await bcrypt.compare(senha, u.password)
  console.log(
    `${existente ? "↻" : "✓"} Mat ${u.matricula} (${u.nomeGuerra}) — e-mail: ${u.email} · senha: "${senha}" | confere: ${ok}`
  )
  console.log(`   turma: ${u.turma} · turma13: ${u.turma13} — acesso à área CFO (/inicio, /mementos, /questoes, /ranking, /permutas, /documentos).`)
  console.log("   Peça que entre com a matrícula como usuário e senha e troque em /trocar-senha.")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
