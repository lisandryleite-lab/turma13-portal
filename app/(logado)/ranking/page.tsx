import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples } from "@/lib/ranking"

export const dynamic = "force-dynamic"

export default async function RankingPage() {
  const session = await auth()
  const minhaMatricula = session!.user.matricula

  const [alunos, todasNotas] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { matricula: "asc" },
      select: { id: true, matricula: true, nomeGuerra: true, canga: true },
    }),
    prisma.nota.findMany({
      select: {
        userId: true,
        disciplina: true,
        avaliacao: true,
        nota: true,
        peso: true,
        ehAF: true,
        apto: true,
      },
    }),
  ])

  const notasPorUser: Record<string, typeof todasNotas> = {}
  for (const n of todasNotas) {
    if (!notasPorUser[n.userId]) notasPorUser[n.userId] = []
    notasPorUser[n.userId].push(n)
  }

  const ranking = alunos
    .map((a) => ({
      ...a,
      mgc: calcularMGCSimples(notasPorUser[a.id] || []),
    }))
    .sort((a, b) => {
      if (a.mgc === null && b.mgc === null) return a.matricula - b.matricula
      if (a.mgc === null) return 1
      if (b.mgc === null) return -1
      return b.mgc - a.mgc
    })

  const minhaPos = ranking.findIndex((a) => a.matricula === minhaMatricula)
  const minhaEntrada = ranking[minhaPos]

  function medalha(i: number) {
    if (i === 0) return "🥇"
    if (i === 1) return "🥈"
    if (i === 2) return "🥉"
    return null
  }

  function ordinal(n: number) {
    return `${n}º`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--serif)", color: "var(--azul-profundo)" }}
        >
          Ranking da Turma
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--azul-medio)" }}>
          MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10 · Decreto 57.694/2024
        </p>
      </div>

      {/* Card do aluno logado */}
      {minhaEntrada && (
        <div
          className="rounded-xl p-4 mb-6 flex items-center gap-4"
          style={{ background: "var(--azul-profundo)", color: "#fff" }}
        >
          <div
            className="text-3xl font-bold w-14 text-center shrink-0"
            style={{ fontFamily: "var(--serif)" }}
          >
            {medalha(minhaPos) ?? ordinal(minhaPos + 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{minhaEntrada.nomeGuerra}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              Mat. {minhaEntrada.matricula}
              {minhaEntrada.canga ? ` · Canga: ${minhaEntrada.canga}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--serif)" }}
            >
              {minhaEntrada.mgc !== null ? minhaEntrada.mgc.toFixed(3) : "—"}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              MGC
            </p>
          </div>
        </div>
      )}

      {/* Tabela geral */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid #dde3ee",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(11,45,94,0.06)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "var(--azul-profundo)",
                color: "#fff",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <th className="px-4 py-3 text-left w-16">Pos.</th>
              <th className="px-4 py-3 text-left">Nome de Guerra</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Mat.</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Canga</th>
              <th className="px-4 py-3 text-right">MGC</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((a, i) => {
              const isMe = a.matricula === minhaMatricula
              const med = medalha(i)
              return (
                <tr
                  key={a.matricula}
                  style={{
                    borderTop: "1px solid #edf0f7",
                    background: isMe ? "rgba(184,146,74,0.08)" : undefined,
                    fontWeight: isMe ? 600 : undefined,
                  }}
                >
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: med ? undefined : "var(--azul-medio)", fontSize: med ? 18 : undefined }}
                  >
                    {med ? `${med} ${ordinal(i + 1)}` : ordinal(i + 1)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--azul-profundo)" }}>
                    {a.nomeGuerra}
                    {isMe && (
                      <span
                        className="ml-2 text-xs font-normal"
                        style={{ color: "var(--dourado)" }}
                      >
                        (você)
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 hidden sm:table-cell"
                    style={{ color: "#6b7a99" }}
                  >
                    {a.matricula}
                  </td>
                  <td
                    className="px-4 py-3 hidden md:table-cell"
                    style={{ color: "#6b7a99" }}
                  >
                    {a.canga || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {a.mgc !== null ? (
                      <span style={{ color: "var(--azul-profundo)", fontWeight: 700 }}>
                        {a.mgc.toFixed(3)}
                      </span>
                    ) : (
                      <span style={{ color: "#c5cde0" }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4 text-center" style={{ color: "#9aa3b8" }}>
        NFDC = 10 (sem transgressões registradas) · Atualizado em tempo real
      </p>
    </div>
  )
}
