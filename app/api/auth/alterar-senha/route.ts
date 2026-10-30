import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, ErroHttp, z } from "@/lib/api"
import { enviarEmail, htmlEmail } from "@/lib/email"

const TrocarSenha = z.object({
  senhaAtual: z.string().min(1, "preencha a senha atual"),
  novaSenha: z.string().min(6, "mínimo 6 caracteres"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session) throw naoAutorizado()

  const matricula = session.user.matricula // Int — tipado em next-auth.d.ts
  const { senhaAtual, novaSenha } = await lerCorpo(req, TrocarSenha)

  const user = await prisma.user.findUnique({ where: { matricula } })
  if (!user) throw naoEncontrado("Usuário")

  const senhaCorreta = await bcrypt.compare(senhaAtual, user.password)
  if (!senhaCorreta) throw new ErroHttp(400, "Senha atual incorreta")

  const hash = await bcrypt.hash(novaSenha, 12)
  await prisma.user.update({ where: { matricula }, data: { password: hash } })

  // Aviso de segurança — se falhar, a senha já foi trocada; só registra no log.
  await enviarEmail(user.email, "Sua senha foi alterada — Portal CFO PM 2026", htmlEmail(user.nomeGuerra,
    "A senha da sua conta no Portal CFO PM 2026 acabou de ser alterada.",
    "Se não foi você, use \"Esqueci minha senha\" na tela de login e avise a administração do portal.",
  ))

  return NextResponse.json({ ok: true })
})
