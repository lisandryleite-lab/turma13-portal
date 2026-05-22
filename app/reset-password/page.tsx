"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") || ""
  const email = params.get("email") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("As senhas não coincidem"); return }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return }
    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push("/login?msg=senha-alterada")
    } else {
      const data = await res.json()
      setError(data.error || "Erro ao redefinir senha")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-white font-semibold text-lg mb-2">Nova senha</h2>
      {error && <p className="text-red-400 text-sm bg-red-900/30 rounded px-3 py-2">{error}</p>}
      <div>
        <label className="text-slate-300 text-sm block mb-1">Nova senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          minLength={6} required />
      </div>
      <div>
        <label className="text-slate-300 text-sm block mb-1">Confirmar senha</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50">
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-800 rounded-xl p-6">
        <Suspense fallback={<p className="text-white">Carregando...</p>}>
          <ResetForm />
        </Suspense>
        <Link href="/login" className="block text-center text-xs text-slate-400 hover:text-white mt-4">← Voltar ao login</Link>
      </div>
    </div>
  )
}
