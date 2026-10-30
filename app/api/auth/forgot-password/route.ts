import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { rotaApi, lerCorpo, ErroHttp, z, zMatricula } from "@/lib/api"
import { enviarEmail, htmlEmail, urlPortal } from "@/lib/email"

const PedirReset = z.object({
  matricula: zMatricula.refine((m) => m > 0, "matrícula inválida"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const { matricula } = await lerCorpo(req, PedirReset)

  const user = await prisma.user.findUnique({ where: { matricula } })
  if (!user) return NextResponse.json({ ok: true }) // não revelar se existe

  // Um link válido por vez: pedidos antigos (e vencidos) deixam de valer.
  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1h
  await prisma.verificationToken.create({ data: { identifier: user.email, token, expires } })

  const link = `${urlPortal()}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`
  const envio = await enviarEmail(user.email, "Redefinição de senha — Portal CFO PM 2026", htmlEmail(user.nomeGuerra,
    "Recebemos um pedido para redefinir a sua senha. Clique no link abaixo — ele vale por 1 hora:",
    `<a href="${link}">${link}</a>`,
    "Se não foi você, ignore este e-mail: a sua senha continua a mesma.",
  ))
  if (!envio.ok) {
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })
    throw new ErroHttp(502, "Não foi possível enviar o e-mail agora. Tente mais tarde ou procure a administração do portal.")
  }

  return NextResponse.json({ ok: true })
})
