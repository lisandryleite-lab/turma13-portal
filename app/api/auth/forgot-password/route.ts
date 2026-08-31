import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { randomBytes } from "crypto"
import { rotaApi, lerCorpo, z, zMatricula } from "@/lib/api"

const resend = new Resend(process.env.RESEND_API_KEY?.trim())

const PedirReset = z.object({
  matricula: zMatricula.refine((m) => m > 0, "matrícula inválida"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const { matricula } = await lerCorpo(req, PedirReset)

  const user = await prisma.user.findUnique({ where: { matricula } })
  if (!user) return NextResponse.json({ ok: true }) // não revelar se existe

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1h

  await prisma.verificationToken.create({
    data: { identifier: user.email, token, expires },
  })

  const link = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: user.email,
    subject: "Redefinição de senha — CFO PM 2026 Turma 13",
    html: `
      <p>Olá, ${user.nomeGuerra}!</p>
      <p>Clique no link abaixo para redefinir sua senha. O link expira em 1 hora.</p>
      <a href="${link}">${link}</a>
    `,
  })

  return NextResponse.json({ ok: true })
})
