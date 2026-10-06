import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples, type Verificacao } from "@/lib/ranking"
import { RankingClient } from "./ranking-client"

// Ordem do curso (seed) — desempata as disciplinas que terminaram antes de o
// QTS entrar no portal e por isso não têm última aula registrada.
const ORDEM_CURSO = [
  "SSP","TGA","GPGA","GPCL","GLOFP","FPC","PA","ACE","QAGV","DHAAPM","GC","SMQV","TFM1","TFM2",
  "GPSEI","TIC","CMSCM2","INTSISP","ECRI","OU1","OU2","IG","DPP1","DPP2","UDF","PS","APHT",
  "POE","EPCR","PE","GRAPP","TCEM","PJM","DADM","DPPM","LPMO","PO","EASE","HPMPE",
  "AP","AV","AE","PU","AM","TP","TDV","ABAA","MAP1","MAP2","MPC","TPE","TCC",
]

const ALIAS_QTS: Record<string, string> = { "TFM-II": "TFM2", "OU-II": "OU2" }

export default async function RankingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const userId = session.user.id!

  const [minhasNotas, disciplinasBrutas, todasNotas, eu, turmaSize, opms, minhaPref, agregado, qtss] = await Promise.all([
    prisma.notaCFO.findMany({ where: { userId }, orderBy: [{ disciplina: "asc" }, { avaliacao: "asc" }] }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true, status: true, cargaMinistrada: true, cargaTotal: true }, orderBy: { sigla: "asc" } }),
    // Filtra no SQL: antes puxava a tabela INTEIRA (todas as turmas, todos os
    // campos) e descartava em JS — atravessando a rede à toa a cada abertura.
    prisma.notaCFO.findMany({
      where: { user: { turma: 3 }, NOT: { userId } },
      select: {
        userId: true, disciplina: true, avaliacao: true,
        valor: true, ehAF: true, apto: true,
        user: { select: { nfdc: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { nfdc: true } }),
    prisma.user.count({ where: { turma: 3 } }),
    prisma.oPM.findMany({ orderBy: { ordem: "asc" } }),
    prisma.preferenciaOPM.findUnique({ where: { userId } }),
    prisma.preferenciaOPM.findMany({ select: { opcao1Id: true, opcao2Id: true, opcao3Id: true } }),
    prisma.qTS.findMany({ select: { semana: true, dados: true } }),
  ])

  // Ordem de término de cada disciplina = última aula dela no QTS (semana + dia).
  // Sem aula registrada no QTS (semanas antigas, antes do QTS no portal) →
  // ordem do curso, sempre antes das que têm data no QTS.
  const ultimaAula = new Map<string, number>()
  for (const q of qtss) {
    const d = q.dados as { dias?: string[]; grade?: Record<string, string[]> } | null
    if (!d?.grade) continue
    const dias = d.dias ?? Object.keys(d.grade)
    dias.forEach((dia, i) => {
      for (const bruta of d.grade?.[dia] ?? []) {
        // QTS antigos grafavam com hífen (TFM-II, OU-II)
        const sigla = ALIAS_QTS[bruta] ?? bruta
        if (!sigla) continue
        const chave = q.semana * 10 + i
        if (chave > (ultimaAula.get(sigla) ?? 0)) ultimaAula.set(sigla, chave)
      }
    })
  }
  const fase = (d: (typeof disciplinasBrutas)[number]): "concluida" | "andamento" | "inicio" =>
    (d.cargaTotal > 0 ? d.cargaMinistrada >= d.cargaTotal : d.status === "Concluída") ? "concluida"
      : d.cargaMinistrada > 0 ? "andamento" : "inicio"
  const disciplinas = disciplinasBrutas.map(d => ({
    sigla: d.sigla, nome: d.nome, status: d.status, fase: fase(d), ordem: ultimaAula.get(d.sigla) ?? (ORDEM_CURSO.indexOf(d.sigla) - 100),
  }))

  // MGC dos OUTROS alunos T3 que já lançaram notas (para posicionar o ranking)
  const porUser = new Map<string, { nfdc: number; vs: Verificacao[] }>()
  for (const n of todasNotas) {
    const e = porUser.get(n.userId) || { nfdc: n.user.nfdc, vs: [] }
    e.vs.push({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto })
    porUser.set(n.userId, e)
  }
  const mgcsOutros: number[] = []
  for (const [, e] of porUser) { const m = calcularMGCSimples(e.vs, e.nfdc); if (m != null) mgcsOutros.push(m) }

  // Contagem de preferências: 1ª opção e total (1ª + 2ª + 3ª)
  const contagem1 = new Map<string, number>()
  const contagemTotal = new Map<string, number>()
  for (const p of agregado) {
    contagem1.set(p.opcao1Id, (contagem1.get(p.opcao1Id) ?? 0) + 1)
    for (const id of [p.opcao1Id, p.opcao2Id, p.opcao3Id]) {
      if (id) contagemTotal.set(id, (contagemTotal.get(id) ?? 0) + 1)
    }
  }
  // Exclui OPMs especiais (ex.: "—" Não decidiu) dos rankings — não são posições
  const opmsReais = opms.filter(o => !o.especial)

  return (
    <RankingClient
      notasIniciais={minhasNotas.map(n => ({ id: n.id, disciplina: n.disciplina, avaliacao: n.avaliacao, valor: n.valor, ehAF: n.ehAF, apto: n.apto }))}
      nfdc={eu?.nfdc ?? 10}
      disciplinas={disciplinas}
      totalDisciplinas={disciplinas.length}
      turmaSize={turmaSize}
      mgcsOutros={mgcsOutros}
      nomeGuerra={session.user.nomeGuerra}
      opms={opms.map(o => ({ id: o.id, sigla: o.sigla, nome: o.nome, especial: o.especial }))}
      minhaPref={minhaPref ? { opcao1Id: minhaPref.opcao1Id, opcao2Id: minhaPref.opcao2Id, opcao3Id: minhaPref.opcao3Id } : null}
      agregado1={opmsReais.map(o => ({ sigla: o.sigla, nome: o.nome, especial: o.especial, count: contagem1.get(o.id) ?? 0 }))}
      agregadoTotal={opmsReais.map(o => ({ sigla: o.sigla, nome: o.nome, especial: o.especial, count: contagemTotal.get(o.id) ?? 0 }))}
    />
  )
}
