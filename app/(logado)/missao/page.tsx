import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { MissaoAdmin } from "./missao-admin"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function MissaoPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const SEMANA_ATUAL = semanaAtual()

  const missoes = await prisma.missao.findMany({ orderBy: { semana: "desc" } })
  const atual = missoes.find((m) => m.semana === SEMANA_ATUAL) || missoes[0]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Missão da Semana</h1>

      {atual ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Semana {atual.semana}/52</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{atual.titulo}</h2>
          <p className="text-slate-600 whitespace-pre-wrap">{atual.corpo}</p>
        </div>
      ) : (
        <p className="text-slate-500">Missão ainda não definida.</p>
      )}

      {isAdmin && <MissaoAdmin semanaAtual={SEMANA_ATUAL} />}

      {missoes.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico</h2>
          <div className="space-y-3">
            {missoes.slice(1).map((m) => (
              <div key={m.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Semana {m.semana}</p>
                <p className="font-medium text-slate-700">{m.titulo}</p>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{m.corpo}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
