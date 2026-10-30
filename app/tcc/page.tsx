import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { garantirTabelaTcc } from "@/lib/tcc-db"
import {
  DUPLAS_TCC, TCC_PRAZO, TCC_PASTA, TCC_NOME_PASTA, TCC_FORMATOS,
  codigoDupla, nomeArquivoTcc, linkPasta,
} from "@/lib/tcc"
import { Contagem, CopiarNome, MarcarEnvio } from "./tcc-client"

// Página PÚBLICA e temporária (em PUBLIC_PATHS) até o prazo do TCC.
// Mostra só nome de guerra e matrícula — nada de e-mail, CPF ou telefone.

export const metadata: Metadata = {
  title: "Envio do TCC · Turma 13",
  description: "Envio do TCC da Turma 13 (1º Pelotão) — CFO PM 2026. Prazo: 02/11/2026, 07h.",
}
export const dynamic = "force-dynamic"

const fmt = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Recife", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

/** Dupla → hora em que marcou "enviado". `null` se o banco não respondeu. */
async function lerEnvios(): Promise<Map<number, Date> | null> {
  try {
    await garantirTabelaTcc()
    const linhas = await prisma.tccEnvio.findMany({ where: { declaradoEm: { not: null } } })
    return new Map(linhas.map((l) => [l.dupla, l.declaradoEm!]))
  } catch {
    return null
  }
}

// ─── Checklist (modelo oficial CFO PM 2025 + ABNT) ───────────────────────────

const CHECKLIST: { titulo: string; itens: string[] }[] = [
  {
    titulo: "Formatação (modelo CFO PM 2025)",
    itens: [
      "Arial 12, texto justificado, entrelinhas 1,5, margens de 2,5 cm.",
      "Título centralizado, Arial 14, negrito, MAIÚSCULAS. Subtítulo na mesma fonte, em minúsculas (só nomes próprios com inicial maiúscula).",
      "Autores e orientador com nota de rodapé: curso (CFO PMPE), graduação e especialização.",
      "Seções em algarismos arábicos, sem ponto ou hífen depois do número (NBR 6024:2012): 1 INTRODUÇÃO, 2 …, 3 …, 4 …, 5 CONSIDERAÇÕES FINAIS. REFERÊNCIAS, ANEXOS e APÊNDICES centralizados, sem número.",
    ],
  },
  {
    titulo: "Resumo e Abstract",
    itens: [
      "Parágrafo único, espaço simples, Arial 12, justificado — máximo de 200 palavras.",
      "3ª pessoa do singular, voz ativa, sem abreviações e sem citações/referências.",
      "Ordem obrigatória: contextualização → objetivo → metodologia → resultados → considerações finais.",
      "Até 5 palavras-chave, separadas por ponto, como no modelo da APMP (Palavra 1. Palavra 2. Palavra 3.). A NBR 6028:2021 usa ponto e vírgula — vale o modelo institucional.",
      "Abstract e Keywords: versão em inglês do resumo e das palavras-chave.",
    ],
  },
  {
    titulo: "Estrutura do texto",
    itens: [
      "Introdução em texto corrido, sem subtítulos, com verbos no passado: contexto, delimitação, problema, objetivos e justificativa; termina anunciando as próximas seções.",
      "Referencial teórico: argumentos que sustentam o debate sobre o tema.",
      "Metodologia: como os dados foram obtidos; se houve amostra, o método de amostragem, critérios de inclusão/exclusão e a população.",
      "Resultados e discussão: claros, objetivos, em sequência lógica, interpretados à luz do referencial.",
      "Considerações finais: respondem ao problema; proposições com base nos resultados; podem apontar lacunas e pesquisas futuras.",
    ],
  },
  {
    titulo: "Citações (ABNT NBR 10520:2023)",
    itens: [
      "Até 3 linhas: entre aspas, no corpo do texto.",
      "Mais de 3 linhas: recuo de 4 cm da margem esquerda, fonte menor, espaço simples, sem aspas.",
      "Citação direta sempre com página: (Gil, 2002, p. 116). Desde 2023, o autor entre parênteses vai em maiúsculas e minúsculas, não mais em CAIXA ALTA.",
      "Até três autores separados por ponto e vírgula: (Silva; Souza; Lima, 2024). Quatro ou mais: (Silva et al., 2024).",
      "Citação indireta: autor e ano; página opcional. Documento sem página: não invente.",
      "Supressões com [...]; texto traduzido: “tradução nossa”.",
    ],
  },
  {
    titulo: "Referências (ABNT NBR 6023:2025)",
    itens: [
      "Só entram autores e obras citados no artigo.",
      "Ordem alfabética, alinhadas à esquerda, espaço simples, separadas por uma linha em branco.",
      "Destaque (negrito) do título uniforme em todas as referências.",
      "Fontes on-line: “Disponível em: <link>. Acesso em: dia mês abreviado ano.” Confira o DOI quando houver.",
      "Toda citação está nas referências, e toda referência foi citada.",
    ],
  },
  {
    titulo: "Tabelas, quadros e figuras",
    itens: [
      "Identificação (título) acima; fonte abaixo — inclusive “Fonte: dados da pesquisa (2026)” quando forem dados próprios.",
      "Tabelas no padrão IBGE (sem fechar as laterais); quadros com bordas fechadas.",
      "Anexo = documento de terceiros; apêndice = material elaborado pelos autores.",
    ],
  },
  {
    titulo: "Antes de enviar",
    itens: [
      "Apague as instruções do modelo, comentários e marcas de revisão.",
      "Gere os dois arquivos — PDF e Word (.docx) — com o mesmo nome padronizado da sua dupla (abaixo).",
      "Confira se o PDF ficou igual ao .docx (quebras de página, tabelas, notas de rodapé).",
      "Confira ortografia, numeração das seções e se toda citação está nas referências (e vice-versa).",
    ],
  },
]

