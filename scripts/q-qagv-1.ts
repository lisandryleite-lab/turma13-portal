import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
// Qualidade do Atendimento aos Grupos Vulneráveis — 9 módulos (11 questões cada:
// 7 V/F + 3 MC + 1 dissertativa) + módulo SIM (simulado, 22 questões, 10,0 pontos) = 121.
// Fonte: apostila "Qualidade do Atendimento aos Grupos Vulneráveis — CFO PM 2024"
// (public/apostilas/QAGV.pdf) e memento QAGV. Gabaritos das múltiplas já distribuídos
// entre A–E; as explicações não citam letra (seguro para redistribui-gabaritos.ts).
const MAT = "QAGV"
const FONTE_PADRAO = "Apostila QAGV (CFO PM 2024)"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string; contexto?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const BLOCO_VF = "BLOCO I — Julgue os itens a seguir, assinalando VERDADEIRO ou FALSO. Cada assertiva vale 0,20 ponto."

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Minorias × grupos vulneráveis e direitos humanos ════════════════════
  { modulo: "1", tipo: "certo_errado", enunciado: "Segundo Siqueira e Castro, os grupos vulneráveis são indivíduos com alto grau de chance de serem ofendidos ou atacados, mas que não possuem uma identidade nem um traço comum entre si.", gabarito: "certo", explicacao: "Correto. É a definição de grupos vulneráveis (item 2.1): alta chance de ofensa, sem identidade ou traço comum." },
  { modulo: "1", tipo: "certo_errado", enunciado: "As minorias são sujeitos conectados por um traço cultural comum, e esse traço, fator de discriminação, deve ser eliminado para que o grupo se integre à sociedade.", gabarito: "errado", explicacao: "Errado. O traço cultural das minorias NÃO visa a ser eliminado: busca ser reconhecido e respeitado, com fundamento na pluralidade (ex.: indígenas)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O número de integrantes, por si só, não é capaz de caracterizar uma minoria; para ser protegida institucionalmente, ela precisa ser não dominante no Estado em que vive.", gabarito: "certo", explicacao: "Correto. O critério numérico isolado não define minoria; exige-se a posição não dominante." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O vínculo subjetivo de solidariedade entre os membros para proteção da identidade cultural é uma característica comum às minorias e aos grupos vulneráveis.", gabarito: "errado", explicacao: "Errado. Esse vínculo é peculiaridade das MINORIAS e, segundo a apostila, NÃO pertence aos grupos vulneráveis." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Os grupos vulneráveis são categorizados como gênero, a chamada minoria lato sensu, enquanto as minorias são espécie, a minoria stricto sensu.", gabarito: "certo", explicacao: "Correto. Grupos vulneráveis = gênero (lato sensu); minorias = espécie (stricto sensu) — item 2.2." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Os grupos vulneráveis buscam o próprio reconhecimento de direitos para, num segundo momento, buscar o seu exercício.", gabarito: "errado", explicacao: "Errado. Isso é próprio das MINORIAS. Os grupos vulneráveis buscam o respeito e o exercício de direitos já reconhecidos e aceitos." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Ações afirmativas são medidas especiais destinadas a assegurar a igualdade de fato e a corrigir desigualdades históricas e sociais enfrentadas por minorias e grupos vulneráveis.", gabarito: "certo", explicacao: "Correto. É a definição de ações afirmativas na correlação com os direitos humanos (item 2.4, C)." },
  { modulo: "1", tipo: "multipla", enunciado: "São apontadas pela apostila como peculiaridades das minorias, EXCETO:", alternativas: A(
    "posição de não dominação junto ao grupo social",
    "vínculo subjetivo de solidariedade entre seus membros para proteção da identidade cultural",
    "demanda de especial proteção estatal",
    "busca pela eliminação do traço que as diferencia dos demais",
    "sofrimento de opressão social"),
    gabarito: "D", explicacao: "As quatro peculiaridades são: não dominação, vínculo de solidariedade, especial proteção estatal e opressão social. A minoria NÃO busca eliminar seu traço; busca reconhecimento e respeito." },
  { modulo: "1", tipo: "multipla", enunciado: "Na fundamentação legal da proteção de minorias e grupos vulneráveis, a apostila cita, como tratados internacionais com base legal específica:", alternativas: A(
    "o Pacto de San José e a Convenção de Viena sobre Relações Consulares",
    "a Convenção sobre a Eliminação de Todas as Formas de Discriminação Racial (CERD) e a Convenção sobre os Direitos das Pessoas com Deficiência (CDPD)",
    "o Estatuto de Roma e a Carta da OEA",
    "a Convenção de Genebra e o Tratado de Tordesilhas",
    "a Declaração de Independência e a Carta Magna"),
    gabarito: "B", explicacao: "A apostila cita a DUDH e, entre os tratados, a CERD e a CDPD como base legal específica." },
  { modulo: "1", tipo: "multipla", enunciado: "Ao implementar uma política pública voltada a uma MINORIA, a estratégia adequada, segundo Brito (2009), é:", alternativas: A(
    "homogeneizar a sociedade, impondo os valores majoritários",
    "eliminar o fator de discriminação para facilitar a integração",
    "tratar a minoria exatamente como um grupo vulnerável, sem distinção",
    "priorizar apenas o critério numérico do grupo",
    "contemplar o reconhecimento de direitos e a manutenção do traço cultural específico (igualdade na diferença)"),
    gabarito: "E", explicacao: "Para minorias, a estratégia deve reconhecer direitos e manter o traço cultural específico — 'igualdade na diferença' —, sem procurar eliminá-lo." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Diferencie minorias de grupos vulneráveis, apontando as quatro peculiaridades das minorias e explicando por que essa diferenciação é importante na implementação de políticas públicas. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Conceitos (Siqueira e Castro) → gênero × espécie → 4 peculiaridades → importância para a política pública.", criterios: ["Grupos vulneráveis: alta chance de ofensa, sem traço comum; gênero (lato sensu); buscam exercer direitos já reconhecidos", "Minorias: traço cultural comum que não se quer eliminar; espécie (stricto sensu); buscam o reconhecimento de direitos", "Peculiaridades: não dominação, vínculo de solidariedade, especial proteção estatal, opressão social", "Política pública: para minorias, reconhecer direitos e manter o traço (igualdade na diferença); para grupos vulneráveis, estratégia distinta"], resposta: "Grupos vulneráveis são indivíduos com alto grau de chance de serem ofendidos ou atacados, mas sem identidade ou traço comum entre si (ex.: crianças, idosos, pessoas com deficiência, mulheres); constituem o gênero, ou minoria lato sensu, e buscam o respeito e o exercício de direitos já reconhecidos. Minorias são sujeitos ligados por um traço cultural comum que os diferencia dos demais e que não visa a ser eliminado, mas reconhecido e respeitado (ex.: indígenas); são a espécie, ou minoria stricto sensu, e buscam primeiro o reconhecimento de direitos e depois o seu exercício. Suas peculiaridades são: posição de não dominação, vínculo subjetivo de solidariedade para proteção da identidade cultural, demanda de especial proteção estatal e opressão social. A diferenciação importa porque, no caso das minorias, a política pública deve contemplar o reconhecimento de direitos e a manutenção do traço cultural (igualdade na diferença), sem homogeneizar a sociedade; já para os grupos vulneráveis a estratégia é distinta, pois não envolve preservar um traço cultural." } },

  // ════════════════════ MÓDULO 2 — Estatuto da Criança e do Adolescente (Lei 8.069/90) ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "Para o ECA, considera-se criança a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.", gabarito: "certo", explicacao: "Correto. É a redação do art. 2º do ECA." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Nos casos expressos em lei, o ECA aplica-se excepcionalmente às pessoas entre dezoito e vinte e cinco anos de idade.", gabarito: "errado", explicacao: "Errado. A aplicação excepcional é às pessoas entre dezoito e VINTE E UM anos (art. 2º, parágrafo único)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos fundamentais da criança e do adolescente.", gabarito: "certo", explicacao: "Correto. É a redação do art. 4º do ECA." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para fins do art. 18-A do ECA, castigo físico é a ação de natureza disciplinar ou punitiva aplicada com uso da força física que resulte em sofrimento físico ou lesão.", gabarito: "certo", explicacao: "Correto. É o conceito do art. 18-A, parágrafo único, I." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O tratamento cruel ou degradante, nos termos do ECA, exige necessariamente a ocorrência de lesão corporal na criança ou no adolescente.", gabarito: "errado", explicacao: "Errado. Tratamento cruel ou degradante é a conduta que humilhe, ameace gravemente ou ridicularize — não exige lesão (art. 18-A, parágrafo único, II)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Ato infracional é a conduta descrita como crime ou contravenção penal (art. 103 do ECA).", gabarito: "certo", explicacao: "Correto. É a definição do art. 103." },
  { modulo: "2", tipo: "certo_errado", enunciado: "As medidas de proteção do art. 98 do ECA só se aplicam quando os direitos forem violados por falta, omissão ou abuso dos pais ou responsável.", gabarito: "errado", explicacao: "Errado. O art. 98 prevê três hipóteses: ação ou omissão da sociedade ou do Estado; falta, omissão ou abuso dos pais ou responsável; e em razão da própria conduta da criança ou adolescente." },
  { modulo: "2", tipo: "multipla", enunciado: "Verificada a prática de ato infracional, a autoridade competente poderá aplicar ao adolescente as seguintes medidas, EXCETO:", alternativas: A(
    "advertência",
    "obrigação de reparar o dano",
    "reclusão em estabelecimento prisional comum",
    "liberdade assistida",
    "internação em estabelecimento educacional"),
    gabarito: "C", explicacao: "As medidas são: advertência, reparar o dano, prestação de serviços à comunidade, liberdade assistida, semiliberdade, internação em estabelecimento educacional e as do art. 101, I a VI. Não existe reclusão em estabelecimento prisional comum." },
  { modulo: "2", tipo: "multipla", enunciado: "O direito de crianças e adolescentes serem educados e cuidados sem o uso de castigo físico ou de tratamento cruel ou degradante foi incluído no ECA (art. 18-A) pela:", alternativas: A(
    "Lei nº 13.010/2014",
    "Lei nº 11.340/2006",
    "Lei nº 10.741/2003",
    "Lei nº 13.146/2015",
    "Lei nº 7.716/1989"),
    gabarito: "A", explicacao: "O art. 18-A foi incluído pela Lei nº 13.010/2014. As demais são Maria da Penha, Estatuto do Idoso, Estatuto da PcD e Lei do racismo." },
  { modulo: "2", tipo: "multipla", enunciado: "Considera-se tratamento cruel ou degradante, nos termos do ECA, a conduta que:", alternativas: A(
    "resulte exclusivamente em lesão grave",
    "seja aplicada apenas pelos pais biológicos",
    "ocorra somente no ambiente escolar",
    "humilhe, ameace gravemente ou ridicularize a criança ou o adolescente",
    "tenha natureza patrimonial"),
    gabarito: "D", explicacao: "Tratamento cruel ou degradante é a conduta que humilhe, ameace gravemente ou ridicularize (art. 18-A, parágrafo único, II), praticada por qualquer pessoa encarregada de cuidar, tratar, educar ou proteger." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Com base no ECA, diferencie criança de adolescente, conceitue ato infracional e enumere as medidas aplicáveis ao adolescente autor de ato infracional. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Art. 2º → art. 103 → rol de medidas socioeducativas.", criterios: ["Criança: até 12 anos incompletos; adolescente: entre 12 e 18 anos (excepcionalmente até 21)", "Ato infracional: conduta descrita como crime ou contravenção penal", "Medidas: advertência, reparar o dano, serviços à comunidade, liberdade assistida, semiliberdade, internação e as do art. 101, I a VI"], resposta: "Segundo o art. 2º do ECA, criança é a pessoa até doze anos de idade incompletos e adolescente é aquela entre doze e dezoito anos, aplicando-se excepcionalmente o Estatuto às pessoas entre dezoito e vinte e um anos nos casos expressos em lei. Ato infracional é a conduta descrita como crime ou contravenção penal (art. 103). Verificada sua prática, a autoridade competente poderá aplicar ao adolescente: advertência; obrigação de reparar o dano; prestação de serviços à comunidade; liberdade assistida; inserção em regime de semiliberdade; internação em estabelecimento educacional; e qualquer das medidas previstas no art. 101, I a VI." } },

  // ════════════════════ MÓDULO 3 — Lei Maria da Penha (Lei 11.340/06) ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "Configura violência doméstica e familiar contra a mulher qualquer ação ou omissão baseada no gênero que lhe cause morte, lesão, sofrimento físico, sexual ou psicológico e dano moral ou patrimonial.", gabarito: "certo", explicacao: "Correto. É o caput do art. 5º da Lei 11.340/06." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Para configurar violência em relação íntima de afeto, a Lei Maria da Penha exige que o agressor coabite com a ofendida.", gabarito: "errado", explicacao: "Errado. O art. 5º, III, alcança qualquer relação íntima de afeto em que o agressor conviva ou tenha convivido com a ofendida, INDEPENDENTEMENTE de coabitação." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As relações pessoais enunciadas no art. 5º da Lei Maria da Penha independem de orientação sexual.", gabarito: "certo", explicacao: "Correto. É o parágrafo único do art. 5º." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A violência moral, segundo a Lei Maria da Penha, é qualquer conduta que configure calúnia, difamação ou injúria.", gabarito: "certo", explicacao: "Correto. É o art. 7º, V." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A retenção dos documentos pessoais e dos instrumentos de trabalho da mulher caracteriza violência psicológica.", gabarito: "errado", explicacao: "Errado. Reter, subtrair ou destruir objetos, instrumentos de trabalho, documentos e bens configura violência PATRIMONIAL (art. 7º, IV)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No ciclo da violência, a fase de explosão é aquela em que o agressor se torna amável para conseguir a reconciliação.", gabarito: "errado", explicacao: "Errado. Esse comportamento corresponde à terceira fase, do ARREPENDIMENTO ('lua de mel'). Na explosão, a tensão acumulada se materializa no ato violento." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As medidas protetivas previstas na Lei Maria da Penha formam rol não exaustivo, podendo o juiz conceder outras medidas de acordo com o caso concreto.", gabarito: "certo", explicacao: "Correto. As medidas são elencadas de maneira não exaustiva." },
  { modulo: "3", tipo: "multipla", enunciado: "A conduta que impede a mulher de usar qualquer método contraceptivo ou que a força ao matrimônio, à gravidez, ao aborto ou à prostituição caracteriza, segundo o art. 7º da Lei Maria da Penha, violência:", alternativas: A(
    "moral",
    "patrimonial",
    "sexual",
    "psicológica",
    "física"),
    gabarito: "C", explicacao: "É hipótese de violência SEXUAL (art. 7º, III), que também abrange limitar ou anular o exercício dos direitos sexuais e reprodutivos." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre o ciclo da violência doméstica, assinale a alternativa CORRETA:", alternativas: A(
    "É composto por quatro fases: tensão, explosão, separação e reconciliação.",
    "Na fase de tensão, o agressor mostra-se irritado por coisas insignificantes, humilha a vítima, faz ameaças e destrói objetos.",
    "Na fase de arrependimento, a falta de controle chega ao limite e leva ao ato violento.",
    "Na fase de explosão, a mulher se sente confusa e pressionada a manter o relacionamento.",
    "A fase de 'lua de mel' é a primeira do ciclo."),
    gabarito: "B", explicacao: "O ciclo tem três fases: tensão (irritação, humilhação, ameaças, destruição de objetos), explosão (ato violento) e arrependimento ou 'lua de mel' (agressor amável; mulher confusa e pressionada)." },
  { modulo: "3", tipo: "multipla", enunciado: "A Lei Maria da Penha organiza as medidas de proteção em três grupos. Assinale a correspondência CORRETA:", alternativas: A(
    "art. 22 — medidas protetivas de urgência que obrigam o agressor; art. 23 — medidas à ofendida; art. 24 — medidas de ordem patrimonial",
    "art. 22 — medidas à ofendida; art. 23 — medidas que obrigam o agressor; art. 24 — medidas patrimoniais",
    "art. 22 — medidas patrimoniais; art. 23 — medidas à ofendida; art. 24 — medidas que obrigam o agressor",
    "todas as medidas estão concentradas no art. 5º",
    "art. 7º — medidas que obrigam o agressor; art. 8º — medidas à ofendida"),
    gabarito: "A", explicacao: "Art. 22: medidas protetivas de urgência que obrigam o agressor; art. 23: medidas protetivas de urgência à ofendida; art. 24: medidas de proteção de ordem patrimonial." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Descreva as três fases do ciclo da violência doméstica e familiar contra a mulher e explique por que seu conhecimento é relevante no atendimento policial. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Fase 1 (tensão) → fase 2 (explosão) → fase 3 (arrependimento/lua de mel) → relevância para o atendimento.", criterios: ["Tensão: agressor tenso e irritado, acessos de raiva, humilhação, ameaças, destruição de objetos", "Explosão: falta de controle chega ao limite; tensão se materializa em violência verbal, física, psicológica, moral ou patrimonial", "Arrependimento: agressor amável para reconciliar; mulher confusa e pressionada, abre mão de direitos", "Relevância: entender por que a vítima nega ou desiste; acolher, não julgar e encaminhar corretamente"], resposta: "O ciclo da violência é composto de três fases. Na fase de tensão, o agressor mostra-se tenso e irritado por coisas insignificantes, com acessos de raiva, humilha a vítima, faz ameaças e destrói objetos. Na fase de explosão, a falta de controle chega ao limite e leva ao ato violento: a tensão acumulada se materializa em violência verbal, física, psicológica, moral ou patrimonial. Na fase do arrependimento, ou 'lua de mel', o agressor torna-se amável para conseguir a reconciliação, e a mulher sente-se confusa e pressionada a manter o relacionamento, abrindo mão de seus direitos enquanto ele diz que 'vai mudar'. Conhecer o ciclo permite ao policial compreender por que a vítima muitas vezes nega a agressão, desiste da denúncia ou pede apenas que o agressor seja aconselhado, orientando-o a acolhê-la sem julgamentos, a incentivar o registro e a dar o encaminhamento técnico e legal correto à ocorrência." } },

  // ════════════════════ MÓDULO 4 — Pessoa idosa, pessoa com deficiência e TEA ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "Entre as pessoas idosas, é assegurada prioridade especial aos maiores de 80 anos, atendendo-se suas necessidades sempre preferencialmente em relação às demais pessoas idosas.", gabarito: "certo", explicacao: "Correto. É o art. 3º, § 2º, do Estatuto da Pessoa Idosa." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Aos maiores de 60 anos fica assegurada a gratuidade dos transportes coletivos públicos urbanos e semiurbanos, inclusive nos serviços seletivos e especiais.", gabarito: "errado", explicacao: "Errado. A gratuidade do art. 39 é para os maiores de 65 anos e EXCLUI os serviços seletivos e especiais prestados paralelamente aos regulares." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Segundo novidade de 2021 destacada na apostila, não constitui crime a negativa de crédito motivada por superendividamento da pessoa idosa.", gabarito: "certo", explicacao: "Correto. A apostila destaca essa ressalva introduzida em 2021." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Considera-se pessoa com deficiência aquela que tem impedimento de longo prazo de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade.", gabarito: "certo", explicacao: "Correto. É o art. 2º da Lei 13.146/15." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Abandonar pessoa com deficiência em hospitais, casas de saúde ou entidades de abrigamento é crime punido com reclusão de 1 a 4 anos e multa.", gabarito: "errado", explicacao: "Errado. O abandono (art. 90) é punido com reclusão de 6 meses a 3 anos e multa. Reclusão de 1 a 4 anos é a pena do art. 89 (apropriar-se ou desviar bens e rendimentos)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O TEA acomete mais o sexo masculino, na proporção de quatro meninos para uma menina, e suas principais manifestações costumam ocorrer antes dos três anos de idade.", gabarito: "certo", explicacao: "Correto. O azul do símbolo representa a maior incidência masculina (4:1), e as manifestações ocorrem geralmente antes dos três anos." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Pela Lei Estadual nº 15.487/2015, os servidores públicos federais que tenham cônjuge, filho ou dependente com necessidades especiais têm direito a horário especial de trabalho sem necessidade de compensação.", gabarito: "errado", explicacao: "Errado. Nesse caso (§ 3º do art. 98 da Lei 8.112/90) há horário especial, mas COM compensação. A dispensa de compensação é para o servidor que é, ele próprio, pessoa com deficiência (§ 2º)." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre os crimes previstos no Estatuto da Pessoa com Deficiência, assinale a correspondência CORRETA:", alternativas: A(
    "praticar, induzir ou incitar discriminação — detenção de 6 meses a 1 ano",
    "apropriar-se de proventos da pessoa com deficiência — reclusão de 6 meses a 3 anos",
    "abandonar pessoa com deficiência em casa de saúde — reclusão de 1 a 4 anos",
    "reter cartão magnético para obter vantagem indevida — detenção de 6 meses a 2 anos e multa",
    "todos os crimes do Estatuto são punidos apenas com multa"),
    gabarito: "D", explicacao: "Art. 88 (discriminação): reclusão de 1 a 3 anos; art. 89 (apropriação): reclusão de 1 a 4 anos; art. 90 (abandono): reclusão de 6 meses a 3 anos; art. 91 (reter cartão ou documento): detenção de 6 meses a 2 anos e multa." },
  { modulo: "4", tipo: "multipla", enunciado: "No símbolo do Transtorno do Espectro Autista, as peças de quebra-cabeça e suas cores vibrantes representam, respectivamente:", alternativas: A(
    "a prevalência masculina e a cura do transtorno",
    "a complexidade e o mistério do transtorno, e a esperança",
    "a luta contra o câncer e a diversidade religiosa",
    "a idade do diagnóstico e o tipo de tratamento",
    "o Dia Mundial do Autismo e a fita de conscientização"),
    gabarito: "B", explicacao: "As peças representam a complexidade e o mistério do TEA; as cores vibrantes, a esperança; o colorido, a diversidade; o azul, a maior incidência masculina." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre o Estatuto da Pessoa Idosa (Lei 10.741/03), assinale a alternativa INCORRETA:", alternativas: A(
    "É considerada idosa a pessoa com mais de 60 anos.",
    "É assegurada prioridade na tramitação de processos em que figure pessoa com 60 anos ou mais.",
    "Discriminar pessoa idosa, dificultando seu acesso a operações bancárias por motivo de idade, é crime punido com reclusão de 6 meses a 1 ano e multa.",
    "Deixar de prestar assistência ao idoso em iminente perigo é crime cuja pena é triplicada se resulta morte.",
    "A gratuidade dos transportes coletivos é assegurada a partir dos 60 anos, inclusive nos serviços especiais."),
    gabarito: "E", explicacao: "A gratuidade (art. 39) é para os maiores de 65 anos e não alcança os serviços seletivos e especiais prestados paralelamente aos regulares." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Apresente o conceito de pessoa com deficiência segundo a Lei 13.146/15, cite dois direitos assegurados pelo Estatuto e dois crimes nele previstos, com as respectivas penas. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Conceito (art. 2º) → direitos → crimes e penas.", criterios: ["Conceito: impedimento de longo prazo físico, mental, intelectual ou sensorial que, com barreiras, obstrui a participação plena", "Direitos (dois): igualdade sem discriminação (art. 4º), proteção contra negligência e violência (art. 5º), não submissão a tratamento forçado (art. 11), saúde integral pelo SUS (art. 18), educação, moradia, trabalho", "Crimes (dois): art. 88 (1 a 3 anos), art. 89 (1 a 4 anos), art. 90 (6 meses a 3 anos), art. 91 (detenção de 6 meses a 2 anos)"], resposta: "Nos termos do art. 2º da Lei 13.146/15, pessoa com deficiência é aquela que tem impedimento de longo prazo de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas. O Estatuto assegura, entre outros direitos, a igualdade de oportunidades sem qualquer discriminação (art. 4º) e a impossibilidade de ser obrigada a se submeter a intervenção clínica ou cirúrgica, a tratamento ou a institucionalização forçada (art. 11). Entre os crimes previstos estão praticar, induzir ou incitar discriminação em razão da deficiência (art. 88), punido com reclusão de 1 a 3 anos e multa, e abandonar a pessoa com deficiência em hospitais, casas de saúde ou entidades de abrigamento (art. 90), punido com reclusão de 6 meses a 3 anos e multa." } },

  // ════════════════════ MÓDULO 5 — LGBTQIAPN+: conceitos e abordagem conforme o POP ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "Identidade de gênero refere-se aos papéis sociais que cada um assume na sociedade, expressando a recusa do determinismo biológico na construção da identidade.", gabarito: "certo", explicacao: "Correto. É a definição de identidade de gênero da apostila (item 3.6, B)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Cisgênero é a pessoa que se identifica com um gênero diferente daquele atribuído no nascimento.", gabarito: "errado", explicacao: "Errado. Esse é o conceito de TRANSGÊNERO. Cisgênero é quem se identifica com o sexo biológico designado no nascimento." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O termo orientação sexual substitui a noção de opção sexual, pois o objeto do desejo não é uma escolha consciente, mas fruto do processo complexo de constituição do indivíduo.", gabarito: "certo", explicacao: "Correto. É a explicação da apostila para a substituição do termo." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na busca pessoal a lésbicas, gays e bissexuais, o POP recomenda que o procedimento seja feito sempre por policial do sexo oposto ao da pessoa abordada.", gabarito: "errado", explicacao: "Errado. A busca é CONVENCIONAL, pois não há divergência entre sexo biológico e identidade de gênero: homens são revistados por PM masculinos e mulheres por PM femininas." },
  { modulo: "5", tipo: "certo_errado", enunciado: "É recomendado que o efetivo feminino realize a busca pessoal na mulher transexual e na travesti, devido à sua aparência feminina.", gabarito: "certo", explicacao: "Correto. É a regra do POP 0005 (item 4.1, B)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na identificação documental de pessoa trans, deve-se evitar repetir em voz alta o nome de registro, e os documentos oficiais, como o boletim de ocorrência, devem conter o nome social, constando também o nome de registro.", gabarito: "certo", explicacao: "Correto. O nome social deve ser usado no atendimento e nos documentos, com o nome de registro também anotado." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na busca pessoal em pessoa intersexual, o policial deve proceder sempre conforme o sexo indicado no documento de identidade.", gabarito: "errado", explicacao: "Errado. A busca na pessoa intersexual é feita conforme a identidade por ela ASSUMIDA, masculina ou feminina." },
  { modulo: "5", tipo: "multipla", enunciado: "Constituem exceções à regra de que o efetivo feminino realize a busca pessoal na mulher trans e na travesti, EXCETO:", alternativas: A(
    "ausência de policial militar do sexo feminino",
    "disparidade quanto ao porte físico",
    "a policial militar alegar constrangimento para proceder à busca",
    "a pessoa abordada solicitar ser revistada por policial masculino por preferência pessoal",
    "necessidade de preservar a segurança da guarnição na abordagem"),
    gabarito: "D", explicacao: "As exceções previstas são: ausência de PM feminina (solicitar pessoa do sexo feminino para acompanhar ou mandar a abordada pressionar a própria roupa), disparidade de porte físico e constrangimento alegado pela policial — todas ligadas à segurança. A mera preferência da abordada não está entre elas." },
  { modulo: "5", tipo: "multipla", enunciado: "Quanto à busca pessoal no homem trans, segundo o POP, assinale a alternativa CORRETA:", alternativas: A(
    "É vedado ao efetivo feminino realizar a busca.",
    "Recomenda-se o efetivo feminino; não sendo possível identificar que se trata de homem trans, primeiro o efetivo masculino realiza a busca, salvo se ele se identificar e pedir policial feminina.",
    "Deve ser sempre conduzido à delegacia para a revista.",
    "A busca deve ser feita por dois policiais, um de cada sexo, simultaneamente.",
    "O homem trans deve ser tratado por termos femininos durante a abordagem."),
    gabarito: "B", explicacao: "Recomenda-se o efetivo feminino (há legislação que regula a busca em mulheres, biologicamente). Por ser difícil identificar o homem trans, primeiro o efetivo masculino faz a busca, a não ser que ele se identifique e solicite PM feminina. Deve-se usar termos masculinos." },
  { modulo: "5", tipo: "multipla", enunciado: "A pessoa que nasce com anatomia reprodutiva ou sexual que não se encaixa na definição típica de sexo feminino ou masculino é denominada:", alternativas: A(
    "transexual",
    "travesti",
    "queer",
    "pansexual",
    "intersexual"),
    gabarito: "E", explicacao: "Intersexual é a pessoa cuja anatomia reprodutiva ou sexual não se encaixa na definição típica de sexo feminino ou masculino (conhecida outrora como hermafrodita)." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Diferencie sexo biológico, identidade de gênero e orientação sexual e descreva como o POP da PMPE orienta a busca pessoal em mulheres trans e travestis, incluindo as exceções. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Três conceitos → regra para mulher trans/travesti → exceções → nome social.", criterios: ["Sexo biológico: órgãos genitais, sistema reprodutor e hormônios", "Identidade de gênero: papéis sociais assumidos (cisgênero × transgênero)", "Orientação sexual: direção do desejo afetivo e sexual, não é opção", "Regra: efetivo feminino; exceções: ausência de PM feminina, disparidade de porte físico, constrangimento da policial", "Nome social nos documentos e no tratamento"], resposta: "Sexo biológico é a condição de macho ou fêmea definida pelos órgãos genitais, pelo sistema reprodutor e pelos hormônios. Identidade de gênero são os papéis sociais que a pessoa assume, podendo ser cisgênero (identifica-se com o sexo designado ao nascer) ou transgênero (identifica-se com gênero diferente). Orientação sexual é a direção do desejo afetivo e sexual, que não é uma escolha consciente — por isso o termo substitui 'opção sexual'. Pelo POP da PMPE, recomenda-se que o efetivo feminino realize a busca pessoal na mulher trans e na travesti, devido à sua aparência feminina. São exceções, em razão da segurança: a ausência de PM feminina (quando se solicita uma pessoa do sexo feminino para acompanhar visualmente a revista ou se manda a abordada pressionar a própria roupa), a disparidade de porte físico (o PM masculino procede à busca) e o constrangimento alegado pela policial. Na identificação, deve-se usar o nome social, evitando repetir em voz alta o nome de registro, que também constará nos documentos oficiais." } },

  // ════════════════════ MÓDULO 6 — Indígenas, comunidades tradicionais, refugiados e pessoas em situação de rua ════════════════════
  { modulo: "6", tipo: "certo_errado", enunciado: "Os povos e comunidades tradicionais do Brasil não se resumem aos indígenas: são 28 tipos reconhecidos oficialmente, entre eles quilombolas, ribeirinhos, povos ciganos e pantaneiros.", gabarito: "certo", explicacao: "Correto. São 28 tipos, reconhecidos em 2007 (PNPCT) e em 2019 (CNPCT)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Constituição Federal reconhece aos índios os direitos originários sobre as terras que tradicionalmente ocupam, competindo aos Estados demarcá-las.", gabarito: "errado", explicacao: "Errado. Pelo art. 231 da CF/88, compete à UNIÃO demarcar as terras, protegê-las e fazer respeitar todos os bens dos índios." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os índios, suas comunidades e organizações são partes legítimas para ingressar em juízo em defesa de seus direitos, intervindo o Ministério Público em todos os atos do processo.", gabarito: "certo", explicacao: "Correto. É a redação do art. 232 da CF/88." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O refugiado conta com a proteção internacional e o princípio da não devolução, pois voltar ao país de origem significa risco à sua vida.", gabarito: "certo", explicacao: "Correto. O refugiado foi forçado a se deslocar; o imigrante escolheu se deslocar." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O imigrante sem a documentação adequada é considerado imigrante ilegal e responde criminalmente por sua permanência irregular no país.", gabarito: "errado", explicacao: "Errado. Não existe imigrante ilegal: ele pode estar em situação irregular, mas essa infração é ADMINISTRATIVA e pode ser resolvida." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A mendicância deixou de ser tipificada como contravenção penal a partir da Lei nº 11.983/2009.", gabarito: "certo", explicacao: "Correto. Morar na rua não é crime, e a mendicância deixou de ser contravenção em 2009." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Para a ONU, desabrigado é a pessoa ou família sem abrigo que carrega suas posses consigo, pernoitando nas ruas a partir de uma trajetória mais ou menos aleatória.", gabarito: "errado", explicacao: "Errado. Essa é a definição de SEM-TETO. Desabrigado é quem vive nas ruas por lhe faltar residência devido a tragédias naturais, guerras, desemprego em massa ou falta de renda." },
  { modulo: "6", tipo: "multipla", enunciado: "Nos termos do Decreto nº 7.053/2009, a população em situação de rua é o grupo populacional heterogêneo que tem em comum:", alternativas: A(
    "a pobreza extrema, os vínculos familiares interrompidos ou fragilizados e a inexistência de moradia convencional regular",
    "a condição de estrangeiro e a ausência de documentos",
    "a prática habitual de contravenções penais",
    "a dependência química e o sofrimento mental, necessariamente",
    "a recusa a qualquer forma de acolhimento institucional"),
    gabarito: "A", explicacao: "O art. 1º, parágrafo único, do Decreto 7.053/2009 fala em pobreza extrema, vínculos familiares interrompidos ou fragilizados e inexistência de moradia convencional regular, com uso dos logradouros como moradia e sustento." },
  { modulo: "6", tipo: "multipla", enunciado: "Sobre imigrantes e refugiados, assinale a alternativa INCORRETA:", alternativas: A(
    "O imigrante escolheu se deslocar e pode voltar ao país de origem sem correr riscos.",
    "Para viver regularmente no Brasil, o imigrante precisa de autorização de residência.",
    "O refugiado pode ser chamado de foragido, pois deixou seu país em fuga.",
    "No Brasil, imigrantes, refugiados ou não, têm os mesmos direitos à educação, à saúde e ao trabalho.",
    "O refugiado conta com o princípio da não devolução."),
    gabarito: "C", explicacao: "Refugiado não é foragido nem fugitivo: foragidos fogem da justiça, geralmente por terem cometido crime; o refugiado, não." },
  { modulo: "6", tipo: "multipla", enunciado: "A atitude de não aceitar a prática religiosa do outro, usando violência física, psicológica, escrita ou verbal com a finalidade de combatê-la, denomina-se:", alternativas: A(
    "racismo institucional",
    "preconceito estrutural",
    "discriminação indireta",
    "intolerância religiosa",
    "xenofobia"),
    gabarito: "D", explicacao: "É a definição de intolerância religiosa (Silva e Ribeiro, 2007), baseada no desejo de unificação do pensamento em torno de um monoteísmo hegemônico." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Diferencie imigrante de refugiado e explique por que não se deve empregar os termos 'foragido' e 'imigrante ilegal' no atendimento a essas pessoas. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Imigrante → refugiado → termos indevidos.", criterios: ["Imigrante: escolheu se deslocar, pode voltar sem risco; precisa de autorização de residência", "Refugiado: forçado a se deslocar; proteção internacional e princípio da não devolução", "Foragido/fugitivo foge da justiça; o refugiado não", "Não existe imigrante ilegal: situação irregular é infração administrativa, resolvível"], resposta: "O imigrante é quem escolheu se deslocar e pode voltar a qualquer momento ao país de origem, pois não corre riscos por lá; para manter sua condição migratória regular no Brasil, precisa de autorização de residência. O refugiado, por sua vez, foi forçado a se deslocar e conta com a proteção internacional e o princípio da não devolução, já que retornar significaria risco à sua vida. Em ambos os casos, todos têm os mesmos direitos à educação, à saúde e ao trabalho. O refugiado não deve ser chamado de foragido ou fugitivo, termos que designam quem foge da justiça por ter cometido crime. Também não existe 'imigrante ilegal': a pessoa pode estar em situação irregular, mas trata-se de infração administrativa, que pode ser regularizada, e não a torna criminosa." } },

  // ════════════════════ MÓDULO 7 — POP: crianças e adolescentes, pessoa com deficiência mental e violência contra a mulher ════════════════════
  { modulo: "7", tipo: "certo_errado", enunciado: "Sendo documentalmente identificada como criança a autora de ato infracional, o policial militar deverá conduzi-la ao Conselho Tutelar da área em que foi cometido o ato.", gabarito: "certo", explicacao: "Correto. Sem identificação documental, conduz-se a criança à residência para que um responsável acompanhe e comprove a condição." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O adolescente pode ser algemado sempre que o policial julgar conveniente, dispensada justificativa escrita.", gabarito: "errado", explicacao: "Errado. O adolescente não deve ser algemado, exceto em extrema necessidade, e o PM deve OBRIGATORIAMENTE fundamentar por escrito os motivos (Súmula Vinculante nº 11)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Na condução, o adolescente deve ir no banco traseiro da viatura e separado dos presos adultos, ainda que tenham cometido o ilícito conjuntamente.", gabarito: "certo", explicacao: "Correto. É a orientação do ECA reproduzida no POP 0021." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Nas ocorrências em que o adolescente for infrator, a competência é do plantão da DPCCAI (antiga DEPAI), independentemente da idade da vítima e ainda que haja adultos em coautoria.", gabarito: "certo", explicacao: "Correto. Em CVLI praticado por adolescente, a competência é concorrente com o DHPP." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Confirmada a violência contra criança ou adolescente vítima, os envolvidos devem ser encaminhados ao Conselho Tutelar, e os encaminhamentos assistenciais, à DECCA.", gabarito: "errado", explicacao: "Errado. É o inverso: os envolvidos vão para a DECCA, e os encaminhamentos assistenciais, ao Conselho Tutelar do local de moradia da vítima." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Em toda ocorrência com pessoa com deficiência mental, o efetivo deve, primeiramente, encaminhá-la ao hospital de referência ou à unidade de saúde mais próxima para avaliação médica.", gabarito: "certo", explicacao: "Correto. É a orientação final da sequência de ações do POP 0009." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Na ocorrência de violência doméstica, havendo apenas uma viatura, a mulher vítima deve ser conduzida no xadrez e o agressor no banco traseiro.", gabarito: "errado", explicacao: "Errado. Vítima e agressor vão em locais distintos: com uma só viatura, o AGRESSOR vai no xadrez e a mulher no banco de trás." },
  { modulo: "7", tipo: "multipla", enunciado: "Ao atender ocorrência de violência doméstica contra a mulher, à luz da Lei Maria da Penha, o efetivo policial militar, segundo o POP, deve:", alternativas: A(
    "encerrar a ocorrência no local se a vítima desistir de denunciar após confirmar as agressões",
    "ouvir primeiro o agressor, para evitar alegações falsas",
    "fotografar a vítima ferida e divulgar a imagem para identificar o autor",
    "conduzir a vítima ferida primeiro à delegacia e depois ao atendimento médico",
    "prosseguir com o encaminhamento até a delegacia, ainda que a vítima desista após confirmar as agressões, para que a autoridade decida o desfecho"),
    gabarito: "E", explicacao: "O POP manda ouvir primeiro a mulher, levar a vítima ferida primeiro ao atendimento médico e, se ela desistir após confirmar as agressões, prosseguir até a delegacia para que a autoridade decida." },
  { modulo: "7", tipo: "multipla", enunciado: "Segundo o POP de ocorrências com violência contra a mulher, deve ser EVITADO no atendimento:", alternativas: A(
    "separar as partes envolvidas para evitar novas agressões",
    "classificar a situação como ocorrência de menor importância",
    "entrevistar a vítima, preferencialmente por policial militar feminina",
    "realizar consulta do agressor no Polícia Ágil",
    "realizar diligências para localizar o agressor ausente"),
    gabarito: "B", explicacao: "Deve-se evitar desencorajar a vítima, ameaçar com prisão das partes, fazer comentários depreciativos, classificar a situação como de menor importância e exprimir julgamentos pessoais. As demais condutas são orientações do POP." },
  { modulo: "7", tipo: "multipla", enunciado: "Diante de pessoa com deficiência mental agressiva e irredutível, sem cooperar com o policiamento, o POP orienta que:", alternativas: A(
    "o efetivo se retire do local e aguarde o fim da crise",
    "seja empregada imediatamente arma de fogo",
    "um único policial realize a contenção para não assustar a pessoa",
    "dentro da proporcionalidade, sejam empregados os meios de contenção, sempre em maior número de policiais, podendo-se solicitar apoio do SAMU ou dos bombeiros",
    "a pessoa seja conduzida diretamente à delegacia, sem avaliação médica"),
    gabarito: "D", explicacao: "O POP 0009 prevê contenção proporcional com maior número de policiais, apoio do SAMU, bombeiros ou serviço de emergência via CIODS/COPOM e encaminhamento para avaliação médica." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Descreva os procedimentos previstos no POP da PMPE para a condução de adolescente acusado de ato infracional e o encaminhamento da ocorrência. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Algemas → condução → identificação e COPOM → sigilo → competência.", criterios: ["Não algemar, salvo extrema necessidade, com fundamentação escrita", "Banco traseiro, separado de adultos; feridos: atendimento médico primeiro (ficha de esclarecimento)", "Sem documento: conduzir à residência para identificação; dar ciência ao COPOM dos deslocamentos", "Sigilo de imagem e identidade (art. 17 do ECA)", "Competência do plantão da DPCCAI; CVLI: concorrente com o DHPP"], resposta: "O adolescente acusado de ato infracional não deve ser algemado, exceto em circunstâncias de extrema necessidade, devendo o policial fundamentar por escrito todas as motivações. Na condução, deve ir no banco traseiro da viatura e separado dos presos adultos, ainda que tenham agido em conjunto; havendo feridos, primeiro deve haver atendimento médico, com a ficha de esclarecimento médico. Sem documentação, deve ser conduzido à sua residência para comprovar sua condição, e todo deslocamento deve ser comunicado ao COPOM. O sigilo da imagem e da identidade deve ser respeitado, sendo vedado divulgar fotos em redes sociais (art. 17 do ECA). A ocorrência é encaminhada ao plantão da DPCCAI (antiga DEPAI), independentemente da idade da vítima e mesmo com adultos em coautoria; em caso de CVLI, a competência é concorrente com o DHPP." } },

  // ════════════════════ MÓDULO 8 — POP: pessoa com deficiência, território indígena, maracatus e pessoa em situação de rua ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "Na abordagem a pessoa com deficiência, deve-se identificar a deficiência para selecionar a técnica adequada — física, visual e/ou auditiva —, adotando o uso diferenciado da força.", gabarito: "certo", explicacao: "Correto. É a orientação geral do POP 0029." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na abordagem a pessoa em cadeira de rodas, o comandante determina que ela trave a cadeira lentamente e retorne as mãos sobre a cabeça antes da busca pessoal.", gabarito: "certo", explicacao: "Correto. Depois, verifica-se se ela consegue se erguer para a revista do assento." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na abordagem a pessoa surda, o comandante realiza os comandos em LIBRAS, como 'Pare', 'Polícia', 'Você é surdo?' e 'Mãos sobre a cabeça'.", gabarito: "certo", explicacao: "Correto. O POP prevê a sequência de comandos em LIBRAS." },
  { modulo: "8", tipo: "certo_errado", enunciado: "No policiamento em território indígena, a guarnição pode apreender foices, facões, arcos e flechas sempre que os encontrar, por se tratar de armas brancas.", gabarito: "errado", explicacao: "Errado. NÃO se apreendem utensílios usados para lavoura, caça e pesca, EXCETO quando utilizados na prática de crime." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Ao chegar ao território indígena, logo que possível, deve-se dar ciência da presença do efetivo ao cacique ou pajé ou, na ausência destes, a outra liderança local.", gabarito: "certo", explicacao: "Correto. É a sequência de ações do POP 0023." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Os ensaios e sambadas de maracatu rural costumam iniciar às 22h e devem ser encerrados coercitivamente à meia-noite pelo efetivo policial.", gabarito: "errado", explicacao: "Errado. O efetivo deve manter a ordem SEM restringir coercitivamente o horário: por recomendação do MPPE, os eventos podem seguir a noite e a madrugada, encerrando-se após o amanhecer." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na abordagem a pessoa em situação de rua, deve-se informá-la sobre as instituições de acolhida, esclarecendo que ela não é obrigada a aceitar o convite.", gabarito: "certo", explicacao: "Correto. Se possível, deve-se ajudá-la a encontrar uma instituição que a acolha." },
  { modulo: "8", tipo: "multipla", enunciado: "Havendo recusa das lideranças indígenas à presença policial, o comandante da OME deverá:", alternativas: A(
    "lançar o policiamento imediatamente, sem comunicar a ninguém",
    "suspender definitivamente o policiamento na área",
    "avaliar a real necessidade do empenho e, se necessário, oficiar aos escalões superiores, ao Judiciário, ao Ministério Público e à FUNAI sobre a recusa e suas consequências",
    "solicitar exclusivamente o apoio das Forças Armadas",
    "transferir a responsabilidade à Polícia Federal"),
    gabarito: "C", explicacao: "O comandante avalia a real necessidade; se for preciso, oficia aos escalões superiores, ao Judiciário, ao MP e à FUNAI sobre a recusa, a hostilidade e as consequências da ausência de policiamento." },
  { modulo: "8", tipo: "multipla", enunciado: "No policiamento de ensaios e sambadas de maracatu rural ou de baque solto, compete ao COMANDANTE DA OME:", alternativas: A(
    "elaborar a Nota de Instrução para todos os policiais da OME",
    "realizar a vistoria prévia no local do evento",
    "recepcionar a documentação dos organizadores, reunir-se pessoalmente com eles e determinar a elaboração da Ordem de Serviço",
    "restringir o horário do evento a 12 horas de duração",
    "receber a solicitação com antecedência mínima de 15 dias úteis, conforme a Lei de Grandes Eventos"),
    gabarito: "C", explicacao: "Ao Cmt da OME cabe recepcionar a documentação (antecedência mínima de 3 dias úteis), reunir-se com os organizadores e determinar a Ordem de Serviço. A vistoria é do P/3 e a Nota de Instrução, do chefe da Seção de Instrução. A Lei de Grandes Eventos não se aplica." },
  { modulo: "8", tipo: "multipla", enunciado: "A Lei Estadual nº 14.133/2010 (Lei de Grandes Eventos) é inaplicável aos ensaios e sambadas de maracatu rural porque:", alternativas: A(
    "tais eventos costumam reunir cerca de 200 a 400 pessoas, abaixo do limite de 1.000 espectadores da lei",
    "a lei foi revogada pela Lei do Silêncio",
    "os maracatus acontecem apenas em áreas urbanas",
    "a lei só se aplica a eventos religiosos",
    "os eventos ocorrem mais de três vezes por ano"),
    gabarito: "A", explicacao: "A Lei 14.133/2010 regula shows e eventos acima de 1.000 espectadores; as sambadas reúnem cerca de 200 a 400 pessoas, acontecem de duas a três vezes por ano e se enquadram nas exceções culturais da Lei do Silêncio." },
  { modulo: "8", tipo: "dissertativa", enunciado: "Explique a sequência de ações prevista no POP para o policiamento ostensivo e preventivo em território indígena, incluindo o tratamento dado a utensílios e locais sagrados. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Levantamento prévio → recusa → Cartão Programa/OS → chegada → utensílios → locais sagrados → revista.", criterios: ["Levantamento prévio da área pela Seção de Operações (residências, moradores, mapa, aceitação)", "Recusa: avaliar necessidade; oficiar escalões superiores, Judiciário, MP e FUNAI", "Cartão Programa ou Ordem de Serviço, fiscalizado pelo Oficial de Operações", "Dar ciência ao cacique, pajé ou outra liderança", "Não apreender utensílios de lavoura, caça e pesca, salvo uso em crime; não acessar locais sagrados; evitar busca em objetos sagrados"], resposta: "O comandante determina à Seção de Operações um levantamento prévio da área indígena, com quantidade de residências, número de moradores, mapa e aceitação do policiamento pela comunidade. Havendo recusa das lideranças, ele avalia a real necessidade do empenho; se necessário, oficia aos escalões superiores, ao Judiciário, ao Ministério Público e à FUNAI sobre a recusa e as consequências da ausência de policiamento. Em seguida, determina a confecção do Cartão Programa ou da Ordem de Serviço, cuja execução é fiscalizada pelo Oficial de Operações. Ao chegar ao local, deve-se dar ciência da presença do efetivo ao cacique ou pajé, ou a outra liderança. Não se apreendem foices, facões, machados, facas, arcos e flechas usados para lavoura, caça e pesca, salvo quando utilizados em crime; o comandante da guarnição não permite o acesso a locais sagrados e, na abordagem, evita-se a busca em objetos sagrados, solicitando ao abordado que exponha cada objeto que carrega." } },

  // ════════════════════ MÓDULO 9 — Rede de enfrentamento, atendimento humanizado e temas correlatos ════════════════════
  { modulo: "9", tipo: "certo_errado", enunciado: "As cinco técnicas de comunicação eficaz e empática apresentadas na apostila são: escuta ativa, empatia, não se prender a um script, personalizar a abordagem e ter proatividade.", gabarito: "certo", explicacao: "Correto. São as cinco técnicas do item 6.1." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Uma regra prática da escuta ativa é passar mais tempo falando do que escutando, para conduzir o atendimento com firmeza.", gabarito: "errado", explicacao: "Errado. A regra prática é passar MAIS TEMPO ESCUTANDO do que falando, para entender o problema e encontrar a solução adequada." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Enquanto o preconceito é uma atitude ou crença, a discriminação é a manifestação prática desse preconceito, resultando em comportamentos que prejudicam indivíduos ou grupos.", gabarito: "certo", explicacao: "Correto. É a distinção do item 7.1." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Pela Lei 7.716/89, uma instituição pública pode ser denunciada criminalmente por racismo institucional.", gabarito: "errado", explicacao: "Errado. O agente do crime de racismo só pode ser pessoa, não instituição; no racismo institucional cabe indenização cível." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A Patrulha Maria da Penha fiscaliza o cumprimento das Medidas Protetivas de Urgência por meio de visitas e acompanhamento às mulheres que as solicitaram.", gabarito: "certo", explicacao: "Correto. Também atua com ações preventivas, como 'Maria da Penha vai à escola' e 'Papo de Homem'." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A DASDH, criada em 2013, é diretamente subordinada ao Comando-Geral da PMPE.", gabarito: "errado", explicacao: "Errado. A DASDH (Lei Estadual nº 15.186/2013) é diretamente subordinada à DPO — Diretoria de Planejamento Operacional." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Para aproximar a polícia da mídia, recomenda-se desenvolver campanhas educativas de prevenção usando sempre a mesma marca 'Polícia', e não o nome do batalhão ou distrito.", gabarito: "certo", explicacao: "Correto. É uma das práticas do item 7.3." },
  { modulo: "9", tipo: "multipla", enunciado: "São programas vinculados à DASDH da PMPE, EXCETO:", alternativas: A(
    "Patrulha Maria da Penha",
    "PROERD",
    "Operação Lei Seca",
    "ASCRIAD",
    "Patrulha Escolar"),
    gabarito: "C", explicacao: "A DASDH reúne Polícia Comunitária, Patrulha Maria da Penha, Patrulha Escolar, PROERD, ASCRIAD, Programa de Enfrentamento à Intolerância e a Companhia Independente de Música. A Lei Seca não é programa da DASDH." },
  { modulo: "9", tipo: "multipla", enunciado: "A prática de uma organização em NÃO PROVER um serviço a determinada pessoa devido à sua cor, cultura ou origem étnica denomina-se:", alternativas: A(
    "preconceito",
    "racismo institucional",
    "injúria",
    "intolerância religiosa",
    "xenofobia"),
    gabarito: "B", explicacao: "É o racismo institucional, que também se manifesta por normas, práticas e comportamentos discriminatórios no cotidiano do trabalho." },
  { modulo: "9", tipo: "multipla", enunciado: "Entre os serviços oferecidos pela Secretaria da Mulher de Pernambuco na rede de enfrentamento à violência, NÃO se inclui:", alternativas: A(
    "programa de proteção e abrigamento, com rede de casas-abrigo em local sigiloso",
    "monitoramento eletrônico com Unidades Portáteis de Rastreamento",
    "190 Mulher, com atendimento prioritário pela PM",
    "concessão direta de medidas protetivas de urgência, sem decisão judicial",
    "Ouvidoria da Mulher, com central de teleatendimento 24 horas"),
    gabarito: "D", explicacao: "Medidas protetivas e monitoramento eletrônico dependem de decisão judicial; a Secretaria oferece abrigamento, monitoramento, 190 Mulher e Ouvidoria, e a PM fiscaliza as MPU pela Patrulha Maria da Penha." },
  { modulo: "9", tipo: "dissertativa", enunciado: "Explique as cinco técnicas de comunicação eficaz e empática apresentadas na apostila e sua importância para o atendimento humanizado aos grupos vulneráveis. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Importância → cinco técnicas explicadas.", criterios: ["Escuta ativa: ouvir com atenção, mais tempo escutando do que falando", "Empatia: colocar-se no lugar do outro", "Não se prender a script: roteiro de apoio, sem rigidez", "Personalizar: informações específicas, perguntas a partir do relato", "Proatividade: antecipar demandas e oferecer soluções além do problema"], resposta: "O atendimento humanizado, com respeito às diferenças, estreita a relação entre a Polícia Militar e a sociedade e qualifica o serviço prestado aos grupos vulneráveis. A primeira técnica é a escuta ativa: ouvir com atenção o cidadão, passando mais tempo escutando do que falando, para entender o problema e encontrar a solução adequada. A segunda é a empatia, peça-chave da humanização, que é a capacidade de se colocar no lugar do outro e compreender o problema sob sua perspectiva. A terceira é não se prender a um script: pode-se usar um roteiro de apoio, mas sem segui-lo à risca. A quarta é personalizar a abordagem, levantando informações específicas e fazendo perguntas com base no relato da vítima. A quinta é a proatividade: antecipar as demandas da sociedade e oferecer soluções que vão além do problema apresentado." } },

  // ════════════════════ SIMULADO — formato da prova (10,0 pontos) ════════════════════
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Os grupos vulneráveis caracterizam-se pelo vínculo subjetivo de solidariedade entre seus membros para a proteção de sua identidade cultural. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O vínculo de solidariedade para proteger a identidade cultural é peculiaridade das minorias, não dos grupos vulneráveis." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O número de integrantes, por si só, não caracteriza uma minoria, que precisa ser não dominante no Estado em que vive para ser protegida institucionalmente. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Item 2.1 da apostila." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Nos casos expressos em lei, o ECA aplica-se excepcionalmente às pessoas entre dezoito e vinte e um anos de idade. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Art. 2º, parágrafo único, do ECA." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Liberdade assistida e inserção em regime de semiliberdade estão entre as medidas aplicáveis ao adolescente autor de ato infracional. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Integram o rol de medidas socioeducativas." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A violência psicológica, segundo a Lei Maria da Penha, é qualquer conduta que configure calúnia, difamação ou injúria. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Calúnia, difamação ou injúria configuram violência MORAL (art. 7º, V)." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A violência doméstica em relação íntima de afeto independe de coabitação entre agressor e ofendida. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Art. 5º, III, da Lei 11.340/06." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Aos maiores de 65 anos é assegurada a gratuidade dos transportes coletivos públicos urbanos e semiurbanos, exceto nos serviços seletivos e especiais prestados paralelamente aos regulares. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Art. 39 do Estatuto da Pessoa Idosa." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A pessoa com deficiência pode ser obrigada a se submeter a tratamento ou institucionalização forçada quando o médico assistente recomendar. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O art. 11 da Lei 13.146/15 veda obrigar a pessoa com deficiência a intervenção clínica ou cirúrgica, tratamento ou institucionalização forçada." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Transgênero é a pessoa que se identifica com um gênero diferente daquele atribuído no nascimento. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Item 3.6, B, II." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pelo POP, havendo disparidade de porte físico, o policial militar masculino deverá proceder à busca pessoal na mulher trans ou na travesti. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. É uma das exceções, ligada à segurança da abordagem." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Compete aos Estados demarcar as terras tradicionalmente ocupadas pelos índios. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Compete à UNIÃO (art. 231 da CF/88)." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A permanência de imigrante sem a documentação adequada no Brasil constitui infração administrativa, e não crime. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Não existe imigrante ilegal; a situação irregular é resolvível." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Confirmada a violência contra criança vítima, os envolvidos são encaminhados à DECCA e os encaminhamentos assistenciais ao Conselho Tutelar do local de moradia da vítima. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. POP 0021, item C." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "No território indígena, o comandante da guarnição pode autorizar o acesso do efetivo a locais considerados sagrados sempre que julgar conveniente para o patrulhamento. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O comandante da guarnição NÃO permitirá o acesso de seus componentes a locais considerados sagrados." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pela Lei 7.716/89, o agente do crime de racismo só pode ser uma pessoa, razão pela qual o racismo institucional enseja indenização cível. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Item 7.1 da apostila." },
  { modulo: "SIM", tipo: "multipla", contexto: "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto.", enunciado: "Sobre minorias e grupos vulneráveis, assinale a alternativa INCORRETA: (Valor: 0,50)", alternativas: A(
    "Os grupos vulneráveis são gênero; as minorias, espécie.",
    "As minorias buscam primeiro o reconhecimento de direitos e, depois, o seu exercício.",
    "Os grupos vulneráveis buscam exercer direitos já reconhecidos e aceitos.",
    "Os indígenas são exemplo de minoria, pois lutam pelo reconhecimento de sua cultura.",
    "Na política pública para minorias, deve-se eliminar o traço cultural que as diferencia, para homogeneizar a sociedade."),
    gabarito: "E", explicacao: "Para as minorias, a política deve manter o traço cultural específico (igualdade na diferença), sem homogeneizar a sociedade." },
  { modulo: "SIM", tipo: "multipla", contexto: "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto.", enunciado: "A conduta que configure retenção, subtração ou destruição de documentos pessoais, instrumentos de trabalho, bens e valores da mulher caracteriza violência: (Valor: 0,50)", alternativas: A(
    "moral",
    "patrimonial",
    "psicológica",
    "sexual",
    "física"),
    gabarito: "B", explicacao: "É violência patrimonial (art. 7º, IV, da Lei 11.340/06)." },
  { modulo: "SIM", tipo: "multipla", contexto: "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto.", enunciado: "Quanto à condução de adolescente autor de ato infracional, assinale a alternativa CORRETA: (Valor: 0,50)", alternativas: A(
    "Deve ser conduzido no xadrez da viatura, junto com os adultos coautores.",
    "O uso de algemas é a regra, dispensada justificativa.",
    "Pode ter a imagem divulgada nas redes sociais da corporação para fins de prevenção.",
    "Deve ir no banco traseiro, separado dos presos adultos, e o uso de algemas exige extrema necessidade e fundamentação escrita.",
    "Deve ser encaminhado sempre ao Conselho Tutelar, independentemente da idade."),
    gabarito: "D", explicacao: "Banco traseiro, separado dos adultos; algemas só em extrema necessidade, com justificativa escrita; sigilo de imagem (art. 17 do ECA); o Conselho Tutelar é o destino da CRIANÇA." },
  { modulo: "SIM", tipo: "multipla", contexto: "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto.", enunciado: "Sobre o policiamento em eventos de ensaios e sambadas de maracatu rural ou de baque solto, assinale a alternativa CORRETA: (Valor: 0,50)", alternativas: A(
    "Os organizadores devem comunicar a OME com antecedência mínima de 3 dias úteis, e o efetivo deve manter a ordem sem restringir coercitivamente o horário de término.",
    "Aplica-se a Lei de Grandes Eventos, limitando o evento a 12 horas.",
    "Os eventos acontecem semanalmente durante todo o ano.",
    "A Lei do Silêncio proíbe tais eventos por não preverem exceções culturais.",
    "O efetivo deve encerrar o evento à meia-noite."),
    gabarito: "A", explicacao: "Antecedência mínima de 3 dias úteis; manter a ordem sem restringir o horário, pois os eventos podem seguir até o amanhecer (recomendação do MPPE), ocorrem 2 a 3 vezes ao ano e se enquadram nas exceções culturais da Lei do Silêncio." },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Diferencie minorias de grupos vulneráveis e explique a importância dessa diferenciação para a implementação de políticas públicas, citando um exemplo de cada. (Mínimo 05 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "Conceitos → gênero × espécie → finalidade → importância → exemplos.", criterios: ["Grupos vulneráveis: alta chance de ofensa, sem traço comum; gênero (lato sensu); exercer direitos já reconhecidos", "Minorias: traço cultural comum mantido; espécie (stricto sensu); reconhecimento e depois exercício de direitos", "Importância: para minorias, reconhecer direitos e manter o traço (igualdade na diferença)", "Exemplos: idosos, crianças, PcD (vulneráveis); indígenas (minoria)"], resposta: "Grupos vulneráveis são indivíduos com alto grau de chance de serem ofendidos ou atacados, sem identidade ou traço comum entre si, como idosos, crianças e pessoas com deficiência; constituem o gênero, ou minoria lato sensu, e buscam o respeito e o exercício de direitos já reconhecidos. Minorias são sujeitos ligados por um traço cultural comum que os diferencia da sociedade e que não deve ser eliminado, mas reconhecido e respeitado, como os indígenas; são a espécie, ou minoria stricto sensu, e buscam primeiro o reconhecimento de direitos e depois o seu exercício. A diferenciação importa porque a política pública voltada a uma minoria deve contemplar o reconhecimento de direitos e a manutenção do traço cultural (igualdade na diferença), sem homogeneizar a sociedade, ao passo que a política para grupos vulneráveis segue estratégia distinta, sem a preocupação de preservar um traço cultural." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Descreva as cinco formas de violência doméstica e familiar contra a mulher previstas no art. 7º da Lei 11.340/06 e as três fases do ciclo da violência. (Mínimo 05 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "Cinco formas (art. 7º) → três fases do ciclo.", criterios: ["Física, psicológica, sexual, patrimonial e moral, com conceito resumido de cada", "Tensão: irritação, humilhação, ameaças, destruição de objetos", "Explosão: ato violento", "Arrependimento ('lua de mel'): agressor amável; vítima confusa e pressionada"], resposta: "O art. 7º prevê cinco formas de violência doméstica e familiar contra a mulher: física, qualquer conduta que ofenda sua integridade ou saúde corporal; psicológica, a que cause dano emocional, diminuição da autoestima ou vise controlar suas ações mediante ameaça, humilhação, manipulação, isolamento e outros meios; sexual, a que a constranja a presenciar, manter ou participar de relação sexual não desejada ou limite seus direitos sexuais e reprodutivos; patrimonial, a retenção, subtração ou destruição de objetos, documentos, bens e recursos; e moral, a calúnia, difamação ou injúria. O ciclo da violência tem três fases: a de tensão, em que o agressor se irrita por coisas insignificantes, humilha, ameaça e destrói objetos; a de explosão, em que a falta de controle leva ao ato violento; e a de arrependimento ou 'lua de mel', em que o agressor se torna amável para reconciliar-se e a mulher, confusa e pressionada, abre mão de seus direitos." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Com base no POP da PMPE, descreva a sequência de ações do efetivo ao atender ocorrência de violência doméstica e familiar contra a mulher à luz da Lei Maria da Penha, indicando também o que deve ser evitado no atendimento. (Mínimo 08 e máximo 15 linhas) (Valor: 2,00)", modelo: { estrutura: "Separar e ouvir a vítima → localizar o agressor → entrada na residência → atendimento médico → lesões e desistência → condução → condutas a evitar.", criterios: ["Separar as partes; ouvir primeiro a vítima, preferencialmente por PM feminina", "Localizar o agressor e conduzir as partes à Delegacia da Mulher, comum ou de plantão", "Perguntar se a vítima autoriza a entrada na residência, de preferência diante de testemunhas", "Vítima ferida: primeiro atendimento médico; vítima e agressor em espaços distintos", "Lesões aparentes com testemunhas: encaminhar mesmo contra a vontade; desistência após confirmar: prosseguir até a delegacia", "Evitar: desencorajar, ameaçar com prisão, comentários depreciativos, minimizar a ocorrência, julgamentos pessoais"], resposta: "Ao atender ocorrência de violência doméstica e familiar contra a mulher, o efetivo deve separar as partes, mantendo-as fora do alcance da vista e da audição uma da outra, e, certificando-se da ocorrência, ouvir primeiro a mulher, preferencialmente por policial militar feminina. Obtida a confirmação e a indicação de onde está o agressor, deve envidar esforços para encontrá-lo, fazer a busca pessoal e consultá-lo no Polícia Ágil, conduzindo as partes à Delegacia da Mulher, à Delegacia Comum ou à de Plantão mais próxima. Se o agressor estiver na residência, deve perguntar se a vítima autoriza a entrada do policiamento, de preferência na presença de testemunhas. Estando ferida, a vítima é levada primeiro ao atendimento médico e depois à delegacia, sem dividir o mesmo espaço físico com o agressor. Havendo lesões aparentes e testemunhas, todas as partes são encaminhadas mesmo contra a vontade da ofendida; se ela desistir após confirmar as agressões, prossegue-se até a delegacia para que a autoridade decida. Negada a violência e sem lesões, registra-se em boletim de ocorrência assinado pelas partes e informa-se o COPOM/CIODS. Deve-se evitar qualquer declaração que desencoraje a vítima, ameaçar com a prisão das partes, fazer comentários depreciativos, classificar a situação como de menor importância e exprimir julgamentos pessoais." } },
]

// ── Validação antes de gravar ─────────────────────────────────────────────
function validar() {
  const erros: string[] = []
  const porMod = new Map<string, Q[]>()
  for (const q of QS) (porMod.get(q.modulo) ?? porMod.set(q.modulo, []).get(q.modulo)!).push(q)
  for (const [m, qs] of porMod) {
    const n = (t: string) => qs.filter(q => q.tipo === t).length
    const esperado = m === "SIM" ? [15, 4, 3] : [7, 3, 1]
    const real = [n("certo_errado"), n("multipla"), n("dissertativa")]
    if (real.join() !== esperado.join()) erros.push(`módulo ${m}: ${real.join("/")} (esperado ${esperado.join("/")})`)
    const vistos = new Set<string>()
    for (const q of qs) { if (vistos.has(q.enunciado)) erros.push(`módulo ${m}: enunciado repetido`); vistos.add(q.enunciado) }
  }
  for (const q of QS) {
    if (q.tipo === "multipla" && !q.alternativas.some(a => a.id === q.gabarito)) erros.push(`gabarito inválido: ${q.enunciado.slice(0, 50)}`)
    if (q.tipo !== "dissertativa" && !q.explicacao) erros.push(`sem explicação: ${q.enunciado.slice(0, 50)}`)
    if (q.tipo === "dissertativa" && !q.modelo.resposta) erros.push(`sem resposta-modelo: ${q.enunciado.slice(0, 50)}`)
  }
  if (erros.length) throw new Error("Validação falhou:\n" + erros.join("\n"))
  const dist: Record<string, number> = {}
  for (const q of QS) if (q.tipo === "multipla") dist[q.gabarito] = (dist[q.gabarito] ?? 0) + 1
  const vf = QS.filter(q => q.tipo === "certo_errado")
  console.log(`✓ ${QS.length} questões em ${porMod.size} módulos · múltiplas por letra ${JSON.stringify(dist)} · V/F: ${vf.filter(q => q.gabarito === "certo").length} certo / ${vf.filter(q => q.gabarito === "errado").length} errado`)
}

async function main() {
  validar()
  if (process.argv.includes("--dry-run")) return
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      contexto: ("contexto" in q && q.contexto) ? q.contexto : null,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : FONTE_PADRAO,
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`${MAT}: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
