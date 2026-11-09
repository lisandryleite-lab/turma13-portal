"use client"

// Reta final: textos a decorar para a formatura e a lista de material do MAPOM.
// Tudo recolhido — cada item abre ao clicar. As marcações da lista ficam só no
// aparelho (localStorage), como um checklist pessoal.

import { useEffect, useState } from "react"
import { TEXTOS_DECORAR, MATERIAL_MAPOM_INDIVIDUAL, MATERIAL_MAPOM_COLETIVO, PDF_MATERIAL_MAPOM, type ItemMapom } from "@/lib/reta-final"

const CHAVE = "cfo:mapom:material:v1"

const caixa: React.CSSProperties = { borderRadius: 12, border: "1px solid rgba(58,74,58,0.15)", background: "#fff", marginTop: 8 }
const resumo: React.CSSProperties = { cursor: "pointer", padding: "11px 14px", fontSize: 14, fontWeight: 600, color: "var(--olive)" }

export function RetaFinal() {
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  useEffect(() => {
    try { setMarcados(new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]"))) } catch { /* sem armazenamento — lista começa vazia */ }
  }, [])
  function alternar(n: string) {
    setMarcados(prev => {
      const novo = new Set(prev)
      if (novo.has(n)) novo.delete(n); else novo.add(n)
      try { localStorage.setItem(CHAVE, JSON.stringify([...novo])) } catch { /* ignora */ }
      return novo
    })
  }
  const total = MATERIAL_MAPOM_INDIVIDUAL.length
  const feitos = MATERIAL_MAPOM_INDIVIDUAL.filter(i => marcados.has(i.n)).length

  const lista = (itens: ItemMapom[]) => (
    <ul style={{ listStyle: "none", margin: 0, padding: "0 14px 10px" }}>
      {itens.map(i => (
        <li key={i.n} style={{ borderTop: "1px solid rgba(58,74,58,0.08)" }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", cursor: "pointer" }}>
            <input type="checkbox" checked={marcados.has(i.n)} onChange={() => alternar(i.n)} style={{ marginTop: 3, accentColor: "var(--olive)" }} />
            <span style={{ fontSize: 13.5, lineHeight: 1.4, color: marcados.has(i.n) ? "var(--ink-60)" : "var(--ink)", textDecoration: marcados.has(i.n) ? "line-through" : "none" }}>
              <strong style={{ fontWeight: 600 }}>{i.item}</strong>
              {i.detalhe && <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-60)", textDecoration: "none" }}>{i.detalhe}</span>}
            </span>
          </label>
        </li>
      ))}
    </ul>
  )

  return (
    <details style={{ marginBottom: 16, borderRadius: 16, border: "1px solid rgba(181,147,63,0.45)", background: "var(--surface)", padding: "4px 12px 12px" }}>
      <summary style={{ cursor: "pointer", padding: "10px 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎖️</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.05rem", color: "var(--olive)" }}>Reta final</span>
          <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-60)" }}>Para decorar · lista de material do MAPOM ({feitos}/{total})</span>
        </span>
      </summary>

      <p style={{ margin: "4px 4px 0", fontSize: 11.5, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Para decorar</p>
      {TEXTOS_DECORAR.map(t => (
        <details key={t.id} style={caixa}>
          <summary style={resumo}>{t.titulo}</summary>
          <div style={{ padding: "0 14px 14px" }}>
            {t.autoria && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--ink-60)" }}>{t.autoria}</p>}
            {t.estrofes.map((e, k) => (
              <div key={k} style={{ marginBottom: 12 }}>
                {e.rotulo && <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{e.rotulo}</div>}
                {e.versos.map((v, j) => (
                  <div key={j} style={{ fontFamily: "var(--serif-cfo)", fontSize: 15.5, lineHeight: 1.55, color: "var(--ink)", fontWeight: e.rotulo === "Refrão" ? 600 : 400 }}>{v}</div>
                ))}
              </div>
            ))}
            {t.video && (
              <a href={t.video} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>▶ Ouvir no YouTube ↗</a>
            )}
          </div>
        </details>
      ))}

      <p style={{ margin: "16px 4px 0", fontSize: 11.5, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.06em" }}>MAPOM · 29/11 a 04/12 (data possível)</p>
      <details style={caixa}>
        <summary style={resumo}>Material individual <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>· {feitos} de {total} separados</span></summary>
        {lista(MATERIAL_MAPOM_INDIVIDUAL)}
      </details>
      <details style={caixa}>
        <summary style={resumo}>Material coletivo <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>· por pelotão</span></summary>
        {lista(MATERIAL_MAPOM_COLETIVO)}
      </details>
      <p style={{ margin: "10px 4px 0", fontSize: 12, color: "var(--ink-60)" }}>
        As marcações ficam só neste aparelho · <a href={PDF_MATERIAL_MAPOM} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>relação oficial em PDF ↗</a>
      </p>
    </details>
  )
}
