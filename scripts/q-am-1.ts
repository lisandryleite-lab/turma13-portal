import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "AM" // Armamento e Munição — 11 módulos (apostilas AM-1 a AM-5 + memento). Padrão: 11 questões/módulo (7 V/F + 3 MC + 1 dissertativa).

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Conceito e classificação das armas de fogo ════════════════════
  { modulo: "1", tipo: "certo_errado", enunciado: "Conceitua-se como arma todo instrumento ou objeto concebido pelo homem com a finalidade específica de ser utilizado como meio de ataque e defesa, para ferir, matar ou causar danos diversos.", gabarito: "certo", explicacao: "Correto (RABELLO, Balística Forense). É o conceito geral de arma, do qual a arma de fogo é uma espécie." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Pela Portaria nº 067-Cmt Ex de 2017, arma de fogo é o artefato que arremessa projéteis empregando a força expansiva dos gases gerados pela combustão de um propelente.", gabarito: "certo", explicacao: "Correto. É a definição regulamentar de arma de fogo adotada pelo Exército Brasileiro." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O arco e flecha, a besta e a catapulta são classificados como armas brancas.", gabarito: "errado", explicacao: "Errado. São armas impulsivas ou de arremesso (utilizam meios manuais/mecânicos para lançar projéteis). Armas brancas são as perfurantes/contundentes/cortantes, como espada, baioneta e punhal." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Armas de gás e armas elétricas são classificadas como armas especiais, por não se enquadrarem nas demais especificações, mas serem ofensivas ou defensivas.", gabarito: "certo", explicacao: "Correto. É a categoria residual das armas especiais." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Armamento leve é, em regra, toda arma de calibre inferior a 0,60'' (15,24 mm), sendo a espingarda calibre 12 (18,6 mm) e o lança-granadas M-203 40 mm exceções a essa regra.", gabarito: "certo", explicacao: "Correto, conforme o CGCFN-201 (Manual do Fuzileiro Naval, Marinha do Brasil, 2020)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Quanto ao tipo, a arma de porte é aquela de peso e dimensões reduzidos, podendo ser conduzida no coldre, como a pistola e o revólver.", gabarito: "certo", explicacao: "Correto. Arma portátil tem peso maior, geralmente dotada de bandoleira (submetralhadora, fuzil, carabina, espingarda); arma não portátil exige viatura ou divisão em fardos entre vários homens (metralhadoras Vickers/Browning)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Quanto ao princípio de funcionamento, as armas se dividem em força muscular e ação dos gases; quanto ao funcionamento, em repetição, semiautomática e automática.", gabarito: "certo", explicacao: "Correto. Funcionamento: repetição (toda fase manual), semiautomática (automatiza tudo menos o disparo) e automática (automatiza tudo, inclusive disparos sucessivos enquanto o gatilho é mantido)." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre a classificação das armas de fogo quanto ao carregamento, assinale a CORRETA:", alternativas: A(
    "Dividem-se em antecarga (ex.: bacamarte) e retrocarga (ex.: fuzil Mauser)",
    "Dividem-se em manual e automático",
    "Dividem-se em alma lisa e alma raiada",
    "Dividem-se em individual e coletivo",
    "Dividem-se em água e ar"),
    gabarito: "A", explicacao: "Quanto ao carregamento: antecarga (carregada pela boca do cano, ex. bacamarte) e retrocarga (carregada pela culatra, ex. fuzil Mauser)." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre os conceitos fundamentais de manejo de munição, assinale a CORRETA:", alternativas: A(
    "Municiar é colocar munição no tambor/carregador/tubo do depósito; alimentar é colocar o carregador municiado na arma (ou fechar o tambor); carregar é colocar a munição na câmara",
    "Municiar e carregar são sinônimos em todas as armas",
    "Alimentar só existe em armas automáticas",
    "Carregar é sinônimo de municiar na espingarda calibre 12",
    "No revólver, alimentar e carregar são processos distintos e sequenciais"),
    gabarito: "A", explicacao: "MUNICIAR (colocar munição no tambor/carregador/tubo do depósito) → ALIMENTAR (no revólver, fechar o tambor, que equivale a carregar; nas demais, colocar o carregador municiado na arma) → CARREGAR (colocar a munição na câmara)." },
  { modulo: "1", tipo: "multipla", enunciado: "Quanto ao emprego, uma arma, munição ou equipamento é considerado COLETIVO quando:", alternativas: A(
    "o efeito esperado de sua utilização eficiente destina-se ao proveito da ação de um grupo",
    "é operado por um único homem em qualquer circunstância",
    "é refrigerado a água",
    "possui alimentação manual",
    "é de alma lisa"),
    gabarito: "A", explicacao: "Conforme o Decreto nº 2.998/1999: emprego individual beneficia a ação de um indivíduo; emprego coletivo, a ação de um grupo." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Diferencie as classificações das armas de fogo quanto ao tipo (porte, portátil e não portátil) e cite um exemplo de cada.", modelo: { estrutura: "Porte → portátil → não portátil, com exemplo de cada.", criterios: ["Porte: peso/dimensões reduzidos, conduzida no coldre (pistola, revólver)", "Portátil: peso maior, mas conduzida por um só homem, geralmente com bandoleira (submetralhadora, fuzil, carabina, espingarda)", "Não portátil: volume/peso grandes, exige viatura ou divisão em fardos por vários homens (metralhadora Vickers/Browning)"], resposta: "Quanto ao tipo, a arma de PORTE tem peso e dimensões reduzidos, podendo ser conduzida no coldre — são exemplos a pistola e o revólver. A arma PORTÁTIL tem peso significativamente maior, mas ainda pode ser conduzida por um só homem, geralmente dotada de bandoleira — são exemplos a submetralhadora, o fuzil, a carabina e a espingarda. Já a arma NÃO PORTÁTIL tem volume e peso relativamente grandes, devendo ser conduzida somente por viatura ou dividida em fardos entre vários homens, como as metralhadoras Vickers e Browning." } },

  // ════════════════════ MÓDULO 2 — Partes, nomenclaturas e funcionamento das armas (revólver, pistola, SMT, fuzil, espingarda) ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "O revólver classifica-se quanto ao funcionamento como repetição, com alimentação manual e sentido da esquerda para direita.", gabarito: "certo", explicacao: "Correto, conforme a tabela de classificação do revólver da apostila de Armamento (CIAMTP)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A pistola funciona através da ação dos gases, classificando-se quanto ao funcionamento como semiautomática e quanto à alimentação por carregador, de baixo para cima.", gabarito: "certo", explicacao: "Correto. É a classificação típica da pistola (ex.: PT 100 Taurus cal. .40 S&W)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A submetralhadora (SMT 40) classifica-se quanto ao funcionamento como automática e quanto ao princípio de funcionamento pela ação dos gases.", gabarito: "certo", explicacao: "Correto, conforme a tabela de classificação da SMT 40 (Famae/CTT40) da apostila." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O fuzil M964 FAL classifica-se quanto ao tipo como portátil, individual, refrigerado a ar e quanto ao funcionamento como automático, por ação dos gases.", gabarito: "certo", explicacao: "Correto, conforme a tabela de classificação do fuzil FAL da apostila de Armamento." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A espingarda CBC calibre .12 classifica-se quanto ao funcionamento como repetição, por ação muscular, com alimentação manual e alma raiada.", gabarito: "errado", explicacao: "Errado. A espingarda cal. .12 é de ALMA LISA (e não raiada), justamente por disparar chumbo/balotes que não exigem estabilização por rotação." },
  { modulo: "2", tipo: "certo_errado", enunciado: "No procedimento de inspeção de segurança, a sigla mnemônica utilizada é D-A-R-G-I: Dedo fora do gatilho, Apontar para local seguro, Retirar carregador/munições, Golpes de segurança/abertura da arma, Inspeção visual e manual.", gabarito: "certo", explicacao: "Correto. É a sequência mnemônica DARGI dos procedimentos preliminares (inspeção de segurança) ensinada na apostila." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Na alça de mira de uma pistola, a parte mais à frente do aparelho de pontaria é chamada de massa de mira.", gabarito: "errado", explicacao: "Errado. A massa de mira é a parte mais à FRENTE; a parte mais à RETAGUARDA é a alça de mira. A afirmação inverteu os conceitos ao classificar a massa como parte da 'alça'." },
  { modulo: "2", tipo: "multipla", enunciado: "Sobre as nomenclaturas externas das armas estudadas na disciplina Armamento, assinale a CORRETA:", alternativas: A(
    "Na SMT FAMAE, a fixação da bandoleira e o quebra-chamas são partes externas identificadas na nomenclatura do armamento",
    "O retém do ferrolho só existe em revólveres",
    "O guarda-mato é exclusivo de espingardas",
    "A alavanca de desmontagem é nomenclatura exclusiva de fuzis",
    "O cão é peça presente apenas na espingarda"),
    gabarito: "A", explicacao: "A fixação da bandoleira e o quebra-chamas constam expressamente na nomenclatura externa da SMT FAMAE apresentada na apostila." },
  { modulo: "2", tipo: "multipla", enunciado: "Quanto à classificação do revólver estudado na apostila, é correto afirmar que ele é:", alternativas: A(
    "de porte, individual, refrigerado a ar, de repetição, por ação muscular, alimentação manual, alma raiada e retrocarga",
    "portátil, coletivo, refrigerado a água, automático, ação dos gases, carregador, alma lisa e antecarga",
    "de porte, individual, ação dos gases, semiautomático, carregador, alma raiada e retrocarga",
    "portátil, individual, repetição, ação muscular, manual, alma lisa e antecarga",
    "de porte, coletivo, automático, ação dos gases, carregador, alma raiada e retrocarga"),
    gabarito: "A", explicacao: "O revólver é classificado, na apostila, como: porte, individual, a ar, repetição, ação muscular, manual, esquerda para direita, alma raiada, retrocarga." },
  { modulo: "2", tipo: "multipla", enunciado: "No manejo de armas de fogo, antes de qualquer inspeção, o procedimento correto é:", alternativas: A(
    "retirar o carregador, executar golpes de segurança e, em seguida, realizar a inspeção visual e tátil",
    "apontar diretamente para o alvo e disparar em seco",
    "deixar o carregador inserido para agilizar a inspeção",
    "realizar apenas a inspeção visual, sem necessidade de golpes de segurança",
    "acionar o gatilho antes de retirar o carregador, para verificar o estado da arma"),
    gabarito: "A", explicacao: "A sequência regulamentar (regra DARGI) exige retirar o carregador, executar golpes de segurança/abertura da arma e só então fazer a inspeção visual e tátil." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Explique a diferença entre 'alma lisa' e 'alma raiada' e cite um exemplo de arma de cada tipo estudada na apostila de Armamento.", modelo: { estrutura: "Conceito de alma → lisa (sem raiamento) × raiada (com raiamento) → exemplo de cada.", criterios: ["Alma é a parte oca do interior do cano, que resiste à pressão dos gases e orienta o projétil", "Alma lisa: interior totalmente polido, sem raiamento, sem necessidade de estabilização por rotação (espingarda cal. .12)", "Alma raiada: sulcos helicoidais que forçam o projétil a girar, estabilizando-o na trajetória (pistola, revólver, fuzil)"], resposta: "A alma é a parte oca do interior do cano de uma arma de fogo, destinada a resistir à pressão dos gases e a orientar o projétil. Na ALMA LISA o interior do cano é totalmente polido, sem raiamento, por não haver necessidade de estabilização rotacional dos projéteis — é o caso da espingarda calibre 12. Na ALMA RAIADA o interior do cano possui sulcos helicoidais (raias) que forçam o projétil a um movimento de rotação, garantindo sua estabilidade na trajetória — é o caso da pistola, do revólver e do fuzil." } },

  // ════════════════════ MÓDULO 3 — Regras de segurança gerais com armamento ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "As regras de segurança têm por objetivo garantir a integridade física do instrutor, do aluno e da sociedade, minimizando erros e evitando que atos negligentes ou imprudentes comprometam o aprendizado.", gabarito: "certo", explicacao: "Correto. É o objetivo expresso das regras de segurança gerais da disciplina." },
  { modulo: "3", tipo: "certo_errado", enunciado: "É permitido ao aluno portar munição real durante a instrução, desde que a guarde separadamente da munição de manejo.", gabarito: "errado", explicacao: "Errado. É VEDADO ao aluno estar de posse de qualquer munição real, justamente para evitar eventual troca pela munição de manejo utilizada em sala." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O dedo deve permanecer sempre fora do gatilho, exceto no exato momento de atirar.", gabarito: "certo", explicacao: "Correto. É uma das regras de segurança gerais mais reiteradas na apostila." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Sempre que receber ou entregar uma arma de fogo, deve-se certificar de que esteja aberta (ferrolho à retaguarda), descarregada (sem munição na câmara) e desalimentada (sem o carregador).", gabarito: "certo", explicacao: "Correto. São as três verificações exigidas na transferência de uma arma de fogo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As travas de segurança mecânicas da arma substituem integralmente a necessidade de bom senso do usuário no seu manejo.", gabarito: "errado", explicacao: "Errado. As travas de segurança são dispositivos relativamente confiáveis, mas NÃO substituem o bom senso do usuário." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Armas e munições devem ser guardadas juntas, no mesmo local, para facilitar o acesso em caso de emergência.", gabarito: "errado", explicacao: "Errado. Armas e munições devem ser guardadas SEPARADAMENTE, em locais longe do alcance de curiosos." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O fenômeno do 'fogo amigo' está relacionado ao chamado 'efeito manada' em situações de confronto.", gabarito: "certo", explicacao: "Correto, conforme abordado na apostila de Regras de Segurança." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre os 'dez segundos do homem morto', assinale a CORRETA:", alternativas: A(
    "Refere-se à capacidade que o ser humano tem de, mesmo ferido mortalmente, manter ação voluntária contra o policial, exigindo atenção total em ocorrências com instrumento perfurocortante",
    "É o tempo médio para a chegada do socorro em uma ocorrência policial",
    "Refere-se ao tempo de reação do policial para o saque da arma",
    "É o prazo regulamentar para realizar o follow through após o disparo",
    "Refere-se ao tempo de validade da munição de manejo"),
    gabarito: "A", explicacao: "O conceito alerta que mesmo um agressor mortalmente ferido pode, por alguns segundos, ainda agir voluntariamente contra o policial — daí a necessidade de atenção total." },
  { modulo: "3", tipo: "multipla", enunciado: "Nunca se deve transportar ou coldrear a arma de porte:", alternativas: A(
    "com o cão armado", "descarregada", "desalimentada", "com o carregador retirado", "com a trava de segurança acionada"),
    gabarito: "A", explicacao: "Uma das regras de segurança gerais é nunca transportar ou coldrear a arma com o cão armado." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre o equipamento do policial armado, assinale a alternativa CORRETA quanto ao coldre:", alternativas: A(
    "Coldres projetados para 'saques rápidos' podem, por outro lado, desconsiderar a retenção confortável e segura da arma junto ao corpo; idealmente, deve ser adquirido junto com a arma curta e ser de boa qualidade",
    "Qualquer coldre serve, independentemente do modelo da arma",
    "O coldre deve sempre priorizar a velocidade de saque, ainda que comprometa a retenção da arma",
    "O uso de coldre é facultativo para o policial em serviço armado",
    "O coldre deve ser adquirido somente após meses de uso da arma, para adaptação do usuário"),
    gabarito: "A", explicacao: "A apostila alerta que o saque rápido pode comprometer a retenção segura da arma, recomendando coldre de boa qualidade, preferencialmente adquirido junto com a arma." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Descreva a sequência mnemônica 'DARGI' dos procedimentos preliminares (inspeção de segurança) de uma arma de fogo.", modelo: { estrutura: "D-A-R-G-I em ordem, com a função de cada etapa.", criterios: ["Dedo sempre fora do gatilho", "Apontar a arma para local seguro", "Retirar o carregador (e/ou munições)", "Golpes de segurança / abertura da arma", "Inspeção visual e tátil/manual"], resposta: "A sequência DARGI consiste em: D — manter o Dedo sempre fora do gatilho; A — Apontar a arma para um local seguro; R — Retirar o carregador e/ou as munições; G — executar Golpes de segurança e a abertura da arma; e I — realizar a Inspeção visual e tátil (manual) da arma, confirmando que está aberta, descarregada e desalimentada antes de qualquer manuseio ou entrega." } },

  // ════════════════════ MÓDULO 4 — Regras de segurança no estande de tiro ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "No estande de tiro, o armamento deve permanecer sempre descarregado, desalimentado e desmuniciado, salvo sob comando expresso do instrutor.", gabarito: "certo", explicacao: "Correto. É a regra-mestra das regras de segurança no estande de tiro." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Todo procedimento de carregar, sacar, descarregar, inspecionar e colocar a arma no coldre ou na bancada deve ser feito sob o comando do instrutor.", gabarito: "certo", explicacao: "Correto. Nenhuma ação com o armamento no estande é livre — tudo é comandado pelo instrutor." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Ao completar a sequência de disparos orientada pelo instrutor, o atirador deve retornar à posição 'pronto retido', com o cano voltado para a direção da linha de tiro, ligeiramente para baixo.", gabarito: "certo", explicacao: "Correto. É a posição de espera padrão entre séries de disparo." },
  { modulo: "4", tipo: "certo_errado", enunciado: "É recomendável atirar contra superfícies planas, duras ou em água, pois isso aumenta a eficiência do treinamento.", gabarito: "errado", explicacao: "Errado. Deve-se EVITAR atirar nessas superfícies, pois os projéteis podem ricochetear, colocando em risco os presentes." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Em caso de incidente de tiro, o atirador deve retirar o dedo do gatilho, manter a arma sempre apontada em direção ao alvo e levantar o braço oposto ao da arma para que o instrutor possa atendê-lo.", gabarito: "certo", explicacao: "Correto. É o procedimento padrão de sinalização de incidente no estande de tiro." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Caso não haja a deflagração da munição (falha de disparo), o atirador deve imediatamente abrir a arma e descartar o cartucho, sem aguardar qualquer intervalo de tempo.", gabarito: "errado", explicacao: "Errado. Deve-se MANTER a arma apontada para o alvo por alguns segundos antes de qualquer ação, pois pode haver retardamento (ignição tardia) do cartucho." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Qualquer pessoa que observar uma ocorrência de ato atentatório à segurança no estande deve comandar 'Suspender Fogo!'.", gabarito: "certo", explicacao: "Correto. É o comando de emergência que qualquer presente pode (e deve) dar para interromper imediatamente os disparos." },
  { modulo: "4", tipo: "multipla", enunciado: "São regras básicas a serem seguidas no estande de tiro, EXCETO:", alternativas: A(
    "antecipar a execução de comandos não determinados pelo instrutor, para ganhar tempo",
    "dedo fora do gatilho",
    "sempre apontar a arma para um local seguro",
    "manter o silêncio e evitar brincadeiras",
    "agir mediante comando"),
    gabarito: "A", explicacao: "A exceção (regra violada) é a alternativa 'A': o atirador deve obedecer a tudo que for orientado, NUNCA antecipando a execução de um comando ou fazendo algo não determinado pelo instrutor." },
  { modulo: "4", tipo: "multipla", enunciado: "Caso algum estojo seja ejetado contra o corpo do atirador durante o disparo, o procedimento correto é:", alternativas: A(
    "manter a calma, retirar o dedo do gatilho, continuar apontando a arma para os alvos e sinalizar para o instrutor",
    "interromper imediatamente e abandonar a posição de tiro sem sinalizar",
    "abaixar a arma e verificar o próprio corpo antes de qualquer outra ação",
    "acionar novamente o gatilho para verificar se há outra falha",
    "remover os EPIs para checar se houve lesão"),
    gabarito: "A", explicacao: "O atirador deve manter a calma, retirar o dedo do gatilho, continuar apontando a arma para os alvos e sinalizar a ocorrência ao instrutor." },
  { modulo: "4", tipo: "multipla", enunciado: "Havendo mais de um atirador na linha de tiro, a regra de segurança a ser observada é:", alternativas: A(
    "manter sempre o alinhamento com os demais atiradores",
    "avançar livremente em relação aos demais para melhor ângulo de tiro",
    "recuar sempre que ouvir um disparo próximo",
    "trocar de posição com o atirador ao lado sem aviso ao instrutor",
    "ignorar o posicionamento dos demais, focando apenas no próprio alvo"),
    gabarito: "A", explicacao: "Deve-se manter sempre o alinhamento com os demais atiradores na linha de tiro, por segurança." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Descreva o procedimento de segurança a ser adotado pelo atirador em caso de incidente de tiro no estande.", modelo: { estrutura: "Retirar o dedo do gatilho → manter apontada ao alvo → sinalizar com o braço livre.", criterios: ["Retirar o dedo do gatilho imediatamente", "Permanecer sempre com a arma apontada em direção ao alvo", "Levantar o braço oposto ao da arma para sinalizar ao instrutor", "Aguardar a intervenção do instrutor, sem tentar resolver a pane por conta própria"], resposta: "Em caso de incidente de tiro, o atirador deve, em primeiro lugar, retirar o dedo do gatilho; em seguida, permanecer sempre com a arma apontada em direção ao alvo, nunca a direcionando para si ou para outras pessoas; e, por fim, levantar o braço oposto ao da arma para sinalizar ao instrutor, que então se aproximará para atendê-lo. O atirador não deve tentar resolver a situação por conta própria nem se antecipar a qualquer comando." } },

  // ════════════════════ MÓDULO 5 — Fundamentos do tiro policial: posição ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "A posição Isósceles forma um triângulo isósceles entre os braços do atirador, com os pés paralelos entre si, ligeiramente flexionados e apontando direto para o alvo.", gabarito: "certo", explicacao: "Correto. É a descrição clássica da posição Isósceles, popularizada por Brian Enos e Rob Leatham no IPSC." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A grande desvantagem da posição Isósceles é deixar a parte frontal do corpo do operador exposta, principalmente sem o uso de colete balístico.", gabarito: "certo", explicacao: "Correto. É a desvantagem expressamente apontada na apostila de Fundamentos do Tiro Policial." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A posição Weaver foi desenvolvida pelo xerife Jack Weaver e utiliza tensão isométrica: a mão ativa empurra a arma para frente, enquanto a reativa pressiona para trás.", gabarito: "certo", explicacao: "Correto. É a técnica que utiliza a estrutura muscular (em contraste com a Isósceles, que utiliza a estrutura óssea)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A vantagem da posição Weaver é reduzir a área de exposição do atirador, já que ele fica lateralizado, reduzindo a silhueta.", gabarito: "certo", explicacao: "Correto. A desvantagem correlata é que, com colete balístico, o policial expõe justamente a parte menos protegida do colete." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na posição de joelhos do tipo 'com apoio', o contato correto se dá entre o cotovelo e o joelho (osso com osso), para maior estabilidade.", gabarito: "errado", explicacao: "Errado. O contato correto é entre o TRÍCEPS e o joelho (músculo com osso); o cotovelo NUNCA deve apoiar diretamente no joelho (osso com osso)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na posição deitado dorsal, o policial não deve descansar a cabeça no solo, nem permitir que o cano de sua arma fique direcionado para suas próprias coxas, sob risco de tiro acidental.", gabarito: "certo", explicacao: "Correto. É um dos pontos de atenção da posição deitado dorsal, que tem risco específico de tiro acidental na perna ou pé do próprio atirador." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na posição de tiro barricado, o corpo do policial deve ficar perpendicular (90°) ao abrigo, com a arma podendo ultrapassar livremente a barricada.", gabarito: "errado", explicacao: "Errado. O corpo deve ficar inclinado em DIAGONAL com o abrigo (regra dos 45°), e a arma, preferencialmente, NÃO deve ultrapassar a barricada." },
  { modulo: "5", tipo: "multipla", enunciado: "São critérios para a escolha da melhor posição de tiro policial, EXCETO:", alternativas: A(
    "a preferência estética do atirador pela posição",
    "verificar as circunstâncias em que o policial se encontra",
    "avaliar o risco contra a segurança do policial",
    "buscar uma maior estabilidade corporal",
    "consumo de energia versus conforto policial"),
    gabarito: "A", explicacao: "A 'preferência estética' não é um critério listado na apostila; os critérios reais são circunstâncias, risco à segurança, estabilidade corporal e consumo de energia x conforto." },
  { modulo: "5", tipo: "multipla", enunciado: "A posição Isósceles Modificada, desenvolvida por Massad Ayoob, é também conhecida como:", alternativas: A(
    "Posição de Combate", "Posição Torre", "Posição Barricada", "Posição Pronado Dinâmico", "Posição Oblíqua"),
    gabarito: "A", explicacao: "A Isósceles Modificada é conhecida como 'Posição de Combate', sendo a mais indicada para defesa individual e forças de segurança." },
  { modulo: "5", tipo: "multipla", enunciado: "Na posição deitado 'Pronado Dinâmico', a principal diferença em relação à posição deitado convencional é:", alternativas: A(
    "maior contato com a lateral ativa do corpo, em vez de apoiar somente os cotovelos, deixando os braços mais livres para recargas e solução de panes",
    "exigir que as pernas fiquem totalmente estendidas e separadas",
    "ser usada exclusivamente com arma de porte",
    "dispensar o uso de colete balístico",
    "ser aplicada apenas em ambientes externos"),
    gabarito: "A", explicacao: "O Pronado Dinâmico difere do convencional pela maior amplitude/lateralidade, com mais contato lateral do corpo, liberando os braços para movimentos e procedimentos de recarga e solução de panes." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Compare as posições Isósceles e Weaver quanto à estrutura utilizada (óssea x muscular) e às respectivas vantagens e desvantagens.", modelo: { estrutura: "Isósceles (estrutura óssea) → vantagem/desvantagem; Weaver (estrutura muscular/tensão isométrica) → vantagem/desvantagem.", criterios: ["Isósceles utiliza a estrutura óssea (triângulo formado pelos braços)", "Vantagem da Isósceles: tiro em alvos múltiplos a 180°, posição estratégica com colete", "Desvantagem da Isósceles: expõe a parte frontal do corpo sem colete", "Weaver utiliza a estrutura muscular (tensão isométrica entre as mãos)", "Vantagem da Weaver: reduz a área de exposição (atirador lateralizado)", "Desvantagem da Weaver: expõe a parte menos protegida do colete balístico"], resposta: "A posição Isósceles utiliza a estrutura ÓSSEA, formando um triângulo isósceles entre os braços do atirador; sua vantagem é permitir tiro em alvos múltiplos em 180°, sendo estratégica para quem usa colete balístico, mas sua desvantagem é expor a parte frontal do corpo, principalmente sem o colete. Já a posição Weaver utiliza a estrutura MUSCULAR, por meio de tensão isométrica (a mão ativa empurra a arma para frente e a reativa pressiona para trás); sua vantagem é reduzir a área de exposição do atirador, que fica lateralizado, mas sua desvantagem é justamente oferecer ao agressor a parte menos protegida do colete balístico, por conta dessa mesma lateralização." } },

  // ════════════════════ MÓDULO 6 — Fundamentos do tiro policial: empunhadura ════════════════════
  { modulo: "6", tipo: "certo_errado", enunciado: "No serviço policial, a empunhadura preferencial é a dupla, cujas características são altura, envolvimento e pressão.", gabarito: "certo", explicacao: "Correto. As três características da boa empunhadura dupla são ALTURA, ENVOLVIMENTO e PRESSÃO." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Quanto mais alta (mais próxima/justa ao beavertail) for a empunhadura, melhor o controle do armamento durante o disparo.", gabarito: "certo", explicacao: "Correto. A técnica do 'C da mão' busca empunhar o mais alto possível, pois isso melhora o controle do recuo (subida e descida da arma)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Na pressão da empunhadura dupla, a mão ativa deve empregar mais força que a mão reativa, já que é ela que aciona o gatilho.", gabarito: "errado", explicacao: "Errado. É o INVERSO: a mão REATIVA dá suporte ao armamento e emprega um pouco MAIS de pressão; a mão ATIVA emprega um pouco MENOS de pressão, pois tem o dedo no gatilho." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A técnica 'Polegares à Frente' (Straight Thumbs) foi desenvolvida por Rob Leatham e Brian Enos nos anos 1980.", gabarito: "certo", explicacao: "Correto, conforme a apostila de Fundamentos do Tiro Policial." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A empunhadura simples em arma de porte deve ser o padrão preferencial no serviço policial, por proporcionar maior estabilidade do que a empunhadura dupla.", gabarito: "errado", explicacao: "Errado. A empunhadura preferencial é a DUPLA. A empunhadura simples compromete o envolvimento e só deve ser usada em situações excepcionais." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Em armas portáteis (SMT, fuzil, espingarda cal. 12), o rosto encostado na arma é considerado um dos pontos de contato da empunhadura de três pontos.", gabarito: "errado", explicacao: "Errado. O rosto NÃO é considerado ponto de contato e não deve fazer pressão no armamento, sob pena de prejudicar a visada e/ou causar desconforto na posição." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Em armas portáteis, o cotovelo da mão ativa deve ficar o mais próximo possível do corpo do policial, evitando aumentar a silhueta.", gabarito: "certo", explicacao: "Correto. Cotovelo mais lateralizado aumenta a exposição/silhueta do policial de forma desnecessária." },
  { modulo: "6", tipo: "multipla", enunciado: "São objetivos básicos de uma boa empunhadura, segundo a apostila de Fundamentos do Tiro Policial:", alternativas: A(
    "estabilidade da arma e recuperação do engajamento", "velocidade do saque e camuflagem", "redução de calibre e aumento de cadência", "diminuição do peso da arma e aumento do alcance", "redução do raiamento e aumento da precisão"),
    gabarito: "A", explicacao: "Os dois objetivos básicos expressos são: 1) estabilidade da arma; 2) recuperação do engajamento." },
  { modulo: "6", tipo: "multipla", enunciado: "Sobre as técnicas de empunhadura em armas portáteis, assinale a CORRETA:", alternativas: A(
    "Existem quatro técnicas mais adotadas: convencional, 'C' Clamp, Rodesiana (polegar indexador) e MagWell",
    "Existe apenas uma técnica padronizada para todas as armas portáteis",
    "A técnica convencional é a que oferece maior estabilidade entre todas",
    "A técnica 'C' Clamp é usada apenas em revólveres",
    "A técnica MagWell é exclusiva de armas de porte"),
    gabarito: "A", explicacao: "As quatro técnicas de empunhadura da mão reativa em armas portáteis citadas na apostila são: convencional, 'C' Clamp, Rodesiana e MagWell." },
  { modulo: "6", tipo: "multipla", enunciado: "Em armas portáteis, toda a coronha (chapa da soleira) do armamento deve se ajustar:", alternativas: A(
    "no 'cavado do ombro', para absorver o recuo, não devendo se posicionar sobre a clavícula ou bíceps",
    "sobre a clavícula, para maior estabilidade", "sobre o bíceps, para reduzir o recuo percebido", "na axila, independentemente do recuo", "no antebraço da mão reativa"),
    gabarito: "A", explicacao: "A coronha deve se ajustar no cavado do ombro, absorvendo o recuo; posicioná-la na clavícula ou no bíceps é incorreto." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Explique as três características de uma boa empunhadura dupla em arma de porte (altura, envolvimento e pressão).", modelo: { estrutura: "Altura → envolvimento → pressão, com a função de cada uma.", criterios: ["Altura: ajuste da mão ativa o mais alto/justo possível ao beavertail (técnica do 'C da mão'), melhorando o controle do recuo", "Envolvimento: o punho do armamento deve estar totalmente envolvido pelas mãos, sem espaços livres, com as mãos bem ajustadas entre si", "Pressão: mão reativa com um pouco mais de pressão (suporte); mão ativa com um pouco menos (tem o dedo no gatilho); ambas firmes, sem excesso nem relaxamento"], resposta: "A ALTURA consiste em ajustar a mão ativa o mais alta possível, próxima/justa ao beavertail, usando a técnica do 'C da mão' — quanto mais alta, melhor o controle do armamento após o disparo. O ENVOLVIMENTO exige que o punho do armamento esteja completamente envolvido pelas mãos do policial, sem espaços livres, com a mão ativa e a reativa bem ajustadas entre si. Já a PRESSÃO deve ser empregada de forma firme por ambas as mãos, sem ser excessiva nem relaxada, com a mão reativa aplicando um pouco mais de pressão (papel de suporte) e a mão ativa um pouco menos, já que está com o dedo indicador sobre o gatilho." } },

  // ════════════════════ MÓDULO 7 — Fundamentos do tiro policial: visada, respiração e acionamento do gatilho ════════════════════
  { modulo: "7", tipo: "certo_errado", enunciado: "A visada é o fundamento no qual o policial realiza o ajuste do aparelho de pontaria do armamento ao alvo desejado, sendo suas técnicas o alinhamento do aparelho de pontaria, o enquadramento de mira no alvo e o plano focal.", gabarito: "certo", explicacao: "Correto. São as três técnicas empregadas no fundamento da visada (A, B e C)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A linha de mira é a distância partindo do olho do atirador, compreendendo a alça de mira e a massa de mira; já a linha de visada é o prolongamento da linha de mira até o ponto desejável do alvo.", gabarito: "certo", explicacao: "Correto. São conceitos distintos: linha de mira (olho → alça → massa) e linha de visada (prolongamento até o alvo)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "No plano focal, o ser humano consegue, com sua visão, focar simultaneamente em mais de um ponto em profundidades (distâncias) variadas.", gabarito: "errado", explicacao: "Errado. O ser humano NÃO consegue focar mais de um ponto em profundidades variadas — por isso é preciso escolher o que focar (regra geral: massa de mira)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Durante a respiração, devido à ligação dos ombros com o tórax, ocorre oscilação vertical dos braços, gerando variação nos disparos, principalmente se o policial estiver ofegante.", gabarito: "certo", explicacao: "Correto. É o motivo pelo qual a respiração afeta diretamente a estabilidade do tiro." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O ideal, para um bom disparo, é o policial inspirar e expirar algumas vezes, oxigenando cérebro e músculos, e, próximo ao término da expiração, executar o disparo, deixando cerca de 30% de oxigênio nos pulmões antes de bloquear a respiração.", gabarito: "certo", explicacao: "Correto. É o ciclo respiratório recomendado para o tiro, equilibrando a oscilação dos braços e a falta de oxigênio da apneia." },
  { modulo: "7", tipo: "certo_errado", enunciado: "No acionamento do gatilho, deve-se manter uma 'luz do gatilho': um espaço mínimo entre o dedo e a armação da arma, para que a força aplicada não seja transmitida ao armamento e altere seu alinhamento ao alvo.", gabarito: "certo", explicacao: "Correto. É a recomendação quanto à altura do posicionamento do dedo no gatilho." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A 'gatilhada' ocorre quando o policial aciona o gatilho de forma lenta e progressiva, sem nunca surpreender o disparo.", gabarito: "errado", explicacao: "Errado. A gatilhada é justamente o CONTRÁRIO: ocorre quando o policial aciona BRUSCAMENTE o gatilho ao julgar visualizar a 'fotografia ideal', deslocando o ponto de impacto." },
  { modulo: "7", tipo: "multipla", enunciado: "São erros comuns no acionamento do gatilho estudados na apostila de Fundamentos do Tiro Policial, EXCETO:", alternativas: A(
    "follow through", "gatilhada", "antecipação do tiro", "esquiva", "puxada diagonal"),
    gabarito: "A", explicacao: "O follow through é um procedimento dos PROCEDIMENTOS DO TIRO POLICIAL (avaliação pós-disparo), não um erro do acionamento do gatilho. Os erros listados são: gatilhada, antecipação do tiro, esquiva e puxada diagonal." },
  { modulo: "7", tipo: "multipla", enunciado: "Sobre o aparelho de pontaria das armas de fogo, assinale a CORRETA:", alternativas: A(
    "É composto basicamente pela massa de mira (parte mais à frente) e pela alça de mira (parte mais à retaguarda)",
    "É composto apenas pela massa de mira",
    "É composto apenas pela alça de mira",
    "Varia completamente de princípio entre os diferentes modelos e fabricantes",
    "Não existe em armas portáteis"),
    gabarito: "A", explicacao: "O aparelho de pontaria é basicamente o mesmo em todos os armamentos (massa de mira à frente, alça de mira à retaguarda), diferindo apenas em detalhes entre modelos e fabricantes." },
  { modulo: "7", tipo: "multipla", enunciado: "Sobre o erro de 'esquiva' no acionamento do gatilho em armas portáteis, é correto afirmar que:", alternativas: A(
    "ocorre quando o policial, por ansiedade ou medo do recuo, movimenta o ombro levemente para trás, podendo ainda fechar os olhos e comprometer a visada",
    "ocorre apenas em armas de porte",
    "é um erro exclusivamente relacionado à posição dos pés",
    "está relacionado unicamente à respiração ofegante",
    "é sinônimo de antecipação do tiro"),
    gabarito: "A", explicacao: "A esquiva ocorre em armas portáteis, quando o medo do recuo faz o policial recuar o ombro e, por vezes, fechar os olhos, comprometendo a visada." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Diferencie precisão e acurácia, conforme estudado nos casos práticos do fundamento de acionamento do gatilho.", modelo: { estrutura: "Precisão (repetição/agrupamento) × acurácia (proximidade do objetivo).", criterios: ["Precisão: ação repetida com o mesmo procedimento, relacionada à proximidade entre os próprios disparos (agrupamento, mesmo que fora do alvo)", "Acurácia: proximidade entre o valor obtido (disparos) e o valor verdadeiro (objetivo/centro-alvo)", "É possível ter precisão sem acurácia (agrupado, mas fora do centro) e vice-versa"], resposta: "PRECISÃO é a ação de, repetidas vezes, adotar o mesmo procedimento, relacionando-se à proximidade entre os valores obtidos na repetição — ou seja, os disparos atingem praticamente o mesmo ponto, estejam ou não no alvo certo. ACURÁCIA é a proximidade entre o valor obtido experimentalmente (os disparos) e o valor verdadeiro desejado (o objetivo, centro-alvo) — ou seja, os disparos atingem o ponto pretendido ou bem próximo dele. É possível haver precisão sem acurácia (disparos bem agrupados, mas fora do centro do alvo, por erro sistemático como massa alta/baixa) e acurácia sem precisão (disparos dispersos, mas centrados na média)." } },

  // ════════════════════ MÓDULO 8 — Condicionamento mental e saque/apresentação do armamento ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "O condicionamento mental é a junção da preparação física, técnica e psicológica, sendo o fator que exerce maior influência na execução do disparo por parte do atirador.", gabarito: "certo", explicacao: "Correto, conforme os Procedimentos do Tiro Policial (CIAMTP)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Entre os sintomas do medo, ansiedade e estresse no tiro policial estão a diminuição da visão periférica (visão de túnel/taquipsiquia), a diminuição da capacidade auditiva e a diminuição da habilidade motora.", gabarito: "certo", explicacao: "Correto. São os sintomas expressamente listados na apostila de Procedimentos do Tiro Policial." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O saque da arma de porte está relacionado, principalmente, aos fundamentos da posição e da empunhadura, sendo simultâneo a ele o ajuste até a apresentação da arma.", gabarito: "certo", explicacao: "Correto. O saque consiste em retirar a arma do coldre, ajustando posição e empunhadura simultaneamente, até a apresentação para o disparo." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Durante o saque da arma de porte, o dedo que acionará o gatilho deve ir diretamente ao gatilho desde o início do movimento, para ganhar tempo de reação.", gabarito: "errado", explicacao: "Errado. O dedo deve permanecer AO LONGO do armamento durante o saque, indo ao gatilho SOMENTE no momento do disparo, após a identificação positiva do alvo." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na posição 2 do saque da arma de porte, a empunhadura já deve estar bem feita e a arma posicionada na região do peito do policial, voltada preferencialmente em direção ao alvo.", gabarito: "certo", explicacao: "Correto. É a descrição da Posição 2 do saque da arma de porte." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A apresentação do armamento, na transição da posição 2 para a 3, deve ser realizada com movimento diagonal-retilíneo ao alvo, conhecido como 'espetagem' ou 'flecha'.", gabarito: "certo", explicacao: "Correto. O movimento é diagonal-retilíneo (espetagem/flecha), com os cotovelos levemente projetados para fora, sem o policial abaixar a cabeça até a arma." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na apresentação do armamento, é correto que o policial abaixe a cabeça até a altura da arma, formando um movimento de arco entre o saque e a apresentação.", gabarito: "errado", explicacao: "Errado. O policial NÃO deve abaixar a cabeça até a arma nem fazer o movimento de arco — a arma é que sobe até a linha de visada do policial." },
  { modulo: "8", tipo: "multipla", enunciado: "São pontos importantes a serem observados no saque da arma de porte, segundo a apostila de Procedimentos do Tiro Policial, EXCETO:", alternativas: A(
    "o calibre da munição utilizada no treinamento",
    "o modelo e a marca do coldre utilizado",
    "o uso de travas externas da arma de porte",
    "a posição do dedo que aciona o gatilho",
    "a empunhadura adotada durante o movimento"),
    gabarito: "A", explicacao: "O calibre da munição não é um dos pontos listados; os pontos reais são: modelo/marca do coldre, travas externas e a posição do dedo no gatilho durante o saque." },
  { modulo: "8", tipo: "multipla", enunciado: "Sobre o condicionamento mental no tiro policial, assinale a alternativa CORRETA quanto às formas de melhorá-lo:", alternativas: A(
    "Concentração (foco na execução dos fundamentos), disciplina mental (estabilidade emocional) e motivação (pensamento positivo quanto ao resultado)",
    "Apenas a repetição de disparos reais, sem necessidade de foco mental",
    "Exclusivamente o aumento da carga horária de tiro com munição real",
    "Apenas o treinamento físico, sem componente psicológico",
    "Apenas a redução do tempo de reação, independentemente da técnica"),
    gabarito: "A", explicacao: "Os três fatores de melhoria do condicionamento mental citados são concentração, disciplina mental e motivação." },
  { modulo: "8", tipo: "multipla", enunciado: "Na Posição 1 do saque da arma de porte, o procedimento correto é:", alternativas: A(
    "o policial faz contato com a arma com empunhadura alta e firme da mão ativa, liberando a trava do coldre, enquanto a mão reativa se posiciona próxima ao abdômen para receber e envolver a arma",
    "a arma já deve estar totalmente apresentada e voltada para o alvo",
    "o policial deve apontar a arma diretamente para o agressor antes mesmo de sacá-la do coldre",
    "a mão reativa deve permanecer afastada do corpo, sem qualquer contato com a arma",
    "o dedo já deve estar posicionado sobre o gatilho"),
    gabarito: "A", explicacao: "Na Posição 1, a mão ativa faz contato com empunhadura alta e firme (liberando a trava do coldre) e a mão reativa se posiciona próximo ao abdômen, inclinando-se para envolver a pistola corretamente." },
  { modulo: "8", tipo: "dissertativa", enunciado: "Explique por que o condicionamento mental é considerado o fator de maior influência na execução do disparo e cite dois sintomas decorrentes de medo, ansiedade ou estresse.", modelo: { estrutura: "Condicionamento mental = junção de preparação física, técnica e psicológica → maior influência → sintomas (visão de túnel, diminuição auditiva/motora, sudorese/taquicardia).", criterios: ["Condicionamento mental é a junção da preparação física, técnica e psicológica", "É o fator de maior influência na execução do disparo", "Dois sintomas: diminuição da visão periférica (taquipsiquia)/diminuição da capacidade auditiva/diminuição da habilidade motora/descarga de adrenalina (sudorese e aumento da frequência cardíaca)"], resposta: "O condicionamento mental é a junção dos fatores de preparação física, técnica e psicológica, sendo justamente essa junção que exerce a maior influência na execução do disparo pelo atirador — mais até do que cada fator isoladamente. Quando o policial é tomado por medo, ansiedade ou estresse, surgem sintomas como a diminuição da visão periférica (visão de túnel, ou taquipsiquia) e a diminuição da capacidade auditiva, além da diminuição da habilidade motora e da descarga de adrenalina, com sudorese e aumento da frequência cardíaca." } },

  // ════════════════════ MÓDULO 9 — Double tap, follow through, controle de cano, recargas e bandoleira ════════════════════
  { modulo: "9", tipo: "certo_errado", enunciado: "O 'Double Tap' busca proporcionar uma soma da ressonância de choque de dois disparos sequenciados, objetivando causar um choque hipovolêmico no agressor para cessar sua ação.", gabarito: "certo", explicacao: "Correto. É a definição/objetivo original do Double Tap." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O estudo de Patrick Urey (FBI) mostrou que o Double Tap, tecnicamente, exigiria um intervalo entre disparos de até 0,019 segundos (cerca de 53 disparos por segundo), o que é humanamente impossível de executar.", gabarito: "certo", explicacao: "Correto. É a desmistificação do Double Tap apresentada na apostila, com base no estudo de Patrick Urey." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O 'N Tap' significa que o agente de segurança deve efetuar a quantidade de disparos que sejam necessárias para cessar a agressão e alcançar a incapacitação do agressor.", gabarito: "certo", explicacao: "Correto. É o recurso atualmente recomendado em substituição à ideia (desmistificada) do Double Tap como técnica garantida." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O 'follow through' é o conjunto de procedimentos realizados ANTES do disparo, voltados à preparação psicológica do atirador.", gabarito: "errado", explicacao: "Errado. O follow through ocorre APÓS o disparo: o policial avalia o ambiente, checa se o alvo foi atingido, faz a varredura por novas ameaças e prepara a arma para um novo disparo (reset + nova visada)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O controle de cano exige que o policial mantenha sempre o cano de sua arma voltado para um local seguro, nunca para outros policiais ou demais cidadãos.", gabarito: "certo", explicacao: "Correto. É uma das principais regras de segurança e procedimento do tiro policial." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A recarga tática é realizada em situação de confronto, com o atirador trocando o carregador com a arma carregada, visando aumentar a quantidade de munições para uma possível continuidade do confronto.", gabarito: "certo", explicacao: "Correto. Diferencia-se da recarga administrativa (fora de combate) e da recarga de emergência (carregador esgotado em combate)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Durante a execução da recarga, o armamento deve ser mantido na altura da visão, de modo que o atirador também possa observar o agressor (área de trabalho), mantendo o controle de cano.", gabarito: "certo", explicacao: "Correto. É a orientação para a posição do armamento durante a troca do carregador." },
  { modulo: "9", tipo: "multipla", enunciado: "São tipos de recarga estudados nos Procedimentos do Tiro Policial, EXCETO:", alternativas: A(
    "recarga preventiva", "recarga administrativa", "recarga tática", "recarga de emergência", "nenhuma das anteriores está incorreta"),
    gabarito: "A", explicacao: "Os três tipos estudados são: administrativa (fora de combate), tática (combate, com a arma carregada) e de emergência (combate, com o carregador esgotado). 'Recarga preventiva' não é um tipo estudado." },
  { modulo: "9", tipo: "multipla", enunciado: "Sobre a bandoleira de 2 pontas, assinale a alternativa CORRETA quanto à sua vantagem:", alternativas: A(
    "A arma fica mais fixada e próxima ao corpo na transição para a arma de porte, possibilitando o uso de tira-colo",
    "Permite agilidade na troca de plataforma, ao contrário da de 1 ponta",
    "É a única que estabiliza completamente a arma sem nenhuma desvantagem",
    "Substitui integralmente a necessidade de empunhadura correta",
    "É utilizada exclusivamente em armas de porte"),
    gabarito: "A", explicacao: "A vantagem da bandoleira de 2 pontas é manter a arma mais fixada e próxima ao corpo na transição, possibilitando uso de tira-colo; sua desvantagem é impossibilitar a troca de plataforma." },
  { modulo: "9", tipo: "multipla", enunciado: "Sobre a transição de armamento, assinale a CORRETA:", alternativas: A(
    "Divide-se em tática (planejada, conforme o cenário) e emergencial (quando há pane ou falta de munição no armamento empunhado em combate)",
    "É sempre planejada, nunca ocorrendo de forma emergencial",
    "Dispensa o uso de bandoleira",
    "É um procedimento simples que não exige treinamento",
    "Só pode ser executada com armas de porte"),
    gabarito: "A", explicacao: "A transição de armamento divide-se em tática (planejada, por adaptação ao cenário) e emergencial (decorrente de pane ou esgotamento de munições em combate)." },
  { modulo: "9", tipo: "dissertativa", enunciado: "Explique o conceito de 'follow through' e os três objetivos verificados pelo policial nesse procedimento.", modelo: { estrutura: "Conceito (pós-disparo) → três objetivos.", criterios: ["É o conjunto de procedimentos realizado APÓS o disparo", "Verificar se o alvo agressor foi atingido (checagem do alvo)", "Verificar que não há mais ameaças contra o policial (varredura)", "Preparar o policial para o disparo subsequente (reset do gatilho e nova visada)"], resposta: "O follow through ('seguir através') é o conjunto de procedimentos realizado pelo policial IMEDIATAMENTE APÓS o disparo, em que ele avalia o ambiente de confronto. Seus três objetivos são: 1) verificar que o alvo agressor foi atingido (checagem do alvo); 2) verificar que não há mais ameaças contra o policial (varredura do ambiente); e 3) preparar-se para um disparo subsequente, com o reset do gatilho e uma nova visada, garantindo que esteja em condições de disparar novamente se necessário." } },

  // ════════════════════ MÓDULO 10 — Resolução de panes e tiro em seco ════════════════════
  { modulo: "10", tipo: "certo_errado", enunciado: "A 'pane de nega' ocorre quando, após o acionamento do gatilho, não há disparo porque a espoleta foi percutida, mas não houve a iniciação do acionamento do propelente, ou a munição não se apresentou na câmara.", gabarito: "certo", explicacao: "Correto. É a definição de pane de nega; sua solução é o Tap-Rap (golpe do ferrolho)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A 'pane de trancamento' ocorre quando, apesar de a munição ter sido empurrada pelo ferrolho para a câmara, ela não se acopla devidamente, por munição inchada, inadequada ou ciclagem incompleta.", gabarito: "certo", explicacao: "Correto, conforme a apostila de Procedimentos do Tiro Policial." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A 'pane de duplo carregamento' ocorre quando duas munições se apresentam simultaneamente na entrada da câmara, interrompendo o carregamento.", gabarito: "certo", explicacao: "Correto. É causada, entre outros motivos, por falha no extrator, culote do estojo gasto ou problema no carregador (lábio frouxo)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A 'pane de chaminé' ocorre quando, após o disparo, o estojo permanece preso na janela de ejeção da arma.", gabarito: "certo", explicacao: "Correto. É causada por ciclagem incompleta do ferrolho ou falha no extrator/ejetor; a solução também é o Tap-Rap." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A maior parte das panes é sanável apenas com a substituição completa do carregador, sendo o procedimento Tap-Rap-Bang aplicável apenas em casos raros.", gabarito: "errado", explicacao: "Errado. É justamente o CONTRÁRIO: a grande parcela das panes é sanável com o Tap-Rap-Bang (tapa, golpe e tiro), sendo este o procedimento de uso imediato recomendado." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Diante de uma pane não sanada pelo Tap-Rap-Bang, o operador deve fazer o 'check' na arma para confirmar a pane antes de realizar a próxima solução.", gabarito: "certo", explicacao: "Correto. É a orientação geral de resolução de panes da apostila." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Para a prática segura do tiro em seco, o policial deve utilizar munição real, desde que em pequena quantidade, para maior realismo do treinamento.", gabarito: "errado", explicacao: "Errado. NÃO se deve utilizar, em nenhuma hipótese, munição real no tiro em seco — devem ser usadas munições de treino (snap cap), em local adequado e com a arma sempre apontada para local seguro." },
  { modulo: "10", tipo: "multipla", enunciado: "São tipos de pane estudados na apostila de Procedimentos do Tiro Policial, EXCETO:", alternativas: A(
    "pane de cadência", "pane de nega", "pane de trancamento", "pane de duplo carregamento", "pane de chaminé"),
    gabarito: "A", explicacao: "'Pane de cadência' não existe na classificação; os tipos reais são: nega, trancamento, duplo carregamento, chaminé e embuxamento." },
  { modulo: "10", tipo: "multipla", enunciado: "A solução padrão para a maioria das panes (Tap-Rap) consiste em:", alternativas: A(
    "golpe no ferrolho para recarregamento, lateralizando a arma",
    "desmontar completamente a arma no momento do confronto",
    "trocar imediatamente o cano da arma",
    "aguardar o resfriamento da arma antes de qualquer ação",
    "limpar a arma com solvente antes de continuar o tiro"),
    gabarito: "A", explicacao: "Tap-Rap é o golpe do ferrolho para recarregamento, com a arma lateralizada, sendo a solução padrão para panes de nega, trancamento e chaminé." },
  { modulo: "10", tipo: "multipla", enunciado: "Sobre a pane de embuxamento, assinale a CORRETA:", alternativas: A(
    "Ocorre quando, após a deflagração, o estojo não é extraído, ficando afixado na parte inicial do cano, travando a abertura da arma; sua solução é envolver o ferrolho e dar uma pancada na traseira do punho",
    "É sinônimo de pane de nega",
    "Ocorre apenas em armas de alma lisa",
    "É resolvida unicamente com a troca do carregador",
    "Não tem relação com o estado da munição"),
    gabarito: "A", explicacao: "A pane de embuxamento, causada por munição inchada, exige solução específica diferente do Tap-Rap: envolver o ferrolho por cima e dar uma pancada na traseira do punho com a mão forte." },
  { modulo: "10", tipo: "dissertativa", enunciado: "Explique a finalidade da prática do 'tiro em seco' e cite duas regras de segurança que devem ser observadas durante essa prática.", modelo: { estrutura: "Finalidade (aplicar fundamentos intuitivamente/reflexo condicionado) → regras de segurança.", criterios: ["Finalidade: aplicar os fundamentos do tiro de forma intuitiva, por reflexo condicionado, trazendo confiança e condicionamento mental", "Regra: arma sempre apontada para local seguro", "Regra: não utilizar, em nenhuma hipótese, munição real", "Regra: utilizar munições de treino (snap cap) e local adequado"], resposta: "O tiro em seco é a forma mais comum e eficiente de aplicação repetitiva dos fundamentos do tiro, fazendo com que o atirador os aplique intuitivamente, por reflexo condicionado, trazendo-lhe confiança na execução e, por consequência, condicionando-o mentalmente. Durante essa prática, devem ser observadas regras de segurança como: manter a arma sempre apontada para um local seguro; não utilizar, em nenhuma hipótese, munição real; e utilizar munições de treino (como o snap cap), em local adequado para o treinamento." } },

  // ════════════════════ MÓDULO 11 — Munição e balística ════════════════════
  { modulo: "11", tipo: "certo_errado", enunciado: "Munição é o conjunto formado por estojo, projétil, propelente e espoleta, destinado a armas de retrocarga de pequeno ou médio calibre, sendo o mesmo que cartucho.", gabarito: "certo", explicacao: "Correto (CÂMARA JÚNIOR, 2002). É a definição de munição/cartucho adotada na apostila." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A espoleta tipo Boxer caracteriza-se por possuir a bigorna montada DENTRO da própria cápsula, ao passo que a espoleta Berdan tem a bigorna como um ressalto no centro da base do estojo.", gabarito: "certo", explicacao: "Correto. É a distinção central entre os dois principais tipos de espoleta de fogo central." },
  { modulo: "11", tipo: "certo_errado", enunciado: "As pólvoras são misturas ou compostos químicos que, ao queimarem em velocidade muito alta, geram grande quantidade de gases, cujo aumento de volume gera, por sua vez, um enorme aumento de pressão.", gabarito: "certo", explicacao: "Correto. É o princípio básico do funcionamento do propelente (carga de projeção)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A balística interna estuda o comportamento do projétil somente após ele deixar completamente a influência dos gases do disparo, já distante da arma.", gabarito: "errado", explicacao: "Errado. Isso descreve a balística EXTERNA. A balística INTERNA estuda os fenômenos que ocorrem ANTES da saída do projétil pelo cano (espoletas, propelentes, pressão interna, raiamento)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A balística de transição estuda o comportamento do projétil quando ele sai do cano da arma, mas ainda está sob a influência dos gases remanescentes do disparo.", gabarito: "certo", explicacao: "Correto, conforme Rogério Nogueira (2023). É a fase intermediária entre a balística interna e a externa." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A energia cinética de um projétil é calculada pela fórmula Ec = m·v²/2, sendo diretamente proporcional à massa e proporcional ao quadrado da velocidade.", gabarito: "certo", explicacao: "Correto. Por estar elevada ao quadrado, uma variação na velocidade altera a energia cinética de forma muito mais significativa do que uma variação equivalente na massa." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Segundo Fackler, o conceito de 'stopping power' está diretamente vinculado à biologia de quem recebe o disparo e ao seu estado emocional, e não apenas ao calibre em si.", gabarito: "certo", explicacao: "Correto. O Coronel Martin Fackler, considerado o pai da Balística Terminal Moderna, derrubou o mito do 'poder de parada' atrelado unicamente ao calibre da munição." },
  { modulo: "11", tipo: "multipla", enunciado: "Quanto à divisão da balística, assinale a CORRETA:", alternativas: A(
    "Divide-se em interna, de transição, externa e terminal (final ou dos efeitos)",
    "Divide-se apenas em interna e externa",
    "Divide-se em balística civil e militar",
    "Divide-se em balística de porte e balística portátil",
    "Divide-se em balística direta e reversa"),
    gabarito: "A", explicacao: "A balística se divide em interna, de transição, externa e terminal (também chamada final ou dos efeitos)." },
  { modulo: "11", tipo: "multipla", enunciado: "Sobre os fatores que atuam na trajetória de um projétil, assinale a alternativa que apresenta apenas fatores corretamente citados na apostila:", alternativas: A(
    "Estabilidade giroscópica, gravidade, inclinação, arrasto, temperatura e vento",
    "Cor da munição, marca do fabricante e tipo de embalagem",
    "Apenas a gravidade, isoladamente",
    "Apenas o calibre da arma, isoladamente",
    "Temperatura corporal do atirador e batimento cardíaco"),
    gabarito: "A", explicacao: "Entre os fatores que atuam na trajetória do projétil estão: ação dos gases/velocidade, estabilidade giroscópica, rotação/nutação/precessão, gravidade, inclinação, arrasto, temperatura, densidade de altitude, umidade, vento e obstáculos." },
  { modulo: "11", tipo: "multipla", enunciado: "Sobre os tipos de incapacitação estudados em balística terminal, assinale a CORRETA:", alternativas: A(
    "Incapacitação imediata (efeito biológico, lesão no sistema nervoso central), mediata (efeito fisiológico, perda de sangue) e psicológica (o agressor desiste sem necessariamente ter sido lesionado)",
    "Incapacitação apenas imediata, sempre por lesão muscular",
    "Incapacitação apenas física, nunca psicológica",
    "Incapacitação mediata é sempre mais rápida que a imediata",
    "Incapacitação psicológica exige obrigatoriamente lesão grave"),
    gabarito: "A", explicacao: "São três os tipos: imediata (lesão no SNC), mediata (perda de sangue/oxigenação) e psicológica (desistência por efeito psicológico, independente de lesão)." },
  { modulo: "11", tipo: "dissertativa", enunciado: "Diferencie as quatro divisões da balística (interna, de transição, externa e terminal), indicando o que cada uma estuda.", modelo: { estrutura: "Interna → transição → externa → terminal, com o objeto de estudo de cada.", criterios: ["Interna: fenômenos antes da saída do projétil pelo cano (espoletas, propelentes, pressão, raiamento)", "Transição: comportamento do projétil ao sair do cano, ainda sob influência dos gases remanescentes", "Externa: movimento do projétil pelo ar e variáveis como gravidade, altitude, umidade, vento", "Terminal (final/dos efeitos): interações do projétil ao impactar estruturas físicas ou biológicas"], resposta: "A balística INTERNA estuda todos os fenômenos químicos e físicos que ocorrem ANTES da saída do projétil pelo cano da arma, como espoletas, propelentes, pressão interna e raiamento. A balística DE TRANSIÇÃO estuda o comportamento do projétil no momento em que sai do cano, mas ainda sob influência dos gases remanescentes do disparo. A balística EXTERNA estuda os movimentos do projétil durante seu deslocamento pelo ar, considerando variáveis como gravidade, altitude, umidade, vento e densidade do ar. Por fim, a balística TERMINAL (final ou dos efeitos) foca no estudo das interações do projétil ao impactar estruturas físicas ou biológicas, sendo a base para o entendimento da incapacitação do alvo." } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  const novosHashes = QS.map(q => createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex"))
  const del = await prisma.questao.deleteMany({ where: { materia: MAT, hash: { notIn: novosHashes } } })
  if (del.count > 0) console.log(`Removidas ${del.count} questões AM obsoletas.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : "Apostilas AM (CIAMTP/SDS) + Memento Resumido AM",
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`AM: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
