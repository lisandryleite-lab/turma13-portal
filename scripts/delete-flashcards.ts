import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

// Remove TODOS os flashcards do banco — a feature foi descontinuada na UI.
async function main() {
  const antes = await prisma.flashcard.count()
  const r = await prisma.flashcard.deleteMany({})
  const depois = await prisma.flashcard.count()
  console.log(`Flashcards antes: ${antes} · removidos: ${r.count} · restantes: ${depois}`)
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
