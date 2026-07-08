import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// ─── Ícones dos links institucionais ─────────────────────────────────────────

function IconSEI() {
  return (
    <svg viewBox="0 0 80 60" width="56" height="42" aria-hidden>
      <text x="4" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#0072CE">sei</text>
      <text x="63" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#00A651">!</text>
    </svg>
  )
}

function IconAcides() {
  return (
    <svg viewBox="0 0 80 80" width="52" height="52" aria-hidden>
      <defs>
        <linearGradient id="acShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#1A52A8" />
          <stop offset="1" stopColor="#0B2D5E" />
        </linearGradient>
        <linearGradient id="acFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE68A" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B8924A" />
        </linearGradient>
      </defs>
      <path d="M40 22 L66 30 L66 50 C66 62 40 74 40 74 C40 74 14 62 14 50 L14 30 Z" fill="url(#acShield)" stroke="#0B2D5E" strokeWidth="1.5" />
      <path d="M40 36 L54 62 L46 62 L40 50 L34 62 L26 62 Z" fill="#F8FAFC" />
      <path d="M40 2 C49 12 54 17 50 27 C49 23 47 21 45 20 C48 27 44 31 43 25 C44 31 39 33 39 27 C37 32 33 30 35 24 C33 26 31 28 32 31 C27 23 33 13 40 2Z" fill="url(#acFlame)" />
    </svg>
  )
}

function IconDecreto() {
  return (
    <svg viewBox="0 0 80 80" width="52" height="52" aria-hidden>
      <rect x="14" y="8" width="40" height="52" rx="4" fill="#FEF9C3" stroke="#B8924A" strokeWidth="2" />
      <path d="M44 8 L44 22 L58 22" stroke="#B8924A" strokeWidth="2" strokeLinejoin="round" />
      <path d="M44 8 L58 22" stroke="#B8924A" strokeWidth="2" />
      <text x="24" y="42" fontSize="22" fontWeight="900" fontFamily="Georgia,serif" fill="#B8924A">§</text>
      <line x1="20" y1="52" x2="46" y2="52" stroke="#B8924A" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="44" y="46" width="22" height="22" rx="4" fill="#92400E" transform="rotate(-15 55 57)" />
      <text x="55" y="60" fontSize="10" fontWeight="900" fontFamily="Arial,sans-serif" fill="white" textAnchor="middle" transform="rotate(-15 55 57)">OK</text>
    </svg>
  )
}

// ─── Dados ───────────────────────────────────────────────────────────────────

type LinkItem = { label: string; desc: string; url: string; Icon: () => React.ReactElement }

const LINKS: LinkItem[] = [
  { label: "SEI", desc: "Sistema Eletrônico de Informações", url: "https://sei.pe.gov.br", Icon: IconSEI },
  { label: "ACIDES", desc: "Plataforma EAD da SDS", url: "https://acidesead.sds.pe.gov.br/login/index.php", Icon: IconAcides },
  { label: "Decreto 57.694/2024", desc: "Plano do Curso — CFO PM/BM", url: "https://legis.alepe.pe.gov.br/texto.aspx?tiponorma=6&numero=57694&complemento=0&ano=2024&tipo=&url=", Icon: IconDecreto },
]

type Modelo = {
  id: string
  titulo: string
  descricao: string
  arquivo: string
  formato: "DOCX" | "PDF" | "XLSX"
  prazo?: string
  destino?: string
  base?: string
  dicas: string[]
}

type Categoria = { nome: string; modelos: Modelo[] }

const FOLHA_PLANTAO_DICAS = [
  "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno do grupo.",
  "Efetivo conforme o mapa de equipes vigente — ajuste se houver remanejamento de grupo.",
]

