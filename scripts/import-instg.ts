import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "IG" // Instrução Geral (sigla atualizada — antes INSTG)
const TITULO = "Memento Completo — Instrução Geral (Cerimonial Militar)"

const MD = `# Módulo 1 — Continência Individual e Sinais de Respeito

> **Base normativa:** Portaria GM-MD nº 1.143, de 3 de março de 2022 (Regulamento de Continências, Honras, Sinais de Respeito e Cerimonial Militar das Forças Armadas); R-1/RISG (Exército); Vade-Mécuns de Cerimonial Militar (EB10-VM-12.xxx); Lei 14.751/2023 (LON das PM/CBM); Estatuto dos Militares de PE; SUNOR nº 20/2022 (Manual Básico de Comunicação Social da PMPE).

## Como o militar deve tratar os demais (art. 3º)
- **Superiores:** com respeito e consideração (tributo à autoridade).
- **Pares:** com afeição e camaradagem.
- **Subordinados:** com bondade, dignidade e urbanidade.
- **§2º:** as demonstrações de respeito devidas entre membros das Forças Armadas **também** o são aos integrantes das **PM, CBM e militares de Nações Estrangeiras** → reciprocidade obrigatória.

## Sinais de respeito × continência
- **Os sinais de respeito são obrigatórios em TODAS as situações** (art. 4º, §3º).
- A **continência**, porém, **pode** ser dispensada conforme a situação. Não confundir: continência é só **uma** das formas de sinal de respeito.
- **Deslocamento de 2 militares:** o de menor antiguidade dá a **direita** ao superior (em via com lado interno/externo, dá o lado interno).
- **Deslocamento em grupo (3 ou +):** o mais antigo fica no **centro**, distribuindo-se os demais alternadamente à direita e à esquerda.
- Porta: o mais moderno franqueia/abre a porta ao superior. Melhor lugar: cede-se ao mais antigo.

## Tratamento verbal
- A um superior, emprega-se sempre **"Senhor"/"Senhora"**. O termo **"COMANDO"** é gíria e **não** é sinal de respeito (art. 9º).
- Oficial-general: "Vossa Excelência", "Senhor Almirante/General/Brigadeiro" (admite-se "Almirante/General/Brigadeiro" nas relações de serviço).

## A continência (saudação)
- Saudação militar de origem medieval (cavaleiros levantavam a viseira do elmo). Hoje é **impessoal**: homenageia a **autoridade/função**, não a pessoa.
- Todo militar (ativa ou inatividade) deve **retribuir** a continência que lhe é prestada.
- **Uniformizado** (qualquer uniforme): é **obrigado** a prestar o gesto. **Em trajes civis:** pode respondê-la prestando a continência individual ou cumprimento verbal.
- **Devida a qualquer hora** do dia ou da noite.

## Elementos da continência individual
1. **Atitude** — postura marcial e comportamento respeitoso.
2. **Gesto** — movimento do corpo, braços e mãos (com ou sem armas).
3. **Duração** — tempo em que se mantém a atitude e o gesto.

## Gesto conforme o armamento
- **Desarmado / pistola / revólver / espada embainhada:** gesto da mão (mão no prolongamento do antebraço, palma para baixo/voltada ao rosto conforme o caso, braço ~horizontal, ângulo de 90° com a linha dos ombros).
- **Espada desembainhada:** 1º sentido; 2º perfila a espada (**ombro-arma**); para símbolos/autoridades dos incisos I a VIII e XII do art. 16 e oficiais-generais → **abate a espada (apresentar-arma)**.
  - Para o **Comandante-Geral da PMPE**: por norma interna (honras de Of-General a todos os Cmt de PM/CBM), faz-se **apresentar-arma (abater espada)**.
- **Arma longa a tiracolo / bandoleira / "pronto baixo":** toma **posição de sentido**, frente perpendicular à direção do deslocamento do superior (NÃO ergue a mão).

## Procedimento na continência individual (alternativa "incorreta" clássica)
- Feita quando o superior atinge **3 passos** do mais moderno e desfeita quando o superior **ultrapassa 1 passo**.
- Posição de sentido, frente perpendicular ao deslocamento; olhar franco voltado ao superior; desfaz baixando a mão em movimento enérgico.

## Continência à Bandeira / Hino
- Todo militar faz **alto** para prestar continência à Bandeira Nacional.
- Em viatura, na cerimônia da Bandeira/Hino: condutor e passageiro **saltam** do veículo e fazem continência individual (sempre que viável).

---

# Módulo 2 — Apresentação Individual e Continência da Tropa

## Apresentação individual
1. Aproxima-se até a distância do **aperto de mão**.
2. Posição de **sentido** + continência; diz grau hierárquico, **nome de guerra** e OM (ou função, se na própria OM).
3. Desfaz a continência e diz o **motivo**, permanecendo em sentido até autorização de "Descansar"/"À Vontade".
- Para retirar-se: faz continência idêntica e pede permissão. A **praça**, após "Meia Volta", rompe a marcha com o **pé esquerdo**.

## Continência da tropa — definição
- **Tropa (p/ continência):** reunião de **dois ou mais** militares **devidamente comandados** → efetivo mínimo prático = **3** (comandante + 2). São 4 modalidades: a **pé firme**, em **deslocamento**, em **desfile** e da **guarda**.

## Tropa a pé firme (à passagem de outra tropa)
- A tropa em forma volta-se e toma **sentido**.
- Mesmo posto e tropa que passa **não** conduz Bandeira → **só os Comandantes** fazem continência.
- Se a tropa que passa conduz Bandeira **ou** seu Cmt é superior:
  - oficial subalterno/intermediário → **"Sentido!"**
  - oficial-superior → **"Sentido! Ombro Arma!"**
  - oficiais-generais / incisos I a VIII do art. 16 → **"Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!"**
- **Tropa desarmada:** ao "Apresentar Arma!" todos fazem continência individual; desfazem ao "Descansar Arma!".

## Continência entre tropas (art. 58)
- Nenhuma conduz Bandeira → inicia a de **menor** hierarquia (iguais: ambas).
- Apenas uma conduz Bandeira → continência **à Bandeira**, independente da hierarquia.
- Ambas conduzem Bandeira → continência por ambas.

## Tropa em instrução / sala de aula
- Em instrução, faxina etc., as continências de tropa são **dispensáveis** (cabe ao Cmt/instrutor prestá-la ao superior que chega).
- Tropa reunida (instrução/preleção) + chega autoridade superior: "**Companhia... Sentido! Comandante da Companhia!**" → todos se levantam; após correspondido, "**À vontade!**".
- OM de **ensino**: o procedimento dos alunos em sala fica em **aberto** para instruções internas específicas.

## Continência da guarda
- A guarda em forma presta continência aos símbolos/autoridades (incisos I a X, XII e XIII do art. 16), oficiais-generais, oficiais superiores, ao Cmt/Ch/Dir da OM, e à guarda que venha rendê-la.
- Presta no momento da **entrada e da saída** da autoridade da OME.

---

# Módulo 3 — Culto à Bandeira e Hasteamento

## Dia da Bandeira — 19 de novembro
Cerimonial nas OM:
1. **Hasteamento** da Bandeira Nacional, em ato solene **às 12 horas (doze horas)**;
2. **Canto do Hino à Bandeira** e, se for o caso, **incineração** de Bandeiras inservíveis;
3. **Desfile** em continência à Bandeira Nacional.

## Incineração de Bandeiras inservíveis
- Pira/recipiente de metal próximo ao mastro; leitura da **Ordem do Dia**; uma **praça antiga e de ótimo comportamento** ateia fogo às Bandeiras embebidas em álcool; segue o **Hino à Bandeira** com a tropa em sentido.
- As **cinzas** são depositadas em caixa e **enterradas** em local apropriado (ou lançadas ao mar).

## Hasteamento com maior gala (datas)
7/set (Independência); 15/nov (Proclamação da República); 1º/jan (Fraternidade Universal); 21/abr (Inconfidência Mineira); 1º/mai (Trabalhador); 12/out (Padroeira do Brasil); 25/dez (Natal); aniversário da OM.

## Luto oficial / meio-mastro
- No hasteamento em **luto**, a Bandeira sobe **primeiro ao topo** do mastro e **depois desce a meio-mastro**.
- Na **arriação**, sobe novamente **ao topo** e só então **desce** definitivamente.
- O **Pavilhão Nacional** fica **acima** de todas as demais bandeiras.

---

# Módulo 4 — Bandeiras-insígnias e Honras de Recepção e Despedida

## Bandeiras-insígnias / distintivos
- Hasteados quando a autoridade **entra** na OM; arriados logo após sua **saída**.
- No hasteamento/arriação da Bandeira Nacional, a insígnia deve ser **arriada** e re-hasteada após.
- **Nenhuma** bandeira/insígnia pode ficar **acima** da Bandeira Nacional no mesmo mastro.
- Vários OM no mesmo edifício → hasteia-se só a insígnia da **mais alta autoridade** presente.

## Honras de Recepção e Despedida (Vade-Mécum EB10-VM-12.003, 2ª ed./2022)
- São prestadas às autoridades do art. 101, ao **chegar/sair** da OM e em visitas/inspeções.
- **Visita sem aviso prévio:** NÃO altera a rotina da OM. Ao ser informado, o Cmt/Ch/Dir vai ao encontro, apresenta-se e a acompanha.
- **Visita programada:** a autoridade indica finalidade, local e hora; é recebida pelo Cmt/Dir/Ch + oficial de serviço.
- **Guarda do quartel:** forma em **uma fileira**, no interior do quartel após o portão, com efetivo **igual ou maior que 6 (seis) soldados**, dando a direita para a direção de onde vem a autoridade.
- Posicionamento: Cmt a **3 passos** do último soldado; Of Dia a 1 passo à esquerda e 1 à retaguarda (ou à direita, se houver Adj Cmdo).
- Despedida: a autoridade despede-se do oficial **mais moderno para o mais antigo**.

---

# Módulo 5 — Guarda-Bandeira (Vade-Mécum EB10-VM-12.004, 2ª ed./2022)

- **Missão:** transportar e proteger o Pavilhão Nacional e os Estandartes.
- Em **instruções/treinamentos** usa-se **estandarte**, nunca a Bandeira Nacional.
- Cada OM possui **no mínimo 2** exemplares da Bandeira Nacional (uma no mastro; outra em formaturas/desfiles, guardada em armário envidraçado no gabinete do Cmt).
- **Composição:** Porta-Bandeira + Porta-Estandarte (se houver) + **5 ou 6 guardas** (2 cabos + soldados). Porta-Bandeira escolhido entre **oficiais/aspirantes mais modernos**.
- **Armamento:** oficiais Porta-Bandeira → pistola e espada; sargentos Porta-Estandarte → pistola; demais → fuzil com baioneta armada.
- **Cadência da Guarda-Bandeira ao marchar: 100 passos/minuto.**
- A Bandeira é **desfraldada** quando a tropa faz "Apresentar-Arma" e, em marcha, no "Olhar à Direita". **Em passagem de comando em recinto coberto, a Bandeira NÃO é desfraldada.**
- Músicas: Alvorada de "Lo Schiavo" (espera) e "Canção do Expedicionário" (marcha, com "Marcar-Passo"); Hino Nacional para continência.
- Só o **Porta-Bandeira** e o **Porta-Estandarte** executam "Apresentar-Arma" (a Guarda faz Sentido/Descansar/Ombro-Arma/Descansar-Arma/Ordinário-Marche).
- Desfile: distância de **10 passos** da fração que antecede e da que sucede. Balizas: branca (30 m), azul (20 m), vermelha (10 m).

---

# Módulo 6 — Compromisso e Promoção ao Primeiro Posto

- Todo militar nomeado ao primeiro posto presta o **compromisso de oficial**; cerimônia presidida pelo **Cmt da OM** ou pela mais alta autoridade militar presente.
- **Estatuto dos Militares de PE:** compromisso é solene, prestado na presença de tropa.
- **Compromisso ao 1º posto (dizeres):** *"Perante a Bandeira do Brasil e pela minha honra prometo cumprir os deveres de oficial da Polícia Militar do Estado de Pernambuco e dedicar-me ao seu serviço."*
- Cerimonial: tropa armada e equipada; Bandeira Nacional à frente (20 passos do centro); compromitentes desembainham e **perfilam** espadas; após "apresentar arma", **olhos fitos na Bandeira**, **abatem espadas** e prestam o compromisso em voz alta e pausada.
- Se o oficial servir em Estabelecimento/Repartição → prestado no **gabinete do diretor/chefe**, assistido por todos os oficiais que ali servem.
- O compromisso de **declaração** a Guarda-Marinha e Aspirante-a-Oficial é prestado nas **Escolas de Formação**.

---

# Módulo 7 — Solenidades e Passagem de Comando

## Roteiro básico da solenidade — 12 pontos (SUNOR nº 20/2022)
1. Chegada da Autoridade; 2. Honras Militares (à maior autoridade civil ou militar presente); 3. Formalidades Militares (pedir permissão para iniciar/encerrar à autoridade de maior precedência); 4. Composição do Dispositivo de Honra (da maior para a menor); 5. Hino Nacional/de PE (só após todas as autoridades ocuparem seus lugares); 6. Leitura do objetivo (breve histórico); 7. Homenagens/apresentações culturais/condecorações; 8. Pronunciamentos (**da menor para a maior** autoridade); 9. Canção da PMPE; 10. Autorização para encerrar; 11. Saída da autoridade com honras; 12. Encerramento.
- **Honras militares** são prestadas só à **maior autoridade** presente. Maior precedência **não** significa direito às honras militares.

## Passagem de comando × transmissão do cargo
- **Passagem de comando** é a cerimônia completa; a **transmissão do cargo** é apenas **um dos eventos** dela.
- **Dois boletins** na data: o normal (último do Cmt sucedido, com a exoneração e as palavras de despedida) e um **especial** (primeiro do Cmt sucessor, com a nomeação).
- O evento de transmissão do cargo é conduzido pela **autoridade imediatamente superior** na cadeia de comando.
- Cmt sucedido e sucessor + autoridade formam um **triângulo isósceles** (3 m). Os dois Cmt **abatem** as espadas (voltados um para o outro); a autoridade que conduz permanece com a **espada perfilada**; Porta-Bandeira/Estandarte em **Ombro-Arma**.
- "EM CONTINÊNCIA À BANDEIRA, APRESENTAR-ARMA!" → executado **somente** pela autoridade e pelos Cmt sucedido/sucessor.
- **Revista da tropa:** só nas passagens de comando de **unidade e subunidade isolada**; cadência **116 passos/min**; o Cmt sucedido fica **à direita** do sucessor com a espada **embainhada** (simboliza missão cumprida).
- Em seguida, **desfile** da tropa em continência ao **Cmt sucessor**.

---

# Módulo 8 — Honras Fúnebres (Vade-Mécum EB10-VM-12.009, 2ª ed./2016)

- **Definição:** homenagens **póstumas** prestadas **diretamente pela tropa** aos despojos mortais de **alta autoridade** ou **militar da ativa**, conforme a posição hierárquica que ocupava.
- **3 tipos:** 1) **Guarda Fúnebre**; 2) **Escolta Fúnebre**; 3) **Salvas Fúnebres**.
- O **ataúde**, depois de fechado até a inumação, é coberto com a **Bandeira Nacional**, que depois é **dobrada** e entregue à família. Ao descer o corpo: **toque de silêncio**.

## Guarda Fúnebre — composição por posto do falecido
| Posto/Graduação | Efetivo |
|---|---|
| Of-General / Cmt-Geral | 1 Batalhão |
| Oficial Superior | 2 Companhias |
| Oficial Intermediário | 1 Companhia |
| Oficial Subalterno | 1 Pelotão |
| Aspirantes/Alunos de Academia | 2 Grupos de Combate (18 homens) |
| Subtenentes/Sargentos | 1 Grupo de Combate (9 homens) |
| Cabos/Soldados | 1 Esquadra (4 homens) |
- Ao comando "**PREPARAR!**", giro de **45 graus** à direita (sobre a planta do pé esquerdo). Executa **três descargas** de fuzil (salvas).

---

# Módulo 9 — Atribuições do Comandante de OME

> **Base:** Regulamento Interno e dos Serviços Gerais (R-1/RISG). As atribuições do Cmt aplicam-se também a quem exerce função de **Chefe (Ch)** ou **Diretor (Dir)**.

- **Comando** é função do grau hierárquico, da qualificação e das habilitações — prerrogativa **impessoal** com atribuições e deveres.
- **Ação de comando:** planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e **apurar responsabilidades** (exercida em todos os setores, com iniciativa e sob inteira responsabilidade).
- Destaques: organizar o **horário da unidade**; conceder **dispensa, trânsito e férias**; autorizar trajes civis às praças; **estabelecer as NGA/U**; dar ordens **por intermédio do SCmt**; **anular ato em BI em até 180 dias**; designar para cargos (nenhum oficial, em princípio, **mais de 2 anos** no mesmo cargo).
- **Pegadinha:** NÃO é atribuição transferir o militar considerando a **localização da residência**.

---

# Módulo 10 — Atribuições do Subcomandante de OME

- **Principal auxiliar e substituto imediato** do Cmt U; **Chefe do Estado-Maior** da OME; intermediário na expedição das ordens de **disciplina, instrução e serviços gerais**, cuja execução fiscaliza.
- Em **Companhias independentes** pode **acumular** funções (p. ex., a de P1).
- Atribuições: encaminhar ao Cmt os documentos que dependam de sua decisão; **assinar documentos urgentes na ausência do Cmt** (dando ciência depois); zelar pela conduta dos militares; **escalar oficiais e SU** para serviços gerais/extraordinários; **supervisionar o controle do armamento** (inspeções inopinadas). Autentica as cópias do BI.

---

# Módulo 11 — Atribuições do Ajudante-Secretário

- **Auxiliar imediato do Cmt U.**
- Compete-lhe: dirigir a escrituração da correspondência, do arquivo e das **alterações dos oficiais**; redigir correspondência; **subscrever certidões**; **manter em dia o histórico da unidade**; conferir/autenticar cópias; manter o arquivo; responder pela carga do material do gabinete do Cmt/SCmt/Secretaria; **receber a correspondência externa**.
- **Cópias autenticadas do BI** só podem ser emitidas pelo **ajudante-secretário** (determinação do Cmt).
- **Art. 27:** sem cargo específico, a função é exercida cumulativamente pelo **P1**.

---

# Módulo 12 — Atribuições do P1

- **Chefe da 1ª seção do EM/U** — pessoal, **BI**, justiça e disciplina, protocolo, arquivo da correspondência interna e **pagamento** do pessoal.
- Compete-lhe: organizar as relações p/ **escalas**; **escalar as praças** para serviços normais e extraordinários; organizar fichários/mapas do efetivo; **organizar os boletins ostensivos**; preparar documentação de **promoção, reserva, reforma e medalhas**; controlar a escrituração das **alterações dos subtenentes e sargentos** (a dos oficiais é do ajudante-secretário).
- **Art. 29:** nas Cias Independentes, sem cargo específico, a função de P1 pode ser exercida pelo **SCmt U**.

---

# Módulo 13 — Atribuições do P3

- **Chefe da 3ª seção do EM/U** — **operações e estatística**.
- Compete-lhe: **organizar as cerimônias militares** (com os demais oficiais do EM/U); preparar e coordenar a **documentação de operações**.
- Nas **formaturas**, é o P3 quem **avisa o Cmt U** de que a tropa está pronta.
- *Não* confundir: a **instrução** é do **SEI**.

---

# Módulo 14 — Atribuições do SEI (Seção de Ensino e Instrução)

- **Chefe da seção de ensino e instrução do EM/U** — responsável pela **instrução**.
- Compete-lhe: **planejar, organizar e coordenar toda a instrução** (determinação do Cmt + diretrizes do escalão superior); selecionar praças para cursos (com o P1); fiscalizar a instrução.
- **SUNOR 034/2020:** a instrução tem **duas vertentes** — **IG (Instrução Geral)**, elaborada pela **DEIP**, e **IP (Instrução Particular)**, desenvolvida pelas OMEs.
- **PgI (Programa de Instrução):** documento básico de planejamento, encaminhado à **DEIP** para aprovação.
- **Direção da instrução em 3 níveis:** Geral, Setorial e **Execução** (esta pelas OMEs/SEIs e Campi).

---

# Módulo 15 — Atribuições do P4

- **Chefe da 4ª seção do EM/U** (logística/administração); pode acumular **Fiscal Administrativo (Fisc Adm)**.
- Principal responsável pela observância das disposições de **administração**.
- Compete-lhe: coordenar e fiscalizar os serviços; manter ligação com o **P3** e o **Chefe da SEI** para o **apoio material** aos programas de instrução e planos de emprego; zelar pela prevenção de acidentes (EPI).
- Quando acumula **Fisc Adm**, **não participa de serviços estranhos** à sua função e assessora o Cmt no **controle ambiental**.

---

# Módulo 16 — Do Boletim Interno (BI)

- Documento em que o Cmt publica suas ordens, as das autoridades superiores e os fatos do conhecimento da unidade.
- **4 partes:** 1ª **Serviços Diários**; 2ª **Instrução**; 3ª **Assuntos Gerais e Administrativos**; 4ª **Justiça e Disciplina**.
- Publicado **diariamente ou não**, conforme as necessidades. Assuntos **sigilosos** → **boletim de acesso restrito** (não no ostensivo).
- **Conterá:** discriminação do serviço; ordens/decisões do Cmt (mesmo executadas); determinações superiores (com referência); alterações de pessoal/material.
- **Não publicará:** sigilosos (e referências a eles); assuntos não ligados ao serviço (salvo ordem ou comemoração cívica).
- Cópias **autenticadas pelo SCmt**; **cópias autenticadas só pelo ajudante-secretário**. O **desconhecimento do BI não justifica** falta ou descumprimento de ordens.

---

# Módulo 17 — Trabalhos Diários, Instrução e Faxinas

- **Horário** da vida diária estabelecido pelo **Cmt U**, por períodos que variam com estações, instrução e determinações superiores; publicado em **BI** (antecedência de 1 semana, sempre que possível).
- A **instrução** é o **objeto principal** da vida da unidade e **não deve ser prejudicada** pelos demais trabalhos, salvo **justiça** e **situações anormais**.
- **Militar gestante** (salvo recomendação médica) participa de tudo, **exceto** esforços físicos e jornadas/exercícios em **campanha**.
- **Faxinas:** trabalhos de utilidade geral (limpeza, lavagem, capinação, arrumação, transporte, carga/descarga) **regulados pelas NGA/U**.

---

# Módulo 18 — Do Adjunto de Comando

- Criado no **Exército** em caráter experimental (**22/05/2015**) — valoriza a carreira do graduado.
- Recai sobre **subtenente ou primeiro sargento** de destacada **liderança**, competência e conduta **ilibada**.
- Na **PMPE**: instituído em **janeiro de 2022** e, diferentemente do EB, **apenas no Comando Geral** (Comando Geral, **DGA** e **DPO**).
- Atribuições: propagar valores éticos/militares; fortalecer o **comportamento militar**; **facilitar a comunicação entre o comando e as praças**; difundir missão/visão; assessorar o comando em assuntos das praças.

---

# Módulo 19 — Manual Básico de Comunicação Social da PMPE (SUNOR 20/2022)

- **Todos** os integrantes são elementos da Comunicação Social (difusores dos valores).
- **ASCOM = 5ª Seção do EMG**, responsável pela imagem da instituição.
- **Oficial de Comunicação Social (P/5)** recai sobre o **Oficial Secretário** da OME.
- **Entrevistas/esclarecimentos jornalísticos:** sob **orientação da Ascom/5ª EMG** (salvo autorização do Comando Geral). Comandantes podem dar **informações** sobre ocorrências **positivas e neutras**.
- **Vedações:** divulgar imagens de **suspeitos** (salvo notório interesse público); imagens de PM em situações **vexatórias**; **criar perfis funcionais**; engajamento em **conteúdo político**; exposição **fardado em circunstância negativa**. Sanções: Código de Ética (Dec. 22.114/2000) e Código Disciplinar (Lei 11.817/2000).

---

# Módulo 20 — Do Expediente

- Fase da jornada destinada à **administração** e ao funcionamento das repartições.
- **Começa** com a **formatura geral** (= um tempo de instrução) e **termina** após a **leitura do BI**, com o **toque de fim do expediente**.
- Serviços de **escala** e permanentes **independem** do horário do expediente.
- **Toque de "ordem"** (fim) só após o **SCmt receber todos os mapas diários do armamento**.
- Durante o expediente: oficiais saem com **permissão do Cmt** (delegável ao SCmt); praças, com autorização do Cmt de Cia/chefe de repartição.

---

# Módulo 21 — Das Escalas de Serviço

- **Escala:** relação do pessoal/frações que concorrem a determinado serviço — finalidade: **distribuição equitativa**.
- Regras-chave:
  - **Externo antes do interno**; **extraordinário antes do ordinário**.
  - Designação recai em quem **maior folga** tiver; em **igualdade de folga**, o de **menor posto/graduação** ou **mais moderno**.
  - **Folgas contadas separadamente** para cada serviço; mínimo de **48 horas** entre dois serviços (sempre que possível).
  - Só escalado **depois de pronto** à unidade.
  - **Gestante não concorre** à escala durante a gravidez e até a criança completar **6 meses**.

---

# Módulo 22 — Do Serviço Interno

- Abrange **todos os trabalhos** necessários ao funcionamento da unidade.
- **Compreende:** serviço **permanente** + serviço de **escala**.
- Determinado, quando possível, à **mesma fração de tropa** (entrosamento).
- **Fiscalização dos serviços de escala:** **SCmt U**, **Of de Operações** e **Graduado de Operações**.
- **Pegadinha:** "portaria e serviços gerais" **não** integra o serviço de escala.

---

# Módulo 23 — Do Oficial de Dia (de Operações)

- **Fora do expediente**, é o **representante do Cmt U**.
- Compete-lhe: assegurar o cumprimento das ordens do **serviço diário**; estar familiarizado com os planos de **segurança/incêndio/chamada**; **verificar as dependências** ao assumir (com o antecessor); **receber autoridade igual/superior** ao Cmt e acompanhá-la; **participar ao SCmt** as ocorrências extraordinárias; **permanecer no quartel**, pronto e uniformizado.

---

# Módulo 24 — Do Adjunto ao Oficial de Dia (Graduado de Operações)

- **Sgt Adj = auxiliar imediato do Of Dia.**
- Compete-lhe: executar/transmitir as ordens; **responder pela limpeza** do quartel a cargo do cabo da faxina; **acompanhar o Of Dia** nas visitas; **passar revista às Companhias** quando determinado; providenciar as **chaves no claviculário** após o toque de ordem; **responder pelo Of Dia** em impedimentos eventuais (participando-lhe as ocorrências, mesmo já providenciadas).

---

# Módulo 25 — Do Serviço de Guarda do Quartel

- Normalmente comandada por **2º ou 3º Sargento**; constituída de cabos e soldados (sentinelas).
- **Excepcionalmente** comandada por **oficial** → acrescida de **corneteiro/clarim**; o sargento passa a **auxiliar**.
- Pessoal sempre **uniformizado, equipado e armado**; **rodízio de descanso** sob controle do Cmt Gd.
- **Finalidades:** manter a **segurança** do quartel; impedir saída mal fardada; **não permitir** entrada de bebidas alcoólicas/inflamáveis/explosivos (salvo suprimento); impedir entrada de força estranha sem ordem do **Of Dia**; controlar entrada/saída de pessoas, viaturas e material; **prestar continências**.
- No **corpo da guarda** é proibida a permanência de civis ou praças estranhas.

---

# Módulo 26 — Do Comandante da Guarda do Quartel

- Responsável pela execução das ordens do serviço da guarda; **subordinado diretamente ao Of Dia**.
- Compete-lhe: **formar a guarda** ao sinal de alarme; **conferir o material** ao assumir; **fechar os portões às 18h** (deixando só a passagem individual do portão principal); **conservar as chaves** e **entregá-las ao Of Dia às 21h** (exceto a do portão principal); **revistar viaturas estranhas** à entrada/saída; **entregar a parte da guarda** ao Of Dia (relação nominal, roteiros, ocorrências).

---

# Módulo 27 — Do Plantão

- **Plantão da hora = sentinela da SU**; posto na **entrada do alojamento** (que percorre algumas vezes).
- Compete-lhe: estar atento ao alojamento e **participar ao Cabo Dia** qualquer alteração; **fazer levantar** as praças à **alvorada**; **não consentir civis** sem oficial/sargento; **impedir conversa em voz alta após o silêncio**; dar o **sinal de silêncio**; **acender/apagar as luzes**.
- Substituídos às **mesmas horas** que as sentinelas da guarda. Se não perceber a entrada de oficial, **qualquer praça** dá o sinal.

---

# Módulo 28 — Das Formaturas

- **Formatura:** toda reunião do pessoal em forma, **armado ou desarmado**.
- **Classificação:** **geral ou parcial** (unidade/Cia) e **ordinária ou extraordinária** (estas **previstas ou inopinadas**).
- **Ordinárias:** revistas normais, **rancho**, **Parada**, **leitura do BI**, **instrução**.
- **Origem na companhia:** subalternos revistam as frações; o mais antigo apresenta ao Cmt SU.
- Reunidas as Cias, o **SCmt assume** o comando **até a chegada do Cmt U**; o **Cmt só se aproxima** após o **aviso do P3** de que a tropa está pronta.`

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  { modulo: "1", frente: "Tratamento entre militares (art. 3º)", verso:
`• Superiores: respeito e consideração.
• Pares: afeição e camaradagem.
• Subordinados: bondade, dignidade e urbanidade.
• §2º: respeito devido entre as FFAA TAMBÉM se aplica a PM, CBM e militares estrangeiros (reciprocidade obrigatória).` },
  { modulo: "1", frente: "Sinais de respeito × continência", verso:
`• Sinais de respeito: obrigatórios em TODAS as situações.
• Continência: é apenas UMA forma de sinal de respeito e PODE ser dispensada conforme a situação.` },
  { modulo: "1", frente: "Deslocamento: 2 militares × grupo", verso:
`• 2 militares: o mais moderno dá a DIREITA ao superior (lado interno, se houver).
• 3 ou mais (grupo): o mais antigo fica no CENTRO; os demais alternam à direita/esquerda.` },
  { modulo: "1", frente: "Tratamento verbal de superior", verso:
`• Sempre "Senhor"/"Senhora" (art. 9º).
• "COMANDO" é GÍRIA — não é sinal de respeito.
• Of-General: "Vossa Excelência", "Sr. Almirante/General/Brigadeiro".` },
  { modulo: "1", frente: "Continência — natureza e obrigatoriedade", verso:
`• Saudação impessoal: homenageia a função/autoridade, não a pessoa.
• Todo militar (ativa ou inatividade) deve RETRIBUIR.
• Uniformizado: obrigado a prestar. Trajes civis: pode responder com continência ou cumprimento verbal.
• Devida a qualquer hora do dia ou da noite.` },
  { modulo: "1", frente: "Elementos da continência individual", verso:
`1. ATITUDE — postura marcial.
2. GESTO — movimento de corpo, braços e mãos.
3. DURAÇÃO — tempo em que se mantém atitude e gesto.` },
  { modulo: "1", frente: "Gesto da continência conforme o armamento", verso:
`• Desarmado/pistola/espada embainhada: gesto da mão (90° com a linha dos ombros).
• Espada desembainhada: sentido → ombro-arma → para Of-Gen e incisos I-VIII/XII abate a espada (apresentar-arma).
• Cmt-Geral PMPE: apresentar-arma (honras de Of-General).
• Arma longa em bandoleira/tiracolo: só toma SENTIDO, frente perpendicular ao deslocamento (não ergue a mão).` },
  { modulo: "1", frente: "Continência individual — distâncias", verso:
`• Inicia quando o superior atinge 3 PASSOS do mais moderno.
• Desfaz quando o superior ULTRAPASSA 1 passo.
• Frente perpendicular ao deslocamento do superior; olhar voltado a ele.` },
  { modulo: "2", frente: "Definição de tropa (p/ continência)", verso:
`• Reunião de 2 ou mais militares devidamente COMANDADOS → na prática, efetivo mínimo = 3 (1 comanda + 2).
• 4 modalidades: a pé firme, em deslocamento, em desfile e da guarda.` },
  { modulo: "2", frente: "Tropa a pé firme — comandos de continência", verso:
`• Subalterno/intermediário: "Sentido!".
• Oficial-superior: "Sentido! Ombro Arma!".
• Of-Gen / incisos I-VIII art.16: "Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!".
• Tropa desarmada: ao "Apresentar Arma!" todos fazem continência individual; desfazem ao "Descansar Arma!".` },
  { modulo: "2", frente: "Continência entre tropas (art. 58)", verso:
`• Nenhuma com Bandeira: inicia a de MENOR hierarquia (iguais → ambas).
• Só uma com Bandeira: continência À BANDEIRA, qualquer que seja a hierarquia.
• Ambas com Bandeira: ambas fazem continência.` },
  { modulo: "2", frente: "Continência da guarda — quando", verso:
`• A guarda em forma presta continência a símbolos/autoridades (incisos I-X, XII, XIII), Of-Gen, of. superiores, Cmt/Ch/Dir da OM e à guarda que a render.
• Presta na ENTRADA e na SAÍDA da autoridade da OME.` },
  { modulo: "3", frente: "Dia da Bandeira (19/nov) — cerimonial", verso:
`1. Hasteamento da Bandeira em ato solene ÀS 12 HORAS.
2. Canto do Hino à Bandeira e, se for o caso, incineração de Bandeiras inservíveis.
3. Desfile em continência à Bandeira Nacional.` },
  { modulo: "3", frente: "Incineração de Bandeiras inservíveis", verso:
`• Pira de metal junto ao mastro; leitura da Ordem do Dia.
• Praça antiga e de ótimo comportamento ateia fogo (Bandeiras embebidas em álcool).
• Segue o Hino à Bandeira; cinzas em caixa, ENTERRADAS em local apropriado (ou lançadas ao mar).` },
  { modulo: "3", frente: "Hasteamento em luto (meio-mastro)", verso:
`• Hasteamento: a Bandeira sobe PRIMEIRO ao topo e DEPOIS desce a meio-mastro.
• Arriação: sobe novamente ao topo e só então desce.
• O Pavilhão Nacional fica ACIMA de todas as demais bandeiras.` },
  { modulo: "4", frente: "Bandeiras-insígnias / distintivos", verso:
`• Hasteados quando a autoridade ENTRA; arriados logo após a SAÍDA.
• Nenhuma insígnia acima da Bandeira Nacional.
• Vários OM no mesmo prédio: só a insígnia da mais alta autoridade presente.` },
  { modulo: "4", frente: "Honras de Recepção e Despedida", verso:
`• Prestadas ao chegar/sair e em visitas/inspeções (não só na chegada).
• Visita SEM aviso: não altera a rotina; o Cmt vai ao encontro e acompanha.
• Guarda do quartel: 1 fileira, efetivo ≥ 6 soldados.
• Despedida: do oficial mais moderno para o mais antigo.` },
  { modulo: "5", frente: "Guarda-Bandeira — composição e armamento", verso:
`• Porta-Bandeira + Porta-Estandarte (se houver) + 5 ou 6 guardas (2 cabos + soldados).
• Porta-Bandeira: oficial/aspirante mais moderno.
• Oficiais Porta-Bandeira: pistola e espada; sargentos Porta-Estandarte: pistola; demais: fuzil c/ baioneta.` },
  { modulo: "5", frente: "Guarda-Bandeira — cadência e desfralde", verso:
`• Cadência ao marchar: 100 passos/minuto.
• Bandeira desfraldada no "Apresentar-Arma" (e no "Olhar à Direita" em marcha).
• Passagem de comando em recinto COBERTO: a Bandeira NÃO é desfraldada.
• Só Porta-Bandeira e Porta-Estandarte fazem "Apresentar-Arma".` },
  { modulo: "6", frente: "Compromisso ao primeiro posto (dizeres)", verso:
`"Perante a Bandeira do Brasil e pela minha honra prometo cumprir os deveres de oficial da Polícia Militar do Estado de Pernambuco e dedicar-me ao seu serviço."
• Cerimônia presidida pelo Cmt da OM ou pela mais alta autoridade militar presente.
• Compromitentes: olhos fitos na Bandeira, abatem espadas e prestam em voz alta e pausada.` },
  { modulo: "7", frente: "Roteiro da solenidade — pontos-chave", verso:
`• 12 pontos (SUNOR 20/2022).
• Honras militares: só à MAIOR autoridade presente.
• Pronunciamentos: da MENOR para a MAIOR autoridade.
• Hino Nacional: só após todas as autoridades da mesa ocuparem seus lugares.` },
  { modulo: "7", frente: "Passagem de comando × transmissão do cargo", verso:
`• Passagem de comando = cerimônia completa; transmissão do cargo = apenas 1 evento dela.
• 2 boletins: normal (sucedido, exoneração/despedida) e especial (sucessor, nomeação).
• Conduzida pela autoridade imediatamente superior na cadeia de comando.` },
  { modulo: "7", frente: "Passagem de comando — espadas e revista", verso:
`• Cmt sucedido e sucessor ABATEM espadas (voltados um para o outro); autoridade que conduz permanece com espada PERFILADA.
• Revista só em unidade/subunidade isolada; cadência 116 passos/min.
• Na revista, o sucedido fica à DIREITA do sucessor com a espada EMBAINHADA (missão cumprida).` },
  { modulo: "8", frente: "Honras Fúnebres — definição e tipos", verso:
`• Definição: homenagens PÓSTUMAS prestadas diretamente pela TROPA aos despojos de alta autoridade ou militar da ativa, conforme a posição hierárquica.
• 3 tipos: 1) Guarda Fúnebre; 2) Escolta Fúnebre; 3) Salvas Fúnebres.` },
  { modulo: "8", frente: "Guarda Fúnebre — efetivo por posto", verso:
`• Of-Gen/Cmt-Geral: 1 Batalhão • Of. Superior: 2 Cias • Of. Intermediário: 1 Cia • Of. Subalterno: 1 Pelotão • Aspirantes/Alunos: 18 homens • Subten/Sgt: 9 homens • Cabos/Sd: 4 homens.
• "PREPARAR!": giro de 45° à direita; três descargas de fuzil.` },
  { modulo: "9", frente: "Comandante de OME — ação de comando", verso:
`• Comando = função do grau hierárquico, qualificação e habilitações (prerrogativa impessoal).
• Ação de comando: planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades.
• Aplica-se também a Chefe (Ch) e Diretor (Dir).` },
  { modulo: "9", frente: "Cmt de OME — atribuições e pegadinha", verso:
`• Estabelecer as NGA/U; dar ordens via SCmt; anular ato em BI em até 180 dias.
• Designar p/ cargos: nenhum oficial, em princípio, mais de 2 anos no mesmo cargo.
• NÃO é atribuição: transferir o militar pela localização da residência.` },
  { modulo: "10", frente: "Subcomandante de OME — papel", verso:
`• Principal auxiliar e substituto imediato do Cmt; Chefe do Estado-Maior da OME.
• Intermediário nas ordens de disciplina, instrução e serviços gerais.
• Em Cias independentes pode acumular funções (ex.: P1).` },
  { modulo: "10", frente: "Subcomandante — atribuições", verso:
`• Encaminhar ao Cmt documentos que dependam de sua decisão.
• Assinar documentos urgentes na ausência do Cmt (dando ciência depois).
• Escalar oficiais e SU p/ serviços gerais/extraordinários.
• Supervisionar o controle do armamento (inspeções inopinadas).` },
  { modulo: "11", frente: "Ajudante-Secretário — atribuições", verso:
`• Auxiliar imediato do Cmt U.
• Manter em dia o HISTÓRICO da unidade; redigir correspondência; subscrever certidões.
• Escriturar as alterações dos OFICIAIS; receber a correspondência externa.
• Cópias autenticadas do BI: só por ele. Sem cargo específico, função vai p/ o P1 (Art. 27).` },
  { modulo: "12", frente: "P1 — 1ª seção", verso:
`• Chefe da 1ª seção do EM/U: pessoal, BI, justiça e disciplina, protocolo, pagamento.
• Escalar as praças; organizar relações p/ escalas; organizar boletins ostensivos.
• Documentação de promoção/reserva/reforma/medalhas; alterações de SUBTENENTES e SARGENTOS.
• Cias Independentes sem cargo: P1 pode ser exercido pelo SCmt (Art. 29).` },
  { modulo: "13", frente: "P3 — 3ª seção (operações)", verso:
`• Chefe da 3ª seção do EM/U: operações e estatística.
• Organiza as CERIMÔNIAS MILITARES (com o EM/U); prepara a documentação de operações.
• Nas formaturas, AVISA o Cmt que a tropa está pronta.
• A instrução NÃO é do P3 (é do SEI).` },
  { modulo: "14", frente: "SEI — instrução e vertentes (SUNOR 034/2020)", verso:
`• Chefe da seção de ensino e instrução; planeja/organiza/coordena toda a instrução.
• 2 vertentes: IG (Instrução Geral) elaborada pela DEIP; IP (Particular) pelas OMEs.
• PgI (Programa de Instrução): documento básico, aprovado pela DEIP.
• Direção da instrução em 3 níveis: Geral, Setorial e Execução.` },
  { modulo: "15", frente: "P4 — 4ª seção e Fisc Adm", verso:
`• Chefe da 4ª seção do EM/U (administração); pode acumular Fiscal Administrativo.
• Mantém ligação com o P3 e o SEI p/ o APOIO MATERIAL à instrução e planos de emprego.
• Acumulando Fisc Adm: não participa de serviços estranhos e assessora o Cmt no controle ambiental.` },
  { modulo: "16", frente: "Boletim Interno — 4 partes", verso:
`• 1ª Serviços Diários; 2ª Instrução; 3ª Assuntos Gerais e Administrativos; 4ª Justiça e Disciplina.
• Publicado diariamente ou não. Sigilosos vão em boletim de acesso RESTRITO.
• Cópias autenticadas pelo SCmt; cópias autenticadas só pelo ajudante-secretário.
• O desconhecimento do BI NÃO justifica falta/descumprimento de ordens.` },
  { modulo: "16", frente: "BI — o que conterá / não publicará", verso:
`• Conterá: discriminação do serviço; ordens do Cmt (mesmo executadas); determinações superiores (c/ referência); alterações de pessoal/material.
• NÃO publicará: assuntos sigilosos (e referências); assuntos não ligados ao serviço (salvo ordem ou comemoração cívica).` },
  { modulo: "17", frente: "Trabalhos diários, instrução e faxinas", verso:
`• Horário estabelecido pelo Cmt U, por períodos; publicado em BI (1 semana antes, se possível).
• Instrução = objeto principal; não deve ser prejudicada (salvo justiça/situações anormais).
• Gestante: participa de tudo, exceto esforços físicos e exercícios em campanha.
• Faxinas: trabalhos de utilidade geral, regulados pelas NGA/U.` },
  { modulo: "18", frente: "Adjunto de Comando", verso:
`• Criado no Exército em 22/05/2015 (caráter experimental).
• Recai sobre subtenente ou 1º sargento de destacada liderança e conduta ilibada.
• PMPE: instituído em jan/2022, APENAS no Comando Geral (Cmdo Geral, DGA e DPO).
• Facilita a comunicação entre o comando e as praças.` },
  { modulo: "19", frente: "Comunicação Social — ASCOM e P/5", verso:
`• Todos os PM são elementos da Comunicação Social.
• ASCOM = 5ª Seção do EMG. Oficial de Com. Social (P/5) = Oficial Secretário da OME.
• Entrevistas: sob orientação da Ascom/5ª EMG. Cmt fornece info de ocorrências positivas/neutras.` },
  { modulo: "19", frente: "Comunicação Social — vedações em redes", verso:
`• Vedado: imagens de suspeitos (salvo notório interesse público); PM em situação vexatória.
• Vedado: criar perfis funcionais; engajamento em conteúdo político; exposição fardado em circunstância negativa.
• Sanções: Cód. de Ética (Dec. 22.114/2000) e Cód. Disciplinar (Lei 11.817/2000).` },
  { modulo: "20", frente: "Expediente — início e fim", verso:
`• Começa com a FORMATURA GERAL (= um tempo de instrução).
• Termina após a LEITURA DO BI, com o toque de fim do expediente.
• Serviços de escala/permanentes independem do horário do expediente.
• Toque de "ordem" só após o SCmt receber todos os mapas diários do armamento.` },
  { modulo: "21", frente: "Escalas de serviço — regras", verso:
`• Finalidade: distribuição equitativa. Externo antes do interno; extraordinário antes do ordinário.
• Recai em quem maior folga tiver; em igualdade, o de MENOR posto/MAIS MODERNO.
• Folgas separadas por serviço; mínimo 48h entre serviços (se possível).
• Gestante não concorre à escala até a criança completar 6 meses.` },
  { modulo: "22", frente: "Serviço interno", verso:
`• Abrange todos os trabalhos para o funcionamento da unidade.
• Compreende serviço PERMANENTE + serviço de ESCALA.
• Fiscalização da escala: SCmt U, Of de Operações e Graduado de Operações.
• Pegadinha: "portaria e serviços gerais" NÃO integra a escala.` },
  { modulo: "23", frente: "Oficial de Dia (de Operações)", verso:
`• FORA do expediente, é o representante do Cmt U.
• Assegura o cumprimento das ordens do serviço diário; conhece os planos de segurança/incêndio/chamada.
• Verifica as dependências ao assumir; recebe autoridade igual/superior ao Cmt.
• Participa ao SCmt as ocorrências; permanece pronto e uniformizado no quartel.` },
  { modulo: "24", frente: "Adjunto ao Of Dia (Graduado de Operações)", verso:
`• Auxiliar imediato do Of Dia.
• Responde pela limpeza do quartel (cabo da faxina); acompanha o Of Dia nas visitas.
• Passa revista às Companhias quando determinado; cuida das chaves no claviculário.
• Responde pelo Of Dia em impedimentos eventuais.` },
  { modulo: "25", frente: "Serviço de Guarda do Quartel", verso:
`• Normalmente comandada por 2º ou 3º Sgt; excepcionalmente por oficial (+ corneteiro/clarim).
• Finalidades: segurança do quartel; barrar bebidas/inflamáveis/explosivos; controlar entradas/saídas; prestar continências.
• Proibida a permanência de civis/praças estranhas no corpo da guarda.` },
  { modulo: "26", frente: "Comandante da Guarda do Quartel", verso:
`• Subordinado diretamente ao OF DIA.
• Forma a guarda ao alarme; confere o material ao assumir.
• Fecha os portões às 18h (deixa a passagem individual do portão principal).
• Entrega as chaves ao Of Dia às 21h (exceto a do portão principal); revista viaturas estranhas.` },
  { modulo: "27", frente: "Plantão (plantão da hora)", verso:
`• Sentinela da SU; posto na entrada do alojamento.
• Participa ao Cabo Dia qualquer alteração; faz levantar as praças à alvorada.
• Não consente civis sem oficial/sargento; impede conversa em voz alta após o silêncio.
• Substituído nas mesmas horas das sentinelas da guarda.` },
  { modulo: "28", frente: "Formaturas — definição e classificação", verso:
`• Reunião do pessoal em forma, armado ou desarmado.
• Geral/parcial (unidade ou Cia); ordinária/extraordinária (previstas ou inopinadas).
• Ordinárias: revistas, rancho, Parada, leitura do BI, instrução.
• Origem na companhia; SCmt assume até a chegada do Cmt; o P3 avisa que a tropa está pronta.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento de ${MATERIA} salvo (${MD.length} caracteres).`)

  // Remove flashcards IG obsoletos (de versões anteriores) que não fazem parte do novo conjunto
  const novosHashes = CARDS.map(c => createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex"))
  const del = await prisma.flashcard.deleteMany({ where: { materia: MATERIA, hash: { notIn: novosHashes } } })
  if (del.count > 0) console.log(`Removidos ${del.count} flashcards IG obsoletos.`)

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
