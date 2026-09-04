import { readdir } from "node:fs/promises"
import path from "node:path"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { PDF_PARTS, type PdfPart } from "@/lib/mementos-pdfs"
import { APOSTILA_PARTS, type ApostilaPart } from "@/lib/apostilas"
import { hojeRecifeISO } from "@/lib/calendario-provas"
import { tipoPorExtensao, tituloDeArquivo } from "@/lib/midia-embed"
import { MIDIAS_DRIVE } from "@/lib/midias-drive"
import { MementosClient } from "./mementos-client"

export default async function MementosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [mementos, fcGroups, disciplinas, midias] = await Promise.all([
    prisma.memento.findMany({
      select: { id: true, materia: true, modulo: true, titulo: true },
      orderBy: [{ materia: "asc" }, { modulo: "asc" }, { ordem: "asc" }],
    }),
    // mantido apenas para a área "Limpar matéria" do admin (conteudoMaterias)
    prisma.flashcard.groupBy({ by: ["materia", "modulo"], _count: { _all: true } }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true, status: true }, orderBy: { sigla: "asc" } }),
    // vídeo / áudio / mapa mental por matéria (links do Drive ou YouTube)
    // (tolerante: se a tabela ainda não existir no banco — antes do db:push — segue sem itens)
    prisma.mementoMidia.findMany({
      select: { id: true, materia: true, tipo: true, titulo: true, url: true, ordem: true },
      orderBy: [{ materia: "asc" }, { tipo: "asc" }, { ordem: "asc" }, { createdAt: "asc" }],
    }).catch(() => [] as { id: string; materia: string; tipo: string; titulo: string; url: string; ordem: number }[]),
  ])

  const nomeMap = new Map(disciplinas.map(d => [d.sigla, d.nome]))

  // matérias com PDF "Pernambuco Imortal" em /public/mementos/
  // (1 arquivo = <SIGLA>.pdf; várias partes = <SIGLA>-N.pdf, rotuladas no manifesto)
  let pdfMaterias: { sigla: string; nome: string; parts: PdfPart[] }[] = []
  try {
    const dir = path.join(process.cwd(), "public", "mementos")
    const arquivos = (await readdir(dir)).filter(f => f.toLowerCase().endsWith(".pdf"))
    const bySigla = new Map<string, string[]>()
    for (const f of arquivos) {
      const base = f.slice(0, -4)
      const sigla = (base.includes("-") ? base.slice(0, base.indexOf("-")) : base).toUpperCase()
      ;(bySigla.get(sigla) ?? bySigla.set(sigla, []).get(sigla)!).push(f)
    }
    pdfMaterias = [...bySigla.entries()].map(([sigla, files]) => {
      const manifest = PDF_PARTS[sigla]
      const parts: PdfPart[] = manifest
        ? manifest.filter(p => files.includes(p.file))
        : files.sort().map(file => ({ file, label: "PDF" }))
      return { sigla, nome: nomeMap.get(sigla) || sigla, parts }
    }).filter(m => m.parts.length > 0)
  } catch { /* pasta ausente — sem PDFs */ }

  // matérias com apostila em /public/apostilas/ (1 arquivo = <SIGLA>.pdf;
  // várias partes = <SIGLA>-N.pdf, rotuladas no manifesto APOSTILA_PARTS)
  let apostilaMaterias: { sigla: string; parts: ApostilaPart[] }[] = []
  try {
    const dir = path.join(process.cwd(), "public", "apostilas")
    const arquivos = (await readdir(dir)).filter(f => f.toLowerCase().endsWith(".pdf"))
    const bySigla = new Map<string, string[]>()
    for (const f of arquivos) {
      const base = f.slice(0, -4)
      const sigla = (base.includes("-") ? base.slice(0, base.indexOf("-")) : base).toUpperCase()
      ;(bySigla.get(sigla) ?? bySigla.set(sigla, []).get(sigla)!).push(f)
    }
    apostilaMaterias = [...bySigla.entries()].map(([sigla, files]) => {
      const manifest = APOSTILA_PARTS[sigla]
      const parts: ApostilaPart[] = manifest
        ? manifest.filter(p => files.includes(p.file))
        : files.sort().map(file => ({ file, label: "Apostila" }))
      return { sigla, parts }
    }).filter(m => m.parts.length > 0).sort((a, b) => a.sigla.localeCompare(b.sigla))
  } catch { /* pasta ausente — sem apostilas */ }

  // mídias locais em /public/midias/<SIGLA>/ (vídeo, áudio ou mapa mental
  // detectados pela extensão; título vem do nome do arquivo). Somam-se às do banco.
  type MidiaItem = (typeof midias)[number]
  const midiasLocais: MidiaItem[] = []
  try {
    const raiz = path.join(process.cwd(), "public", "midias")
    for (const pasta of await readdir(raiz)) {
      const sigla = pasta.toUpperCase()
      let arquivos: string[] = []
      try { arquivos = await readdir(path.join(raiz, pasta)) } catch { continue }
      for (const [i, f] of arquivos.sort().entries()) {
        const tipo = tipoPorExtensao(f)
        if (!tipo) continue
        midiasLocais.push({ id: `file:${sigla}/${f}`, materia: sigla, tipo, titulo: tituloDeArquivo(f), url: `/midias/${encodeURIComponent(pasta)}/${encodeURIComponent(f)}`, ordem: -1000 + i })
      }
    }
  } catch { /* pasta ausente — sem mídias locais */ }
  // mídias declaradas em código (links do Drive/YouTube) — não pesam no repositório
  const midiasDrive: MidiaItem[] = Object.entries(MIDIAS_DRIVE).flatMap(([sigla, itens]) =>
    itens.map((m, i) => ({ id: `drive:${sigla}/${i}`, materia: sigla.toUpperCase(), tipo: m.tipo, titulo: m.titulo, url: m.url, ordem: -500 + i }))
  )
  const todasMidias = [...midiasLocais, ...midiasDrive, ...midias].sort((a, b) => a.materia.localeCompare(b.materia) || a.tipo.localeCompare(b.tipo) || a.ordem - b.ordem)

  // matérias com conteúdo (mementos + flashcards) — para a área de limpar
  const contMap = new Map<string, Set<string>>()
  for (const m of mementos) (contMap.get(m.materia) || contMap.set(m.materia, new Set()).get(m.materia)!).add(m.modulo)
  for (const g of fcGroups) (contMap.get(g.materia) || contMap.set(g.materia, new Set()).get(g.materia)!).add(g.modulo)
  const conteudoMaterias = [...contMap.entries()]
    .map(([sigla, mods]) => ({ sigla, nome: nomeMap.get(sigla) || sigla, modulos: [...mods].sort() }))
    .sort((a, b) => a.sigla.localeCompare(b.sigla))

  return (
    <MementosClient
      mementos={mementos.map(m => ({ ...m, nome: nomeMap.get(m.materia) || m.materia }))}
      conteudoMaterias={conteudoMaterias}
      disciplinas={disciplinas}
      isAdmin={await adminAtivo(session.user.isAdmin)}
      currentUser={{ matricula: session.user.matricula, nomeGuerra: session.user.nomeGuerra }}
      pdfMaterias={pdfMaterias}
      apostilaMaterias={apostilaMaterias}
      midias={todasMidias}
      hojeISO={hojeRecifeISO()}
    />
  )
}
