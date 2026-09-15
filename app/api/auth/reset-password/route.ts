import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json()
  if (!token || !email || !password)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  // Mesma exigência de /api/auth/alterar-senha: sem isto dava para sair do link
  // do e-mail com uma senha de um caractere.
  if (typeof password !== "string" || password.length < 6)
    return NextResponse.json({ error: "Nova senha deve ter mínimo 6 caracteres" }, { status: 400 })

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token, expires: { gt: new Date() } },
  })
  if (!record) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hash, senhaTrocada: true } })
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  return NextResponse.json({ ok: true })
}
