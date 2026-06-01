import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EscalasClient } from "./escalas-client"
import {
  calcularServico,
  calendarioFaxinaMes,
  COMPOSICAO_FAXINA,
  MEMBROS_PLANTAO,
} from "@/lib/escalas"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

function mesAtual() {
  const hoje = new Date()
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 }
}

export default async function EscalasPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const minhaMatricula = session?.user?.matricula

  const semana = semanaAtual()
  const { ano, mes } = mesAtual()

  // Calendários de faxina: mês atual até dezembro
  const mesesCalendario = Array.from({ length: 12 - mes + 1 }, (_, i) => {
    const m = mes + i
    return {
      ano,
      mes: m,
      dias: calendarioFaxinaMes(ano, m), // data já é string "YYYY-MM-DD" (tz-estável)
    }
  })

  // Gera semanas restantes do ano com cálculo automático
  const semanasAno = Array.from({ length: 52 - semana + 1 }, (_, i) => semana + i)

  const [plantaoDias, funcoesDias, alunos, overridesBD, faxinaMembrosBD] = await Promise.all([
    // plantão do mês atual ao final do ano
    prisma.plantaoDia.findMany({
      where: { data: { gte: new Date(ano, mes - 1, 1), lte: new Date(ano, 11, 31) } },
      orderBy: { data: "asc" },
    }),
    prisma.funcaoDestaqueDia.findMany({
      where: { data: { gte: new Date(ano, mes - 1, 1), lte: new Date(ano, 11, 31) } },
      orderBy: [{ data: "asc" }, { funcao: "asc" }],
    }),
    prisma.user.findMany({
      where: { isAdmin: false, matricula: { gt: 0 } },
      select: { matricula: true, nomeGuerra: true, grupoFaxina: true, grupoPlantao: true },
      orderBy: { matricula: "asc" },
    }),
    // Overrides admin para escala de serviço
    prisma.escalaServico.findMany({ where: { semana: { in: semanasAno } } }),
    // Composição dos grupos de faxina (DB-backed)
    prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] }),
  ])

  const nomesPorMat: Record<number, string> = {}
  for (const a of alunos) nomesPorMat[a.matricula] = a.nomeGuerra

  const overridesMap: Record<number, { p1: number | null; p3: number | null; p4: number | null }> = {}
  for (const o of overridesBD) {
    overridesMap[o.semana] = { p1: o.p1 ?? null, p3: o.p3 ?? null, p4: o.p4 ?? null }
  }

  // Monta lista de todas as semanas restantes mesclando automático + override
  function resolverServico(s: number) {
    const auto = calcularServico(s)
    const ov = overridesMap[s]
    const p1Mat = ov?.p1 ?? auto.p1
    const p3Mat = ov?.p3 ?? auto.p3
    const p4Mat = ov?.p4 ?? auto.p4
    return {
      semana: s,
      isOverride: !!ov,
      p1: p1Mat ? { mat: p1Mat, nome: nomesPorMat[p1Mat] ?? `Mat.${p1Mat}` } : null,
      p3: p3Mat ? { mat: p3Mat, nome: nomesPorMat[p3Mat] ?? `Mat.${p3Mat}` } : null,
      p4: p4Mat ? { mat: p4Mat, nome: nomesPorMat[p4Mat] ?? `Mat.${p4Mat}` } : null,
    }
  }

  const todasSemanas = semanasAno.map(resolverServico)
  const servicoAtual = todasSemanas[0]

  // Monta composicaoFaxina do banco (com fallback para estático)
  const composicaoFaxinaBD: Record<string, { id: string; mat: number; nome: string }[]> = {}
  for (const m of faxinaMembrosBD) {
    if (!composicaoFaxinaBD[m.grupo]) composicaoFaxinaBD[m.grupo] = []
    composicaoFaxinaBD[m.grupo].push({ id: m.id, mat: m.mat, nome: m.nome })
  }
  const composicaoFinal = faxinaMembrosBD.length > 0 ? composicaoFaxinaBD : COMPOSICAO_FAXINA

  return (
    <EscalasClient
      semana={semana}
      ano={ano}
      mes={mes}
      isAdmin={isAdmin ?? false}
      minhaMatricula={minhaMatricula ?? 0}
      servicoAtual={servicoAtual}
      todasSemanas={todasSemanas}
      mesesCalendario={mesesCalendario}
      composicaoFaxina={composicaoFinal}
      membrosPlantao={MEMBROS_PLANTAO}
      plantaoDias={plantaoDias.map(p => ({ ...p, data: p.data.toISOString() }))}
      funcoesDias={funcoesDias.map(f => ({ ...f, data: f.data.toISOString() }))}
      nomesPorMat={nomesPorMat}
      alunos={alunos}
    />
  )
}
