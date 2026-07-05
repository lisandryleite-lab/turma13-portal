// ─────────────────────────────────────────────────────────────
//  Seed do roster completo de plantão (Turma 13 + demais militares da 2ª CIA)
//  Fonte: "MAPA DE EQUIPES - JULHO" — Escala de Serviço nº 1, PMPE/APMP/CFO 2026/3ªCIA
//  (Paudalho/PE, 26/06/2026). Upsert por matrícula — idempotente, rodar quantas vezes precisar.
//
//  Uso: npx tsx prisma/seed-militares-plantao.ts
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

const ROSTER: Record<string, { mat: number; nome: string }[]> = {
  GOLF: [
    { mat: 1, nome: "HELLTON FERNANDES" }, { mat: 6, nome: "CAMPOS" }, { mat: 7, nome: "ALDO SILVA" },
    { mat: 8, nome: "JEFFERSON FRANCISCO" }, { mat: 15, nome: "TAYNÃ RAMALHO" }, { mat: 16, nome: "FLÁVIO CARVALHO" },
    { mat: 19, nome: "THAIS FIGUEIREDO" }, { mat: 27, nome: "CLÁUDIA" }, { mat: 32, nome: "NAPOLEÃO" },
    { mat: 34, nome: "RICARDO" }, { mat: 39, nome: "CAETANO" }, { mat: 42, nome: "JONILDO" },
    { mat: 43, nome: "MATHEUS ROCHA" }, { mat: 46, nome: "FONTES" }, { mat: 57, nome: "CLEYTON" },
    { mat: 62, nome: "IDEYVISON" }, { mat: 80, nome: "LUIZ OLIVEIRA" }, { mat: 111, nome: "ANDRÉ MARINHO" },
    { mat: 143, nome: "VIDAL" }, { mat: 159, nome: "HIGOR LIMA" }, { mat: 184, nome: "PAULO AZEVÊDO" },
    { mat: 191, nome: "GOMES NASCIMENTO" }, { mat: 196, nome: "EDUARDA RODRIGUES" }, { mat: 197, nome: "ABREU" },
    { mat: 199, nome: "BARROS" },
  ],
  HOTEL: [
    { mat: 9, nome: "VERAS" }, { mat: 13, nome: "JONAS" }, { mat: 21, nome: "SAMPAIO" },
    { mat: 23, nome: "RODOLFO MOURA" }, { mat: 24, nome: "MÓYSES" }, { mat: 25, nome: "CAROLINE QUEIROZ" },
    { mat: 30, nome: "RODRIGUES" }, { mat: 35, nome: "FILLIPE PAIXÃO" }, { mat: 36, nome: "MACÊDO JÚNIOR" },
    { mat: 74, nome: "DAVID" }, { mat: 75, nome: "JÚLIO CÉSAR" }, { mat: 77, nome: "FÁBIO" },
    { mat: 83, nome: "DIEGO SANTOS" }, { mat: 89, nome: "EWERTON FARIAS" }, { mat: 105, nome: "LUCAS EDUARDO" },
    { mat: 109, nome: "LETÍCIA PINHEIRO" }, { mat: 112, nome: "IVHINNY" }, { mat: 129, nome: "MARTINS" },
    { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 147, nome: "JANDERSON" }, { mat: 154, nome: "TÂMARA LEMOS" },
    { mat: 170, nome: "RONALDO" }, { mat: 195, nome: "JEFFERSON NUNES" }, { mat: 200, nome: "APOLLO" },
    { mat: 206, nome: "CÉSAR" }, { mat: 211, nome: "DÁRIO" },
  ],
  INDIA: [
    { mat: 38, nome: "JOHN ALVES" }, { mat: 41, nome: "ALAN SILVA" }, { mat: 48, nome: "LIMA" },
    { mat: 56, nome: "WESLEY BATISTA" }, { mat: 59, nome: "ASSIS" }, { mat: 60, nome: "JOÃO NUNES" },
    { mat: 63, nome: "ALVES" }, { mat: 67, nome: "BARBOSA" }, { mat: 70, nome: "LUCAS GABRIEL" },
    { mat: 78, nome: "FRANCISCO SOUZA" }, { mat: 90, nome: "NETTO" }, { mat: 102, nome: "LEITE JÚNIOR" },
    { mat: 107, nome: "DIEGO LOPES" }, { mat: 113, nome: "ÁUREA AMORIM" }, { mat: 116, nome: "BERTIPALHA" },
    { mat: 118, nome: "BRUNO SILVA" }, { mat: 122, nome: "ANDREY" }, { mat: 124, nome: "CECÍLIA" },
    { mat: 126, nome: "LUCAS RIBEIRO" }, { mat: 133, nome: "ANDERSON SOARES" }, { mat: 136, nome: "RONIÉRISON BARROS" },
    { mat: 137, nome: "PRISCYLA NEVES" }, { mat: 138, nome: "JANAÍNA" }, { mat: 157, nome: "CARLOS LIMA" },
  ],
  JULIETT: [
    { mat: 11, nome: "KALYNNE GOMES" }, { mat: 12, nome: "MELO" }, { mat: 33, nome: "LUIZ VICENTE" },
    { mat: 72, nome: "EDNALDO BEZERRA" }, { mat: 82, nome: "LEANDRO SILVA" }, { mat: 86, nome: "HOLANDA" },
    { mat: 91, nome: "DANILO" }, { mat: 94, nome: "ANDRÉ CARDOSO" }, { mat: 96, nome: "PATRÍCIA CORREIA" },
    { mat: 104, nome: "FURTUNATO NETO" }, { mat: 121, nome: "LUNA" }, { mat: 128, nome: "MIGUEL" },
    { mat: 130, nome: "IVALDO" }, { mat: 141, nome: "RAMONN" }, { mat: 145, nome: "FRANCISCO VIEIRA" },
    { mat: 150, nome: "GERALDO" }, { mat: 158, nome: "FELIPE OLIVEIRA" }, { mat: 161, nome: "FELIPE GOMES" },
    { mat: 163, nome: "ELIVELTON RODRIGUES" }, { mat: 173, nome: "HÉVILA" }, { mat: 181, nome: "PABLO MACIEL" },
    { mat: 190, nome: "LARISSA ALCANTARA" }, { mat: 204, nome: "AMANDA" }, { mat: 208, nome: "FABIANA" },
    { mat: 213, nome: "R SILVA" },
  ],
  KILO: [
    { mat: 20, nome: "TIBÚRCIO" }, { mat: 26, nome: "ANDRÉ" }, { mat: 37, nome: "PABLO TORRES" },
    { mat: 58, nome: "JOHN FELIX" }, { mat: 61, nome: "TEREZA" }, { mat: 65, nome: "KAUHANNI" },
    { mat: 85, nome: "FLÁVIA COSTA" }, { mat: 98, nome: "JOSÉ MENEZES" }, { mat: 101, nome: "MATHEUS ALBUQUERQUE" },
    { mat: 119, nome: "HEITOR" }, { mat: 132, nome: "CEZAR SANTOS" }, { mat: 140, nome: "RAIMUNDO" },
    { mat: 155, nome: "VICTOR ALVES" }, { mat: 156, nome: "SILVANO PEREIRA" }, { mat: 166, nome: "EVANGELISTA" },
    { mat: 169, nome: "HYGO CESÁRIO" }, { mat: 171, nome: "MAXWEL" }, { mat: 177, nome: "ROSÁRIO JÚNIOR" },
    { mat: 179, nome: "LEONARDO" }, { mat: 180, nome: "DANTAS" }, { mat: 188, nome: "ALBERTO" },
    { mat: 193, nome: "MÁRCIO LEITE" }, { mat: 198, nome: "MARCELO" }, { mat: 202, nome: "FERRAZ" },
    { mat: 212, nome: "CAMILA BOUONORA" },
  ],
  LIMA: [
    { mat: 4, nome: "ANA SILVA" }, { mat: 14, nome: "WINNY" }, { mat: 40, nome: "ALMEIDA" },
    { mat: 49, nome: "MIRANDA" }, { mat: 50, nome: "ELDER FERREIRA" }, { mat: 66, nome: "LUCAS MATEUS" },
    { mat: 69, nome: "AUGUSTO" }, { mat: 93, nome: "SALES" }, { mat: 95, nome: "ALEX SILVA" },
    { mat: 103, nome: "MENDONÇA" }, { mat: 114, nome: "JOSIANE" }, { mat: 131, nome: "JOSÉ INÁCIO" },
    { mat: 134, nome: "SILVÂNIO SANTOS" }, { mat: 146, nome: "ELÍSIO" }, { mat: 151, nome: "RAINY" },
    { mat: 160, nome: "JONAS GOMES" }, { mat: 162, nome: "MARCONDES" }, { mat: 167, nome: "GUSTAVO NETO" },
    { mat: 174, nome: "ALEXANDRE" }, { mat: 175, nome: "EMERSON LOPES" }, { mat: 186, nome: "SAMUEL SILVA" },
    { mat: 189, nome: "PAULO NASCIMENTO" }, { mat: 207, nome: "HOBERDAN" },
  ],
  MIKE: [
    { mat: 5, nome: "GEORGE" }, { mat: 28, nome: "BRANDÃO" }, { mat: 29, nome: "LYSIA" },
    { mat: 44, nome: "DIOGO ARAÚJO" }, { mat: 45, nome: "GABRIELE COSTA" }, { mat: 53, nome: "PEDRO HENRIQUE" },
    { mat: 64, nome: "EDUARDO" }, { mat: 68, nome: "AMAURI" }, { mat: 73, nome: "MILENE QUEIROZ" },
    { mat: 81, nome: "FERNANDO ROCHA" }, { mat: 84, nome: "EDILSON JOSÉ" }, { mat: 87, nome: "BARRETO" },
    { mat: 88, nome: "TACIANE" }, { mat: 97, nome: "ROBERTO CAVALCANTE" }, { mat: 100, nome: "KARLA ALBUQUERQUE" },
    { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 108, nome: "LISANDRY" }, { mat: 117, nome: "GUILHERME" },
    { mat: 123, nome: "BEATRIZ" }, { mat: 127, nome: "LOIOLA" }, { mat: 149, nome: "FELIPE FERREIRA" },
    { mat: 153, nome: "HUGO" }, { mat: 165, nome: "KEVIN GOMES" }, { mat: 176, nome: "DIRLEYNNE ALVES" },
  ],
  NOVEMBER: [
    { mat: 10, nome: "ERICK" }, { mat: 18, nome: "FERNANDA BISPO" }, { mat: 22, nome: "WILLIAN SANTOS" },
    { mat: 31, nome: "ROMÉRIO" }, { mat: 55, nome: "SHIRLAYNE" }, { mat: 52, nome: "JAMILLE" },
    { mat: 71, nome: "LEIMIG" }, { mat: 76, nome: "ARAÚJO JÚNIOR" }, { mat: 79, nome: "BRUNO HENRIQUE" },
    { mat: 92, nome: "MOACIR" }, { mat: 110, nome: "WESLEY HENRIQUE" }, { mat: 115, nome: "EDUARDO GONÇALVES" },
    { mat: 120, nome: "ADRIANO" }, { mat: 135, nome: "BELTRÃO" }, { mat: 139, nome: "GLEYDSON" },
    { mat: 142, nome: "MAGALHÃES" }, { mat: 152, nome: "LÉLIS" }, { mat: 164, nome: "ROBSON MELO" },
    { mat: 168, nome: "MATHEUS SILVA" }, { mat: 178, nome: "GABRIEL SILVA" }, { mat: 183, nome: "LÉIA" },
    { mat: 185, nome: "VINÍCIUS KAIRÊ" }, { mat: 187, nome: "HEMERSON FILHO" }, { mat: 192, nome: "JOSÉ BARBOSA" },
    { mat: 210, nome: "ANDRÉ JÚNIOR" },
  ],
}

async function main() {
  let total = 0
  for (const [grupo, membros] of Object.entries(ROSTER)) {
    for (const m of membros) {
      await prisma.militarPlantao.upsert({
        where: { matricula: m.mat },
        update: { nome: m.nome, grupoPlantao: grupo },
        create: { matricula: m.mat, nome: m.nome, grupoPlantao: grupo },
      })
      total++
    }
  }
  console.log(`Seed de MilitarPlantao concluído: ${total} registros.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
