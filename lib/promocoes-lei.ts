// Resumo da LC nº 470/2021 (Promoção dos Militares do Estado de Pernambuco) para oficiais QOPM.
// Texto: https://www.lai.pe.gov.br/cbmpe/wp-content/uploads/sites/15/2022/03/LEI-COMPLEMENTAR-no-470-de-21DEZ2021-1.pdf

export const LC470_URL = "https://www.lai.pe.gov.br/cbmpe/wp-content/uploads/sites/15/2022/03/LEI-COMPLEMENTAR-no-470-de-21DEZ2021-1.pdf"

export type TipoPromocao = { nome: string; artigos: string; resumo: string; criterios: string[] }

export const PROMOCOES_ORDINARIAS: TipoPromocao[] = [
  {
    nome: "Antiguidade", artigos: "arts. 5º, 7º e 48",
    resumo: "Sobe quem é mais antigo no posto, assim que abre a vaga — os efeitos retroagem à data da vacância.",
    criterios: [
      "Estar no Quadro de Acesso por Antiguidade (QAA): interstício, inspeção de saúde, cursos e serviço arregimentado.",
      "Antiguidade no posto conta da data da última promoção; no 1º posto, vale a classificação final do CFO (art. 16).",
      "Aspirante → 2º Ten: só por antiguidade, após o estágio probatório com aproveitamento (art. 7º, § 1º).",
      "Se a vaga abre e ninguém está habilitado, a promoção sai na data em que o primeiro completar os requisitos (art. 48, § 7º).",
    ],
  },
  {
    nome: "Merecimento", artigos: "arts. 6º, 7º, 18, 37, 49 e 54",
    resumo: "Sobe quem tem o melhor conceito entre os habilitados — uma vez por ano, em 6 de março.",
    criterios: [
      "Proporção das vagas: 1º Ten, Capitão e Major — 1 por merecimento para 1 por antiguidade; Ten-Cel e Coronel — 2 por merecimento para 1 por antiguidade.",
      "Só concorre quem está entre os 40% mais antigos do posto (calculado sobre o efetivo fixado em lei) e no Quadro de Acesso por Merecimento (QAM).",
      "Nota da Ficha de Promoção: FP = [FAF + 3 × FAE + 2 × FPO] ÷ 6 (avaliação funcional do comandante, avaliação estratégica da comissão e pontuação objetiva: cursos, conduta, medalhas e produtividade).",
      "Conceito: até 10 Insuficiente · até 20 Regular · até 30 Bom · até 40 Ótimo · até 50 Excelente. Empate: decide a antiguidade.",
      "A FAF e a FPO contam o ano anterior (1º/jan a 31/dez) — o merecimento é construído ano a ano, desde o aspirantado.",
    ],
  },
]

export const PROMOCOES_EXTRAORDINARIAS: TipoPromocao[] = [
  {
    nome: "Decenal", artigos: "arts. 12 e 55",
    resumo: "Garante o posto seguinte por tempo de carreira, sem depender de vaga.",
    criterios: [
      "Capitão com 10 anos de oficial; Major com 20; Tenente-Coronel com 30 (contados da nomeação como aspirante).",
      "Exige interstício, inspeção de saúde, cursos (CAO para Major e Ten-Cel) e certidões negativas.",
      "A vaga do posto de origem é extinta e outra criada no novo posto — exceto saindo de 1º Ten, que abre vaga normalmente (§ 1º).",
    ],
  },
  {
    nome: "Bravura", artigos: "arts. 9º e 56",
    resumo: "Ato incomum de coragem e audácia que ultrapassa o cumprimento do dever, em serviço ou não.",
    criterios: [
      "Apurado por Conselho Especial designado pelo Comandante Geral e homologado pela Comissão de Promoção.",
      "Efetivada pelo Governador; não exige os requisitos dos outros critérios (interstício, cursos, vaga).",
    ],
  },
  {
    nome: "Post mortem", artigos: "arts. 10 e 57",
    resumo: "Reconhecimento ao militar que morre em serviço ou em razão da função.",
    criterios: [
      "Ações de preservação da ordem pública, ferimento em luta contra malfeitores, acidente de serviço, incêndio, salvamento ou defesa civil — ou doença decorrente disso.",
      "Não cabe se a apuração mostrar ofensa à honra, ao pundonor, ao dever ou ao decoro. A bravura pelo mesmo fato exclui a post mortem.",
    ],
  },
  {
    nome: "Invalidez permanente", artigos: "art. 11",
    resumo: "Promoção ao posto seguinte antes da reforma de quem é julgado definitivamente incapaz.",
    criterios: [
      "Ferimento no serviço, acidente em serviço, doença ligada ao serviço ou doenças graves listadas em lei (laudo da Junta Militar de Saúde).",
      "Independe de vaga, interstício e cursos; o militar fica excedente e é reformado após dois meses de remuneração do novo posto.",
    ],
  },
  {
    nome: "Requerida", artigos: "arts. 13 e 14",
    resumo: "Promoção a pedido de quem já tem tempo para a reserva — só para quem ingressou até 31/12/2021 (não vale para a nossa turma).",
    criterios: [
      "Independe de vaga, interstício e cursos; depois do pedido o militar deixa de concorrer às demais promoções e vai para a reserva.",
      "Irrevogável depois de publicada; não se aplica a quem já é coronel.",
    ],
  },
  {
    nome: "Ressarcimento de preterição", artigos: "art. 15",
    resumo: "Devolve a promoção a quem foi indevidamente preterido.",
    criterios: [
      "Recurso deferido, erro administrativo comprovado, fim de situação de desaparecido, absolvição ou impronúncia.",
      "O militar recebe o número que teria na escala hierárquica, como se tivesse sido promovido na época certa.",
    ],
  },
]

// Anexo V (QOPM) e Anexo VII
export const REQUISITOS_POSTO = [
  { posto: "Aspirante a Oficial", intersticio: "6 meses", arregimentado: "—", curso: "CFO" },
  { posto: "2º Tenente", intersticio: "5 anos", arregimentado: "36 meses", curso: "CFO" },
  { posto: "1º Tenente", intersticio: "5 anos", arregimentado: "24 meses", curso: "CFO" },
  { posto: "Capitão", intersticio: "4 anos", arregimentado: "24 meses", curso: "CAO (para Major e Ten-Cel)" },
  { posto: "Major", intersticio: "4 anos", arregimentado: "12 meses", curso: "CSP (para Coronel)" },
  { posto: "Tenente-Coronel", intersticio: "3 anos", arregimentado: "12 meses", curso: "CSP (para Coronel)" },
]

export const OUTRAS_REGRAS = [
  "Interstício é o tempo mínimo no posto para entrar no Quadro de Acesso (art. 21). Serviço arregimentado é o tempo em funções de natureza policial militar — o curso de formação não conta (arts. 24 e 25).",
  "Quando há mais claros do que militares habilitados, o Governador pode reduzir interstício e serviço arregimentado até a metade, por proposta do Comandante Geral (art. 26).",
  "Vagas abrem por promoção, reserva, demissão, falecimento ou aumento de efetivo; cada vaga aberta num posto abre vaga nos postos de baixo (art. 47).",
  "Inspeção de saúde anual: apto vale por um ano; incapacidade temporária não impede a promoção (arts. 22 e 29).",
]
