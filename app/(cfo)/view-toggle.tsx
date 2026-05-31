"use client"

import { useRouter } from "next/navigation"

// Alternância "Admin ⇄ aluna" para a AL 108. Define cookie cfoView e recarrega.
export function ViewToggle({ adminAtivo }: { adminAtivo: boolean }) {
  const router = useRouter()
  function alternar() {
    const novo = adminAtivo ? "aluna" : "admin"
    document.cookie = `cfoView=${novo}; path=/; max-age=31536000`
    router.refresh()
  }
  return (
    <button
      onClick={alternar}
      title="Alternar entre visão de administradora e de aluna"
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid var(--gold)",
        background: adminAtivo ? "var(--olive)" : "var(--surface)",
        color: adminAtivo ? "var(--canvas)" : "var(--ink)",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {adminAtivo ? "👑 Admin — ver como aluna" : "🎓 Aluna — voltar a Admin"}
    </button>
  )
}
