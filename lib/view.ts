import { cookies } from "next/headers"

// "Modo aluna": admin pode alternar para ver/usar o portal como aluno comum.
// Cookie cfoView=aluna esconde os recursos de admin (sem precisar de 2 contas).
export async function adminAtivo(isAdmin: boolean): Promise<boolean> {
  if (!isAdmin) return false
  const c = await cookies()
  return c.get("cfoView")?.value !== "aluna"
}
