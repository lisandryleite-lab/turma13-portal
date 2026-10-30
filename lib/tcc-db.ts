import "server-only"
import { prisma } from "@/lib/prisma"

// A tabela `TccEnvio` entrou no schema perto do prazo do TCC, sem `db push`
// no banco de produção. Criada aqui no primeiro uso, idêntica ao que o
// Prisma geraria — um `db push` futuro encontra a tabela já em dia.
let pronta: Promise<unknown> | null = null

export function garantirTabelaTcc() {
  pronta ??= prisma
    .$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TccEnvio" (
        "dupla"         INTEGER NOT NULL,
        "declaradoEm"   TIMESTAMP(3),
        "declaradoPor"  INTEGER,
        "confirmadoEm"  TIMESTAMP(3),
        "confirmadoPor" INTEGER,
        "updatedAt"     TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TccEnvio_pkey" PRIMARY KEY ("dupla")
      )`)
    .catch((e) => {
      pronta = null // tenta de novo na próxima requisição
      throw e
    })
  return pronta
}
