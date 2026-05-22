import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EscalasClient } from "./escalas-client"
import {
  calcularServico,
  calendarioFaxinaMes,
  COMPOSICAO_FAXINA,
  MEMBROS_PLANTAO,
  MATRICULAS_ORDEM,
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

  // Dados calculados automaticamente
  const servico = calcularServico(semana)
  const calendario = calendarioFaxinaMes(ano, mes)

  // Dados externos (admin insere)
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)
  const [plantaoDias, funcoesDias, alunos] = await Promise.all([
    prisma.plantaoDia.findMany({ where: { data: { gte: inicio, lte: fim } }, orderBy: { data: "asc" } }),
    prisma.funcaoDestaqueDia.findMany({ where: { data: { gte: inicio, lte: fim } }, orderBy: [{ data: "asc" }, { funcao: "asc" }] }),
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { matricula: true, nomeGuerra: true, grupoFaxina: true, grupoPlantao: true },
      orderBy: { matricula: "asc" },
    }),
  ])

  // Monta mapa nome de guerra por matrícula
  const nomesPorMat: Record<number, string> = {}
  for (const a of alunos) nomesPorMat[a.matricula] = a.nomeGuerra

  // P1/P3/P4 com nomes
  const servicoComNomes = {
    semana,
    p1: servico.p1 ? { mat: servico.p1, nome: nomesPorMat[servico.p1] ?? `Mat.${servico.p1}` } : null,
    p3: servico.p3 ? { mat: servico.p3, nome: nomesPorMat[servico.p3] ?? `Mat.${servico.p3}` } : null,
    p4: servico.p4 ? { mat: servico.p4, nome: nomesPorMat[servico.p4] ?? `Mat.${servico.p4}` } : null,
  }

  // Próximas 4 semanas de serviço
  const proximasSemanasServico = Array.from({ length: 4 }, (_, i) => {
    const s = semana + i
    const sv = calcularServico(s)
    return {
      semana: s,
      p1: sv.p1 ? { mat: sv.p1, nome: nomesPorMat[sv.p1] ?? `Mat.${sv.p1}` } : null,
      p3: sv.p3 ? { mat: sv.p3, nome: nomesPorMat[sv.p3] ?? `Mat.${sv.p3}` } : null,
      p4: sv.p4 ? { mat: sv.p4, nome: nomesPorMat[sv.p4] ?? `Mat.${sv.p4}` } : null,
    }
  })

  return (
    <EscalasClient
      semana={semana}
      ano={ano}
      mes={mes}
      isAdmin={isAdmin}
      minhaMatricula={minhaMatricula}
      servicoAtual={servicoComNomes}
      proximasSemanasServico={proximasSemanasServico}
      calendario={calendario.map(d => ({
        ...d,
        data: d.data.toISOString(),
      }))}
      composicaoFaxina={COMPOSICAO_FAXINA}
      membrosPlantao={MEMBROS_PLANTAO}
      plantaoDias={plantaoDias.map(p => ({ ...p, data: p.data.toISOString() }))}
      funcoesDias={funcoesDias.map(f => ({ ...f, data: f.data.toISOString() }))}
      nomesPorMat={nomesPorMat}
      alunos={alunos}
    />
  )
}
