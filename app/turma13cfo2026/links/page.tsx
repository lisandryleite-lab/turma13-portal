export default function LinksPage() {
  const links = [
    { label: "Agendar com Psicólogo", url: "https://agendamento-apmp.vercel.app/", desc: "Agendamento APMP" },
    { label: "SEI — Sistema Eletrônico de Informações", url: "https://sei.pe.gov.br", desc: "Portal SEI/PE" },
    { label: "Decreto CFO 2024", url: "https://legis.alepe.pe.gov.br/texto.aspx?tiponorma=6&numero=57694&complemento=0&ano=2024&tipo=&url=", desc: "Decreto 57.694/2024" },
    { label: "Drive da Turma 13", url: "https://drive.google.com/drive/folders/1wrNtI9TyT6jNBdMfWlwcGJOwVL-wDqqJ", desc: "Google Drive" },
    { label: "Portal ACIDES / EAD", url: "https://acidesead.sds.pe.gov.br/login/index.php", desc: "Plataforma EAD" },
    { label: "Mementos", url: null, desc: "Em breve" },
    { label: "Plataforma de Questões", url: null, desc: "Em breve" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Links Úteis</h1>
      <div className="space-y-3">
        {links.map((l) => (
          <div key={l.label} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900 text-sm">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
            </div>
            {l.url ? (
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 bg-blue-900 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-800">
                Abrir
              </a>
            ) : (
              <span className="shrink-0 text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded">Em breve</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
