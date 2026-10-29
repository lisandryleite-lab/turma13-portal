import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples, calcularProjecaoConsolidada, type Verificacao } from "@/lib/ranking"
import { LC470_URL, OUTRAS_REGRAS, PROMOCOES_EXTRAORDINARIAS, PROMOCOES_ORDINARIAS, REQUISITOS_POSTO, type TipoPromocao } from "@/lib/promocoes-lei"
import { CarreiraClient } from "./carreira-client"

export const dynamic = "force-dynamic"

// Posição provável no CFO, com a mesma conta do /ranking (null se o aluno não lançou notas)
async function posicaoProvavel(userId: string, turmaSize: number) {
  const notas = await prisma.notaCFO.findMany({
    where: { user: { turma: 3 } },
    select: { userId: true, disciplina: true, avaliacao: true, valor: true, ehAF: true, apto: true, user: { select: { nfdc: true } } },
  })
  const porUser = new Map<string, { nfdc: number; vs: Verificacao[] }>()
  for (const n of notas) {
    const e = porUser.get(n.userId) ?? { nfdc: n.user.nfdc, vs: [] }
    e.vs.push({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto })
    porUser.set(n.userId, e)
  }
  const minha = porUser.get(userId)
  const mgc = minha ? calcularMGCSimples(minha.vs, minha.nfdc) : null
  if (mgc == null) return null
  const outros = [...porUser].filter(([id]) => id !== userId).map(([, e]) => calcularMGCSimples(e.vs, e.nfdc)).filter((m): m is number => m != null)
  return calcularProjecaoConsolidada(mgc, outros.filter(m => m > mgc).length, turmaSize, outros.length + 1).provavel
}

const caixa: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.12)", padding: 18 }
const h2: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }
const th: React.CSSProperties = { padding: "7px 10px", textAlign: "left", fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }
const td: React.CSSProperties = { padding: "8px 10px", borderTop: "1px solid var(--surface)", fontSize: 13.5 }

function Tipo({ t }: { t: TipoPromocao }) {
  return (
    <details style={{ borderTop: "1px solid var(--surface)", padding: "10px 0" }}>
      <summary style={{ cursor: "pointer", fontSize: 14 }}>
        <strong style={{ color: "var(--olive)" }}>{t.nome}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>· {t.artigos}</span>
        <div style={{ fontSize: 13, color: "var(--ink-60)", margin: "2px 0 0 16px" }}>{t.resumo}</div>
      </summary>
      <ul style={{ margin: "8px 0 0", paddingLeft: 34, fontSize: 13, lineHeight: 1.55 }}>
        {t.criterios.map(c => <li key={c}>{c}</li>)}
      </ul>
    </details>
  )
}

export default async function CarreiraPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const turmaSize = await prisma.user.count({ where: { turma: 3 } })
  const sugerida = await posicaoProvavel(session.user.id!, turmaSize)

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/batalhoes" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Escolha de Batalhões</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: "16px 0 4px" }}>Simulador de carreira</h1>
      <p style={{ color: "var(--ink-60)", margin: "0 0 18px", fontSize: 14, lineHeight: 1.5 }}>
        Quando você chega a cada posto, com as regras da LC nº 470/2021, as vagas fixadas em lei e quem ocupa cada posto hoje. Mude as variáveis e veja o que muda.
      </p>

      <CarreiraClient tamanhoTurma={Math.max(turmaSize, 1)} posicaoSugerida={sugerida} />

      <section style={{ ...caixa, marginTop: 16 }}>
        <h2 style={h2}>Como funcionam as promoções</h2>
        <p style={{ margin: "4px 0 6px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
          Resumo da <a href={LC470_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>LC nº 470/2021</a> para o quadro de oficiais (QOPM). Toque em cada tipo para ver os critérios.
        </p>
        <h3 style={{ fontSize: 12, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "12px 0 0" }}>Critérios ordinários</h3>
        {PROMOCOES_ORDINARIAS.map(t => <Tipo key={t.nome} t={t} />)}
        <h3 style={{ fontSize: 12, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "16px 0 0" }}>Critérios extraordinários</h3>
        {PROMOCOES_EXTRAORDINARIAS.map(t => <Tipo key={t.nome} t={t} />)}

        <h3 style={{ fontSize: 12, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "16px 0 6px" }}>Requisitos por posto (Anexos V e VII)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead><tr><th style={th}>No posto de</th><th style={th}>Interstício</th><th style={th}>Serviço arregimentado</th><th style={th}>Curso exigido</th></tr></thead>
            <tbody>{REQUISITOS_POSTO.map(r => (
              <tr key={r.posto}><td style={{ ...td, fontWeight: 600 }}>{r.posto}</td><td style={td}>{r.intersticio}</td><td style={td}>{r.arregimentado}</td><td style={td}>{r.curso}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
          {OUTRAS_REGRAS.map(r => <li key={r}>{r}</li>)}
        </ul>
      </section>
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
