import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { randomBytes } from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ ok: true }) // não revelar se existe

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1h

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const link = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: email,
    subject: "Redefinição de senha — CFO PM 2026 Turma 13",
    html: `
      <p>Olá, ${user.nomeGuerra}!</p>
      <p>Clique no link abaixo para redefinir sua senha. O link expira em 1 hora.</p>
      <a href="${link}">${link}</a>
    `,
  })

  return NextResponse.json({ ok: true })
}
