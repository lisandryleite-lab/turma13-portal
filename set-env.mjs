import { execSync, spawn } from "child_process"

const vars = {
  DATABASE_URL: "postgresql://neondb_owner:npg_NEMy9s1JTQef@ep-super-band-acyddah6-pooler.sa-east-1.aws.neon.tech/turma13?sslmode=require&channel_binding=require",
  NEXTAUTH_SECRET: "02E146B0037E6719C59942B275AE88A888AA62A562DBEE590FF5FFA49D16192C",
  RESEND_API_KEY: "re_h9jQcXdg_8BH3rpjLKyboqzac1nUfB4s6",
  RESEND_FROM: "onboarding@resend.dev",
}

// Remove todas primeiro
for (const key of Object.keys(vars)) {
  try {
    execSync(`vercel env rm ${key} production --yes`, { stdio: "pipe" })
    console.log(`Removido: ${key}`)
  } catch {}
}

// Re-adiciona com stdin limpo (Node.js garante UTF-8 sem BOM)
for (const [key, value] of Object.entries(vars)) {
  await new Promise((resolve, reject) => {
    const proc = spawn("node", ["C:/Users/lisan/AppData/Roaming/npm/node_modules/vercel/dist/vc.js", "env", "add", key, "production", "--yes"], {
      stdio: ["pipe", "pipe", "pipe"],
    })
    proc.stdin.write(value, "utf8")
    proc.stdin.end()
    proc.stdout.on("data", d => process.stdout.write(d))
    proc.stderr.on("data", d => process.stderr.write(d))
    proc.on("close", code => {
      console.log(`✓ ${key} (exit ${code})`)
      resolve()
    })
    proc.on("error", reject)
  })
}

console.log("\nConcluído!")
