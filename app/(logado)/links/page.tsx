"use client"

// ─── Ícones SVG inline estilo "logo card" ───────────────────────────────────

function IconSEI() {
  return (
    <svg viewBox="0 0 80 60" fill="none" width="72" height="54">
      {/* "sei" em azul */}
      <text x="4" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#0072CE">sei</text>
      {/* ponto de exclamação verde */}
      <text x="63" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#00A651">!</text>
    </svg>
  )
}

function IconPsicologo() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      <circle cx="40" cy="40" r="30" fill="none" stroke="#1a7a3c" strokeWidth="3.5"/>
      {/* Cérebro rosa */}
      <ellipse cx="40" cy="43" rx="16" ry="12" fill="#F472B6" opacity="0.9"/>
      <path d="M27 40c0-7 5.8-13 13-13s13 6 13 13" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M24 44c0 7 7 13 16 13s16-6 16-13" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="40" y1="27" x2="40" y2="57" stroke="#DB2777" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 42c-4 0-6 2-6 5" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M50 42c4 0 6 2 6 5" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="32" cy="35" r="2" fill="#EC4899"/>
      <circle cx="48" cy="35" r="2" fill="#EC4899"/>
    </svg>
  )
}

function IconACIDES() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      {/* Escudo */}
      <path d="M40 8 L64 20 L64 46 C64 58 40 72 40 72 C40 72 16 58 16 46 L16 20 Z"
        fill="#1A52A8" stroke="#0B2D5E" strokeWidth="1.5"/>
      {/* Triângulo interno dourado */}
      <path d="M40 26 L52 50 L28 50 Z" fill="#B8924A"/>
      {/* Chama */}
      <path d="M40 4 C40 4 44 10 40 15 C36 10 40 4 40 4Z" fill="#DDB876"/>
      <path d="M40 8 C40 8 43 13 40 17 C37 13 40 8 40 8Z" fill="#F59E0B"/>
      {/* Texto ACIDES */}
      <text x="40" y="66" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif"
        fill="#4A7C3F" textAnchor="middle" letterSpacing="1">ACIDES</text>
    </svg>
  )
}

function IconDecreto() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      {/* Papel */}
      <rect x="14" y="8" width="40" height="52" rx="4" fill="#FEF9C3" stroke="#B8924A" strokeWidth="2"/>
      <path d="M44 8 L44 22 L58 22" stroke="#B8924A" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M44 8 L58 22" stroke="#B8924A" strokeWidth="2"/>
      {/* § símbolo */}
      <text x="24" y="42" fontSize="22" fontWeight="900" fontFamily="Georgia,serif" fill="#B8924A">§</text>
      {/* linhas */}
      <line x1="20" y1="52" x2="46" y2="52" stroke="#B8924A" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Carimbo */}
      <rect x="44" y="46" width="22" height="22" rx="4" fill="#92400E" transform="rotate(-15 55 57)"/>
      <text x="55" y="60" fontSize="10" fontWeight="900" fontFamily="Arial,sans-serif"
        fill="white" textAnchor="middle" transform="rotate(-15 55 57)">OK</text>
    </svg>
  )
}

function IconDrive() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      {/* Google Drive - triângulo verde */}
      <path d="M40 14 L62 54 L52 54 L30 14 Z" fill="#00AC47"/>
      {/* triângulo azul */}
      <path d="M18 54 L40 14 L30 14 L8 54 Z" fill="#4285F4"/>
      {/* triângulo amarelo */}
      <path d="M8 54 L18 54 L52 54 L62 54 L54 68 L16 68 Z" fill="#FFBA00"/>
    </svg>
  )
}

function IconMemento() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      {/* Calendário */}
      <rect x="10" y="18" width="60" height="52" rx="6" fill="white" stroke="#5B6CF0" strokeWidth="2.5"/>
      <rect x="10" y="18" width="60" height="20" rx="6" fill="#5B6CF0"/>
      <rect x="10" y="30" width="60" height="8" fill="#5B6CF0"/>
      {/* Argolas */}
      <rect x="24" y="12" width="6" height="14" rx="3" fill="#7C83E8"/>
      <rect x="50" y="12" width="6" height="14" rx="3" fill="#7C83E8"/>
      {/* Marcador amarelo */}
      <rect x="52" y="14" width="8" height="20" rx="2" fill="#FBBF24"/>
      {/* Letra M */}
      <text x="40" y="56" fontSize="22" fontWeight="900" fontFamily="Arial Black,sans-serif"
        fill="#3B3FB5" textAnchor="middle">M</text>
    </svg>
  )
}

