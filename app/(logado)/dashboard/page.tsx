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

  const [aluno, missao, aviso, xerife, disciplinas, todosComAniv] = await Promise.all([
    prisma.user.findUnique({
      where: { matricula },
      select: { id: true, nomeGuerra: true, nomeCompleto: true, email: true, canga: true, grupoPlantao: true, grupoFaxina: true, aniversario: true },
    }),
    prisma.missao.findFirst({ where: { semana } }),
    prisma.aviso.findFirst({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] }),
    prisma.xerife.findFirst({ where: { atual: true } }),
    prisma.disciplina.findMany({ orderBy: { sigla: "asc" } }),
    prisma.user.findMany({
      where: { isAdmin: false, aniversario: { not: null } },
      select: { nomeGuerra: true, aniversario: true, matricula: true },
    }),
  ])

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const diaHoje = String(hoje.getDate()).padStart(2, "0")

  const aniversariantesDoMes = todosComAniv
    .filter(a => Number(a.aniversario?.split("/")[1]) === mesAtual)
    .sort((a, b) => Number(a.aniversario!.split("/")[0]) - Number(b.aniversario!.split("/")[0]))

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

        {/* ── Seus Dados ── */}
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

        {/* ── Aniversariantes do mês ── */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #dde3ee", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🎂</span>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--azul-profundo)", margin: 0 }}>
              Aniversariantes — {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mesAtual - 1]}
            </h2>
          </div>
          {aniversariantesDoMes.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9aa3b8", margin: 0 }}>Ninguém este mês.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {aniversariantesDoMes.map(a => {
                const dia = a.aniversario!.split("/")[0]
                const isHoje = dia.padStart(2,"0") === diaHoje
                return (
                  <div key={a.matricula} style={{
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    background: isHoje ? "#fffbf0" : "transparent",
                    border: isHoje ? "1px solid #f0c060" : "1px solid transparent",
                    borderRadius: 8, padding: isHoje ? "5px 10px" : "2px 0",
                  }}>
                    <span style={{ fontSize: 11, color: "#9aa3b8", width: 22, flexShrink: 0 }}>{dia}</span>
                    {isHoje && <span>🎂</span>}
                    <span style={{ fontWeight: isHoje ? 700 : 400, color: isHoje ? "#92400e" : "var(--azul-profundo)" }}>
                      {a.nomeGuerra}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <Link href="/aniversarios" style={{ fontSize: 12, color: "var(--azul-medio)", textDecoration: "none", display: "block", marginTop: 10 }}>
            Ver calendário completo →
          </Link>
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
            { href: "/ranking",  label: "Ranking",      emoji: "🏆", desc: "Sua posição no CFO" },
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
