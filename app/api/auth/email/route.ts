import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, ErroHttp, z } from "@/lib/api"
import { enviarEmail, htmlEmail, emailProvisorio } from "@/lib/email"

// E-mail do próprio usuário — é para ele que vai o link de "Esqueci minha senha".
export const GET = rotaApi(async () => {
  const session = await auth()
  if (!session) throw naoAutorizado()
  const user = await prisma.user.findUnique({ where: { matricula: session.user.matricula }, select: { email: true } })
  if (!user) throw naoEncontrado("Usuário")
  const provisorio = emailProvisorio(user.email)
  return NextResponse.json({ email: provisorio ? null : user.email, provisorio })
})

const CadastrarEmail = z.object({
  email: z.string().trim().toLowerCase().email("e-mail inválido"),
  senhaAtual: z.string().min(1, "preencha a sua senha"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session) throw naoAutorizado()
  const { email, senhaAtual } = await lerCorpo(req, CadastrarEmail)
  if (emailProvisorio(email)) throw new ErroHttp(400, "Informe um e-mail que você use de verdade.")

  const user = await prisma.user.findUnique({ where: { matricula: session.user.matricula } })
  if (!user) throw naoEncontrado("Usuário")
  if (!(await bcrypt.compare(senhaAtual, user.password))) throw new ErroHttp(400, "Senha incorreta")
  if (user.email.toLowerCase() === email) return NextResponse.json({ ok: true, email })

  const dono = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (dono) throw new ErroHttp(409, "Este e-mail já está cadastrado em outra matrícula.")

  await prisma.user.update({ where: { id: user.id }, data: { email } })
  // links de recuperação pedidos para o e-mail antigo deixam de valer
  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })

  await enviarEmail(email, "E-mail cadastrado — Portal CFO PM 2026", htmlEmail(user.nomeGuerra,
    "Este endereço agora está cadastrado na sua conta do Portal CFO PM 2026.",
    "É para ele que vamos mandar o link de \"Esqueci minha senha\" e os avisos de segurança.",
  ))
  return NextResponse.json({ ok: true, email })
})
