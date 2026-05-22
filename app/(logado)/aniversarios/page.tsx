import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

export default async function AniversariosPage() {
  const alunos = await prisma.user.findMany({
    where: { aniversario: { not: null } },
    select: { matricula: true, nomeGuerra: true, aniversario: true },
  })

  const porMes: Record<number, typeof alunos> = {}
  for (let m = 1; m <= 12; m++) porMes[m] = []

  for (const a of alunos) {
    if (!a.aniversario) continue
    const [, mes] = a.aniversario.split("/")
    const m = Number(mes)
    if (porMes[m]) porMes[m].push(a)
  }

  for (const m in porMes) {
    porMes[m].sort((a, b) => Number(a.aniversario!.split("/")[0]) - Number(b.aniversario!.split("/")[0]))
  }

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const diaHoje = String(hoje.getDate()).padStart(2, "0")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Calendário de Aniversários</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MESES.map((mes, i) => {
          const m = i + 1
          const isAtual = m === mesAtual
          const lista = porMes[m] || []
          return (
            <div key={m} className={`rounded-xl border p-4 ${isAtual ? "border-yellow-300 bg-yellow-50" : "border-slate-200 bg-white"}`}>
              <h2 className={`font-semibold text-sm mb-2 ${isAtual ? "text-yellow-700" : "text-slate-600"}`}>
                {mes} {isAtual && "← atual"}
              </h2>
              {lista.length === 0 ? (
                <p className="text-slate-400 text-xs">Ninguém</p>
              ) : (
                <ul className="space-y-1">
                  {lista.map((a) => {
                    const isHoje = isAtual && a.aniversario?.startsWith(diaHoje + "/")
                    return (
                      <li key={a.matricula} className={`text-sm flex gap-2 ${isHoje ? "font-semibold text-yellow-700" : "text-slate-700"}`}>
                        <span className="text-slate-400 w-6">{a.aniversario?.split("/")[0]}</span>
                        {isHoje && "🎂"}
                        {a.nomeGuerra}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
