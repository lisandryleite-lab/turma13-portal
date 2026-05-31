import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CfoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--canvas)",
        color: "var(--ink)",
      }}
    >
      {children}
    </div>
  )
}
