import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Formato esperado pelo QtsDisplay: { dias, horarios, grade }
// grade[dia][i] = disciplina no horário i
const HORARIOS = [
  "07h00-07h50",
  "08h00-08h50",
  "08h50-09h40",
  "10h00-10h50",
  "10h50-11h40",
  "13h40-14h30",
  "14h30-15h20",
  "15h40-16h30",
  "16h30-17h20",
  "17h30-18h20",
  "18h20-19h10",
]

const DIAS = ["Seg 25/05", "Ter 26/05", "Qua 27/05", "Qui 28/05", "Sex 29/05"]

const GRADE: Record<string, string[]> = {
  "Seg 25/05": [
    "",            // 07h00-07h50
    "DADM",        // 08h00-08h50
    "DADM",        // 08h50-09h40
    "DADM",        // 10h00-10h50
    "DADM",        // 10h50-11h40
    "À disp. CA",  // 13h40-14h30
    "À disp. CA",  // 14h30-15h20
    "À disp. CA",  // 15h40-16h30
    "À disp. CA",  // 16h30-17h20
    "",            // 17h30-18h20
    "",            // 18h20-19h10
  ],
  "Ter 26/05": [
    "TFM-II",      // 07h00-07h50
    "TFM-II",      // 08h00-08h50
    "TFM-II",      // 08h50-09h40
    "GPGA",        // 10h00-10h50
    "GPGA",        // 10h50-11h40
    "À disp. CA",  // 13h40-14h30
    "À disp. CA",  // 14h30-15h20
    "GPCL",        // 15h40-16h30
    "GPCL",        // 16h30-17h20
    "",            // 17h30-18h20
    "",            // 18h20-19h10
  ],
  "Qua 27/05": [
    "LPMO",        // 07h00-07h50
    "LPMO",        // 08h00-08h50
    "GPCL",        // 08h50-09h40
    "GPCL",        // 10h00-10h50
    "",            // 10h50-11h40
    "À disp. CA",  // 13h40-14h30
    "À disp. CA",  // 14h30-15h20
    "LPMO",        // 15h40-16h30
    "LPMO",        // 16h30-17h20
    "",            // 17h30-18h20
    "",            // 18h20-19h10
  ],
  "Qui 28/05": [
    "",            // 07h00-07h50
    "À disp. CA",  // 08h00-08h50
    "À disp. CA",  // 08h50-09h40
    "TFM-II",      // 10h00-10h50
    "TFM-II",      // 10h50-11h40
    "PO",          // 13h40-14h30
    "PO",          // 14h30-15h20
    "TFM-II",      // 15h40-16h30
    "TFM-II",      // 16h30-17h20
    "",            // 17h30-18h20
    "",            // 18h20-19h10
  ],
  "Sex 29/05": [
    "",            // 07h00-07h50
    "DADM",        // 08h00-08h50
    "DADM",        // 08h50-09h40
    "DADM",        // 10h00-10h50
    "DADM",        // 10h50-11h40
    "GRAPP",       // 13h40-14h30
    "GRAPP",       // 14h30-15h20
    "GRAPP",       // 15h40-16h30
    "GRAPP",       // 16h30-17h20
    "OU-II",       // 17h30-18h20
    "OU-II",       // 18h20-19h10
  ],
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade: GRADE }

  await prisma.qTS.upsert({
    where: { semana: 20 },
    update: { dados },
    create: { semana: 20, dados },
  })

  console.log("✓ QTS semana 20 salvo com sucesso!")
  console.log(`  ${DIAS.length} dias × ${HORARIOS.length} horários`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
