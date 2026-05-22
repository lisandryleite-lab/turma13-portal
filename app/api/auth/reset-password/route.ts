import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json()
  if (!token || !email || !password)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token, expires: { gt: new Date() } },
  })
  if (!record) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { password: hash } })
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } })

  return NextResponse.json({ ok: true })
}
