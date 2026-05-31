import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "PO"

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ───────── MÓD 1 — BOEPM ─────────
  { modulo: "1", frente: "BOEPM — Finalidade e Dever de Registro", verso:
`• O BOEPM registra ocorrência de crime ou incidente: documenta fatos, permite investigação, viabiliza processamento e compõe prova em processos judiciais.
• Dever de registro: os órgãos de segurança devem registrar todas as ocorrências que chegam ao conhecimento institucional, sem filtragem informal por conveniência.
• A qualidade do registro depende de veracidade, precisão e imparcialidade — sem opinião pessoal, preconceito ou narrativa incompleta.
⚠ O BO não é mera burocracia: erro material, omissão relevante ou narrativa parcial pode gerar reflexos administrativos, penais e civis.` },

  { modulo: "1", frente: "BOEPM — Esferas de Responsabilidade", verso:
`• Administrativa: descumprimento de dever funcional (registro sem cuidado, precisão ou imparcialidade).
• Penal: preenchimento falso ou inexato que se ajusta a crime (falsidade ideológica, denunciação caluniosa).
• Civil: conduta dolosa ou negligente que causa prejuízo material ou moral a terceiros, exigindo reparação.` },

  { modulo: "1", frente: "BOEPM — Falsidade e Denunciação", verso:
`• Falsidade ideológica (art. 299 do CP): omitir, inserir ou fazer inserir declaração falsa/diversa da devida em documento público ou particular, com fim de prejudicar direito, criar obrigação ou alterar verdade juridicamente relevante.
• Denunciação caluniosa: exige finalidade específica de incriminar alguém injustamente — difere da simples alteração de verdade documental.
⚠ Todo BO falso pode indicar falsidade, mas denunciação caluniosa exige intenção de fazer pessoa inocente ser investigada/responsabilizada.
🔑 Sigilo: divulgar documentos pode gerar responsabilização criminal (arts. 166 e 324 do Código Penal Militar) e administrativa (RDPMPE).` },

  { modulo: "1", frente: "BOEPM — Conduta Esperada do Redator", verso:
`• Narrar fatos observados ou informados com clareza, distinguindo percepção direta, relato de terceiros, vestígios, providências e encaminhamentos.
• Informações incompletas podem comprometer a investigação, prejudicar vítimas, favorecer autores e fragilizar a credibilidade do registro.
• Preencher com cuidado técnico, linguagem objetiva, dados verificáveis e ausência de juízos pessoais indevidos.` },

  // ───────── MÓD 2 — BOEPM Geração 2 ─────────
  { modulo: "2", frente: "BOEPM Geração 2 — Funcionalidade do Aplicativo", verso:
`• Gera boletins com teor equivalente ao modelo em papel, com vantagem de velocidade, padronização e integração ao sistema.
• Desenvolvido pela área de tecnologia da SDS, com processo conduzido por policiais da ativa e execução técnica por empresa de software.
• Login com usuário e senha do Expresso/SEI, aproveitando credenciais já conhecidas.
• Roda em smartphones comuns — concebido para uso cotidiano, sem depender de equipamentos especiais.` },

  { modulo: "2", frente: "BOEPM Geração 2 — Cadastro e BO em Andamento", verso:
`• O cadastro da equipe começa pelo prefixo da viatura e segue com matrícula e nome do efetivo.
• Na tela inicial: criar novo boletim, visualizar boletins criados, continuar preenchimento pendente ou excluir boletim iniciado.
⚠ Não é possível criar novo BO quando há boletim em andamento; o sistema exige conclusão, continuidade ou exclusão do registro pendente.` },

  { modulo: "2", frente: "BOEPM Geração 2 — Transcrição e Envolvidos", verso:
`• Para prosseguir, o operador informa os campos obrigatórios; alguns dados aparecem como sugestão automática e podem ser alterados manualmente.
• Ocorrências complexas ou de múltipla natureza permitem incluir diversas situações, conforme discernimento do condutor.
• No campo de envolvidos: qualificar suspeitos, vítimas, autores, agentes, testemunhas ou outros, com descrição física e dados relevantes.
• Permite listar usos de força, editar dados de envolvidos e excluir envolvido por movimento no card.` },

  { modulo: "2", frente: "BOEPM Geração 2 — Objetos, Relato e Finalização", verso:
`• O campo modus operandi não é obrigatório em todas as ocorrências (cada fato tem dinâmica própria).
• Objetos podem ser descritos, vinculados a envolvidos e fotografados quando se tratar de arma ou droga.
• Dados complementares são obrigatórios: consistem no relato da ocorrência, digitado ou ditado por transcrição de voz.
⚠ A mensagem "CONTATE O SUPORTE" não significa perda do BO; o registro vai ao banco de erros para tratamento e restabelecimento.` },

  // ───────── MÓD 3 — Algemas ─────────
  { modulo: "3", frente: "Algemas — Hipóteses Autorizadoras (SV 11/STF)", verso:
`• A Súmula Vinculante nº 11 do STF torna o uso de algemas excepcional, só em hipóteses concretas e justificáveis.
• Hipóteses centrais: resistência, fundado receio de fuga ou perigo à integridade física do preso, de terceiros ou dos agentes.
• A justificativa deve ser feita por escrito; o uso abusivo pode gerar nulidade do ato e responsabilização disciplinar, civil e penal.
⚠ A legalidade depende da situação concreta; não basta rotina, gravidade abstrata do crime ou conveniência operacional genérica.` },

  { modulo: "3", frente: "Algemas — Fundamentos e Limites", verso:
`• A súmula protege dignidade humana, vedação a tratamento degradante, presunção de inocência, intimidade, vida privada, honra e imagem.
• Mulheres grávidas, parturientes e puérperas têm proteção específica contra algemas no trabalho de parto, trajeto hospitalar e hospitalização.
• POPs institucionais orientam condução, custódia e escolta, mas não afastam a exigência constitucional de motivação individualizada.` },

  { modulo: "3", frente: "Algemas — Audiência Judicial", verso:
`• Em audiência, júri, velório ou apresentação formal: considerar histórico, periculosidade, risco de fuga e segurança do ambiente.
• Se a autoridade judicial determinar a retirada, o policial mais antigo deve apresentar informações de segurança e registrar oficialmente o cumprimento.
• A decisão operacional concilia ordem judicial, documentação do risco e preservação da integridade física dos presentes.` },

  { modulo: "3", frente: "Algemas — Escolta de Presos", verso:
`• Na PMPE: POP nº 0033 (algemas na condução/custódia de PMs no CREED) e POP nº 0018 (escoltas, conduções e custódia de presos).
• Escolta é atividade de risco: exige consciência da missão, planejamento, disciplina e observância das normas.
• Viaturas de quatro rodas são prioritárias; motos atuam como apoio.
• Armamento conforme tipo de escolta/nº de presos/veículos: pistola cal. .40, carabina cal. 5.56 mm e, em casos complexos, fuzil cal. 7.62 mm.
⚠ Foco de prova: combinação entre excepcionalidade do uso de algemas, justificativa escrita e responsabilização pelo abuso.` },

  // ───────── MÓD 4 — Local de Crime / Sinistro ─────────
  { modulo: "4", frente: "Local de Crime — Princípios de Segurança", verso:
`• Atendimento exige segurança da equipe, proteção de vítimas, isolamento da área, preservação de vestígios e comunicação aos órgãos competentes.
• A 1ª guarnição deve evitar contaminação do local, restringir circulação de curiosos e preservar elementos úteis à investigação/perícia.
• O isolamento mantém a cena o mais próxima do estado encontrado, permitindo leitura técnica dos vestígios.
• A preservação não é obstáculo ao socorro: havendo vítima com vida, a prioridade é o atendimento.` },

  { modulo: "4", frente: "Local de Crime — Etapas e Providências", verso:
`• Aproximação observando riscos aparentes, autores, armas, aglomeração, trânsito, condições ambientais e necessidade de reforço.
• Colher informações iniciais sem substituir a investigação: testemunhas, horário, situação encontrada e providências adotadas.
⚠ Alterar o local sem necessidade ou sem registro pode comprometer cadeia de custódia, perícia, investigação e responsabilização posterior.` },

  { modulo: "4", frente: "Sinistro de Trânsito — Preservação", verso:
`• A segurança viária e a integridade das pessoas orientam sinalização, isolamento, fluxo de veículos e acionamento dos órgãos competentes.
• Havendo vítima: prioridade é socorro e preservação do máximo de informações (posição, vestígios, veículos, pessoas).
• Sem vítima: a liberação da via é admitida conforme legislação e segurança do tráfego, com documentação adequada.` },

  { modulo: "4", frente: "Sinistro de Trânsito — Registro de Alterações", verso:
`• Toda remoção de pessoa, veículo ou objeto deve ser motivada por segurança, socorro, preservação da vida ou necessidade legalmente autorizada.
• A guarnição registra alterações realizadas, justificativa, horário aproximado, pessoas envolvidas e providências, mantendo rastreabilidade.
⚠ Em prova: compatibilizar preservação de local com dever de socorro, segurança pública e regularidade documental.` },

  // ───────── MÓD 5 — Autoridades ─────────
  { modulo: "5", frente: "Autoridades e Outras Forças — Regras de Decisão", verso:
`• Ocorrências com autoridades militares ou profissionais de outra força exigem postura técnica, respeito institucional, legalidade e comunicação pelos canais competentes.
• A condição funcional do envolvido não elimina registro, preservação, identificação, encaminhamento e dever de observar a cadeia de comando.
• Separar cortesia institucional de privilégio indevido, com foco na natureza jurídica do fato e nos procedimentos aplicáveis.
⚠ Erro frequente: achar que autoridade/integrante de outra força dispensa providência formal — a formalidade é o que protege a ocorrência.` },

  { modulo: "5", frente: "Autoridades e Outras Forças — Procedimento e Encaminhamento", verso:
`• Informar superiores, preservar informações relevantes, identificar todos os envolvidos e orientar encaminhamento conforme competência.
• Havendo fato penal ou disciplinar, a comunicação deve permitir providências da instituição competente, sem exposição desnecessária nem discriminação.
• A documentação registra fato, contexto, providências e responsáveis, sem comentários pessoais ou juízo de valor.` },

  // ───────── MÓD 6 — Morte de Integrante ─────────
  { modulo: "6", frente: "Morte de Integrante — Finalidade do Procedimento", verso:
`• Coordenar a resposta institucional, preservar o local, apoiar familiares e organizar informações oficiais.
• Exige integração entre comando, operações, despacho, assistência social, polícia judiciária militar, monitoramento de viaturas e unidades especializadas.
• A comunicação deve ser controlada e responsável, evitando informações desencontradas, exposição da vítima ou antecipação de dados não confirmados.` },

  { modulo: "6", frente: "Morte de Integrante — Coordenação e Controle", verso:
`• O Gabinete de Controle de Crise e estruturas correlatas centralizam decisões, orientam o efetivo e mantêm o fluxo de informações.
• O Oficial de Operações e o COPOM coordenam o empenho de guarnições, os dados do policial vitimado e a preservação do local.
⚠ A prova cobra a ideia de coordenação institucional: muitas áreas atuam, mas com fluxo de comando e comunicação definido.` },

  { modulo: "6", frente: "Morte de PM — Despacho e Operações", verso:
`• O despachante da área orienta guarnições, levanta dados essenciais, direciona recursos e mantém comunicação com a cadeia operacional.
• O controle de viaturas evita deslocamento desordenado, preserva a segurança do local e reduz risco de tumulto durante a crise.
• A assistência social apoia de forma humanizada (acolhimento e acompanhamento familiar), sem substituir a apuração técnica.` },

  { modulo: "6", frente: "Morte de PM — Órgãos Especializados", verso:
`• A Diretoria de Polícia Judiciária Militar atua quando há repercussão para apuração militar, preservando competência e formalização.
• Recursos aéreos, drones e unidades especializadas apoiam conforme necessidade, dentro do planejamento e coordenação.
• A unidade de origem do policial e unidades especializadas devem ser comunicadas quando houver vínculo funcional direto com o vitimado.` },

  // ───────── MÓD 7 — Grupos Vulneráveis ─────────
  { modulo: "7", frente: "Grupos Vulneráveis — Noção Geral", verso:
`• Demandam atendimento com respeito, proteção de direitos, comunicação adequada e atenção a barreiras físicas, sociais ou psicológicas.
• A vulnerabilidade não retira a autonomia da pessoa: evitar infantilização, exposição pública e decisões sem escuta do envolvido.
• Adaptar linguagem, abordagem e encaminhamento conforme as características da pessoa, preservando dignidade e segurança.` },

  { modulo: "7", frente: "Grupos Vulneráveis — Pessoas com Deficiência e Idosos", verso:
`• PcD podem demandar comunicação acessível, tempo maior de resposta, apoio de acompanhante ou recursos que evitem interpretação equivocada de comportamento.
• Idosos: cautela quanto a saúde, mobilidade, violência patrimonial, abandono, negligência e eventual necessidade de rede de proteção.
⚠ O ponto central não é tratar todos igual, mas garantir igualdade material por adaptação proporcional às necessidades concretas.` },

  { modulo: "7", frente: "Criança e Adolescente", verso:
`• Tratados como sujeitos de direitos, com prioridade de proteção, cuidado na exposição e acionamento da rede competente.
• Diferenciar vítima, testemunha e autor de ato infracional, registrando fatos sem linguagem estigmatizante ou julgamento moral.
• A presença de responsável, conselho tutelar ou órgão adequado deve ser analisada conforme situação, risco e proteção imediata.` },

  { modulo: "7", frente: "Situação de Rua e LGBTTI", verso:
`• Pessoas em situação de rua: abordagem sem preconceito, considerando vulnerabilidades sociais, saúde, documentação, vínculos e acesso a serviços.
• Pessoas LGBTTI: tratamento pelo nome social quando aplicável, respeito à identidade e proteção contra exposição ou constrangimento.
⚠ Prova troca vulnerabilidade por incapacidade: vulnerabilidade aumenta o dever de cuidado, mas não autoriza desrespeito à autonomia.` },

  { modulo: "7", frente: "Saúde Mental — Pessoas com Doenças Mentais", verso:
`• Podem apresentar fala desconexa, agitação, medo ou resistência; reduzir estímulos e buscar apoio de saúde quando necessário.
• Priorizar proteção da vida, comunicação simples, distância segura e encaminhamento adequado, sem criminalizar automaticamente a crise psíquica.
• Registrar condutas observadas e providências, sem diagnósticos improvisados ou termos depreciativos.` },

  { modulo: "7", frente: "Mulheres (Atendimento)", verso:
`• Em ocorrências com mulheres, sobretudo violência doméstica ou sexual: preservar intimidade, evitar revitimização e garantir encaminhamento adequado.
• A palavra da vítima, os sinais de risco e o histórico de violência orientam proteção e registro cuidadoso, sem culpabilização.
⚠ Atendimento a grupo vulnerável combina legalidade, técnica policial e respeito à dignidade — não é favor nem flexibilização informal.` },

  // ───────── MÓD 8 — Armas ─────────
  { modulo: "8", frente: "Estatuto do Desarmamento — Tipificações Penais", verso:
`• Lei nº 10.826/2003. Diferencia posse, porte, comércio e tráfico; armas de uso permitido × restrito.
• POSSE (art. 12): manter a arma em local de guarda (residência/trabalho) sem autorização legal.
• PORTE (art. 14): trazer consigo/transportar a arma em local público ou de acesso ao público.
• Na PMPE: POP nº 0017 — abordagem em 3 categorias: porte sem agressividade iminente, agressão iminente e agressão atual em curso. Documentos: porte e CRAF.
⚠ Posse ≠ porte: muda o núcleo da conduta e a situação fática (guarda × trazer consigo).` },

  { modulo: "8", frente: "Estatuto do Desarmamento — Registro e Encaminhamento", verso:
`• A documentação qualifica arma, munição e acessórios: numeração, calibre, condição aparente, local de encontro e pessoa vinculada.
• A guarnição preserva o objeto, registra as circunstâncias da apreensão e encaminha conforme orientação legal e procedimento institucional.` },

  { modulo: "8", frente: "Arma de Fogo da Corporação — Extravio", verso:
`• Regulamentação na PMPE: Instrução Normativa do Comando Geral nº 612/2024.
• Roubo/furto/extravio: registrar BO e comunicar à autoridade competente em até 3 dias.
• Registro obrigatório no SIGMA (Sistema de Gerenciamento Militar de Armas, do Exército).
• Envolve bem público e risco à segurança coletiva — relevância administrativa, operacional e eventualmente penal.` },

  { modulo: "8", frente: "Arma Branca", verso:
`• Porte sem justa causa em local público = contravenção penal (art. 19 da LCP): prisão simples de 15 dias a 6 meses ou multa.
• Permitido com justa causa (trabalho ou atividade esportiva).
• Seu emprego em crimes (roubo, agressão) é circunstância agravante na dosimetria da pena.
⚠ Não confundir arma de fogo, simulacro e arma branca: cada categoria exige descrição própria e gera consequências jurídicas diferentes.` },

  // ───────── MÓD 9 — Drogas ─────────
  { modulo: "9", frente: "Drogas — Usuário × Traficante (Lei 11.343/2006)", verso:
`• Usuário (art. 28): NÃO é preso — advertência, prestação de serviços à comunidade e comparecimento a cursos educativos.
• Tráfico (art. 33): importar, vender, guardar, transportar, oferecer etc.
• STF (jun/2024): até 40 g de maconha ou 6 plantas fêmeas = presunção (RELATIVA) de uso pessoal; não vale para outras drogas.
⚠ Quantidade isolada não define tráfico — analisa-se o conjunto de circunstâncias (acondicionamento, dinheiro, instrumentos, contexto).` },

  { modulo: "9", frente: "Drogas — Tráfico (art. 33) e Registro", verso:
`• Tráfico (art. 33 da Lei 11.343/2006): pena de reclusão de 5 a 15 anos + 500 a 1.500 dias-multa.
• O BO descreve substância aparente, quantidade, local, acondicionamento, dinheiro, objetos associados e declarações.
• A cadeia de custódia e o encaminhamento adequado fortalecem a prova e reduzem questionamentos sobre origem/integridade do material.` },

  // ───────── MÓD 10 — Poluição Sonora ─────────
  { modulo: "10", frente: "Poluição Sonora — Enquadramento e Agentes", verso:
`• Perturbação do sossego = contravenção (art. 42 da LCP). Poluição sonora com dano à saúde/ambiente = crime ambiental (art. 54 da Lei 9.605/98).
• OMS: som acima de 50 decibéis (dB) pode ser nocivo à saúde.
• Atuação integrada: PM, órgãos municipais, fiscalização ambiental, trânsito e Ministério Público conforme competência.
⚠ Perturbação do sossego protege o descanso; poluição sonora tem potencial de dano à saúde e ao meio ambiente.` },

  { modulo: "10", frente: "Poluição Sonora — Critério de Atuação", verso:
`• A abordagem identifica fonte sonora, horário, local, intensidade percebida, perturbação, equipamento usado e eventual resistência à ordem legal.
• O registro evita conclusões técnicas sem medição quando ela for necessária, descrevendo fatos constatados e providências.
⚠ Poluição sonora não pertence a um único ramo: pode ter reflexos penais, ambientais, municipais e de trânsito.` },

  // ───────── MÓD 11 — Crime/Contravenção ─────────
  { modulo: "11", frente: "Crime, Contravenção e Ambiental — Diferenciação Básica", verso:
`• Crime (teoria tripartida): fato típico + antijurídico + culpável. Princípio da legalidade: art. 1º do CP ("não há crime sem lei anterior que o defina").
• Contravenção penal (Decreto-Lei 3.688/1941 — LCP): infração de menor potencial ofensivo, penas mais brandas.
• Principais infrações p/ a PM: tráfico (art. 33/Lei 11.343/06), furto e roubo (arts. 155 e 157 do CP), homicídio (art. 121), violência doméstica (Lei 11.340/06), crimes de trânsito (Lei 9.503/97 — CTB, ex.: art. 306) e perturbação do sossego.
⚠ Contravenção não é fato irrelevante: é infração penal de menor gravidade, com procedimento próprio.` },

  { modulo: "11", frente: "Crime, Contravenção e Ambiental — Exemplos Cobrados", verso:
`• A apostila destaca: perturbação do sossego, embriaguez em via pública, jogos de azar, vadiagem (em desuso prático), comércio irregular e exibição obscena.
• O policial identifica a conduta concreta antes de escolher o encaminhamento, evitando enquadramento automático pelo incômodo.
⚠ Contravenção não significa fato irrelevante: é infração penal de menor gravidade, com procedimento e resposta compatíveis.` },

  { modulo: "11", frente: "Trânsito, Município e Decibéis — Regras Municipais", verso:
`• Som automotivo, carro de som, interdição de via e equipamento sonoro podem envolver normas de trânsito, autorizações municipais e regras administrativas locais.
• Leis municipais regulam horários, locais, licenças e limites de funcionamento de instrumentos sonoros (áreas residenciais, comerciais ou eventos).
• A atuação considera a competência do órgão fiscalizador e a necessidade de documentar desobediência, perturbação ou risco.` },

  { modulo: "11", frente: "Trânsito, Município e Decibéis — Saúde e Intensidade Sonora", verso:
`• A intensidade de decibéis pode causar estresse, alteração do sono, irritabilidade e danos auditivos conforme a exposição.
• Mesmo sem medição imediata, o registro pode narrar sinais objetivos, reclamações, horário, distância, ambiente e impacto da emissão.
⚠ Não confundir incômodo subjetivo com prova técnica quando a norma exige medição; cada caso demanda o conjunto probatório adequado.` },

  // ───────── MÓD 12 — Escolta e Custódia ─────────
  { modulo: "12", frente: "Escolta e Custódia — Planejamento da Missão", verso:
`• Exigem planejamento, definição de recursos, avaliação do risco, documentação, comunicação e respeito às normas institucionais.
• A equipe deve ter consciência da importância da missão: o deslocamento envolve risco ao preso, aos policiais e a terceiros.
• Viatura, armamento, equipamentos e efetivo compatíveis com tipo de preso, trajeto, distância, destino e risco estimado.` },

  { modulo: "12", frente: "Escolta e Custódia — Documentos e Recebimento", verso:
`• A documentação acompanha a missão: identifica o custodiado, a autoridade requisitante, o destino, as condições do deslocamento e os responsáveis.
• O recebimento do custodiado é conferido com cautela, registrando condições aparentes, pertences, documentação e orientações antes do deslocamento.
⚠ A escolta não começa no deslocamento; começa no planejamento, na conferência documental e na avaliação prévia dos fatores de risco.` },

  { modulo: "12", frente: "Escolta — Início e Deslocamento", verso:
`• No início: confirmar destino, rota planejada, comunicação, condições da viatura e responsabilidades de cada integrante.
• A condução observa segurança, discrição compatível, controle do custodiado, comunicação com a central e prevenção de exposição.
• Qualquer intercorrência é registrada e comunicada — a rastreabilidade é elemento essencial de segurança e responsabilização.` },

  { modulo: "12", frente: "Escolta — Eventos Críticos", verso:
`• Diante de risco elevado, tentativa de emboscada ou alteração relevante: preservar vidas, comunicar a cadeia operacional e buscar apoio.
• O desembarque do preso é organizado para reduzir risco de fuga, agressão, tumulto, exposição indevida ou perda de controle do ambiente.
⚠ A resposta em escolta deve ser proporcional ao risco e subordinada à comunicação e coordenação, não ao improviso individual.` },

  { modulo: "12", frente: "Custódia em Hospitais — Ambiente Hospitalar", verso:
`• Conciliar segurança pública, atendimento de saúde, dignidade do custodiado e funcionamento regular da unidade.
• Manter comunicação com profissionais de saúde e cadeia de comando, respeitando áreas restritas, procedimentos médicos e a vigilância.
• Uso de algemas/contenção: observar excepcionalidade, justificativa, risco concreto e compatibilidade com o atendimento clínico.` },

  { modulo: "12", frente: "Custódia em Hospitais — Registro e Conduta", verso:
`• Registrar entrada, deslocamentos internos relevantes, atendimento, alta, transferência, ocorrências e ordens médicas que afetem a custódia.
• Evitar constrangimento de pacientes e profissionais, com foco em prevenir fuga, resgate, agressão ou exposição indevida.
⚠ O hospital não suspende a responsabilidade pela custódia; apenas adiciona exigências de articulação com a saúde e preservação humanitária.` },

  // ───────── MÓD 13 — Repressão Qualificada ─────────
  { modulo: "13", frente: "Repressão Qualificada — Juntos pela Segurança", verso:
`• Operações norteadas pelo Juntos pela Segurança, com foco em planejamento, integração e uso de informação para reduzir a criminalidade.
• O planejamento estratégico considera inteligência policial, análise criminal, seleção de prioridades e coordenação entre instituições.
• Equipes especializadas atuam conforme a natureza da ocorrência, sempre dentro de coordenação institucional e finalidade pública.
⚠ Repressão qualificada não é ação aleatória: é ação orientada por dados, integração, foco e avaliação posterior.` },

  { modulo: "13", frente: "Repressão Qualificada — Elementos do Modelo", verso:
`• A coordenação interinstitucional combina investigação, policiamento ostensivo, tecnologia, inteligência e apoio de órgãos complementares.
• O uso de tecnologia (monitoramento, drones, bases de dados) apoia o planejamento, a segurança da equipe e a avaliação dos resultados.` },

  { modulo: "13", frente: "Repressão Qualificada — Unidades e Papéis", verso:
`• Polícia Civil: investigação criminal, coleta de provas, identificação de autores e formalização de procedimentos de polícia judiciária.
• Polícia Militar: policiamento ostensivo, preservação da ordem, apoio operacional e ações preventivas ou repressivas compatíveis.
• Unidades especializadas (grupos táticos / operações especiais) acionadas conforme natureza, risco e complexidade.` },

  { modulo: "13", frente: "Repressão Qualificada — Avaliação e Ajuste", verso:
`• Após as operações, a avaliação identifica acertos, falhas, resultados, impactos territoriais e ajustes para futuras ações integradas.
• A abordagem comunitária complementa a repressão quando busca reduzir o medo, recuperar espaços públicos e aproximar Estado e população.
⚠ A lógica do JPS combina repressão, prevenção e avaliação: não basta atuar — é preciso medir, aprender e ajustar.` },

  // ───────── MÓD 14 — Eventos e Multidões ─────────
  { modulo: "14", frente: "Grandes Eventos e Manifestações — Princípios de Atuação", verso:
`• Respeitar direitos humanos, legalidade, proporcionalidade, transparência e controle institucional.
• Manifestações pacíficas: acompanhar com foco na preservação da ordem, proteção dos participantes e garantia do direito de reunião.
• A presença ostensiva transmite segurança, mas deve evitar intimidação indevida ou escalada desnecessária em atos pacíficos.
⚠ A PM protege direitos e ordem pública, não atua para impedir manifestação lícita por discordância do conteúdo.` },

  { modulo: "14", frente: "Grandes Eventos e Manifestações — Planejamento e Comunicação", verso:
`• Sempre que possível, o oficial designado reconhece o local, avalia riscos, planeja o efetivo e estabelece canal com as lideranças do evento.
• Inteligência, distribuição do efetivo no terreno e comunicação com lideranças permitem antecipar riscos e reduzir o emprego de força.` },

  { modulo: "14", frente: "Condutas em Multidões — Ações Possíveis", verso:
`• Presença: usar a presença física e ostensiva para transmitir segurança e prevenir desordens, sem contato coercitivo inicial.
• Acompanhar: manter policiamento visível e ordenado ao longo da movimentação, protegendo participantes, terceiros e patrimônio.
• Conter: manter a multidão em área delimitada quando necessário à segurança, circulação ou preservação de locais sensíveis.
• Negociar: mediar com lideranças, buscando soluções proporcionais antes de medidas mais restritivas.` },

  { modulo: "14", frente: "Condutas em Multidões — Escalonamento", verso:
`• Dissuadir: desestimular atos ilícitos ou violentos, reduzindo a tensão antes da intervenção mais intensa.
• Repelir e dispersar: respostas mais gravosas, quando a massa precisa recuar ou ser desagregada por necessidade concreta.
⚠ O emprego da força deve ser progressivo, proporcional e documentado, especialmente havendo detenção de pessoas ou lesões.` },

  { modulo: "14", frente: "Cancelamento e Força — Cancelamento Técnico", verso:
`• Relaciona-se à inviabilidade de continuidade segura do evento/manifestação diante de risco concreto e fundamentado à ordem pública.
• A decisão considera segurança dos participantes, terceiros, circulação, patrimônio, capacidade de controle e solução menos gravosa.
• A comunicação da decisão deve ser clara, coordenada e registrada, evitando ruídos que ampliem a tensão.` },

  { modulo: "14", frente: "Cancelamento e Força — Emprego da Força", verso:
`• Seguir legalidade, necessidade, proporcionalidade, conveniência e moderação, buscando cessar o risco sem punição informal.
• Detenções podem ocorrer em paralelo às ações de controle, desde que baseadas em conduta individualizada e encaminhadas ao órgão competente.
⚠ Arma de fogo em manifestação é medida extrema, vinculada a risco grave — não é instrumento ordinário de controle de multidões.` },

  // ───────── MÓD 15 — Alta Complexidade ─────────
  { modulo: "15", frente: "Alta Complexidade — Ocorrências Abrangidas", verso:
`• Envolve assalto a carro-forte, instituições financeiras, grandes centros comerciais, rebeliões, reféns e vítimas gravemente feridas ou letais.
• Exigem comando definido, comunicação, contenção de riscos, apoio especializado e nível de resposta compatível com a gravidade.
• Primeiro dever: confirmar informações essenciais, proteger vidas, evitar exposição de curiosos e comunicar a cadeia operacional.
⚠ Alta complexidade não é improviso heroico: é cenário que exige coordenação, isolamento, informação e especialistas.` },

  { modulo: "15", frente: "Alta Complexidade — Assalto a Carro-Forte", verso:
`• Costumam envolver planejamento prévio, violência, armamento, bloqueios e danos materiais significativos.
• A resposta prioriza segurança da população, coleta de informações, preservação de vestígios e acionamento dos recursos adequados.` },

  { modulo: "15", frente: "Banco e Comércio — Instituições Financeiras", verso:
`• Em assalto a agência/instituição financeira, COPOM e equipes organizam informação, empenho de recursos e comunicação com unidades competentes.
• A 1ª equipe confirma natureza da ocorrência, localização, vítimas, reféns, autores, fuga ou permanência no interior.
• Evitar entrada precipitada, preservar vidas, isolar a área, orientar curiosos e permitir atuação de equipe especializada.` },

  { modulo: "15", frente: "Banco e Comércio — Criminosos em Fuga ou Homiziados", verso:
`• Havendo fuga, repassar informações de forma rápida e organizada para orientar buscas, bloqueios institucionais e apoio aéreo quando cabível.
• Autores homiziados aproximam a situação de crise: contenção, comunicação, negociação e alternativas táticas conforme a doutrina competente.
⚠ Nível de resposta compatível: nem toda equipe deve executar tudo; cada cenário exige função e limite institucional.` },

  { modulo: "15", frente: "Rebeliões em Presídios", verso:
`• Exigem articulação entre segurança pública, administração prisional, saúde, comando de crise e preservação de vidas.
• A resposta considera contenção externa, informação qualificada, comunicação institucional e prevenção de ampliação para áreas vizinhas.
• Prioridade: impedir o agravamento, proteger reféns/feridos e permitir atuação coordenada dos órgãos responsáveis pelo ambiente prisional.` },

  { modulo: "15", frente: "Reféns e Vítimas Graves", verso:
`• Reféns: isolamento, controle de perímetro, redução de estímulos, coleta de informações e acionamento de equipe especializada.
• Vítimas gravemente feridas/letais: compatibilizar socorro, preservação do local, segurança das equipes de saúde e registro das alterações.
⚠ O foco doutrinário é preservar vidas e coordenar a crise; a atuação individual isolada pode aumentar o risco e comprometer a operação.` },

  { modulo: "15", frente: "Cadeia de Decisão e Crise — Medidas Imediatas", verso:
`• Identificar o tipo de ocorrência, acionar recursos adequados, isolar o local, proteger terceiros e manter fluxo de informação confiável.
• A comunicação com COPOM, comando e órgãos especializados deve ser objetiva: dados confirmados, dúvidas relevantes e necessidades de apoio.
• A classificação do nível da ocorrência orienta quais recursos empregar e quais ações evitar na fase inicial.` },

  { modulo: "15", frente: "Cadeia de Decisão e Crise — Alternativas Táticas", verso:
`• A doutrina de gerenciamento de crise organiza: negociação, contenção, observação, intervenção especializada e solução proporcional ao risco.
• O policial que chega primeiro tem papel fundamental de informação e segurança, mas não substitui a equipe especializada quando a crise exigir.
⚠ Em prova, a resposta certa privilegia contenção, informação e acionamento especializado antes da intervenção direta em cenário crítico.` },

  // ───────── REVISÃO FINAL ─────────
  { modulo: "Revisão", frente: "Revisão — Módulos 1 a 8", verso:
`1. BOEPM: veracidade, imparcialidade, dever de registro; responsabilidade administrativa, penal e civil pelo preenchimento incorreto.
2. Aplicativo: login Expresso/SEI; boletim em andamento impede novo BO; dados complementares obrigatórios; erro "suporte" não perde registro.
3. Algemas: uso excepcional (resistência, receio de fuga ou risco à integridade), sempre com justificativa escrita.
4. Local de crime: preservar vestígios, isolar área, registrar alterações; compatibilizar preservação com socorro e segurança.
5. Autoridades: condição funcional não dispensa registro formal, comunicação institucional e encaminhamento conforme competência.
6. Morte de PM: fluxo coordenado, comunicação controlada, assistência social, polícia judiciária militar e controle operacional.
7. Vulneráveis: adaptar abordagem sem retirar autonomia, com respeito à dignidade, proteção e rede competente.
8. Armas: diferenciar posse, porte, arma institucional, extravio e arma branca conforme contexto e descrição formal.` },

  { modulo: "Revisão", frente: "Revisão — Módulos 9 a 15", verso:
`9. Drogas: usuário e traficante diferem pelo conjunto de circunstâncias, não apenas pela quantidade isolada.
10. Poluição sonora: atuação pode envolver esfera penal, ambiental, municipal, trânsito e fiscalização técnica.
11. Crimes e contravenções: distinguir crime, contravenção, crime ambiental, trânsito, regras municipais e efeitos à saúde.
12. Escolta: planejamento, documentação, custódia, comunicação e avaliação de risco estruturam a missão.
13. Repressão qualificada: ação integrada, orientada por inteligência, tecnologia, avaliação e foco no crime organizado.
14. Eventos: proteger manifestação lícita, negociar, conter proporcionalmente e documentar o emprego de força.
15. Alta complexidade: confirmar informação, isolar, preservar vidas, acionar especialistas e evitar improviso individual.` },

  { modulo: "Revisão", frente: "Revisão — Afirmações Verdadeiras", verso:
`• (V) O BOEPM pode servir como prova judicial e deve ser preenchido com informações precisas, verídicas e imparciais.
• (V) O uso de algemas exige resistência, fundado receio de fuga ou risco à integridade física, com justificativa escrita.
• (V) Dados complementares no BOEPM são obrigatórios e consistem no relato da ocorrência pelo usuário.
• (V) A avaliação de uma operação permite identificar acertos, falhas, resultados e ajustes para ações futuras.
• (V) Em manifestações pacíficas, a atuação policial deve proteger direitos, preservar a ordem e priorizar a negociação.` },

  { modulo: "Revisão", frente: "Revisão — Afirmações Falsas (Correções)", verso:
`• (F) "BO falso sempre é denunciação caluniosa." → Denunciação exige intenção específica de incriminar alguém injustamente.
• (F) "O modus operandi é obrigatório em todas as ocorrências." → A apostila informa que esse campo não é obrigatório.
• (F) "Algemas podem ser usadas por rotina em qualquer preso." → O uso é excepcional e deve ser justificado.
• (F) "Quantidade de droga, sozinha, sempre define tráfico." → O enquadramento depende do conjunto das circunstâncias.
• (F) "Em crise complexa, a primeira equipe deve resolver tudo." → Deve confirmar, isolar, informar e acionar apoio especializado.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  // limpa cards antigos (inclui os renomeados na revisão) para reinserir o conjunto atual
  const del = await prisma.flashcard.deleteMany({ where: { materia: MATERIA } })
  console.log(`Flashcards PO antigos removidos: ${del.count}`)

  let n = 0
  for (const c of CARDS) {
    const hash = createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex")
    await prisma.flashcard.upsert({
      where: { hash },
      update: { verso: c.verso, ordem: n },
      create: { materia: MATERIA, modulo: c.modulo, frente: c.frente, verso: c.verso, ordem: n, hash },
    })
    n++
  }
  console.log(`✓ ${n} flashcards de ${MATERIA} importados/atualizados.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