function IconQuestoes() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      {/* Monitor */}
      <rect x="8" y="14" width="64" height="44" rx="5" fill="#7C3AED" opacity="0.9"/>
      <rect x="12" y="18" width="56" height="36" rx="3" fill="#EDE9FE"/>
      {/* ? central */}
      <text x="28" y="44" fontSize="24" fontWeight="900" fontFamily="Arial Black,sans-serif"
        fill="#7C3AED" textAnchor="middle">?</text>
      {/* A B C */}
      <circle cx="46" cy="29" r="4" fill="#7C3AED" opacity="0.3"/>
      <text x="46" y="32" fontSize="8" fontWeight="700" fontFamily="Arial,sans-serif"
        fill="#7C3AED" textAnchor="middle">A</text>
      <circle cx="46" cy="40" r="4" fill="#7C3AED" opacity="0.3"/>
      <text x="46" y="43" fontSize="8" fontWeight="700" fontFamily="Arial,sans-serif"
        fill="#7C3AED" textAnchor="middle">B</text>
      <circle cx="46" cy="51" r="4" fill="#7C3AED" opacity="0.3"/>
      <text x="46" y="54" fontSize="8" fontWeight="700" fontFamily="Arial,sans-serif"
        fill="#7C3AED" textAnchor="middle">C</text>
      {/* Base monitor */}
      <rect x="30" y="58" width="20" height="4" rx="2" fill="#7C3AED" opacity="0.5"/>
      <rect x="26" y="62" width="28" height="3" rx="1.5" fill="#7C3AED" opacity="0.4"/>
    </svg>
  )
}

function IconFinanceiro() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      <circle cx="40" cy="40" r="28" fill="none" stroke="#16A34A" strokeWidth="3"/>
      {/* Gráfico linha crescente */}
      <polyline points="20,55 32,42 44,48 60,28"
        stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="60" cy="28" r="3" fill="#16A34A"/>
      {/* $ */}
      <text x="28" y="46" fontSize="14" fontWeight="900" fontFamily="Arial Black,sans-serif"
        fill="#15803D">$</text>
    </svg>
  )
}

// ─── Dados dos links ─────────────────────────────────────────────────────────

const LINKS = [
  {
    label: "SEI",
    desc: "Sistema Eletrônico de Informações",
    url: "https://sei.pe.gov.br",
    bg: "#ffffff",
    labelColor: "#0072CE",
    Icon: IconSEI,
  },
  {
    label: "Psicólogo",
    desc: "Agendamento APMP",
    url: "https://agendamento-apmp.vercel.app/",
    bg: "#F0FDF4",
    labelColor: "#1a7a3c",
    Icon: IconPsicologo,
  },
  {
    label: "ACIDES",
    desc: "Plataforma EAD",
    url: "https://acidesead.sds.pe.gov.br/login/index.php",
    bg: "#EFF6FF",
    labelColor: "#4A7C3F",
    Icon: IconACIDES,
  },
  {
    label: "Decreto",
    desc: "Decreto 57.694/2024 — MGC",
    url: "https://legis.alepe.pe.gov.br/texto.aspx?tiponorma=6&numero=57694&complemento=0&ano=2024&tipo=&url=",
    bg: "#FFFBEB",
    labelColor: "#92400E",
    Icon: IconDecreto,
  },
  {
    label: "Drive",
    desc: "Documentos da Turma",
    url: "https://drive.google.com/drive/folders/1wrNtI9TyT6jNBdMfWlwcGJOwVL-wDqqJ",
    bg: "#ffffff",
    labelColor: "#1a73e8",
    Icon: IconDrive,
  },
  {
    label: "Memento",
    desc: "Em breve",
    url: null,
    bg: "#EEF2FF",
    labelColor: "#3B3FB5",
    Icon: IconMemento,
    emBreve: true,
  },
  {
    label: "Questões",
    desc: "Em breve",
    url: null,
    bg: "#F5F3FF",
    labelColor: "#7C3AED",
    Icon: IconQuestoes,
    emBreve: true,
  },
  {
    label: "Financeiro",
    desc: "Em breve",
    url: null,
    bg: "#F0FDF4",
    labelColor: "#15803D",
    Icon: IconFinanceiro,
    emBreve: true,
  },
]

export default function LinksPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{
        fontFamily: "var(--serif)", fontWeight: 600, fontSize: 24,
        color: "var(--azul-profundo)", marginBottom: 6,
      }}>
        Links Úteis
      </h1>
      <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 28 }}>
        Acesso rápido aos sistemas e recursos da turma
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 16,
      }}>
        {LINKS.map(({ label, desc, url, bg, labelColor, Icon, emBreve }) => {
          const cardStyle: React.CSSProperties = {
            background: bg,
            borderRadius: 18,
            border: "1.5px solid rgba(0,0,0,0.07)",
            padding: "22px 12px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: url ? "pointer" : "default",
            opacity: emBreve ? 0.6 : 1,
            transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
            minHeight: 165,
            textDecoration: "none",
            position: "relative",
          }

          const inner = (
            <div
              style={cardStyle}
              onMouseEnter={e => {
                if (!emBreve) {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = "translateY(-4px)"
                  el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)"
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = "translateY(0)"
                el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"
              }}
            >
              <Icon />
              <div style={{ textAlign: "center" }}>
                <p style={{
                  color: labelColor, fontWeight: 800, fontSize: 13,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  lineHeight: 1.2, marginBottom: 2,
                }}>
                  {label}
                </p>
                {emBreve && (
                  <p style={{ fontSize: 10, color: "#9CA3AF" }}>em breve</p>
                )}
              </div>
            </div>
          )

          if (url) {
            return (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block" }}>
                {inner}
              </a>
            )
          }
          return <div key={label}>{inner}</div>
        })}
      </div>
    </div>
  )
}
