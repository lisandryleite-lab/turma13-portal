import { prisma } from "@/lib/prisma"

// Registra acesso/ação sensível para auditoria (LGPD).
export async function logAcesso(
  user: { id: string; matricula: number; nomeGuerra: string },
  area: string,
  acao: string
) {
  try {
    await prisma.logAcesso.create({
      data: { userId: user.id, matricula: user.matricula, nomeGuerra: user.nomeGuerra, area, acao },
    })
  } catch {
    // log nunca deve quebrar a ação principal
  }
}