const ARQUIVOS = [
  { href: "/modelos/tcc/modelo-artigo-cfo-pm-2025.doc", label: "Modelo de artigo — CFO PM 2025 (.doc)" },
  { href: "/modelos/tcc/guia-abnt-artigo-cientifico-2026.pdf", label: "Guia ABNT para artigo científico (PDF)" },
  { href: "/modelos/tcc/modelo-tcle.docx", label: "Modelo de TCLE — APMP (.docx)" },
]

// ─── Página ──────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(58,74,58,0.12)",
  borderRadius: 14,
  padding: 16,
}

const botaoPasta: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 600, color: "var(--olive)", border: "1px solid rgba(58,74,58,0.3)",
  borderRadius: 8, padding: "6px 12px", textDecoration: "none", whiteSpace: "nowrap",
}

export default async function TccPage() {
  const session = await auth()
  const envios = await lerEnvios()

  const encerrado = Date.now() >= TCC_PRAZO.getTime()
  const total = DUPLAS_TCC.length
  const enviados = DUPLAS_TCC.filter((d) => envios?.has(d.n)).length
  const minhaMat = session?.user.matricula
  const ehAdmin = session?.user.isAdmin === true

  return (
    <main style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)", fontFamily: "var(--sans)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>

        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
            CFO PM 2026 · Turma 13 · 1º Pelotão
          </p>
          <h1 style={{ margin: 0, fontFamily: "var(--serif-cfo)", fontSize: 30, color: "var(--olive)", lineHeight: 1.15 }}>
            Envio do TCC
          </h1>
          <p style={{ margin: 0, color: "var(--ink-60)", fontSize: 14.5 }}>
            Prazo: <strong style={{ color: "var(--ink)" }}>segunda-feira, 02/11/2026, às 07h</strong>
          </p>
        </header>

        {/* Prazo + como enviar */}
        <section style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <Contagem prazoIso={TCC_PRAZO.toISOString()} />
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, lineHeight: 1.5 }}>
            <li>Abra a <strong>pasta da sua dupla</strong> (botão na lista abaixo).</li>
            <li>Envie <strong>dois arquivos</strong>: o <strong>PDF</strong> e o <strong>Word (.docx)</strong>, com o nome indicado.</li>
            <li>Entre no portal e clique em <strong>“Marcar como enviado”</strong>.</li>
          </ol>
        </section>

        {/* Duplas */}
        <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--serif-cfo)", fontSize: 20, color: "var(--olive)" }}>Duplas</h2>
            <span style={{ fontSize: 13.5, color: "var(--ink-60)" }}>
              <strong style={{ color: "var(--olive)" }}>{enviados}</strong> de {total} enviaram
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "rgba(58,74,58,0.12)", overflow: "hidden" }}
            role="img" aria-label={`${enviados} de ${total} duplas enviaram`}>
            <div style={{ width: `${(enviados / total) * 100}%`, height: "100%", background: "var(--olive)" }} />
          </div>
          {envios === null && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--red)" }}>⚠ Status indisponível no momento.</p>
          )}

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {DUPLAS_TCC.map((d) => {
              const em = envios?.get(d.n)
              const selo = em
                ? { txt: `✅ Enviado · ${fmt(em)}`, cor: "var(--olive)", fundo: "rgba(58,74,58,0.10)" }
                : encerrado
                  ? { txt: "✖ Não enviado", cor: "var(--red)", fundo: "rgba(122,46,46,0.08)" }
                  : { txt: "⏳ Pendente", cor: "var(--ink-60)", fundo: "rgba(43,42,39,0.06)" }
              const podeMarcar = envios !== null && !encerrado && (ehAdmin || d.alunos.some((a) => a.mat === minhaMat))

              return (
                <li key={d.n} style={{ background: "var(--canvas)", border: "1px solid rgba(58,74,58,0.10)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                      <span style={{ fontFamily: "ui-monospace, Consolas, monospace", fontWeight: 700, color: "var(--gold)", fontSize: 13 }}>{codigoDupla(d.n)}</span>
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>
                        {d.alunos.map((a, i) => (
                          <span key={a.mat}>{i > 0 && " · "}<span style={{ color: "var(--ink-60)", fontWeight: 500 }}>{a.mat}</span> {a.nome}</span>
                        ))}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: selo.cor, background: selo.fundo, borderRadius: 99, padding: "3px 10px", whiteSpace: "nowrap" }}>
                      {selo.txt}
                    </span>
                  </div>
                  {!em && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {TCC_FORMATOS.map((ext) => <CopiarNome key={ext} nome={`${nomeArquivoTcc(d)}.${ext}`} />)}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    {!encerrado && (
                      <a href={linkPasta(d.pasta)} target="_blank" rel="noopener noreferrer" style={botaoPasta}>📁 Abrir pasta da dupla ↗</a>
                    )}
                    {podeMarcar && <MarcarEnvio dupla={d.n} enviado={!!em} />}
                  </div>
                </li>
              )
            })}
          </ul>

          {!session && !encerrado && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-60)" }}>
              Já enviou? <Link href="/login" style={{ color: "var(--olive)", fontWeight: 600 }}>Entre no portal</Link> e volte aqui para marcar a sua dupla.
            </p>
          )}
        </section>

        {/* Modelo + checklist */}
        <details style={card}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--serif-cfo)", fontSize: 17, fontWeight: 600, color: "var(--olive)" }}>
            Modelo do artigo e checklist ABNT
          </summary>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ARQUIVOS.map((a) => (
                <a key={a.href} href={a.href} download
                  style={{ fontSize: 13.5, fontWeight: 600, color: "var(--olive)", border: "1px solid rgba(58,74,58,0.3)", borderRadius: 8, padding: "7px 12px", textDecoration: "none" }}>
                  ⬇ {a.label}
                </a>
              ))}
            </div>
            {CHECKLIST.map((g) => (
              <details key={g.titulo} style={{ background: "var(--canvas)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(58,74,58,0.10)" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 14.5 }}>{g.titulo}</summary>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 14, lineHeight: 1.5 }}>
                  {g.itens.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </details>
            ))}
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-60)", lineHeight: 1.5 }}>
              Fontes: modelo de artigo do CFO PM 2025 (APMP Paudalho); ABNT NBR 6022:2018 (artigo), NBR 6028:2021 (resumo),
              NBR 10520:2023 (citações), NBR 6023:2025 (referências), NBR 6024:2012 (numeração) e Normas de Apresentação Tabular do IBGE.
              Onde o modelo da APMP e a ABNT diferem, vale o modelo institucional; em caso de dúvida, consulte o orientador.
            </p>
          </div>
        </details>

        <footer style={{ fontSize: 12, color: "var(--ink-60)", textAlign: "center" }}>
          Pasta geral: <a href={linkPasta(TCC_PASTA)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{TCC_NOME_PASTA}</a>
        </footer>
      </div>
    </main>
  )
}
