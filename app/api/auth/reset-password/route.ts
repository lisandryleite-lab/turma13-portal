import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, ErroHttp, z } from "@/lib/api"

const ResetarSenha = z.object({
  token: z.string().min(1, "obrigatório"),
  email: z.string().trim().email("e-mail inválido"),
  password: z.string().min(6, "mínimo 6 caracteres"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const { token, email, password } = await lerCorpo(req, ResetarSenha)

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token, expires: { gt: new Date() } },
  })
  if (!record) throw new ErroHttp(400, "Token inválido ou expirado")

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hash } })
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  return NextResponse.json({ ok: true })
})
