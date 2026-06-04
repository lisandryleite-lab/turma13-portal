import { readdir } from "node:fs/promises"
import path from "node:path"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { PDF_PARTS, type PdfPart } from "@/lib/mementos-pdfs"
import { MementosClient } from "./mementos-client"

export default async function MementosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [mementos, fcGroups, disciplinas] = await Promise.all([
    prisma.memento.findMany({
      select: { id: true, materia: true, modulo: true, titulo: true },
      orderBy: [{ materia: "asc" }, { modulo: "asc" }, { ordem: "asc" }],
    }),
    prisma.flashcard.groupBy({ by: ["materia", "modulo"], _count: { _all: true } }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true }, orderBy: { sigla: "asc" } }),
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
  // agrega total + módulos por matéria (flashcards)
  const matMap = new Map<string, { total: number; modulos: Set<string> }>()
  for (const g of fcGroups) {
    const e = matMap.get(g.materia) || { total: 0, modulos: new Set<string>() }
    e.total += g._count._all
    e.modulos.add(g.modulo)
    matMap.set(g.materia, e)
  }
  const flashMaterias = [...matMap.entries()]
    .map(([sigla, e]) => ({ sigla, nome: nomeMap.get(sigla) || sigla, total: e.total, modulos: [...e.modulos].sort() }))
    .sort((a, b) => a.sigla.localeCompare(b.sigla))

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
      flashMaterias={flashMaterias}
      conteudoMaterias={conteudoMaterias}
      disciplinas={disciplinas}
      isAdmin={await adminAtivo(session.user.isAdmin)}
      currentUser={{ matricula: session.user.matricula, nomeGuerra: session.user.nomeGuerra }}
      pdfMaterias={pdfMaterias}
    />
  )
}
