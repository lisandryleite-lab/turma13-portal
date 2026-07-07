import { prisma } from "@/lib/prisma"
import {
  grupoPlantaoPorData,
  grupoFaxinaPorData,
  MEMBROS_PLANTAO,
  COMPOSICAO_FAXINA,
} from "@/lib/escalas"

const FUNCOES_SERVICO = ["AuxiliarOD", "AdjuntoOD", "Adjunto1", "Adjunto2", "Mestre", "Leitor", "Discurso", "Comandante"] as const
const LABEL_FUNCAO: Record<string, string> = {
  AuxiliarOD: "Auxiliar do Oficial de Dia", AdjuntoOD: "Adjunto ao Aux. do Oficial de Dia",
  Adjunto1: "Adjunto da 1ª CIA", Adjunto2: "Adjunto da 2ª CIA",
  Mestre: "Mestre de Cerimônia", Leitor: "Leitor de BI",
  Discurso: "Discurso ao CFO", Comandante: "Comandante da 2ª CIA",
}
const ordemFuncao = (f: string) => {
  const i = (FUNCOES_SERVICO as readonly string[]).indexOf(f)
  return i < 0 ? 99 : i
}

export async function ResumoHoje({ matricula }: { matricula: number }) {
  const hoje = new Date()
  const grupoPlantao = grupoPlantaoPorData(hoje)
  const grupoFaxina = grupoFaxinaPorData(hoje)

  const inicio = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0))
  const fim = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59))

  const [funcoesHoje, faxinaMembrosBD, alunos] = await Promise.all([
    prisma.funcaoDestaqueDia.findMany({ where: { data: { gte: inicio, lte: fim } } }),
    prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] }),
    prisma.user.findMany({ where: { isAdmin: false, matricula: { gt: 0 } }, select: { matricula: true, nomeGuerra: true } }),
  ])

  const nomesPorMat: Record<number, string> = {}
  for (const a of alunos) nomesPorMat[a.matricula] = a.nomeGuerra

  // composição de faxina: banco com fallback estático
  const composicaoBD: Record<string, { mat: number; nome: string }[]> = {}
  for (const m of faxinaMembrosBD) {
    if (!composicaoBD[m.grupo]) composicaoBD[m.grupo] = []
    composicaoBD[m.grupo].push({ mat: m.mat, nome: m.nome })
  }
  const composicao = faxinaMembrosBD.length > 0 ? composicaoBD : (COMPOSICAO_FAXINA as Record<string, { mat: number; nome: string }[]>)

  const plantao = MEMBROS_PLANTAO[grupoPlantao] || []
  const faxina = grupoFaxina ? (composicao[grupoFaxina] || []) : []
  const funcoes = [...funcoesHoje].sort((a, b) => ordemFuncao(a.funcao) - ordemFuncao(b.funcao))

  const chip = (key: string, conteudo: React.ReactNode, eu: boolean, dim = false) => (
    <span key={key} style={{
      background: eu ? "var(--dourado)" : `rgba(255,255,255,${dim ? 0.10 : 0.12})`,
      color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: eu ? 700 : 400,
    }}>{conteudo}{eu ? " ←" : ""}</span>
  )

  const tituloStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
  }
  const divisor = <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", margin: "14px 0 10px" }} />

  return (
    <div style={{ gridColumn: "1/-1", background: "var(--azul-profundo)", borderRadius: 14, padding: "18px 20px" }}>
      {/* Plantão */}
      <p style={tituloStyle}>Plantão de Hoje — {grupoPlantao}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {plantao.map(m => chip(`p${m.mat}`, `${m.mat} ${m.nome}`, m.mat === matricula))}
      </div>

      {/* Faxina */}
      {grupoFaxina && faxina.length > 0 && (
        <>
          {divisor}
          <p style={tituloStyle}>Faxina de Hoje — {grupoFaxina}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {faxina.map(m => chip(`f${m.mat}`, `${m.mat} ${m.nome}`, m.mat === matricula, true))}
          </div>
        </>
      )}

      {/* Funções */}
      {funcoes.length > 0 && (
        <>
          {divisor}
          <p style={tituloStyle}>Funções de Hoje</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {funcoes.map(f => chip(
              `s${f.funcao}`,
              <><b style={{ fontWeight: 700 }}>{LABEL_FUNCAO[f.funcao] ?? f.funcao}:</b> {nomesPorMat[f.matricula] ?? `Mat.${f.matricula}`}</>,
              f.matricula === matricula, true,
            ))}
          </div>
        </>
      )}
    </div>
  )
}
