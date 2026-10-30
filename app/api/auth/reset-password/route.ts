import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, ErroHttp, z } from "@/lib/api"
import { enviarEmail, htmlEmail } from "@/lib/email"

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
  if (!record) throw new ErroHttp(400, "Link inválido ou expirado. Peça um novo em \"Esqueci minha senha\".")

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.update({ where: { email }, data: { password: hash }, select: { nomeGuerra: true } })
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  // Aviso de segurança — se falhar, a senha já foi trocada; só registra no log.
  await enviarEmail(email, "Sua senha foi redefinida — Portal CFO PM 2026", htmlEmail(user.nomeGuerra,
    "A senha da sua conta no Portal CFO PM 2026 acabou de ser redefinida pelo link de recuperação.",
    "Se não foi você, avise a administração do portal imediatamente.",
  ))

  return NextResponse.json({ ok: true })
})
