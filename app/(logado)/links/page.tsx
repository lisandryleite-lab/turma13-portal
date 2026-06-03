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

function IconACIDES() {
  return (
    <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
      <defs>
        <linearGradient id="acidesShield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6"/>
          <stop offset="0.5" stopColor="#1A52A8"/>
          <stop offset="1" stopColor="#0B2D5E"/>
        </linearGradient>
        <linearGradient id="acidesFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE68A"/>
          <stop offset="0.5" stopColor="#F59E0B"/>
          <stop offset="1" stopColor="#B8924A"/>
        </linearGradient>
      </defs>
      {/* Escudo / livro aberto */}
      <path d="M40 22 L66 30 L66 50 C66 62 40 74 40 74 C40 74 14 62 14 50 L14 30 Z"
        fill="url(#acidesShield)" stroke="#0B2D5E" strokeWidth="1.5"/>
      {/* Vinco central do livro */}
      <line x1="40" y1="24" x2="40" y2="68" stroke="#0B2D5E" strokeWidth="1.5" opacity="0.5"/>
      {/* Brilho lateral */}
      <path d="M40 24 L18 31 L18 50 C18 58 30 65 36 68 L40 68 Z" fill="#ffffff" opacity="0.08"/>
      {/* Chevron branco (A) */}
      <path d="M40 36 L54 62 L46 62 L40 50 L34 62 L26 62 Z" fill="#F8FAFC"/>
      {/* Chama dourada — três línguas de fogo */}
      <path d="M40 2
        C49 12 54 17 50 27
        C49 23 47 21 45 20
        C48 27 44 31 43 25
        C44 31 39 33 39 27
        C37 32 33 30 35 24
        C33 26 31 28 32 31
        C27 23 33 13 40 2Z"
        fill="url(#acidesFlame)"/>
      {/* Brilho interno da chama */}
      <path d="M40 9 C44 15 46 19 43 25 C42 22 41 21 40 20 C40 24 38 25 38 22 C36 19 37 14 40 9Z"
        fill="#FDE68A" opacity="0.7"/>
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
        {LINKS.map(({ label, url, bg, labelColor, Icon }) => {
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
            opacity: 1,
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
                const el = e.currentTarget as HTMLElement
                el.style.transform = "translateY(-4px)"
                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)"
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
