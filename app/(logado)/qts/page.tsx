import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { QtsAdmin } from "./qts-admin"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function QtsPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const SEMANA_ATUAL = semanaAtual()

  const qts = await prisma.qTS.findUnique({ where: { semana: SEMANA_ATUAL } })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">QTS — Semana {SEMANA_ATUAL}/52</h1>
      </div>

      {qts ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-auto">
          <QtsDisplay dados={qts.dados as any} />
        </div>
      ) : (
        <div className="bg-slate-100 rounded-xl p-8 text-center">
          <p className="text-slate-500">QTS ainda não cadastrado para esta semana.</p>
          {isAdmin && <p className="text-slate-400 text-sm mt-1">Use o formulário abaixo para cadastrar.</p>}
        </div>
      )}

      {isAdmin && <QtsAdmin semanaAtual={SEMANA_ATUAL} dadosExistentes={qts?.dados as any} />}
    </div>
  )
}

function QtsDisplay({ dados }: { dados: { dias: string[]; horarios: string[]; grade: Record<string, string[]> } }) {
  if (!dados?.dias || !dados?.horarios || !dados?.grade) {
    return <p className="p-4 text-slate-500 text-sm">Formato de QTS inválido.</p>
  }

  return (
    <table className="w-full text-sm min-w-[600px]">
      <thead>
        <tr className="bg-slate-800 text-white">
          <th className="px-3 py-2 text-left text-xs">Horário</th>
          {dados.dias.map((dia) => (
            <th key={dia} className="px-3 py-2 text-left text-xs">{dia}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dados.horarios.map((hora, i) => (
          <tr key={hora} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
            <td className="px-3 py-2 text-slate-500 font-mono text-xs whitespace-nowrap">{hora}</td>
            {dados.dias.map((dia) => {
              const aula = dados.grade[dia]?.[i] || ""
              return (
                <td key={dia} className={`px-3 py-2 text-xs ${aula ? "text-slate-800 font-medium" : "text-slate-300"}`}>
                  {aula || "—"}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
