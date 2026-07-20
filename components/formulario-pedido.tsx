"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { parseResposta, type FormularioCota, type ItemPedido, type ModeloFormulario } from "@/lib/formulario-cota"

/**
 * Mockups dos modelos. Clicar numa foto seleciona aquele modelo na última
 * linha do pedido — assim dá pra escolher olhando a peça, não o texto do select.
 */
function GaleriaModelos({ modelos, selecionado, onEscolher }: {
  modelos: ModeloFormulario[]
  selecionado: string
  onEscolher: (id: string) => void
}) {
  const [zoom, setZoom] = useState<ModeloFormulario | null>(null)
  const comFoto = modelos.filter(m => m.imagem)
  if (comFoto.length === 0) return null

  return (
    <>
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${comFoto.length > 1 ? 2 : 1},1fr)` }}>
        {comFoto.map(m => {
          const ativo = m.id === selecionado
          return (
            <div key={m.id} className="rounded-xl overflow-hidden cursor-pointer transition"
              onClick={() => onEscolher(m.id)}
              style={{ border: ativo ? "2px solid #14294e" : "1px solid #e2e8f4", background: "#fff" }}>
              {/* priority: o mockup é o conteúdo principal da página — carregar
                  sob demanda deixa o pedido sem imagem no primeiro paint. */}
              <Image src={m.imagem!} alt={`Camisa ${m.nome}`} width={940} height={685} priority
                sizes="(max-width: 640px) 50vw, 320px"
                style={{ width: "100%", height: "auto", display: "block" }} />
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: m.cor || "#ccc", border: "1px solid rgba(0,0,0,.15)" }} />
                <span className="text-[11.5px] font-bold truncate" style={{ color: ativo ? "#14294e" : "#6b7a94" }}>
                  {m.nome}
                </span>
                <button onClick={e => { e.stopPropagation(); setZoom(m) }}
                  title="Ampliar" className="ml-auto text-[10px] font-bold shrink-0" style={{ color: "#2c66c9" }}>
                  ampliar
                </button>
              </div>
              {m.descricao && (
                <p className="px-2 pb-1.5 text-[10px] leading-tight" style={{ color: "#93a1ba" }}>{m.descricao}</p>
              )}
            </div>
          )
        })}
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,20,40,.82)" }}>
          <div className="w-full" style={{ maxWidth: 1000 }} onClick={e => e.stopPropagation()}>
            <Image src={zoom.imagem!} alt={`Camisa ${zoom.nome}`} width={940} height={685}
              style={{ width: "100%", height: "auto", borderRadius: 12 }} />
            <button onClick={() => setZoom(null)}
              className="mt-3 mx-auto block text-xs font-bold text-white px-4 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,.16)" }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const linhaVazia = (form: FormularioCota): ItemPedido => ({
  modelo: form.modelos[0]?.id ?? "",
  versao: form.versoes[0] ?? "",
  tamanho: form.tamanhos[Math.floor(form.tamanhos.length / 2)] ?? "",
  quantidade: 1,
})

const inputCls = "border rounded-lg px-2 py-1.5 text-xs bg-white"
const rotuloCls = "text-[10.5px] font-bold uppercase tracking-wide"

/**
 * Formulário de levantamento de uma cota. Usado em dois lugares:
 * dentro de /financeiro (aluno logado) e na página pública /pedido/[token].
 * O que muda entre os dois é só o endpoint — por isso ele vem por prop.
 */
export function FormularioPedido({
  form, respostaAtual, valorUnitario, endpoint, cotaId, compacto = false,
}: {
  form: FormularioCota
  respostaAtual: unknown
  valorUnitario: number
  endpoint: string
  cotaId?: string
  compacto?: boolean
}) {
  const router = useRouter()
  const inicial = parseResposta(respostaAtual)
  const [campos, setCampos] = useState<Record<string, string>>(inicial.campos)
  const [itens, setItens] = useState<ItemPedido[]>(inicial.itens.length ? inicial.itens : [linhaVazia(form)])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const total = itens.reduce((s, i) => s + (i.quantidade || 0), 0)
  const jaRespondeu = inicial.itens.length > 0

  function atualizarItem(idx: number, patch: Partial<ItemPedido>) {
    setItens(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  async function salvar() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(cotaId ? { cotaId } : {}), respostas: { campos, itens } }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        setMsg(e.error || "Não foi possível salvar.")
        setOk(false)
        return
      }
      setMsg("Pedido registrado ✓")
      setOk(true)
      router.refresh()
    } catch {
      setMsg("Falha de conexão — tente de novo.")
      setOk(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Mockups — clicar aplica o modelo na última linha do pedido */}
      <GaleriaModelos
        modelos={form.modelos}
        selecionado={itens[itens.length - 1]?.modelo ?? ""}
        onEscolher={id => atualizarItem(itens.length - 1, { modelo: id })}
      />

      {/* Campos gerais */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: compacto ? "1fr" : "repeat(auto-fit,minmax(160px,1fr))" }}>
        {form.campos.map(c => (
          <label key={c.id} className="flex flex-col gap-1">
            <span className={rotuloCls} style={{ color: "#93a1ba" }}>
              {c.label}{c.obrigatorio && <span style={{ color: "#d6553a" }}> *</span>}
            </span>
            {c.tipo === "select" ? (
              <select value={campos[c.id] || ""} onChange={e => setCampos(p => ({ ...p, [c.id]: e.target.value }))}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                <option value="">—</option>
                {(c.opcoes || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input value={campos[c.id] || ""} onChange={e => setCampos(p => ({ ...p, [c.id]: e.target.value }))}
                placeholder={c.ajuda} className={inputCls} style={{ borderColor: "#dde4ef" }} />
            )}
          </label>
        ))}
      </div>

      {/* Linhas de peças */}
      <div className="space-y-2">
        {itens.map((it, idx) => (
          <div key={idx} className="flex gap-2 items-end flex-wrap">
            <label className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <span className={rotuloCls} style={{ color: "#93a1ba" }}>Modelo / cor</span>
              <select value={it.modelo} onChange={e => atualizarItem(idx, { modelo: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[125px]">
              <span className={rotuloCls} style={{ color: "#93a1ba" }}>Versão</span>
              <select value={it.versao} onChange={e => atualizarItem(idx, { versao: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.versoes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1" style={{ width: 84 }}>
              <span className={rotuloCls} style={{ color: "#93a1ba" }}>Tamanho</span>
              <select value={it.tamanho} onChange={e => atualizarItem(idx, { tamanho: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.tamanhos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1" style={{ width: 66 }}>
              <span className={rotuloCls} style={{ color: "#93a1ba" }}>Qtd.</span>
              <input type="number" min={0} max={20} value={it.quantidade}
                onChange={e => atualizarItem(idx, { quantidade: Number(e.target.value) })}
                className={inputCls} style={{ borderColor: "#dde4ef" }} />
            </label>
            {itens.length > 1 && (
              <button onClick={() => setItens(prev => prev.filter((_, i) => i !== idx))}
                title="Remover linha" className="text-slate-300 hover:text-red-500 text-sm pb-2">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => setItens(prev => [...prev, linhaVazia(form)])}
        className="text-[11px] font-semibold mt-2" style={{ color: "#2c66c9" }}>
        + Adicionar outra peça
      </button>

      <div className="flex items-center gap-3 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #e6ebf4" }}>
        <button onClick={salvar} disabled={saving}
          className="text-xs font-bold text-white px-4 py-2 rounded-[9px] disabled:opacity-50"
          style={{ background: "#14294e" }}>
          {saving ? "Salvando…" : jaRespondeu || ok ? "Atualizar meu pedido" : "Registrar meu pedido"}
        </button>
        <span className="text-[11.5px]" style={{ color: "#8291ab" }}>
          {total} peça{total === 1 ? "" : "s"} · estimado{" "}
          <strong style={{ color: "#14294e" }}>
            {(total * valorUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </span>
        {msg && <span className="text-[11.5px] font-semibold" style={{ color: ok ? "#1f9d63" : "#d6553a" }}>{msg}</span>}
      </div>
    </div>
  )
}
