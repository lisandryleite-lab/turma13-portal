import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { semanaAtual } from "@/lib/utils"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user
  const matricula = user.matricula

  const semana = semanaAtual()

  const [aluno, missao, aviso, xerife, disciplinas, minhasNotas] = await Promise.all([
    prisma.user.findUnique({
      where: { matricula },
      select: { id: true, nomeGuerra: true, nomeCompleto: true, email: true, canga: true, grupoPlantao: true, grupoFaxina: true, aniversario: true },
    }),
    prisma.missao.findFirst({ where: { semana } }),
    prisma.aviso.findFirst({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] }),
    prisma.xerife.findFirst({ where: { atual: true } }),
    prisma.disciplina.findMany({ orderBy: { sigla: "asc" } }),
    prisma.nota.findMany({
      where: { user: { matricula } },
      orderBy: { data: "desc" },
      take: 5,
    }),
  ])

  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalMinistrada = disciplinas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const progressoGeral = totalCarga > 0 ? Math.round((totalMinistrada / totalCarga) * 100) : 0
  const disciplinasEncerradas = disciplinas.filter(d => d.status === "Encerrada" || d.cargaMinistrada >= d.cargaTotal).length

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

      {/* ── Xerife — banner discreto no topo ── */}
      {xerife && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(184,146,74,0.10)",
          border: "1px solid rgba(184,146,74,0.30)",
          borderRadius: 10, padding: "8px 14px",
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <p style={{ fontSize: 12, color: "var(--azul-profundo)", margin: 0 }}>
            <span style={{ fontWeight: 400, color: "#8a7040" }}>Xerife atual: </span>
            <span style={{ fontWeight: 700 }}>{xerife.nomeGuerra}</span>
            <span style={{ color: "#b8924a", marginLeft: 6, fontSize: 11 }}>Mat. {xerife.matricula}</span>
          </p>
          <Link href="/xerifancia" style={{ marginLeft: "auto", fontSize: 11, color: "var(--dourado)", textDecoration: "none", flexShrink: 0 }}>
            Ver histórico →
          </Link>
        </div>
      )}

      {/* ── Saudação ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 24, color: "var(--azul-profundo)", margin: 0 }}>
          Olá, {aluno?.nomeGuerra}!
        </h1>
        <p style={{ color: "#6b7a99", fontSize: 13, marginTop: 4 }}>Semana {semana}/52 · Mat. {matricula}</p>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>

        {/* ── Progresso geral ── */}
        <div style={{ gridColumn: "1/-1", background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #dde3ee", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--azul-profundo)", margin: 0 }}>Progresso do Curso</h2>
            <span style={{ fontSize: 12, color: "#9aa3b8" }}>{disciplinasEncerradas}/{disciplinas.length} encerradas</span>
          </div>
          <div style={{ height: 10, background: "#edf0f7", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${progressoGeral}%`, background: "var(--azul-profundo)", borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9aa3b8" }}>
            <span>{totalMinistrada}h ministradas</span>
            <span style={{ fontWeight: 700, color: "var(--azul-profundo)" }}>{progressoGeral}%</span>
            <span>{totalCarga}h total</span>
          </div>
        </div>

        {/* ── Missão da Semana — em verde ── */}
        <div style={{
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          border: "1.5px solid #86efac",
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>Missão · Semana {semana}</h2>
          </div>
          {missao ? (
            <div>
              <p style={{ fontWeight: 700, color: "#14532d", fontSize: 14, margin: "0 0 6px" }}>{missao.titulo}</p>
              <p style={{ color: "#166534", fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}
                className="line-clamp-3">{missao.corpo}</p>
              <Link href="/comunicados" style={{ fontSize: 12, color: "#15803d", textDecoration: "none", fontWeight: 600 }}>
                Ver completa →
              </Link>
            </div>
          ) : (
            <p style={{ color: "#86efac", fontSize: 13 }}>Não definida ainda</p>
          )}
        </div>

        {/* ── Últimas avaliações ── */}
        {minhasNotas.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #dde3ee", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--azul-profundo)", margin: "0 0 12px" }}>Últimas Avaliações</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {minhasNotas.map(n => (
                <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--azul-profundo)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.disciplina}</p>
                    <p style={{ fontSize: 11, color: "#9aa3b8", margin: 0 }}>{n.avaliacao}</p>
                  </div>
                  <span style={{ fontWeight: 800, marginLeft: 12, flexShrink: 0, fontSize: 15,
                    color: n.nota >= 7 ? "#15803d" : n.nota >= 5 ? "var(--dourado)" : "#b91c1c" }}>
                    {n.nota.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/ranking" style={{ fontSize: 12, color: "var(--azul-medio)", textDecoration: "none", display: "block", marginTop: 10 }}>Ver ranking →</Link>
          </div>
        )}

        {/* ── Dados do aluno ── */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #dde3ee", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--azul-profundo)", margin: "0 0 12px" }}>Seus Dados</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
            {aluno?.canga && <p style={{ margin: 0 }}><span style={{ color: "#9aa3b8" }}>Canga: </span><span style={{ fontWeight: 600, color: "var(--azul-profundo)" }}>{aluno.canga}</span></p>}
            {aluno?.grupoPlantao && <p style={{ margin: 0 }}><span style={{ color: "#9aa3b8" }}>Plantão: </span><span style={{ fontWeight: 600 }}>{aluno.grupoPlantao}</span></p>}
            {aluno?.grupoFaxina && <p style={{ margin: 0 }}><span style={{ color: "#9aa3b8" }}>Faxina: </span><span style={{ fontWeight: 600 }}>{aluno.grupoFaxina}</span></p>}
            {aluno?.aniversario && <p style={{ margin: 0 }}><span style={{ color: "#9aa3b8" }}>Aniversário: </span><span style={{ fontWeight: 600 }}>{aluno.aniversario}</span></p>}
          </div>
          <Link href="/alterar-senha" style={{ fontSize: 12, color: "#9aa3b8", textDecoration: "none", display: "block", marginTop: 10 }}>🔒 Alterar senha →</Link>
        </div>

        {/* ── Último aviso ── */}
        {aviso && (
          <div style={{ gridColumn: "1/-1", background: "#fffbf0", border: "1.5px solid #f0c060", borderRadius: 14, padding: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 6px" }}>📌 {aviso.titulo}</h2>
            <p style={{ color: "#78350f", fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}
              className="line-clamp-2">{aviso.corpo}</p>
            <Link href="/comunicados" style={{ fontSize: 12, color: "#b45309", textDecoration: "none", fontWeight: 600 }}>
              Ver todos os avisos →
            </Link>
          </div>
        )}

        {/* ── Links rápidos: Ranking / Escalas / Links Úteis ── */}
        <div style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { href: "/ranking",  label: "Ranking",      emoji: "🏆", desc: "Sua posição no curso" },
            { href: "/escalas",  label: "Escalas",      emoji: "🔄", desc: "Serviço, faxina e plantão" },
            { href: "/links",    label: "Links Úteis",  emoji: "🔗", desc: "Recursos e sistemas" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              background: "#fff", border: "1.5px solid #dde3ee", borderRadius: 14,
              padding: "18px 16px", textAlign: "center", textDecoration: "none",
              boxShadow: "0 1px 4px rgba(11,45,94,0.06)",
              transition: "border-color 0.15s, box-shadow 0.15s",
              display: "block",
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{l.emoji}</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--azul-profundo)", margin: "0 0 3px" }}>{l.label}</p>
              <p style={{ fontSize: 11, color: "#9aa3b8", margin: 0 }}>{l.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
