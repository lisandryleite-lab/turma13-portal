import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { garantirTabelaTcc } from "@/lib/tcc-db"
import {
  DUPLAS_TCC, TCC_PRAZO, TCC_LINK_ENVIO, TCC_NOME_PASTA, TCC_EXTENSAO,
  codigoDupla, nomeArquivoTcc,
} from "@/lib/tcc"
import { Contagem, CopiarNome, AcoesDupla } from "./tcc-client"

// Página PÚBLICA (em PUBLIC_PATHS): qualquer um com o link vê o status.
// Mostra só nome de guerra e matrícula — nada de e-mail, CPF ou telefone.

export const metadata: Metadata = {
  title: "Envio do TCC · Turma 13",
  description: "Envio do TCC da Turma 13 (1º Pelotão) — CFO PM 2026. Prazo: 02/11/2026, 07h.",
}
export const dynamic = "force-dynamic"

const fmt = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Recife", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

type Status = { declaradoEm: Date | null; confirmadoEm: Date | null }

async function lerStatus(): Promise<Map<number, Status> | null> {
  try {
    await garantirTabelaTcc()
    const linhas = await prisma.tccEnvio.findMany()
    return new Map(linhas.map((l) => [l.dupla, l]))
  } catch {
    return null // tabela ainda não criada: página segue, só sem status
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
      `Salve em .${TCC_EXTENSAO.toUpperCase()} com o nome padronizado da sua dupla (abaixo).`,
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

const resumo: React.CSSProperties = {
  cursor: "pointer",
  fontFamily: "var(--serif-cfo)",
  fontSize: 17,
  fontWeight: 600,
  color: "var(--olive)",
}

export default async function TccPage() {
  const session = await auth()
  const status = await lerStatus()

  const encerrado = Date.now() >= TCC_PRAZO.getTime()
  const total = DUPLAS_TCC.length
  const confirmadas = DUPLAS_TCC.filter((d) => status?.get(d.n)?.confirmadoEm).length
  const declaradas = DUPLAS_TCC.filter((d) => {
    const s = status?.get(d.n)
    return s?.declaradoEm && !s.confirmadoEm
  }).length
  const pendentes = total - confirmadas - declaradas

  const minhaMat = session?.user.matricula
  const ehAdmin = session?.user.isAdmin === true

  return (
    <main style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)", fontFamily: "var(--sans)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Cabeçalho */}
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
            CFO PM 2026 · Turma 13 · 1º Pelotão
          </p>
          <h1 style={{ margin: 0, fontFamily: "var(--serif-cfo)", fontSize: 30, color: "var(--olive)", lineHeight: 1.15 }}>
            Envio do TCC
          </h1>
          <p style={{ margin: 0, color: "var(--ink-60)", fontSize: 14.5 }}>
            Prazo: <strong style={{ color: "var(--ink)" }}>segunda-feira, 02/11/2026, às 07h</strong> (horário de Recife).
          </p>
        </header>

        {/* Prazo + envio */}
        <section style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          <Contagem prazoIso={TCC_PRAZO.toISOString()} />
          {TCC_LINK_ENVIO && !encerrado ? (
            <a href={TCC_LINK_ENVIO} target="_blank" rel="noopener noreferrer"
              style={{ alignSelf: "flex-start", background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600, borderRadius: 10, padding: "10px 16px", fontSize: 14.5 }}>
              Abrir pasta de envio (Google Drive) ↗
            </a>
          ) : !TCC_LINK_ENVIO ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>🔗 O link da pasta de envio será publicado aqui.</p>
          ) : null}
        </section>

        {/* Como enviar */}
        <details style={card}>
          <summary style={resumo}>Como enviar</summary>
          <ol style={{ margin: "12px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5, lineHeight: 1.5 }}>
            <li>Revise o artigo pelo checklist abaixo e salve em <strong>.{TCC_EXTENSAO.toUpperCase()}</strong>.</li>
            <li>Renomeie o arquivo com o <strong>nome padronizado da sua dupla</strong> (botão “copiar” na lista).</li>
            <li>Abra a pasta de envio <strong>{TCC_NOME_PASTA}</strong> e faça o upload. Um arquivo por dupla — não crie subpastas.</li>
            <li>Volte aqui, entre no portal e clique em <strong>“Enviamos o arquivo”</strong>. A administração confere a pasta e marca ✅.</li>
          </ol>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--ink-60)" }}>
            Padrão: <code>TCC_T13_D07_MAT1-MAT2_NOME1-NOME2.{TCC_EXTENSAO}</code> — dupla, matrículas e nomes de guerra, sem acentos.
          </p>
        </details>

        {/* Transparência */}
        <section style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--serif-cfo)", fontSize: 20, color: "var(--olive)" }}>Duplas</h2>
            {total > 0 && (
              <span style={{ fontSize: 13, color: "var(--ink-60)" }}>
                ✅ {confirmadas} recebido{confirmadas === 1 ? "" : "s"} · 📤 {declaradas} a conferir · ⏳ {pendentes} pendente{pendentes === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {total > 0 && (
            <div style={{ height: 8, borderRadius: 99, background: "rgba(58,74,58,0.12)", overflow: "hidden", display: "flex" }}
              role="img" aria-label={`${confirmadas} de ${total} duplas com recebimento confirmado`}>
              <div style={{ width: `${(confirmadas / total) * 100}%`, background: "var(--olive)" }} />
              <div style={{ width: `${(declaradas / total) * 100}%`, background: "var(--gold)" }} />
            </div>
          )}

          {status === null && total > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--red)" }}>⚠ Status indisponível no momento.</p>
          )}

          {total === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>A lista de duplas está sendo cadastrada.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {DUPLAS_TCC.map((d) => {
                const s = status?.get(d.n)
                const confirmado = !!s?.confirmadoEm
                const declarado = !!s?.declaradoEm
                const selo = confirmado
                  ? { txt: `✅ Recebido · ${fmt(s!.confirmadoEm!)}`, cor: "var(--olive)", fundo: "rgba(58,74,58,0.10)" }
                  : declarado
                    ? { txt: `📤 Enviado · ${fmt(s!.declaradoEm!)} · a conferir`, cor: "#7a5c1c", fundo: "rgba(181,147,63,0.16)" }
                    : encerrado
                      ? { txt: "✖ Não enviado", cor: "var(--red)", fundo: "rgba(122,46,46,0.08)" }
                      : { txt: "⏳ Pendente", cor: "var(--ink-60)", fundo: "rgba(43,42,39,0.06)" }
                const podeDeclarar = status !== null && (ehAdmin || d.alunos.some((a) => a.mat === minhaMat))

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
                    {!confirmado && <CopiarNome nome={nomeArquivoTcc(d)} />}
                    {status !== null && (
                      <AcoesDupla dupla={d.n} podeDeclarar={podeDeclarar && !encerrado} ehAdmin={ehAdmin} declarado={declarado} confirmado={confirmado} />
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {!session && total > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-60)" }}>
              Já enviou? <Link href="/login" style={{ color: "var(--olive)", fontWeight: 600 }}>Entre no portal</Link> para marcar a sua dupla.
            </p>
          )}
        </section>

        {/* Modelo + checklist */}
        <details style={card}>
          <summary style={resumo}>Modelo do artigo e checklist ABNT</summary>
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
          <Link href="/dashboard" style={{ color: "var(--olive)" }}>Portal da Turma 13</Link>
        </footer>
      </div>
    </main>
  )
}
