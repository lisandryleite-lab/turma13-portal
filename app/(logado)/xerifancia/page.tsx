import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { XerifanciaAdmin } from "./xerifancia-admin"

export const dynamic = "force-dynamic"

export default async function XerifanciaPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin

  const alunos = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { matricula: "asc" },
    select: { matricula: true, nomeGuerra: true },
  })

  const xerifes = await prisma.xerife.findMany({ orderBy: { dataInicio: "desc" } })
  const atual = xerifes.find((x) => x.atual)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Xerifância</h1>

      {atual && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-xl font-bold text-slate-800">{atual.nomeGuerra}</p>
          <p className="text-slate-500 text-sm">Mat. {atual.matricula}</p>
          <p className="text-slate-400 text-xs mt-1">
            Desde {new Date(atual.dataInicio).toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}

      {isAdmin && <XerifanciaAdmin alunos={alunos} />}

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Histórico</h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {xerifes.map((x, i) => (
            <div key={x.id} className={`px-4 py-3 text-sm flex items-center gap-4 ${i > 0 ? "border-t border-slate-100" : ""} ${x.atual ? "bg-yellow-50" : ""}`}>
              <span className="font-medium w-36">{x.nomeGuerra}</span>
              <span className="text-slate-500">Mat. {x.matricula}</span>
              <span className="text-slate-400 ml-auto text-xs">
                {new Date(x.dataInicio).toLocaleDateString("pt-BR")}
                {x.dataFim && ` → ${new Date(x.dataFim).toLocaleDateString("pt-BR")}`}
              </span>
              {x.atual && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-semibold">Atual</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
