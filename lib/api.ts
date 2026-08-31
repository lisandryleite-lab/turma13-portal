import "server-only"
import { NextResponse } from "next/server"
import { z, type ZodType } from "zod"
import { Prisma } from "@/lib/generated/prisma/client"

// ─────────────────────────────────────────────────────────────
//  Rede de proteção das rotas de API
//
//  Antes: 54 chamadas a `req.json()` sem um único try/catch. Corpo vazio ou
//  malformado, aluno de conexão instável, `update` num registro que não existe
//  (P2025) — tudo virava 500 genérico, e o cliente que fazia `res.json()` na
//  resposta quebrava de novo em cima do erro.
//
//  Uso:
//    export const POST = rotaApi(async (req) => {
//      const { titulo } = await lerCorpo(req, z.object({ titulo: z.string().min(1) }))
//      ...
//    })
// ─────────────────────────────────────────────────────────────

/** Erro com status HTTP. Jogue de dentro do handler; o `rotaApi` formata. */
export class ErroHttp extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = "ErroHttp"
  }
}

export const naoAutorizado = () => new ErroHttp(401, "Não autorizado")
export const proibido = () => new ErroHttp(403, "Não autorizado")
export const naoEncontrado = (o = "Registro") => new ErroHttp(404, `${o} não encontrado`)

/** Primeira mensagem legível de um erro do zod, com o caminho do campo. */
function mensagemZod(erro: z.ZodError): string {
  const p = erro.issues[0]
  if (!p) return "Dados inválidos"
  const campo = p.path.join(".")
  return campo ? `Campo "${campo}": ${p.message}` : p.message
}

/**
 * Lê o corpo JSON e valida contra o schema. Corpo malformado → 400 (não 500).
 * Passe `z.object({}).passthrough()` quando a rota aceitar qualquer coisa.
 */
export async function lerCorpo<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let bruto: unknown
  try {
    bruto = await req.json()
  } catch {
    throw new ErroHttp(400, "Corpo da requisição inválido (JSON malformado ou vazio)")
  }
  const r = schema.safeParse(bruto)
  if (!r.success) throw new ErroHttp(400, mensagemZod(r.error))
  return r.data
}

/** Erros de controle do Next (redirect/notFound) têm que subir intactos. */
function ehErroDeControleDoNext(e: unknown): boolean {
  return typeof (e as { digest?: unknown })?.digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_")
}

function respostaDeErro(e: unknown): NextResponse {
  if (e instanceof ErroHttp) {
    return NextResponse.json({ error: e.message }, { status: e.status })
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case "P2025":
        return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 })
      case "P2002":
        return NextResponse.json({ error: "Já existe um registro com esse valor" }, { status: 409 })
      case "P2003":
        return NextResponse.json({ error: "Referência inválida" }, { status: 409 })
    }
  }

  if (e instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json({ error: "Dados inválidos para o banco" }, { status: 400 })
  }

  // Inesperado: registra no log da Vercel e devolve uma forma estável, para o
  // `res.json()` do cliente não estourar em cima do erro.
  console.error("[api] erro não tratado:", e)
  return NextResponse.json({ error: "Erro interno. Tente de novo." }, { status: 500 })
}

/** Envolve um handler de rota com o tratamento de erro acima. */
export function rotaApi<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
): (...args: A) => Promise<Response> {
  return async (...args: A) => {
    try {
      return await handler(...args)
    } catch (e) {
      if (ehErroDeControleDoNext(e)) throw e
      return respostaDeErro(e)
    }
  }
}

// ── Peças reaproveitadas pelos schemas das rotas ──────────────

/** `matricula` é sempre Int no portal — aceita number ou string numérica. */
export const zMatricula = z.coerce.number().int().refine(Number.isFinite, "matrícula inválida")

/** id de cuid — não valida formato, só exige string não vazia. */
export const zId = z.string().min(1, "obrigatório")

/** Data aceita como "YYYY-MM-DD" ou ISO completo. */
export const zData = z.string().min(1).refine((s) => !Number.isNaN(Date.parse(s)), "data inválida")

/** Semana do curso: 1–52. */
export const zSemana = z.coerce.number().int().min(1).max(52)

export { z }
