/**
 * Insere as gaivotas das anotações de prova de ACE como comentário da LISANDRY.
 * Rodar: npx ts-node -r tsconfig-paths/register scripts/seed-gaivotas-ace.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATRICULA = 108
const NOME_GUERRA = "LISANDRY"
const MATERIA = "ACE"

const GAIVOTAS = [
  `📌 GAIVOTAS ACE — Módulo 1 (História)

▸ Origem: Inteligência militar (estratégias chinesas / Sun Tzu; batalhas bíblicas)
▸ Henry Fielding (1707-1754): Bow Street Runners — 1º uso sistemático de dados criminais
▸ Robert Peel (1829): fundou a Polícia Metropolitana de Londres — policiamento moderno
▸ Séc. XIX: surge o conceito de Modus Operandi (MO)
▸ August Vollmer — "pai da polícia americana":
  • Mapa de pinos (pin map) para localizar crimes geograficamente
  • 1º serviço de chamada de emergência (precursor do 911)
▸ O.W. Wilson (1963): FORMALIZOU o termo "análise de crime"
▸ Consolidação nos EUA = DÉCADA DE 60
▸ Era de Ouro = DÉCADA DE 90:
  • CompStat (NYPD, 1994)
  • Fundação da IACA (1990)
  • Fundos federais + mapeamento acessível`,

  `📌 GAIVOTAS ACE — Módulo 2 (Fundamentos)

▸ Para que servem os dados? Orientar, Formar e Permitir (pág. 18)
▸ 2 dimensões da AC: TÁTICA e ESTRATÉGICA (pág. 18)
▸ AC é MULTIDISCIPLINAR (estatística, geo, direito, TI, psicologia...)
▸ Problema do Brasil: AUSÊNCIA DE CULTURA TÉCNICA (pág. 15)
▸ POP (objetivo): tratar a CAUSA do problema, não o evento (pág. 13)

▸ Bom analista (pág. 21): Proativo | Pesquisador | Bom avaliador | Olhar investigativo

▸ 4 etapas do analista (pág. 25) — CAI DE CERTEZA:
  1. Sistematizar e analisar dados
  2. Submeter esses padrões
  3. Identificar formas de intervir
  4. Avaliar o impacto das intervenções

▸ Focalização (pág. 26): olhar o crime de forma SEPARADA
▸ Pirâmide (pág. 27): poucos locais/ofensores = maioria dos crimes (Pareto)
  Base → incidentes | Meio → hot spots | Topo → prioridades`,

  `📌 GAIVOTAS ACE — Módulos 4, 5 e 6

▸ Identificação cadavérica (pág. 49): pulseira com ID numérica única — combate hiper-notificação de CVLI em PE
▸ Registros de Ocorrência (pág. 52): coletados pela PC-PE → categorizados pelo CP e INFOPOL

▸ Gráfico de linhas/curvas (pág. 68/69): séries temporais → identifica TENDÊNCIAS, SAZONALIDADE e ANOMALIAS

▸ Mapeamento (pág. 77-79):
  • Geoprocessamento = conjunto de tecnologias (cartografia, GPS, BD...)
  • SIG = aplicação que executa; armazena atributos + geometrias
  ⚠ Geoprocessamento ≠ SIG (geoproc. é o todo; SIG é a ferramenta)

▸ 3 Gerações de SIG (pág. 82/83):
  1ª CAD Cartográfico (herança cartografia)
  2ª Banco de Dados Geográfico (anos 90, cliente-servidor)
  3ª Bibliotecas Geográficas Digitais (web, fim anos 90)`,

  `📌 GAIVOTAS ACE — Módulos 3 e 7

▸ Teorias sociológicas (saber TODAS):
  • Escolha Racional (Cornish & Clarke): pondera custo × benefício
  • Atividade de Rotina (Cohen & Felson, 1979): ofensor + alvo + sem guardião
  • Padrão Criminal: nós (nodes), caminhos (paths) e fronteiras (edges)

▸ Ferramentas:
  • Excel (Microsoft, PAGO) × Calc (LibreOffice, GRATUITO) — funcionalidades iguais
  • Power BI / SACE: desenvolvido pela GGACE para indicadores em PE
  • QlikView (Click Wil): usado no "Juntos pela Segurança" — arrastar e soltar
  • INFOPOL: coleta e análise de ocorrências — 2 visões:
    → Visão de ocorrências (todas da PC)
    → Visão de homicídio (CVLI + latrocínio + feminicídio + suicídio + acidente fatal)`,
]

async function main() {
  for (const [i, texto] of GAIVOTAS.entries()) {
    if (texto.length > 2000) throw new Error(`Gaivota ${i + 1} excede 2000 caracteres (${texto.length})`)
    await prisma.gaivota.create({ data: { materia: MATERIA, matricula: MATRICULA, nomeGuerra: NOME_GUERRA, texto } })
    console.log(`✓ Gaivota ${i + 1}/4 inserida (${texto.length} chars)`)
  }
  console.log("Gaivotas ACE publicadas com sucesso.")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
