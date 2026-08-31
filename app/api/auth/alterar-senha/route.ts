import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, ErroHttp, z } from "@/lib/api"

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

  return NextResponse.json({ ok: true })
})
