import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "PO"
const TITULO = "Memento Completo — Procedimento em Ocorrências"

const MD = `# 1. Procedimento Operacional Padrão (POP)
- **POP:** conjunto de normas técnicas e diretrizes que orientam a execução de atividades específicas da atuação policial.
- **Objetivo:** uniformizar o comportamento dos policiais militares, garantindo ações **seguras, eficientes, legais e padronizadas**, independentemente da unidade ou do agente.
- Importância **estratégica, tática, jurídica e institucional** — pilar da legalidade, eficiência, segurança e transparência.

---

# 2. Boletim de Ocorrência Eletrônico (BOEPM)
O BOEPM documenta crime ou incidente, permite investigação, viabiliza processamento e **serve como prova** em juízo.

## Esferas de responsabilidade
- **Administrativa:** dever de registro, veracidade e imparcialidade (sem opiniões/preconceitos).
- **Penal:** preenchimento falso/inexato pode configurar **falsidade ideológica (art. 299 do CP)** ou **denunciação caluniosa** (quando há intenção de incriminar alguém).
- **Civil:** dever de cuidado; conduta dolosa/negligente que cause dano material ou moral gera dever de reparação.

> ⚠ Todo BO falso pode indicar falsidade, mas a **denunciação caluniosa** exige a intenção específica de incriminar pessoa inocente.

> 🔑 Sigilo: a divulgação não autorizada da apostila/documentos pode gerar responsabilização criminal (arts. 166 e 324 do **Código Penal Militar**) e administrativa (RDPMPE).

---

# 3. Preenchimento do BOEPM — Geração 2
- Aplicativo desenvolvido pela **GTI da SDS**; gera BO com o mesmo teor do de papel, com velocidade e integração.
- **Login** com usuário e senha do **Expresso/SEI**; roda em smartphones comuns.
- **Cadastro:** prefixo da viatura → matrícula e nome do efetivo. **Não é possível criar novo BO havendo um em andamento** (concluir, continuar ou excluir).
- **Campos do envolvido:** suspeito, vítima, autor/agente, testemunha ou outros; descrição física; lista de usos de força; editar/excluir envolvido.
- **Modus operandi:** **não é obrigatório** (cada ocorrência tem condições próprias).
- **Objetos:** descrever, vincular a envolvido e fotografar (quando arma ou droga).
- **Dados complementares:** campo **obrigatório** — relato da ocorrência (digitado ou ditado por voz).
- **Finalização:** status INCOMPLETO → PRONTO; informar se concluído no local ou encaminhado à delegacia.

> ⚠ A mensagem **"CONTATE O SUPORTE"** não significa perda do BO — ele vai ao banco de erros para tratamento e restabelecimento.

---

# 4. Emprego de Algemas — Súmula Vinculante 11 do STF
- O uso de algemas é **excepcional**, permitido só em 3 hipóteses: **resistência**, **fundado receio de fuga** ou **perigo à integridade física** (do preso, de terceiros ou dos agentes).
- Deve ser **justificado por escrito**, sob pena de **nulidade** do ato e de responsabilização disciplinar, civil e penal.
- **Vedação:** algemas em mulheres grávidas no trabalho de parto, no trajeto e no puerpério/hospitalização.
- Fundamentos: dignidade humana, vedação a tratamento degradante, presunção de inocência e tratados de direitos humanos (Pacto de São José da Costa Rica).
- Na PMPE: **POP nº 0033** (uso de algemas na condução/custódia de PMs no CREED) e **POP nº 0018** (escoltas, conduções e custódia de presos).

> ⚠ Se a autoridade judicial mandar retirar as algemas, o **policial mais antigo** apresenta o histórico do preso e **registra oficialmente** o cumprimento da ordem.

---

# 5. Local de Crime — Princípios, Aproximação e Preservação
- **Isolamento ≠ Preservação:** isolamento é a **delimitação física** da área; preservação engloba **todas** as medidas para manter a integridade dos vestígios (inclui o isolamento, proteção contra intempéries, não manipulação).
- A 1ª guarnição delimita a área (fitas, cones, barreiras), controla o acesso (curiosos, imprensa) e preserva vestígios para a perícia.
- A preservação **não obsta o socorro**: havendo vítima com vida, a prioridade é o atendimento (registrando as alterações).

## Sinistro de trânsito
- Com vítima: prioridade é socorro + preservação do máximo de informações. Sem vítima: liberação da via conforme legislação e segurança, com documentação.
- Toda **remoção** de pessoa/veículo/objeto deve ser motivada (segurança, socorro, vida ou previsão legal) e registrada.

> ⚠ Alterar o local sem necessidade ou sem registro compromete a **cadeia de custódia**, a perícia e a responsabilização.

---

# 6. Ocorrências com Autoridades Militares e Outras Forças
- Exigem postura técnica, respeito institucional, legalidade e comunicação pelos canais competentes.
- A **condição funcional não dispensa** registro, preservação, identificação e encaminhamento conforme a competência.
- Separar **cortesia institucional de privilégio indevido** — foco na natureza jurídica do fato.

> ⚠ A formalidade é justamente o que protege a ocorrência — não a dispensa.

---

# 7. Morte de Integrante da Corporação em Serviço
Procedimento coordenado para preservar o local, apoiar familiares e organizar informações oficiais. Atores:
- **Gabinete de Controle de Crise (CGC/DPO):** centraliza decisões.
- **Oficial de Operações** e **despachante do COPOM:** coordenam o empenho de guarnições e a preservação do local.
- **Diretoria de Assistência Social:** apoio humanizado e acompanhamento familiar.
- **Diretoria de Polícia Judiciária Militar (PJM):** apuração militar.
- **Monitoramento de viaturas, Grupamento Tático Aéreo, drones/PMPE e unidades especializadas da DIRESP:** apoio conforme necessidade.

> ⚠ A comunicação deve ser controlada — evitar dados não confirmados, informações desencontradas e exposição da vítima.

---

# 8. Grupos Vulneráveis
Atendimento com respeito, proteção de direitos e adaptação, **sem retirar a autonomia** da pessoa.
- **Pessoas com deficiência:** comunicação acessível, mais tempo de resposta, apoio de acompanhante.
- **Idosos:** atenção à saúde, mobilidade, violência patrimonial, abandono e negligência.
- **Crianças e adolescentes:** sujeitos de direitos; diferenciar vítima/testemunha/autor de ato infracional; acionar conselho tutelar/rede.
- **Pessoas em situação de rua:** abordagem sem preconceito, atenção a saúde, documentação e vínculos.
- **Pessoas LGBTTI:** tratamento pelo **nome social**, respeito à identidade, proteção contra exposição.
- **Pessoas com doenças mentais:** reduzir estímulos, comunicação simples, apoio de saúde — sem criminalizar a crise.
- **Mulheres:** preservar intimidade, evitar revitimização; **Lei nº 11.340/2006 (Maria da Penha)**, Delegacias da Mulher e Patrulha Maria da Penha.

> ⚠ O ponto central é a **igualdade material**: adaptação proporcional às necessidades, não tratamento idêntico.

---

# 9. Estatuto do Desarmamento (Lei nº 10.826/2003)
- **Posse (art. 12):** manter a arma em local de guarda (residência/trabalho) **sem autorização legal**.
- **Porte (art. 14):** **trazer consigo/transportar** a arma em local público ou de acesso ao público.
- Diferencia ainda comércio e tráfico, e armas de uso permitido × restrito.
- Na PMPE: **POP nº 0017** padroniza a abordagem a suspeito armado em 3 categorias: **porte sem agressividade iminente**, **agressão iminente** e **agressão atual em curso**. Documentos: porte e **CRAF** (Certificado de Registro de Arma de Fogo).

## Arma da corporação e extravio
- Roubo/furto/extravio: registrar BO e **comunicar à autoridade competente em até 3 dias**; registro no **SIGMA** (Exército).

## Arma branca
- Porte sem justa causa em local público = **contravenção (art. 19 da LCP)**, prisão simples de **15 dias a 6 meses** ou multa (permitido com justa causa — trabalho/esporte).
- Seu emprego em crimes (roubo, agressão) é **agravante** na dosimetria.

> ⚠ **Posse ≠ porte:** muda o núcleo da conduta e a situação fática (local de guarda × trazer consigo).

---

# 10. Drogas — Traficante × Usuário (Lei nº 11.343/2006)
- **Tráfico (art. 33):** importar, vender, guardar, transportar, oferecer etc. **Pena: reclusão de 5 a 15 anos + 500 a 1.500 dias-multa.**
- **Usuário (art. 28):** **não é preso**; medidas de advertência, prestação de serviços à comunidade e comparecimento a cursos educativos.
- **STF (jun/2024):** portar até **40 g de maconha** ou cultivar **6 plantas fêmeas** gera **presunção (relativa) de uso pessoal** — não se aplica a outras drogas; outros indícios podem caracterizar tráfico mesmo com quantidade menor.

> ⚠ Quantidade isolada **não define** tráfico — analisa-se o conjunto de circunstâncias (acondicionamento, dinheiro, instrumentos, contexto).

---

# 11. Poluição Sonora — Agentes e Enquadramento
- Pode ser **contravenção** (perturbação do sossego — **art. 42 da LCP**) ou **crime ambiental** (**art. 54 da Lei nº 9.605/98**) quando causa dano à saúde/meio ambiente.
- **OMS:** som acima de **50 decibéis (dB)** pode ser nocivo à saúde.
- Atuação integrada: PM, órgãos municipais, fiscalização ambiental, trânsito e Ministério Público conforme competência.

> ⚠ **Perturbação do sossego** protege o descanso/tranquilidade; **poluição sonora** tem potencial de **dano à saúde e ao ambiente**.

---

# 12. Crime, Contravenção, Ambiental e Trânsito
- **Crime (teoria tripartida):** fato **típico** + **antijurídico** + **culpável**.
- **Princípio da legalidade (art. 1º do CP):** "não há crime sem lei anterior que o defina".
- **Contravenção penal (Decreto-Lei nº 3.688/1941 — LCP):** infração de **menor potencial ofensivo**, penas mais brandas.
- Principais infrações enfrentadas pela PM: tráfico (art. 33/Lei 11.343/06), **furto e roubo (arts. 155 e 157 do CP)**, **homicídio (art. 121 do CP)**, violência doméstica (Lei 11.340/06), **crimes de trânsito (Lei 9.503/97 — CTB, ex.: art. 306, embriaguez ao volante)** e perturbação do sossego.

> ⚠ Contravenção **não** é fato irrelevante: é infração penal de menor gravidade, com procedimento próprio.

---

# 13. Escolta e Custódia de Presos
- **Planejamento:** definir recursos, avaliar risco, conhecer antecedentes, definir itinerário (mais curto/fluido), rotas alternativas; em escoltas diárias, **variar percursos**; evitar locais ermos.
- **Viaturas:** prioritariamente de **4 rodas**; motos só como apoio; abastecidas e com plano de reabastecimento.
- **Armamento:** conforme tipo de escolta/nº de presos/veículos — pistola **cal. .40**, carabina **cal. 5.56 mm** e, em casos complexos, fuzil **cal. 7.62 mm**.
- **Recebimento:** identificar o escoltado, inspeção visual de saúde/integridade, busca pessoal e **algemação** (proibido algemar em peças da viatura).
- **Início:** comunicar **CIODS/COPOM** os dados e o início; canal de rádio específico; em escoltas de alto risco, comunicação **a cada 30 minutos**.
- **Emboscada:** manter o deslocamento, buscar abrigo, acionar o CIODS e pedir apoio.
- **Desembarque:** busca **360°**, viatura abrigada (de ré para o prédio, frente para rota de fuga); um escoltado por vez, ~1 m de distância, **2 policiais por escoltado**.
- **Custódia em hospital:** no mínimo **2 PMs**; sem aproximação de terceiros; permanece algemado, salvo necessidade extrema/solicitação médica; acompanhar todos os deslocamentos internos.

---

# 14. Repressão Qualificada (Juntos pela Segurança)
- Operações norteadas pelo **Juntos pela Segurança**, com planejamento, integração e uso de informação/inteligência para reduzir a criminalidade.
- **Polícia Civil:** investigação e polícia judiciária. **Polícia Militar:** policiamento ostensivo e preservação da ordem. **Unidades especializadas:** conforme natureza/risco.
- Após as ações, **avaliação** identifica acertos, falhas e ajustes; a abordagem comunitária complementa a repressão.

> ⚠ Repressão qualificada não é ação aleatória — é orientada por dados, integração, foco e avaliação posterior.

---

# 15. Grandes Eventos e Manifestações
- Atuação com respeito a **direitos humanos, legalidade, proporcionalidade e transparência**.
- Manifestações pacíficas: proteger o direito de reunião, preservar a ordem e **priorizar a negociação**; presença ostensiva sem intimidação indevida.
- **Cancelamento técnico:** diante de risco concreto à ordem pública, com decisão clara, coordenada e registrada.
- **Emprego da força:** legalidade, necessidade, proporcionalidade e moderação; detenções por conduta individualizada.

> ⚠ A PM protege a manifestação **lícita** — não atua para impedi-la por discordância do conteúdo. Arma de fogo é medida extrema, não instrumento ordinário de controle de multidões.

---

# 16. Alta Complexidade
Assalto a carro-forte, instituições financeiras e grandes centros comerciais, rebeliões em presídios e tomada de reféns.
- **Primeiro dever:** confirmar informações, **isolar** a área, proteger vidas, conter o perímetro, evitar exposição de curiosos e comunicar imediatamente a cadeia operacional (COPOM).
- **Não** entrar precipitadamente — permitir a atuação de **equipe especializada**; armamento letal restrito à proteção da vida.
- **Reféns:** isolar, conter, reduzir estímulos, **negociar** e acionar equipe especializada; existe **POP de primeira intervenção**, sendo o **CEC** o "causador do evento crítico".

> ⚠ Nível de resposta compatível: nem toda equipe executa tudo — cada cenário exige função e limite institucional. A atuação isolada aumenta o risco.`

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)
  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento de ${MATERIA} salvo (${MD.length} caracteres).`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
