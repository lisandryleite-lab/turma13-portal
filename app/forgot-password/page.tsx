"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [matricula, setMatricula] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    const mat = Number(matricula)
    if (isNaN(mat) || mat <= 0) {
      setErro("Matrícula inválida.")
      return
    }
    setLoading(true)
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula: mat }),
    })
    setLoading(false)
    if (!res.ok) {
      setErro("Erro ao processar. Tente novamente.")
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-lg mb-4">Recuperar senha</h2>
        {sent ? (
          <div>
            <p className="text-green-400 text-sm mb-4">
              Se a matrícula estiver cadastrada, um link de redefinição será enviado ao e-mail registrado.
            </p>
            <Link href="/login" className="text-yellow-400 text-sm hover:underline">← Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && <p className="text-red-400 text-sm bg-red-900/30 rounded px-3 py-2">{erro}</p>}
            <div>
              <label className="text-slate-300 text-sm block mb-1">Matrícula</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 108"
                autoFocus
                required
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-slate-500 text-xs mt-1">
                O link será enviado ao e-mail cadastrado na sua matrícula.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
            <Link href="/login" className="block text-center text-xs text-slate-400 hover:text-white">← Voltar</Link>
          </form>
        )}
      </div>
    </div>
  )
}
