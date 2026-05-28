import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { XerifanciaAdmin } from "./xerifancia-admin"

export const dynamic = "force-dynamic"

export default async function XerifanciaPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin

  const [alunos, xerifes] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false, matricula: { gt: 0 } },
      orderBy: { matricula: "asc" },
      select: { matricula: true, nomeGuerra: true },
    }),
    prisma.xerife.findMany({ orderBy: { dataInicio: "desc" } }),
  ])

  const atual = xerifes.find(x => x.atual)

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--azul-profundo)",
        fontFamily: "var(--serif)", marginBottom: 24 }}>Xerifância</h1>

      {isAdmin
        ? <XerifanciaAdmin alunos={alunos} xerifes={xerifes} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {atual && (
              <div style={{
                background: "linear-gradient(135deg, #fffbf0, #fff8e1)",
                border: "1.5px solid #f0c060", borderRadius: 16, padding: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "var(--azul-profundo)", margin: 0 }}>{atual.nomeGuerra}</p>
                <p style={{ fontSize: 13, color: "#6b7a99", margin: "4px 0 0" }}>Mat. {atual.matricula}</p>
                <p style={{ fontSize: 12, color: "#9aa3b8", marginTop: 4 }}>
                  Desde {new Date(atual.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#9aa3b8",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Histórico</h2>
              <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "hidden" }}>
                {xerifes.map((x, i) => (
                  <div key={x.id} style={{
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                    borderTop: i > 0 ? "1px solid #edf0f7" : undefined,
                    background: x.atual ? "rgba(240,192,96,0.08)" : undefined,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--azul-profundo)", minWidth: 120 }}>{x.nomeGuerra}</span>
                    <span style={{ fontSize: 12, color: "#6b7a99" }}>Mat. {x.matricula}</span>
                    <span style={{ fontSize: 12, color: "#9aa3b8", marginLeft: "auto" }}>
                      {new Date(x.dataInicio).toLocaleDateString("pt-BR")}
                      {x.dataFim && ` → ${new Date(x.dataFim).toLocaleDateString("pt-BR")}`}
                    </span>
                    {x.atual && (
                      <span style={{ fontSize: 11, background: "#f0c060", color: "#7a4f00",
                        padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>Atual</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
