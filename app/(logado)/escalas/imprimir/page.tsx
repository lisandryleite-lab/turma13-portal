import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  calcularServico,
  calendarioFaxinaMes,
  COMPOSICAO_FAXINA,
} from "@/lib/escalas"
import { semanaAtual } from "@/lib/utils"
import { PrintClient } from "./print-client"

export const dynamic = "force-dynamic"

export default async function ImprimirEscalasPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const semana = semanaAtual()
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth() + 1

  // Composição de faxina do banco (com fallback estático)
  const [faxinaMembrosBD, overridesBD] = await Promise.all([
    prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] }),
    prisma.escalaServico.findMany({
      where: { semana: { gte: semana, lte: semana + 15 } },
    }),
  ])

  // Monta composição
  const composicaoDB: Record<string, { mat: number; nome: string }[]> = {}
  for (const m of faxinaMembrosBD) {
    if (!composicaoDB[m.grupo]) composicaoDB[m.grupo] = []
    composicaoDB[m.grupo].push({ mat: m.mat, nome: m.nome })
  }
  const composicao = faxinaMembrosBD.length > 0 ? composicaoDB : COMPOSICAO_FAXINA

  // Overrides de serviço
  const overridesMap: Record<number, { p1: number | null; p3: number | null; p4: number | null }> = {}
  for (const o of overridesBD) {
    overridesMap[o.semana] = { p1: o.p1 ?? null, p3: o.p3 ?? null, p4: o.p4 ?? null }
  }

  // Alunos para nomes
  const alunos = await prisma.user.findMany({
    where: { isAdmin: false, matricula: { gt: 0 } },
    select: { matricula: true, nomeGuerra: true },
  })
  const nomesPorMat: Record<number, string> = {}
  for (const a of alunos) nomesPorMat[a.matricula] = a.nomeGuerra

  // Escala de serviço: semanas a partir da atual
  function resolverServico(s: number) {
    const auto = calcularServico(s)
    const ov = overridesMap[s]
    const p1Mat = ov?.p1 ?? auto.p1
    const p3Mat = ov?.p3 ?? auto.p3
    const p4Mat = ov?.p4 ?? auto.p4
    return {
      semana: s,
      p1: p1Mat ? nomesPorMat[p1Mat] ?? `Mat.${p1Mat}` : "—",
      p3: p3Mat ? nomesPorMat[p3Mat] ?? `Mat.${p3Mat}` : "—",
      p4: p4Mat ? nomesPorMat[p4Mat] ?? `Mat.${p4Mat}` : "—",
    }
  }

  // Gera semanas do mês atual (aproximado: 4 a 5 semanas)
  const semanasDoMes = Array.from({ length: 5 }, (_, i) => semana + i).map(resolverServico)

  // Calendário faxina do mês atual (data já é string "YYYY-MM-DD" tz-estável)
  const diasCalendario = calendarioFaxinaMes(ano, mes)

  const MESES = ["","Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

  return (
    <PrintClient
      semana={semana}
      mes={mes}
      ano={ano}
      nomeMes={MESES[mes]}
      semanasServico={semanasDoMes}
      diasCalendario={diasCalendario}
      composicao={composicao}
    />
  )
}
