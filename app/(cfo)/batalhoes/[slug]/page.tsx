import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { carregarLevantamento } from "@/lib/levantamento-ome"
import { baseDoSlug, CAMPOS_FICHA, foraDoLevantamento, linkMapa, linkMapaEmbutido, type BairroFicha, type ChaveFicha, type FonteFicha, type LinkFicha, type OperacaoFicha, type AspirantadoFicha } from "@/lib/batalhoes-base"
import { BatalhaoClient } from "./batalhao-client"

export const dynamic = "force-dynamic"

const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

export default async function BatalhaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const { slug } = await params
  const base = baseDoSlug(slug)
  if (!base) notFound()

  const [respostas, opm, alunos, isAdmin] = await Promise.all([
    carregarLevantamento(),
    prisma.oPM.findUnique({
      where: { sigla: base.sigla },
      include: {
        info: true,
        mural: { orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { matricula: true, nomeGuerra: true } } } },
      },
    }),
    prisma.user.findMany({ where: { matricula: { gt: 0 } }, select: { matricula: true, nomeGuerra: true, pelotao: true } }),
    adminAtivo(!!session.user.isAdmin),
  ])
  if (!opm) notFound()

  const porMat = new Map(alunos.map(a => [a.matricula, a]))
  const pessoa = (mat: number, qra: string) => ({ mat, nome: porMat.get(mat)?.nomeGuerra ?? qra, pelotao: porMat.get(mat)?.pelotao ?? null })
  const respostasValidas = (respostas ?? []).filter(r => !foraDoLevantamento(r.mat, porMat.get(r.mat)?.pelotao))
  const primeira = respostasValidas.filter(r => r.opcao1 === base.sigla).map(r => ({ ...pessoa(r.mat, r.qra), outra: r.opcao2 }))
  const segunda = respostasValidas.filter(r => r.opcao2 === base.sigla).map(r => ({ ...pessoa(r.mat, r.qra), outra: r.opcao1 }))

  const info = opm.info
  const textos = Object.fromEntries(CAMPOS_FICHA.map(c => [c.chave, (info?.[c.chave] as string | null) ?? ""])) as Record<ChaveFicha, string>
  if (!textos.email && base.email) textos.email = base.email

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/batalhoes" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Todos os batalhões</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "2rem", color: "var(--olive)", margin: "16px 0 2px" }}>{base.sigla}</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-60)", fontSize: 14.5 }}>{base.nome} · 📍 {base.sede}, {base.municipio}</p>
      <BatalhaoClient
        sigla={base.sigla}
        mapaUrl={linkMapa(base, info?.referenciaMapa)}
        mapaEmbutidoUrl={linkMapaEmbutido(base, info?.referenciaMapa)}
        isAdmin={isAdmin}
        minhaMatricula={session.user.matricula}
        planilhaOk={respostas !== null}
        info={textos}
        bairros={lista<BairroFicha>(info?.bairros)}
        links={lista<LinkFicha>(info?.links)}
        fontes={lista<FonteFicha>(info?.fontes)}
        operacoes={lista<OperacaoFicha>(info?.operacoes)}
        aspirantado={(info?.aspirantado as AspirantadoFicha | null) ?? null}
        atualizadoEm={info?.atualizadoEm.toISOString() ?? null}
        primeira={primeira}
        segunda={segunda}
        mural={opm.mural.map(m => ({
          id: m.id, texto: m.texto, tipo: m.tipo, bairro: m.bairro, valor: m.valor, link: m.link,
          criadoEm: m.createdAt.toISOString(), mat: m.user.matricula, nome: m.user.nomeGuerra,
        }))}
      />
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
