import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { carregarLevantamento, PLANILHA_URL } from "@/lib/levantamento-ome"
import { BATALHOES_BASE } from "@/lib/batalhoes-base"
import { BatalhoesClient, type CardBatalhao } from "./batalhoes-client"

export const dynamic = "force-dynamic"

export default async function BatalhoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const minhaMat = session.user.matricula

  const [respostas, opms, totalAlunos] = await Promise.all([
    carregarLevantamento(),
    prisma.oPM.findMany({ where: { especial: false }, include: { info: true, _count: { select: { mural: true } } } }),
    prisma.user.count({ where: { turma: 3, ativo: true } }),
  ])
  const lista = respostas ?? []

  const cards: CardBatalhao[] = BATALHOES_BASE.map(b => {
    const opm = opms.find(o => o.sigla === b.sigla)
    const info = opm?.info
    const preenchidos = info ? ["comandante", "subcomandante", "efetivo", "area", "sobreArea", "morarPerto", "distanciaBR"].filter(k => (info as Record<string, unknown>)[k]).length : 0
    return {
      sigla: b.sigla, slug: b.slug, nome: b.nome, sede: b.sede, municipio: b.municipio,
      opcao1: lista.filter(r => r.opcao1 === b.sigla).length,
      opcao2: lista.filter(r => r.opcao2 === b.sigla).length,
      comandante: info?.comandante ?? null,
      fichaCompleta: preenchidos, mensagens: opm?._count.mural ?? 0,
    }
  })
  const minha = lista.find(r => r.mat === minhaMat) ?? null

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: "16px 0 4px" }}>
        Escolha de Batalhões
      </h1>
      <p style={{ color: "var(--ink-60)", margin: "0 0 20px", fontSize: 14, lineHeight: 1.5 }}>
        Conheça os batalhões da RMR e veja quem da turma escolheu cada um — dados do levantamento da DAG para o aspirantado.
      </p>
      <BatalhoesClient
        cards={cards}
        respondentes={lista.length}
        totalAlunos={totalAlunos}
        minha={minha ? { opcao1: minha.opcao1, opcao2: minha.opcao2 } : null}
        planilhaOk={respostas !== null}
        planilhaUrl={PLANILHA_URL}
      />
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
