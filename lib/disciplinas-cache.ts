import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { fasesDisciplinas, type Fase } from "@/lib/disciplinas-fase"

// Disciplinas com a situação (concluída / em andamento / pendente) calculada
// pelo QTS. Ranking e Mementos liam todos os QTS do banco a cada abertura só
// para isso; agora o resultado fica em cache e é refeito quando o QTS ou a
// carga das disciplinas mudam (revalidateTag) ou, no máximo, a cada 10 min.
export const TAG_DISCIPLINAS = "disciplinas-fases"

export type DisciplinaFase = { sigla: string; nome: string; status: string; fase: Fase; ordem: number }

export const disciplinasComFase = unstable_cache(
  async (): Promise<DisciplinaFase[]> => {
    const [disciplinas, qtss] = await Promise.all([
      prisma.disciplina.findMany({ select: { sigla: true, nome: true, status: true, cargaMinistrada: true, cargaTotal: true }, orderBy: { sigla: "asc" } }),
      prisma.qTS.findMany({ select: { semana: true, dados: true } }),
    ])
    const fases = fasesDisciplinas(disciplinas, qtss)
    return disciplinas.map(d => ({ sigla: d.sigla, nome: d.nome, status: d.status, ...fases.get(d.sigla)! }))
  },
  ["disciplinas-com-fase"],
  { tags: [TAG_DISCIPLINAS], revalidate: 600 },
)
