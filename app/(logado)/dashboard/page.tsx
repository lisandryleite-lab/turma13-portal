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

  // Progresso geral
  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalMinistrada = disciplinas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const progressoGeral = totalCarga > 0 ? Math.round((totalMinistrada / totalCarga) * 100) : 0
  const disciplinasEncerradas = disciplinas.filter(d => d.status === "Encerrada" || d.cargaMinistrada >= d.cargaTotal).length

  // Disciplinas próximas de encerrar (em andamento, >= 70% ministrada)
  const proximasAEncerrar = disciplinas
    .filter(d => d.cargaMinistrada > 0 && d.cargaMinistrada < d.cargaTotal)
    .map(d => ({ ...d, pct: Math.round((d.cargaMinistrada / d.cargaTotal) * 100) }))
    .filter(d => d.pct >= 60)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--serif)", color: "var(--azul-profundo)" }}>
          Olá, {aluno?.nomeGuerra}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">Semana {semana}/52 · Mat. {matricula}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Progresso geral do curso */}
        <div className="col-span-full bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm" style={{ color: "var(--azul-profundo)" }}>
              Progresso do Curso
            </h2>
            <span className="text-xs text-slate-500">
              {disciplinasEncerradas}/{disciplinas.length} disciplinas encerradas
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${progressoGeral}%`, background: "var(--azul-profundo)" }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{totalMinistrada}h ministradas</span>
            <span className="font-semibold" style={{ color: "var(--azul-profundo)" }}>{progressoGeral}%</span>
            <span>{totalCarga}h total</span>
          </div>
        </div>

        {/* Próximas a encerrar */}
        {proximasAEncerrar.length > 0 && (
          <div className="col-span-full sm:col-span-2 bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--azul-profundo)" }}>
              Próximas a Encerrar — Atenção para Avaliação
            </h2>
            <div className="space-y-2">
              {proximasAEncerrar.map(d => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold w-12 shrink-0" style={{ color: "var(--azul-medio)" }}>
                    {d.sigla}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-600 truncate">{d.nome}</span>
                      <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: d.pct >= 90 ? "var(--dourado)" : "var(--azul-medio)" }}>
                        {d.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d.pct}%`,
                          background: d.pct >= 90 ? "var(--dourado)" : "var(--azul-medio)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 w-20 text-right">
                    {d.cargaMinistrada}h/{d.cargaTotal}h
                  </span>
                </div>
              ))}
            </div>
            <Link href="/aulas" className="text-xs mt-3 inline-block hover:underline" style={{ color: "var(--azul-medio)" }}>
              Ver todas as disciplinas →
            </Link>
          </div>
        )}

        {/* Últimas notas */}
        {minhasNotas.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--azul-profundo)" }}>Últimas Avaliações</h2>
            <div className="space-y-2">
              {minhasNotas.map(n => (
                <div key={n.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-700 truncate">{n.disciplina}</p>
                    <p className="text-xs text-slate-400">{n.avaliacao}</p>
                  </div>
                  <span
                    className="font-bold ml-3 shrink-0"
                    style={{ color: n.nota >= 7 ? "#15803d" : n.nota >= 5 ? "var(--dourado)" : "#b91c1c" }}
                  >
                    {n.nota.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dados do aluno */}
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--azul-profundo)" }}>Seus dados</h2>
          <div className="space-y-1.5 text-sm">
            <p><span className="text-slate-500">Nome:</span> <span className="font-medium">{aluno?.nomeCompleto}</span></p>
            {aluno?.canga && <p><span className="text-slate-500">Canga:</span> <span className="font-medium">{aluno.canga}</span></p>}
            {aluno?.grupoPlantao && <p><span className="text-slate-500">Plantão:</span> <span className="font-medium">{aluno.grupoPlantao}</span></p>}
            {aluno?.grupoFaxina && <p><span className="text-slate-500">Faxina:</span> <span className="font-medium">{aluno.grupoFaxina}</span></p>}
            {aluno?.aniversario && <p><span className="text-slate-500">Aniversário:</span> <span className="font-medium">{aluno.aniversario}</span></p>}
          </div>
        </div>

        {/* Missão da Semana */}
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--azul-profundo)" }}>Missão da Semana {semana}</h2>
          {missao ? (
            <div>
              <p className="font-medium text-slate-800">{missao.titulo}</p>
              <p className="text-slate-500 text-sm mt-1 line-clamp-3">{missao.corpo}</p>
              <Link href="/missao" className="text-xs mt-2 inline-block hover:underline" style={{ color: "var(--azul-medio)" }}>
                Ver completa →
              </Link>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Não definida ainda</p>
          )}
        </div>

        {/* Xerife */}
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm text-center">
          <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--azul-profundo)" }}>Xerife Atual</h2>
          {xerife ? (
            <>
              <div className="text-3xl mb-1">⭐</div>
              <p className="font-bold text-slate-800">{xerife.nomeGuerra}</p>
              <p className="text-slate-500 text-xs">Mat. {xerife.matricula}</p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Não definido</p>
          )}
        </div>

        {/* Último aviso */}
        {aviso && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 col-span-full">
            <h2 className="font-semibold text-yellow-800 text-sm mb-1">⚠️ {aviso.titulo}</h2>
            <p className="text-yellow-700 text-sm line-clamp-2">{aviso.corpo}</p>
            <Link href="/avisos" className="text-yellow-600 text-xs mt-1 inline-block hover:underline">
              Ver todos os avisos →
            </Link>
          </div>
        )}

        {/* Links rápidos */}
        <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/qts",     label: "QTS",     emoji: "📅" },
            { href: "/aulas",   label: "Aulas",   emoji: "📚" },
            { href: "/escalas", label: "Escalas", emoji: "🔄" },
            { href: "/turma",   label: "Turma",   emoji: "👥" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="bg-white border border-blue-100 rounded-xl p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm">
              <div className="text-2xl mb-1">{l.emoji}</div>
              <p className="text-sm font-medium text-slate-700">{l.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