const CATEGORIAS: Categoria[] = [
  {
    nome: "Ensino e avaliações",
    modelos: [
      {
        id: "segunda-chamada",
        titulo: "Requerimento de 2ª chamada",
        descricao: "Para quem faltou à 1ª chamada de uma avaliação por motivo justificado.",
        arquivo: "requerimento-2a-chamada.pdf",
        formato: "PDF",
        prazo: "Até 2 dias úteis após tomar ciência da falta/data da prova.",
        destino: "Supervisor de Ensino da APMP (via Coordenador da Turma).",
        base: "Decreto 57.694/2024 — item 10.m.",
        dicas: [
          "Anexe o comprovante do motivo (atestado, declaração de óbito, intimação judicial, ordem de serviço etc.).",
          "Motivos aceitos: internação, licença saúde, luto, convocação judicial, ato de serviço ou caso excepcional a critério do comando.",
          "Preencha nome de guerra, nº, turma, avaliação e disciplina antes de protocolar.",
        ],
      },
      {
        id: "recurso-prova",
        titulo: "Recurso / revisão de prova",
        descricao: "Pedido de revisão de nota ou recurso contra questão de avaliação.",
        arquivo: "requerimento-recurso-revisao-prova.docx",
        formato: "DOCX",
        prazo: "2 dias úteis a contar da divulgação oficial da nota.",
        destino: "Supervisor de Ensino da APMP (via Coordenador da Turma).",
        base: "Decreto 57.694/2024 — item 10.p.",
        dicas: [
          "Fundamente o pedido: aponte a questão, o gabarito e a bibliografia/base que sustenta seu argumento.",
          "Indeferido pelo professor, cabe recurso final ao Comandante do Campus.",
        ],
      },
      {
        id: "avaliacao-final",
        titulo: "Requerimento de Avaliação Final (Recuperação)",
        descricao: "Para realizar a Avaliação Final (AF) de uma disciplina.",
        arquivo: "requerimento-avaliacao-final.pdf",
        formato: "PDF",
        destino: "Comandante da APMP (despacho do Chefe do Corpo de Alunos).",
        base: "Decreto 57.694/2024.",
        dicas: [
          "Informe a disciplina e a avaliação a ser feita.",
          "Após deferido, é publicado em BI e a Divisão de Ensino toma ciência.",
        ],
      },
    ],
  },
  {
    nome: "Disciplinar",
    modelos: [
      {
        id: "razoes-defesa",
        titulo: "Razões de defesa",
        descricao: "Defesa escrita em Processo Apuratório Disciplinar Escolar (PADE) / comunicação disciplinar.",
        arquivo: "razoes-de-defesa.docx",
        formato: "DOCX",
        prazo: "Até 5 dias úteis após a notificação da transgressão.",
        destino: "Comandante do Corpo de Alunos / Comandante do Campus.",
        base: "Decreto 57.694/2024 — regime disciplinar (item 13).",
        dicas: [
          "Faça referência ao nº do PADE e à data/hora do fato relatado.",
          "Narre a sua versão dos fatos, refute a tipicidade e, ao final, peça o arquivamento (deferimento).",
          "Documento produzido no SEI — o cabeçalho é gerado automaticamente pelo sistema.",
        ],
      },
    ],
  },
  {
    nome: "Serviço e rotina",
    modelos: [
      {
        id: "relatorio-xerifancia",
        titulo: "Relatório de xerifância",
        descricao: "Relatório de passagem da xerifância do pelotão ao fim do período.",
        arquivo: "relatorio-xerifancia.docx",
        formato: "DOCX",
        destino: "Coordenador da Turma / Corpo de Alunos.",
        dicas: [
          "Atualize o QTS da semana, os passes concedidos, LTS/RTS e as alterações verificadas.",
          "Preencha xerife, período e coordenador no topo.",
        ],
      },
      {
        id: "relatorio-auxiliar",
        titulo: "Relatório de auxiliar do oficial de dia",
        descricao: "Relatório de passagem do serviço de auxiliar do oficial de dia.",
        arquivo: "relatorio-auxiliar-oficial-dia.docx",
        formato: "DOCX",
        destino: "Oficial de Dia / Corpo de Alunos (via SEI).",
        dicas: [
          "Registre escala de serviço por setor, passes, LTS/RTS, comunicações, instrução externa e observações.",
          "Documento assinado eletronicamente no SEI pelo auxiliar e pelo adjunto.",
        ],
      },
      {
        id: "planilha-plantao",
        titulo: "Planilha de plantão",
        descricao: "Escala de plantão da companhia (turnos, postos e permutas).",
        arquivo: "planilha-plantao.xlsx",
        formato: "XLSX",
        dicas: [
          "Substitua os campos XXX pelos nomes/nº dos alunos escalados.",
          "Postos sem efetivo devem ser marcados como desativados (ver observações da planilha).",
        ],
      },
      {
        id: "passe",
        titulo: "Requerimento de passe",
        descricao: "Autorização para se ausentar da APMP por período determinado.",
        arquivo: "passe.docx",
        formato: "DOCX",
        destino: "Comandante do Pelotão / Oficial de Dia.",
        dicas: [
          "Informe destino, motivo, horário previsto de saída e de retorno.",
          "Declare a(s) disciplina(s)/aula(s) que serão perdidas e a carga horária correspondente (em tempos de aula).",
          "Limite de ausência: no máximo 25% da carga horária total da disciplina — acima disso, reprova por frequência. Confira quanto já faltou antes de solicitar.",
          "O retorno deve ser comunicado ao auxiliar, para ciência do Oficial de Dia e da Guarda.",
        ],
      },
      {
        id: "permuta",
        titulo: "Permuta de serviço",
        descricao: "Troca de plantão/serviço entre dois militares.",
        arquivo: "permuta-servico.docx",
        formato: "DOCX",
        destino: "Comandante da Companhia (chefia imediata autoriza).",
        dicas: [
          "Preencha a escala atual e a escala a ser cumprida de ambos os interessados.",
          "Motivo geralmente é 'interesse particular'. Ambos assinam.",
        ],
      },
    ],
  },
  {
    nome: "Folhas de alterações — pelotões",
    modelos: [
      {
        id: "folha-1-pel",
        titulo: "Folha de alterações — 1º pelotão",
        descricao: "Chamada/alterações do 1º pelotão da 1ª CIA. Efetivo já preenchido, editável.",
        arquivo: "folha-alteracoes-1-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno; some presentes/ausentes ao final.",
          "A lista já vem com o efetivo atual — edite apenas quando houver mudança (é raro).",
        ],
      },
      {
        id: "folha-2-pel",
        titulo: "Folha de alterações — 2º pelotão",
        descricao: "Chamada/alterações do 2º pelotão. Efetivo pré-preenchido, editável.",
        arquivo: "folha-alteracoes-2-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno.",
          "Efetivo com base na relação de referência da turma — confira e ajuste se alguém entrou/saiu.",
        ],
      },
      {
        id: "folha-3-pel",
        titulo: "Folha de alterações — 3º pelotão",
        descricao: "Chamada/alterações do 3º pelotão. Efetivo pré-preenchido, editável.",
        arquivo: "folha-alteracoes-3-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno.",
          "Efetivo com base na relação de referência da turma — confira e ajuste se alguém entrou/saiu.",
        ],
      },
      {
        id: "folha-4-pel",
        titulo: "Folha de alterações — 4º pelotão",
        descricao: "Chamada/alterações do 4º pelotão. Efetivo pré-preenchido, editável.",
        arquivo: "folha-alteracoes-4-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno.",
          "Efetivo com base na relação de referência da turma — confira e ajuste se alguém entrou/saiu.",
        ],
      },
      {
        id: "folha-5-pel",
        titulo: "Folha de alterações — 5º pelotão",
        descricao: "Chamada/alterações do 5º pelotão. Efetivo pré-preenchido, editável.",
        arquivo: "folha-alteracoes-5-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno.",
          "Efetivo com base na relação de referência da turma — confira e ajuste se alguém entrou/saiu.",
        ],
      },
      {
        id: "folha-6-pel",
        titulo: "Folha de alterações — 6º pelotão",
        descricao: "Chamada/alterações do 6º pelotão. Efetivo pré-preenchido, editável.",
        arquivo: "folha-alteracoes-6-pelotao.docx",
        formato: "DOCX",
        dicas: [
          "Preencha DATA, HORA, FORMATURA e a SITUAÇÃO de cada aluno.",
          "Efetivo com base na relação de referência da turma — confira e ajuste se alguém entrou/saiu.",
        ],
      },
    ],
  },
  {
    nome: "Folhas de alterações — plantão",
    modelos: [
      {
        id: "folha-plantao-golf",
        titulo: "Plantão — grupo GOLF",
        descricao: "Folha de alterações do grupo GOLF do plantão.",
        arquivo: "folha-alteracoes-plantao-golf.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-hotel",
        titulo: "Plantão — grupo HOTEL",
        descricao: "Folha de alterações do grupo HOTEL do plantão.",
        arquivo: "folha-alteracoes-plantao-hotel.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-india",
        titulo: "Plantão — grupo INDIA",
        descricao: "Folha de alterações do grupo INDIA do plantão.",
        arquivo: "folha-alteracoes-plantao-india.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-juliett",
        titulo: "Plantão — grupo JULIETT",
        descricao: "Folha de alterações do grupo JULIETT do plantão.",
        arquivo: "folha-alteracoes-plantao-juliett.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-kilo",
        titulo: "Plantão — grupo KILO",
        descricao: "Folha de alterações do grupo KILO do plantão.",
        arquivo: "folha-alteracoes-plantao-kilo.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-lima",
        titulo: "Plantão — grupo LIMA",
        descricao: "Folha de alterações do grupo LIMA do plantão.",
        arquivo: "folha-alteracoes-plantao-lima.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-mike",
        titulo: "Plantão — grupo MIKE",
        descricao: "Folha de alterações do grupo MIKE do plantão.",
        arquivo: "folha-alteracoes-plantao-mike.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
      {
        id: "folha-plantao-november",
        titulo: "Plantão — grupo NOVEMBER",
        descricao: "Folha de alterações do grupo NOVEMBER do plantão.",
        arquivo: "folha-alteracoes-plantao-november.docx",
        formato: "DOCX",
        dicas: FOLHA_PLANTAO_DICAS,
      },
    ],
  },
  {
    nome: "Mestre de cerimônia",
    modelos: [
      {
        id: "mestre-matinal",
        titulo: "Roteiro — formatura matinal",
        descricao: "Roteiro do mestre de cerimônia da formatura matinal (segunda a quinta).",
        arquivo: "mestre-cerimonia-formatura-matinal.docx",
        formato: "DOCX",
        dicas: [
          "Preencha o oficial de dia, quem lê o BI, quem faz a mensagem do dia e o tema.",
          "A canção do dia segue o dia da semana — a tabela está no próprio roteiro.",
          "Traz a lista dos oficiais da APMP como referência.",
        ],
      },
      {
        id: "mestre-geral",
        titulo: "Roteiro — formatura geral",
        descricao: "Roteiro do mestre de cerimônia da formatura geral (sexta; excepcionalmente quarta).",
        arquivo: "mestre-cerimonia-formatura-geral.docx",
        formato: "DOCX",
        dicas: [
          "Inclui incorporação e desincorporação do Pavilhão Nacional e a revista à tropa.",
          "Canção do dia: Hino Nacional Brasileiro. A passagem de serviço é opcional na formatura geral.",
        ],
      },
    ],
  },
  {
    nome: "Acadêmico",
    modelos: [
      {
        id: "projeto-pesquisa",
        titulo: "Projeto de Pesquisa (CFO PM)",
        descricao: "Modelo do Projeto de Pesquisa — disciplina de Metodologia da Pesquisa Científica do CFO PM.",
        arquivo: "modelo-projeto-pesquisa-cfo.docx",
        formato: "DOCX",
        dicas: [
          "Estrutura: dados de identificação, tema, delimitação, problema, justificativa, objetivos (geral e específicos), embasamento teórico, metodologia, cronograma e referências.",
          "Cada seção traz instruções e exemplos no próprio documento; alinhe à linha de pesquisa da PMPE (Supl. Normativo nº 034/2020).",
        ],
      },
    ],
  },
]

