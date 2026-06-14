import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { logAcesso } from "@/lib/log"

export default async function PainelPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!session.user.isAdmin) {
    return (
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div aria-hidden style={{ fontSize: 40 }}>🔒</div>
        <h1 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)", fontSize: "1.5rem", marginTop: 12 }}>Área restrita</h1>
        <p style={{ color: "var(--ink-60)", marginTop: 8 }}>Painel exclusivo da administração.</p>
        <Link href="/inicio" style={{ display: "inline-block", marginTop: 20, padding: "10px 18px", borderRadius: 8, background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600 }}>← Início</Link>
      </main>
    )
  }

  await logAcesso(session.user as any, "painel-admin", "acessou o painel administrativo")

  const agora = new Date()
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const seteDias = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    alunos, qCount, mCount, fCount, prefCount, qPorMat, fPorMat, mPorMat, logs,
    acessosTotal, acessosHoje, acessos7d,
  ] = await Promise.all([
    prisma.user.count({ where: { turma: 3 } }),
    prisma.questao.count(),
    prisma.memento.count(),
    prisma.flashcard.count(),
    prisma.preferenciaOPM.count(),
    prisma.questao.groupBy({ by: ["materia"], _count: { materia: true } }),
    prisma.flashcard.groupBy({ by: ["materia"], _count: { materia: true } }),
    prisma.memento.groupBy({ by: ["materia"], _count: { materia: true } }),
    prisma.logAcesso.findMany({ where: { area: { not: "login" } }, orderBy: { timestamp: "desc" }, take: 50 }),
    prisma.logAcesso.count({ where: { area: "login" } }),
    prisma.logAcesso.count({ where: { area: "login", timestamp: { gte: inicioHoje } } }),
    prisma.logAcesso.count({ where: { area: "login", timestamp: { gte: seteDias } } }),
  ])

  const mats = new Set<string>([...qPorMat, ...fPorMat, ...mPorMat].map(x => x.materia))
  const qMap = new Map(qPorMat.map(x => [x.materia, x._count.materia]))
  const fMap = new Map(fPorMat.map(x => [x.materia, x._count.materia]))
  const mMap = new Map(mPorMat.map(x => [x.materia, x._count.materia]))
  const conteudo = [...mats].sort().map(m => ({ sigla: m, q: qMap.get(m) || 0, f: fMap.get(m) || 0, me: mMap.get(m) || 0 }))

  const stat = (label: string, valor: number | string) => (
    <div style={{ padding: "14px 12px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{label}</div>
      <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.6rem", fontWeight: 600, color: "var(--olive)" }}>{valor}</div>
    </div>
  )

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 16 }}>
        Painel administrativo
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        {stat("Alunos T3", alunos)}
        {stat("Questões", qCount)}
        {stat("Flashcards", fCount)}
        {stat("Mementos", mCount)}
        {stat("Pref. OPM", prefCount)}
      </div>

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 28, marginBottom: 10 }}>Logins no sistema</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        {stat("Logins (total)", acessosTotal)}
        {stat("Hoje", acessosHoje)}
        {stat("Últimos 7 dias", acessos7d)}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 8 }}>
        Conta apenas <strong>logins</strong> (entradas com matrícula e senha), não visitas. Como a sessão fica salva por
        semanas, quem já está logado navega sem gerar novo registro — por isso o número subestima o uso real e não é
        exibido por aluno.
      </p>

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 28, marginBottom: 10 }}>Conteúdo por matéria</h2>
      {conteudo.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhum conteúdo cadastrado ainda.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--olive)", color: "var(--canvas)" }}>
              <th style={{ textAlign: "left", padding: "8px 10px" }}>Matéria</th>
              <th style={{ padding: "8px 10px" }}>Questões</th>
              <th style={{ padding: "8px 10px" }}>Flashcards</th>
              <th style={{ padding: "8px 10px" }}>Mementos</th>
            </tr>
          </thead>
          <tbody>
            {conteudo.map((c, i) => (
              <tr key={c.sigla} style={{ background: i % 2 ? "#f4f1e8" : "#fff" }}>
                <td style={{ padding: "7px 10px", fontWeight: 600 }}>{c.sigla}</td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>{c.q}</td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>{c.f}</td>
                <td style={{ padding: "7px 10px", textAlign: "center" }}>{c.me}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 28, marginBottom: 10 }}>
        Logs de ações administrativas <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-60)" }}>(LGPD · últimos 50)</span>
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {logs.map(l => (
          <li key={l.id} style={{ fontSize: 13, color: "var(--ink)", padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid rgba(58,74,58,0.12)" }}>
            <span style={{ color: "var(--ink-60)" }}>{new Date(l.timestamp).toLocaleString("pt-BR")}</span>
            {" · "}<strong>{l.nomeGuerra}</strong> ({l.matricula}){" · "}<span style={{ color: "var(--olive)" }}>{l.area}</span>{" — "}{l.acao}
          </li>
        ))}
        {logs.length === 0 && <li style={{ color: "var(--ink-60)" }}>Sem registros ainda.</li>}
      </ul>

      <p style={{ marginTop: 24 }}>
        <Link href="/ajuda-senha" style={{ color: "var(--gold)", fontWeight: 600 }}>Como resetar a senha de um aluno →</Link>
      </p>

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}
