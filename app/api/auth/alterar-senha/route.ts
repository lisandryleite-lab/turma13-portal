import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const matricula = session.user.matricula // Int — tipado em next-auth.d.ts
  const { senhaAtual, novaSenha } = await req.json()

  if (!senhaAtual || !novaSenha)
    return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })

  if (novaSenha.length < 6)
    return NextResponse.json({ error: "Nova senha deve ter mínimo 6 caracteres" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { matricula } })
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const senhaCorreta = await bcrypt.compare(senhaAtual, user.password)
  if (!senhaCorreta)
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })

  const hash = await bcrypt.hash(novaSenha, 12)
  await prisma.user.update({ where: { matricula }, data: { password: hash } })

  return NextResponse.json({ ok: true })
}
