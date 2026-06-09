import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "TIC"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ════ M1 — Organização, níveis de decisão, DIKW ════
  { modulo: "1", tipo: "certo_errado", enunciado: "Uma organização pode ser definida como um conjunto de pessoas que se unem para alcançar objetivos comuns.", gabarito: "certo", explicacao: "Correto. Transforma insumos em produtos/serviços (Chiavenato)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "As decisões do nível operacional são, em regra, de longo prazo e alta amplitude estratégica.", gabarito: "errado", explicacao: "Errado. As operacionais são de curto prazo, rotineiras e de baixa amplitude; longo prazo/alta amplitude é o nível estratégico." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O nível estratégico de decisão é o responsável por definir a direção de longo prazo da organização.", gabarito: "certo", explicacao: "Correto. É próprio da alta administração." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Na Pirâmide do Conhecimento, a ordem da base ao topo é: dado, informação, conhecimento e sabedoria.", gabarito: "certo", explicacao: "Correto. DIKW: do menor para o maior grau de abstração." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Informação é o registro bruto, sem qualquer tratamento ou contexto.", gabarito: "errado", explicacao: "Errado. Isso é DADO. Informação é o dado organizado e contextualizado." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Sabedoria, no topo da pirâmide, é o uso eficaz e ético do conhecimento, considerando impactos de longo prazo.", gabarito: "certo", explicacao: "Correto. É o nível mais alto de abstração." },
  { modulo: "1", tipo: "multipla", enunciado: "Os três níveis de decisão em uma organização são:", alternativas: A("operacional, tático e estratégico", "civil, político e social", "simplex, half-duplex e full-duplex", "dado, informação e conhecimento", "interno, externo e misto"), gabarito: "A", explicacao: "Operacional (rotina), tático (gerencial) e estratégico (longo prazo)." },
  { modulo: "1", tipo: "multipla", enunciado: "Na Pirâmide do Conhecimento (DIKW), o nível que representa a capacidade de interpretar e aplicar a informação é:", alternativas: A("conhecimento", "dado", "informação", "sabedoria", "sinal"), gabarito: "A", explicacao: "Conhecimento = interpretação/aplicação da informação; abaixo da sabedoria." },
  { modulo: "1", tipo: "multipla", enunciado: "O dado, isoladamente e sem tratamento:", alternativas: A("não possui significado relevante", "já é conhecimento aplicado", "representa a sabedoria organizacional", "é o topo da pirâmide", "dispensa contextualização"), gabarito: "A", explicacao: "O dado bruto não significa nada sem ser processado e contextualizado." },
  { modulo: "1", tipo: "multipla", enunciado: "Decisões diárias e rotineiras, ligadas à execução das tarefas, situam-se no nível:", alternativas: A("operacional", "tático", "estratégico", "institucional", "deliberativo"), gabarito: "A", explicacao: "São decisões operacionais (curto prazo, alto detalhamento)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Estrutura, recursos humanos, tecnologia, processos, metas e cultura são elementos-chave de uma organização.", gabarito: "certo", explicacao: "Correto. Compõem a organização." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O nível tático é intermediário entre o operacional e o estratégico, traduzindo a estratégia em ações setoriais.", gabarito: "certo", explicacao: "Correto. É o nível gerencial." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Explique a Pirâmide do Conhecimento (DIKW) e sua relação com a tomada de decisão.", modelo: { estrutura: "Conceito → 4 níveis → aplicação na decisão → conclusão.", criterios: ["Citar dado, informação, conhecimento e sabedoria na ordem base-topo", "Definir cada nível", "Relacionar com a qualidade da decisão"], resposta: "A Pirâmide do Conhecimento (DIKW) descreve a evolução, do menor ao maior grau de abstração, em quatro níveis: dado (registro bruto, sem tratamento), informação (dado organizado e contextualizado), conhecimento (capacidade de interpretar e aplicar a informação) e sabedoria (uso eficaz e ético do conhecimento, considerando impactos de longo prazo). Quanto mais alto o nível, melhor a qualidade da tomada de decisão — daí a importância de transformar dados em informação e conhecimento para decidir com sabedoria." } },

  // ════ M2 — Sistemas, SI, TI ════
  { modulo: "2", tipo: "certo_errado", enunciado: "Um sistema é um conjunto de partes interdependentes que interagem para alcançar um objetivo comum.", gabarito: "certo", explicacao: "Correto. Envolve entrada, processamento, saída e retroalimentação." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Sistema de Informação (SI) e Tecnologia da Informação (TI) são conceitos idênticos.", gabarito: "errado", explicacao: "Errado. SI é mais amplo (pessoas + processos + tecnologia); TI é apenas o componente tecnológico." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A Tecnologia da Informação compreende hardware, software, redes e bancos de dados que sustentam o sistema de informação.", gabarito: "certo", explicacao: "Correto. É a 'espinha dorsal' tecnológica das organizações." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Um Sistema de Informação envolve apenas equipamentos, sem participação de pessoas e processos.", gabarito: "errado", explicacao: "Errado. O SI integra pessoas, processos, dados, hardware e software." },
  { modulo: "2", tipo: "multipla", enunciado: "Diferença correta entre SI e TI:", alternativas: A("SI é mais amplo (pessoas, processos e tecnologia); TI é o componente tecnológico", "TI é mais amplo que SI", "SI não usa tecnologia", "TI dispensa hardware", "são exatamente a mesma coisa"), gabarito: "A", explicacao: "O SI engloba a TI, somada a pessoas e processos." },
  { modulo: "2", tipo: "multipla", enunciado: "As etapas básicas do funcionamento de um sistema são:", alternativas: A("entrada, processamento, saída e retroalimentação", "fonte, ruído e destino apenas", "dado, sigilo e descarte", "simplex, half e full", "Tx, antena e bateria"), gabarito: "A", explicacao: "Entrada → processamento → saída → feedback (retroalimentação)." },
  { modulo: "2", tipo: "multipla", enunciado: "Sobre as fontes de dados nas organizações, é correto afirmar:", alternativas: A("podem ser internas ou externas, e sua qualidade impacta a decisão", "são sempre externas", "não influenciam a tomada de decisão", "dispensam confiabilidade", "são irrelevantes para a TI"), gabarito: "A", explicacao: "Fontes internas/externas, cuja qualidade e confiabilidade são essenciais." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Segundo Laudon e Laudon, a TI é a espinha dorsal que sustenta as operações das organizações modernas.", gabarito: "certo", explicacao: "Correto. Permite operar com eficiência e responder a mudanças." },
  { modulo: "2", tipo: "multipla", enunciado: "Um Sistema de Informação é composto, entre outros, por:", alternativas: A("pessoas, processos, dados, hardware e software", "apenas software", "somente hardware", "exclusivamente redes", "apenas dados"), gabarito: "A", explicacao: "O SI integra esses cinco componentes." },

  // ════ M3 — Estrutura TI SDS/PMPE ════
  { modulo: "3", tipo: "certo_errado", enunciado: "A GGTI (Gerência Geral de Tecnologia da Informação) da SDS/PE desenvolve e mantém os sistemas de defesa social do Estado.", gabarito: "certo", explicacao: "Correto. É o órgão de TI da SDS-PE." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O acesso aos sistemas desenvolvidos pela SDS/PE exige uma senha diferente para cada sistema.", gabarito: "errado", explicacao: "Errado. A senha de acesso é UNIFICADA para os sistemas da SDS/PE." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O CIODS (Centro Integrado de Operações de Defesa Social) é um núcleo de operações integradas que gerencia, entre outros, as POE.", gabarito: "certo", explicacao: "Correto. Gerencia as Plataformas de Observação Elevada (POE)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O Sistema de Informação de Defesa Social organiza-se em sistemas e subsistemas (como o subsistema de informação criminal).", gabarito: "certo", explicacao: "Correto. Ex.: subsistema criminal no INFOPOL, coordenado pela PCPE." },
  { modulo: "3", tipo: "multipla", enunciado: "A sigla CIODS designa:", alternativas: A("Centro Integrado de Operações de Defesa Social", "Comando de Inteligência e Operações de Defesa Social", "Central de Informação de Ocorrências de Defesa Social", "Conselho Interno de Operações de Defesa Social", "Centro de Inteligência Operacional de Dados e Segurança"), gabarito: "A", explicacao: "CIODS = Centro Integrado de Operações de Defesa Social." },
  { modulo: "3", tipo: "multipla", enunciado: "As POE, gerenciadas pelo CIODS, são:", alternativas: A("Plataformas de Observação Elevada", "Postos de Operações Especiais", "Programas Operacionais Estaduais", "Pontos de Origem Eletrônica", "Protocolos de Operação Externa"), gabarito: "A", explicacao: "POE = Plataformas de Observação Elevada (videomonitoramento em altura)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A senha unificada simplifica o acesso do policial aos diversos sistemas da SDS/PE.", gabarito: "certo", explicacao: "Correto. Uma credencial para vários sistemas." },

  // ════ M4 — Sistemas operacionais ════
  { modulo: "4", tipo: "certo_errado", enunciado: "O Sistema Polícia Ágil, desenvolvido pela GGTI/SDS-PE, centraliza e agiliza o acesso a informações operacionais em tempo real.", gabarito: "certo", explicacao: "Correto. Reúne as Consultas Integradas." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O INFOPOL gerencia as informações dos registros de ocorrências das Delegacias da Polícia Civil de Pernambuco.", gabarito: "certo", explicacao: "Correto. Integra também os dados do BOEPM após homologação pela PCPE." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O BOEPM é o Boletim de Ocorrência Eletrônico da PM, cujos dados são importados ao boletim na delegacia, dando celeridade.", gabarito: "certo", explicacao: "Correto. Integra-se ao INFOPOL." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O SIAP é o Sistema Integrado de Administração Prisional.", gabarito: "certo", explicacao: "Correto. Trata da gestão prisional." },
  { modulo: "4", tipo: "multipla", enunciado: "As Consultas Integradas (via Polícia Ágil) abrangem, entre outras:", alternativas: A("consultas civil, criminal, carcerária, de veículo e de mandado de prisão", "apenas consulta de e-mail", "somente dados meteorológicos", "exclusivamente folha de pagamento", "apenas frota de veículos administrativos"), gabarito: "A", explicacao: "Reúnem dados civis, criminais, carcerários, de veículos, mandados, celular, etc." },
  { modulo: "4", tipo: "multipla", enunciado: "O BNMP, sistema nacional, refere-se a:", alternativas: A("Banco Nacional de Medidas Penais e Prisões", "Banco Nacional de Multas e Penalidades", "Base Nacional de Mandados Policiais", "Boletim Nacional de Mobilização Penal", "Banco Nacional de Material Pericial"), gabarito: "A", explicacao: "BNMP (CNJ): mandados de prisão e medidas penais." },
  { modulo: "4", tipo: "multipla", enunciado: "O CAD de Ocorrências (SINESP CAD), usado no CIODS, presta-se a:", alternativas: A("despacho e gestão de ocorrências (Computer Aided Dispatch)", "edição de imagens", "controle de estoque de fardamento", "emissão de diárias", "gestão de e-mails"), gabarito: "A", explicacao: "CAD = despacho assistido por computador, para gestão de ocorrências." },
  { modulo: "4", tipo: "certo_errado", enunciado: "SINESP/INFOSEG e SISDEPEN são exemplos de sistemas nacionais de informação de segurança/penitenciário.", gabarito: "certo", explicacao: "Correto. Integram bases nacionais consultadas pelas forças de segurança." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Os tutoriais passo a passo de cada consulta são o conteúdo mais cobrado em prova nesta disciplina.", gabarito: "errado", explicacao: "Errado. Os tutoriais ('clique aqui') não são o foco; importam os conceitos: o que cada sistema faz e quem o gere." },

  // ════ M5 — Tecnologias emergentes ════
  { modulo: "5", tipo: "certo_errado", enunciado: "O reconhecimento facial identifica pessoas por biometria da face, apoiando a localização de foragidos e procurados.", gabarito: "certo", explicacao: "Correto. É uma das tecnologias emergentes da SDS/PE." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O videomonitoramento por câmeras integra-se ao CIODS e auxilia na vigilância e na produção de prova.", gabarito: "certo", explicacao: "Correto. As câmeras alimentam o monitoramento integrado." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O monitoramento por geolocalização (GPS) permite localizar viaturas e recursos, apoiando o despacho.", gabarito: "certo", explicacao: "Correto. É usado na gestão operacional." },
  { modulo: "5", tipo: "multipla", enunciado: "O sistema que conecta o policial em campo aos sistemas, permitindo consultas e registro por dispositivo móvel, é o:", alternativas: A("PM Conectado / E-COP", "SIGFROTA", "SEI", "GLPI", "Expresso"), gabarito: "A", explicacao: "PM Conectado/E-COP levam as consultas e o registro ao campo." },
  { modulo: "5", tipo: "multipla", enunciado: "O padrão P25, citado na modernização da radiocomunicação, refere-se a:", alternativas: A("rádio digital troncalizado", "rede de fibra óptica submarina", "protocolo de e-mail", "sistema de reconhecimento facial", "banco de dados criminal"), gabarito: "A", explicacao: "P25 é um padrão de rádio digital adotado na modernização." },
  { modulo: "5", tipo: "certo_errado", enunciado: "As tecnologias emergentes (reconhecimento facial, câmeras, geolocalização) não têm aplicação na segurança pública.", gabarito: "errado", explicacao: "Errado. São justamente aplicadas à segurança pública (identificação, vigilância, despacho)." },

  // ════ M6 — Sistemas de apoio administrativo ════
  { modulo: "6", tipo: "certo_errado", enunciado: "O SEI (Sistema Eletrônico de Informações) destina-se à tramitação de processos e documentos digitais.", gabarito: "certo", explicacao: "Correto. É sistema de apoio administrativo." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Expresso é o sistema de gestão de frota de veículos da PMPE.", gabarito: "errado", explicacao: "Errado. O Expresso é o e-mail institucional; a gestão de frota é o SIGFROTA." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O GLPI é utilizado como HelpDesk para abertura de chamados de TI.", gabarito: "certo", explicacao: "Correto. Gerencia chamados/suporte de TI." },
  { modulo: "6", tipo: "multipla", enunciado: "O SIGFROTA é o sistema de:", alternativas: A("gestão de frota/veículos", "gestão de pessoal", "e-mail institucional", "processos eletrônicos", "reconhecimento facial"), gabarito: "A", explicacao: "SIGFROTA = gestão da frota de veículos." },
  { modulo: "6", tipo: "multipla", enunciado: "Distinção correta entre sistemas:", alternativas: A("operacionais (atividade-fim: Polícia Ágil, INFOPOL, CIODS) ≠ apoio administrativo (atividade-meio: SEI, Expresso, SIGFROTA)", "todos são de atividade-fim", "SEI é sistema operacional de despacho", "Polícia Ágil é sistema administrativo", "não há distinção entre eles"), gabarito: "A", explicacao: "Operacionais apoiam a atividade-fim; administrativos, a atividade-meio." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O e-SGPM e o Portal PMPE estão relacionados à gestão de pessoal e ao acesso institucional.", gabarito: "certo", explicacao: "Correto. São sistemas de apoio administrativo/pessoal." },
  { modulo: "6", tipo: "multipla", enunciado: "Assinale o sistema de APOIO ADMINISTRATIVO (atividade-meio):", alternativas: A("SEI", "Polícia Ágil", "INFOPOL", "CIODS", "BOEPM"), gabarito: "A", explicacao: "O SEI é administrativo; os demais são operacionais (atividade-fim)." },

  // ════ M7 — Comunicações ════
  { modulo: "7", tipo: "certo_errado", enunciado: "O telégrafo é atribuído a Samuel Morse (1837) e o telefone a Graham Bell (1876).", gabarito: "certo", explicacao: "Correto. Marcos do histórico das comunicações." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Guglielmo Marconi é associado à invenção do rádio, em 1895.", gabarito: "certo", explicacao: "Correto. No Brasil, Landell de Moura transmitiu voz sem fio em 1893." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A primeira transmissão oficial de rádio no Brasil ocorreu em 7 de setembro de 1922, no centenário da Independência.", gabarito: "certo", explicacao: "Correto. Transmitiu o discurso de Epitácio Pessoa e a ópera O Guarani." },
  { modulo: "7", tipo: "certo_errado", enunciado: "No sistema de comunicação, o meio de transmissão é o elemento que, isoladamente, mais influencia o desempenho.", gabarito: "certo", explicacao: "Correto. Determina inclusive o tipo de transmissor e receptor." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os rádios utilizados pela PMPE operam em modo full-duplex, permitindo falar e ouvir simultaneamente na mesma frequência.", gabarito: "errado", explicacao: "Errado. Os rádios da PM são HALF-duplex: um sentido por vez, mesma frequência (full-duplex é o celular)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A telefonia celular é um exemplo clássico de comunicação full-duplex.", gabarito: "certo", explicacao: "Correto. Transmite e recebe simultaneamente, com frequências distintas." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Transmissões de TV e rádio (difusão) são exemplos de comunicação simplex.", gabarito: "certo", explicacao: "Correto. Fluxo unidirecional (um sentido só)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os sinais do Código Q têm caráter sigiloso e funcionam como linguagem cifrada.", gabarito: "errado", explicacao: "Errado. O Código Q NÃO é sigiloso — é considerado linguagem clara e coerente." },
  { modulo: "7", tipo: "multipla", enunciado: "Os três modos (canais) de comunicação quanto ao sentido são:", alternativas: A("simplex, half-duplex e full-duplex", "VHF, UHF e SHF", "Tx, Rx e repetidora", "físico, não físico e híbrido", "analógico, digital e troncalizado"), gabarito: "A", explicacao: "Simplex (1 sentido), half-duplex (um por vez), full-duplex (simultâneo)." },
  { modulo: "7", tipo: "multipla", enunciado: "No Código Q, 'QAP' significa:", alternativas: A("na escuta / pode falar", "qual a sua localização", "entendido/copiei", "ocupado", "parar de transmitir"), gabarito: "A", explicacao: "QAP = na escuta. (QTH = localização; QSL = entendido; QRL = ocupado; QRT = parar)." },
  { modulo: "7", tipo: "multipla", enunciado: "No Código Q, o sinal que indica a localização/endereço é:", alternativas: A("QTH", "QAP", "QSL", "QRV", "QRZ"), gabarito: "A", explicacao: "QTH = local/endereço (qual sua localização)." },
  { modulo: "7", tipo: "multipla", enunciado: "O sinal 'QSL', no Código Q, significa:", alternativas: A("entendido / copiei / OK", "interferência", "quem está chamando?", "aguarde um instante", "horas"), gabarito: "A", explicacao: "QSL = entendido/copiei. (QRM = interferência; QRZ = quem chama; QRX = aguarde; QTR = horas)." },
  { modulo: "7", tipo: "multipla", enunciado: "As séries do Código Q reservadas aos serviços gerais (uso policial) são:", alternativas: A("QRA a QVZ", "QAA a QNZ", "QOA a QQZ", "QVZ a QZZ", "QZA a QZZ"), gabarito: "A", explicacao: "QAA-QNZ = aeronáutico; QOA-QQZ = marítimo; QRA-QVZ = gerais; QVZ-QZZ = não distribuída." },
  { modulo: "7", tipo: "multipla", enunciado: "Para soletrar pelo alfabeto fonético da ONU, anuncia-se antes a expressão:", alternativas: A("'VOU SOLETRAR' (e 'SEPARA' entre palavras, 'TERMINADO' ao final)", "'CÂMBIO E DESLIGO'", "'CÓDIGO VERMELHO'", "'ATENÇÃO GERAL'", "'PRIORIDADE MÁXIMA'"), gabarito: "A", explicacao: "Usa-se 'VOU SOLETRAR', 'SEPARA' e 'TERMINADO'." },
  { modulo: "7", tipo: "multipla", enunciado: "Sobre os equipamentos de radiocomunicação, é correto:", alternativas: A("o móvel (na VT) tem ~30 W e o portátil (HT) ~5 W", "o portátil tem mais potência que o móvel", "o fixo é alimentado por bateria química", "a repetidora apenas recebe sinal", "todos operam apenas em AM"), gabarito: "A", explicacao: "Móvel ~30 W; portátil/HT ~5 W; fixo em estações; repetidora amplifica e reenvia." },
  { modulo: "7", tipo: "multipla", enunciado: "A repetidora, na radiocomunicação, caracteriza-se por:", alternativas: A("receber, amplificar e reenviar o sinal, operando com frequências invertidas (Tx/Rx)", "reduzir o alcance do sinal", "operar sempre em simplex", "substituir o COPOM", "funcionar sem energia"), gabarito: "A", explicacao: "Amplia o alcance; usa frequências distintas/invertidas para Tx e Rx." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Em uma rede de rádio, apenas um posto consegue transmitir por vez, embora todos possam ouvir; por isso é essencial escutar antes de transmitir.", gabarito: "certo", explicacao: "Correto. É a disciplina de rede (evita colisões); não se transmite sem autorização do coordenador." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os meios de transmissão dividem-se em físicos (guiados/cabos) e não-físicos (não guiados/sem fio).", gabarito: "certo", explicacao: "Correto. Físico = cabo; não físico = ondas de rádio." },
  { modulo: "7", tipo: "multipla", enunciado: "Os elementos de um sistema de comunicação são:", alternativas: A("transmissor (Tx), meio de transmissão e receptor (Rx)", "fonte, ruído e sabedoria", "dado, informação e conhecimento", "simplex, half e full", "VHF, UHF e SHF"), gabarito: "A", explicacao: "Tx → sinal → meio → sinal → Rx (que decodifica)." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Diferencie os modos de comunicação simplex, half-duplex e full-duplex, com um exemplo de cada e o uso na PMPE.", modelo: { estrutura: "Simplex → half-duplex → full-duplex → uso PMPE → conclusão.", criterios: ["Definir simplex (unidirecional) com exemplo (TV/rádio difusão)", "Definir half-duplex (um sentido por vez) — rádios da PM", "Definir full-duplex (simultâneo) — celular"], resposta: "No modo simplex a comunicação é unidirecional (um só sentido), como nas transmissões de TV e rádio de difusão. No half-duplex (semi-duplex) a comunicação é bidirecional, mas apenas um sentido por vez, na mesma frequência — é o caso dos rádios transceptores da PMPE, em que só um posto fala por vez (se dois falam, há colisão). No full-duplex a comunicação é bidirecional e simultânea, com frequências distintas para transmissão e recepção — exemplo clássico é a telefonia celular. Assim, a PMPE opera tipicamente em half-duplex em sua rede de rádio." } },
  { modulo: "7", tipo: "dissertativa", enunciado: "Explique a finalidade do Código Q e do alfabeto fonético da ONU nas comunicações policiais.", modelo: { estrutura: "Código Q → alfabeto fonético → finalidade comum → conclusão.", criterios: ["Definir o Código Q (abreviações de 3 letras, não sigiloso)", "Definir o alfabeto fonético (soletração)", "Apontar clareza, padronização e eficiência"], resposta: "O Código Q é um conjunto de abreviações de três letras (de QAA a QZZ) que padroniza e agiliza a troca de informações no rádio (ex.: QAP = na escuta, QTH = localização, QSL = entendido), não tendo caráter sigiloso — é linguagem clara. O alfabeto fonético da ONU (OACI) serve para soletrar palavras e nomes, evitando confusões em ambientes ruidosos, anunciando-se 'VOU SOLETRAR', 'SEPARA' entre palavras e 'TERMINADO' ao final. Ambos garantem clareza, padronização e eficiência, minimizando erros nas operações." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Níveis de decisão", verso: `• Operacional: rotina, curto prazo, baixa amplitude.\n• Tático: intermediário/gerencial, médio prazo.\n• Estratégico: longo prazo, alta amplitude (alta administração).` },
  { modulo: "1", frente: "Pirâmide do Conhecimento (DIKW)", verso: `• Base→topo: Dado → Informação → Conhecimento → Sabedoria.\n• Dado: bruto. Informação: dado contextualizado. Conhecimento: interpretar/aplicar. Sabedoria: uso eficaz e ético (longo prazo).` },
  { modulo: "2", frente: "SI × TI", verso: `• SI (Sistema de Informação): pessoas + processos + dados + hardware + software.\n• TI: só o componente tecnológico (hardware, software, redes, BD).\n• Sistema: entrada → processamento → saída → retroalimentação.` },
  { modulo: "3", frente: "Estrutura de TI na SDS/PE", verso: `• GGTI/SDS-PE desenvolve os sistemas; senha UNIFICADA.\n• CIODS: Centro Integrado de Operações de Defesa Social (gerencia as POE).\n• Sistema de Defesa Social: sistemas e subsistemas (ex.: criminal).` },
  { modulo: "4", frente: "Sistemas operacionais", verso: `• Polícia Ágil: consultas integradas em tempo real (GGTI).\n• BOEPM: BO eletrônico da PM. INFOPOL: ocorrências das delegacias da PCPE.\n• SIAP: administração prisional. CIODS/SINESP CAD: despacho. BNMP: mandados/medidas penais.` },
  { modulo: "5", frente: "Tecnologias emergentes", verso: `• Reconhecimento facial; câmeras (videomonitoramento); geolocalização (GPS).\n• PM Conectado/E-COP: consultas e registro em campo.\n• P25: rádio digital troncalizado.` },
  { modulo: "6", frente: "Sistemas de apoio administrativo", verso: `• Expresso (e-mail), SEI (processos), Portal PMPE/e-SGPM (pessoal), GLPI (helpdesk TI), SIGFROTA (frota).\n• Atividade-MEIO (≠ operacionais de atividade-fim).` },
  { modulo: "7", frente: "Canais: simplex × half × full-duplex", verso: `• Simplex: 1 sentido (TV/rádio difusão).\n• Half-duplex: um por vez, mesma frequência → RÁDIO DA PM.\n• Full-duplex: simultâneo, frequências distintas → CELULAR.` },
  { modulo: "7", frente: "Equipamentos e repetidora", verso: `• Móvel (VT) ~30 W; Portátil/HT ~5 W; Fixo (quartéis/DPMs).\n• Repetidora: recebe, amplifica e reenvia; frequências invertidas (Tx/Rx); amplia alcance.` },
  { modulo: "7", frente: "Código Q (principais)", verso: `• QAP=na escuta; QRU=mensagem; QTH=localização; QSL=entendido/copiei; QRA=nome; QRL=ocupado; QRM=interferência; QRT=parar; QRX=aguarde; QRZ=quem chama.\n• Não é sigiloso. Séries: QAA-QNZ aeronáutico, QOA-QQZ marítimo, QRA-QVZ gerais.` },
  { modulo: "7", frente: "Alfabeto fonético (ONU) e procedimentos", verso: `• Soletrar: "VOU SOLETRAR" → "SEPARA" (entre palavras) → "TERMINADO" (fim).\n• Rede: só um transmite por vez; escute antes de transmitir; não transmita sem autorização do coordenador (COPOM).` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  let fc = 0
  for (const card of CARDS) {
    const hash = createHash("sha1").update(`${MAT}|${card.modulo}|${card.frente}`).digest("hex")
    await prisma.flashcard.upsert({ where: { hash }, update: { verso: card.verso, ordem: fc }, create: { materia: MAT, modulo: card.modulo, frente: card.frente, verso: card.verso, ordem: fc, hash } })
    fc++
  }
  const all = await prisma.questao.findMany({ where: { materia: MAT }, select: { modulo: true } })
  const mods = new Set(all.map(x => x.modulo))
  const tc = await prisma.flashcard.count({ where: { materia: MAT } })
  console.log(`TIC: ${c} criadas/${u} atualizadas. Total Q ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod); flashcards ${tc}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
