import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const QTS19 = {
  semana: 19,
  periodo: "18/05/2026 a 24/05/2026",
  horarios: {
    manha: ["07h00–07h50", "08h00–08h50", "08h50–09h40", "10h00–10h50", "10h50–11h40"],
    tarde: ["13h40–14h30", "14h30–15h20", "15h40–16h30", "16h30–17h20", "17h30–18h20", "18h20–19h10"],
  },
  dias: [
    {
      dia: "Segunda",
      data: "18/05/2026",
      aulas: [
        { hora: "08h00–08h50", disciplina: "GPGA", aula: 9, total: 30 },
        { hora: "08h50–09h40", disciplina: "GPGA", aula: 10, total: 30 },
        { hora: "10h00–10h50", disciplina: "ACE",  aula: 25, total: 30 },
        { hora: "10h50–11h40", disciplina: "ACE",  aula: 26, total: 30 },
        { hora: "13h40–14h30", disciplina: "GRAPP", aula: 13, total: 20 },
        { hora: "14h30–15h20", disciplina: "GRAPP", aula: 14, total: 20 },
        { hora: "15h40–16h30", disciplina: "GPGA", aula: 11, total: 30 },
        { hora: "16h30–17h20", disciplina: "GPGA", aula: 12, total: 30 },
        { hora: "17h30–18h20", disciplina: "GPGA", aula: 13, total: 30 },
        { hora: "18h20–19h10", disciplina: "GPGA", aula: 14, total: 30 },
      ],
    },
    {
      dia: "Terça",
      data: "19/05/2026",
      aulas: [
        { hora: "08h00–08h50", disciplina: "GPGA",   aula: 15, total: 30 },
        { hora: "08h50–09h40", disciplina: "GPGA",   aula: 16, total: 30 },
        { hora: "10h00–10h50", disciplina: "TFM-II", aula: 1,  total: 60 },
        { hora: "10h50–11h40", disciplina: "TFM-II", aula: 2,  total: 60 },
        { hora: "13h40–14h30", disciplina: "LPMO",   aula: 17, total: 40 },
        { hora: "14h30–15h20", disciplina: "LPMO",   aula: 18, total: 40 },
        { hora: "15h40–16h30", disciplina: "PO",     aula: 9,  total: 40 },
        { hora: "16h30–17h20", disciplina: "PO",     aula: 10, total: 40 },
        { hora: "17h30–18h20", disciplina: "PO",     aula: 11, total: 40 },
        { hora: "18h20–19h10", disciplina: "PO",     aula: 12, total: 40 },
      ],
    },
    {
      dia: "Quarta",
      data: "20/05/2026",
      aulas: [
        { hora: "08h00–08h50", disciplina: "PO",     aula: 13, total: 40 },
        { hora: "08h50–09h40", disciplina: "PO",     aula: 14, total: 40 },
        { hora: "10h00–10h50", disciplina: "TFM-II", aula: 3,  total: 60 },
        { hora: "10h50–11h40", disciplina: "TFM-II", aula: 4,  total: 60 },
        { hora: "13h40–14h30", disciplina: "GPCL",   aula: 23, total: 30 },
        { hora: "14h30–15h20", disciplina: "GPCL",   aula: 24, total: 30 },
        { hora: "15h40–16h30", disciplina: "GPCL",   aula: 25, total: 30 },
        { hora: "16h30–17h20", disciplina: "GPCL",   aula: 26, total: 30 },
        { hora: "17h30–18h20", disciplina: "PO",     aula: 15, total: 40 },
        { hora: "18h20–19h10", disciplina: "PO",     aula: 16, total: 40 },
      ],
    },
    {
      dia: "Quinta",
      data: "21/05/2026",
      aulas: [
        { hora: "07h00–07h50", disciplina: "TFM-II", aula: 5,  total: 60 },
        { hora: "08h00–08h50", disciplina: "TFM-II", aula: 6,  total: 60 },
        { hora: "08h50–09h40", disciplina: "TFM-II", aula: 7,  total: 60 },
        { hora: "10h00–10h50", disciplina: "GPGA",   aula: 17, total: 30 },
        { hora: "10h50–11h40", disciplina: "GPGA",   aula: 18, total: 30 },
        { hora: "13h40–14h30", disciplina: "GPGA",   aula: 19, total: 30 },
        { hora: "14h30–15h20", disciplina: "GPGA",   aula: 20, total: 30 },
        { hora: "15h40–16h30", disciplina: "GPGA",   aula: 21, total: 30 },
        { hora: "16h30–17h20", disciplina: "GPGA",   aula: 22, total: 30 },
      ],
    },
    {
      dia: "Sexta",
      data: "22/05/2026",
      aulas: [
        { hora: "08h00–08h50", disciplina: "GLOPF-2", aula: 39, total: 40 },
        { hora: "08h50–09h40", disciplina: "GLOPF-2", aula: 40, total: 40 },
        { hora: "10h00–10h50", disciplina: "TIC-2",   aula: 39, total: 40 },
        { hora: "10h50–11h40", disciplina: "TIC-2",   aula: 40, total: 40 },
        { hora: "13h40–14h30", disciplina: "OU-II",   aula: 1,  total: 40 },
        { hora: "14h30–15h20", disciplina: "OU-II",   aula: 2,  total: 40 },
        { hora: "15h40–16h30", disciplina: "DADM",    aula: 31, total: 60 },
        { hora: "16h30–17h20", disciplina: "DADM",    aula: 32, total: 60 },
        { hora: "17h30–18h20", disciplina: "DADM",    aula: 33, total: 60 },
        { hora: "18h20–19h10", disciplina: "DADM",    aula: 34, total: 60 },
      ],
    },
    { dia: "Sábado",  data: "23/05/2026", aulas: [] },
    { dia: "Domingo", data: "24/05/2026", aulas: [] },
  ],
}

async function main() {
  const result = await prisma.qTS.upsert({
    where: { semana: 19 },
    update: { dados: QTS19 as any },
    create: { semana: 19, dados: QTS19 as any },
  })
  console.log("✓ QTS semana 19 inserido:", result.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
