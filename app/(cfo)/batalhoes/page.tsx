import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { carregarLevantamento, PLANILHA_URL } from "@/lib/levantamento-ome"
import { BATALHOES_BASE, FORMULARIO_DAG_URL, foraDoLevantamento } from "@/lib/batalhoes-base"
import { BatalhoesClient, type CardBatalhao, type Pendente } from "./batalhoes-client"

export const dynamic = "force-dynamic"

export default async function BatalhoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const minhaMat = session.user.matricula

  const [respostas, opms, usuarios] = await Promise.all([
    carregarLevantamento(),
    prisma.oPM.findMany({ where: { especial: false }, include: { info: true, _count: { select: { mural: true } } } }),
    prisma.user.findMany({
      where: { matricula: { gt: 0 } },
      select: { matricula: true, nomeGuerra: true, pelotao: true, turma: true, ativo: true, isAdmin: true },
    }),
  ])
  const pelotaoDe = new Map(usuarios.map(u => [u.matricula, u.pelotao]))
  // alunos da CIA que devem responder (exclui admin, contas de teste, desistentes e 7º pelotão)
  const alunos = usuarios.filter(u => u.turma === 3 && u.ativo && !u.isAdmin && u.matricula < 900 && !foraDoLevantamento(u.matricula, u.pelotao))
  const lista = (respostas ?? []).filter(r => !foraDoLevantamento(r.mat, pelotaoDe.get(r.mat)))
  const respondeu = new Set(lista.map(r => r.mat))

  const cards: CardBatalhao[] = BATALHOES_BASE.map(b => {
    const opm = opms.find(o => o.sigla === b.sigla)
    return {
      sigla: b.sigla, slug: b.slug, nome: b.nome, sede: b.sede, municipio: b.municipio,
      opcao1: lista.filter(r => r.opcao1 === b.sigla).length,
      opcao2: lista.filter(r => r.opcao2 === b.sigla).length,
      comandante: opm?.info?.comandante ?? null,
      mensagens: opm?._count.mural ?? 0,
    }
  })
  const pendentes: Pendente[] = alunos
    .filter(a => !respondeu.has(a.matricula))
    .map(a => ({ mat: a.matricula, nome: a.nomeGuerra, pelotao: a.pelotao }))
    .sort((a, b) => (a.pelotao ?? 99) - (b.pelotao ?? 99) || a.mat - b.mat)
  const respondentesDaCia = alunos.filter(a => respondeu.has(a.matricula)).length
  const minha = lista.find(r => r.mat === minhaMat) ?? null

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: "16px 0 4px" }}>
        Escolha de Batalhões
      </h1>
      <p style={{ color: "var(--ink-60)", margin: "0 0 20px", fontSize: 14, lineHeight: 1.5 }}>
        Levantamento da DAG de interesse em OMEs para o aspirantado — quem escolheu cada batalhão e como conhecê-lo.
      </p>
      <BatalhoesClient
        cards={cards}
        respondentes={lista.length}
        respondentesDaCia={respondentesDaCia}
        totalAlunos={alunos.length}
        pendentes={pendentes}
        minha={minha ? { opcao1: minha.opcao1, opcao2: minha.opcao2 } : null}
        minhaMatricula={minhaMat}
        planilhaOk={respostas !== null}
        planilhaUrl={PLANILHA_URL}
        formularioUrl={FORMULARIO_DAG_URL}
      />
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
