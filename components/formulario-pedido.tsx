"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { parseResposta, linkFornecedor, type FormularioCota, type ItemPedido, type ModeloFormulario } from "@/lib/formulario-cota"

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
              <Image src={m.imagem!} alt={`Camisa ${m.nome}`} width={1448} height={1086} priority
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
            <Image src={zoom.imagem!} alt={`Camisa ${zoom.nome}`} width={1448} height={1086}
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
  const [guia, setGuia] = useState(false)
  const [ficha, setFicha] = useState(false)
  const waFornecedor = linkFornecedor(form.fornecedor)

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

      {/* Condições do fornecedor + canal direto pra dúvida de medida/prazo.
          Fica antes do pedido de propósito: é o que a pessoa precisa saber
          pra decidir tamanho e forma de pagamento. */}
      {(form.condicoes || waFornecedor) && (
        <div className="mb-3 rounded-lg p-3" style={{ background: "#f7f9fc", border: "1px solid #e6ebf4" }}>
          {form.condicoes && (
            <div className="grid gap-2" style={{ gridTemplateColumns: compacto ? "1fr" : "repeat(auto-fit,minmax(150px,1fr))" }}>
              {([
                ["À vista", form.condicoes.avista],
                ["Parcelado", form.condicoes.parcelado],
                ["Prazo de entrega", form.condicoes.prazo],
              ] as const).filter(([, v]) => !!v).map(([rot, v]) => (
                <div key={rot}>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>{rot}</p>
                  <p className="text-[11.5px] leading-snug" style={{ color: "#14294e" }}>{v}</p>
                </div>
              ))}
            </div>
          )}
          {waFornecedor && (
            <a href={waFornecedor} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
              style={{ background: "#e7f7ed", color: "#12603a", border: "1px solid #bfe6cf" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.31-1.96 1.36-.5.05-1.14.07-1.83-.11-.42-.13-.97-.31-1.67-.61-2.94-1.27-4.86-4.23-5.01-4.43-.14-.2-1.19-1.58-1.19-3.02s.76-2.14 1.03-2.44c.27-.3.58-.37.78-.37.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.7.8 1.99.95.29.15.49.22.56.35.07.12.07.71-.17 1.4z" />
              </svg>
              Dúvida? Falar com {form.fornecedor?.nome?.split(" ")[0] ?? "o fornecedor"} no WhatsApp
            </a>
          )}
        </div>
      )}

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

      <div className="flex items-center gap-3 flex-wrap mt-2">
        <button onClick={() => setItens(prev => [...prev, linhaVazia(form)])}
          className="text-[11px] font-semibold" style={{ color: "#2c66c9" }}>
          + Adicionar outra peça
        </button>
        {form.guiaTamanhos && (
          <button onClick={() => setGuia(g => !g)} className="text-[11px] font-semibold" style={{ color: "#8291ab" }}>
            {guia ? "ocultar" : "📏 ver"} medidas
          </button>
        )}
        {form.especificacoes && (
          <button onClick={() => setFicha(f => !f)} className="text-[11px] font-semibold" style={{ color: "#8291ab" }}>
            {ficha ? "ocultar" : "🧵 ver"} ficha técnica
          </button>
        )}
      </div>

      {ficha && form.especificacoes && (
        <div className="mt-2 rounded-lg p-3" style={{ background: "#f7f9fc", border: "1px solid #e6ebf4" }}>
          {form.especificacoes.nome && (
            <p className="text-[11.5px] font-bold mb-1.5" style={{ color: "#14294e" }}>{form.especificacoes.nome}</p>
          )}
          <ul className="space-y-1">
            {form.especificacoes.itens.map(i => (
              <li key={i} className="text-[11px] leading-snug flex gap-1.5" style={{ color: "#6b7a94" }}>
                <span style={{ color: "#b8924a" }}>•</span>{i}
              </li>
            ))}
          </ul>
          {form.especificacoes.composicao && (
            <p className="text-[10.5px] mt-2 pt-2" style={{ color: "#93a1ba", borderTop: "1px solid #e6ebf4" }}>
              <span className="font-bold uppercase tracking-wide">Composição:</span> {form.especificacoes.composicao}
            </p>
          )}
        </div>
      )}

      {guia && form.guiaTamanhos && (
        <div className="mt-2 rounded-lg p-3" style={{ background: "#f7f9fc", border: "1px solid #e6ebf4" }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: compacto ? "1fr" : "repeat(auto-fit,minmax(200px,1fr))" }}>
            {form.guiaTamanhos.grupos.map(g => (
              <div key={g.nome}>
                <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: "#93a1ba" }}>{g.nome}</p>
                <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {form.guiaTamanhos!.colunas.map(c => (
                        <th key={c} className="text-left font-bold px-1.5 py-1" style={{ color: "#93a1ba" }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.linhas.map(l => (
                      <tr key={l[0]} style={{ borderTop: "1px solid #e6ebf4" }}>
                        {l.map((v, i) => (
                          <td key={i} className="px-1.5 py-1" style={{ color: i === 0 ? "#14294e" : "#6b7a94", fontWeight: i === 0 ? 700 : 400 }}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          {form.guiaTamanhos.nota && (
            <p className="text-[10px] mt-2 leading-snug" style={{ color: "#93a1ba" }}>{form.guiaTamanhos.nota}</p>
          )}
        </div>
      )}

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