// ─── UI ──────────────────────────────────────────────────────────────────────

const FMT_COR: Record<Modelo["formato"], string> = {
  DOCX: "#2b579a",
  PDF: "#b3261e",
  XLSX: "#217346",
}

function LinkCard({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: "var(--canvas)",
        border: "1px solid rgba(43,42,39,0.12)",
        borderRadius: 14,
        textDecoration: "none",
        boxShadow: "0 1px 4px rgba(43,42,39,0.06)",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          border: "1px solid rgba(43,42,39,0.08)",
          borderRadius: 12,
        }}
      >
        <item.Icon />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{item.label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ink-60)" }}>{item.desc}</p>
      </div>
    </a>
  )
}

function ModeloCard({ m }: { m: Modelo }) {
  const temInstrucoes = !!(m.prazo || m.destino || m.base || m.dicas.length)
  return (
    <div
      style={{
        background: "var(--canvas)",
        border: "1px solid rgba(43,42,39,0.12)",
        borderRadius: 14,
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(43,42,39,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{m.titulo}</h3>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: "0.04em",
                color: "#fff",
                background: FMT_COR[m.formato],
                padding: "2px 7px",
                borderRadius: 6,
              }}
            >
              {m.formato}
            </span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.45 }}>{m.descricao}</p>
        </div>
        <a
          href={`/modelos/${m.arquivo}`}
          download
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--olive)",
            color: "var(--canvas)",
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar
        </a>
      </div>

      {temInstrucoes && (
        <details style={{ marginTop: 12 }}>
          <summary
            style={{
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--gold)",
              listStyle: "none",
              userSelect: "none",
            }}
          >
            Como usar ▾
          </summary>
          <div
            style={{
              marginTop: 10,
              padding: "12px 14px",
              background: "#fbf7ec",
              border: "1px solid rgba(181,147,63,0.35)",
              borderRadius: 10,
              fontSize: 12.5,
              color: "var(--ink)",
              lineHeight: 1.5,
            }}
          >
            {m.prazo && (
              <p style={{ margin: "0 0 6px" }}>
                <strong>Prazo:</strong> {m.prazo}
              </p>
            )}
            {m.destino && (
              <p style={{ margin: "0 0 6px" }}>
                <strong>A quem se dirige:</strong> {m.destino}
              </p>
            )}
            {m.base && (
              <p style={{ margin: "0 0 6px" }}>
                <strong>Base legal:</strong> {m.base}
              </p>
            )}
            {m.dicas.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {m.dicas.map((d, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

export default async function DocumentosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 64px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/inicio" style={{ fontSize: 13, fontWeight: 600, color: "var(--olive)", textDecoration: "none" }}>
          ← Início
        </Link>
      </div>

      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: 0 }}>
          Links e documentos úteis
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-60)" }}>
          Sistemas de acesso rápido e modelos de documentos com instruções de preenchimento.
        </p>
      </header>

      {/* Links institucionais */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)", margin: "0 0 14px" }}>
          Acesso rápido
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {LINKS.map(l => (
            <LinkCard key={l.label} item={l} />
          ))}
        </div>
      </section>

      {/* Modelos por categoria */}
      {CATEGORIAS.map(cat => (
        <section key={cat.nome} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", fontWeight: 600, color: "var(--ink)", margin: "0 0 6px" }}>
            {cat.nome}
          </h2>
          <div style={{ height: 2, width: 40, background: "var(--gold)", borderRadius: 2, marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cat.modelos.map(m => (
              <ModeloCard key={m.id} m={m} />
            ))}
          </div>
        </section>
      ))}

      <p style={{ marginTop: 8, fontSize: 12, color: "var(--ink-60)", lineHeight: 1.5 }}>
        Os modelos são referências sem dados pessoais. Confira sempre a orientação vigente do Corpo de Alunos antes de
        protocolar.
      </p>
    </main>
  )
}
