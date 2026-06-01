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

# Módulo 9 — Atribuições e Serviço Interno

## Comandante de OME (atribuições — destaques)
- Transcrever em BI as recompensas concedidas pelos comandos subordinados; conceder licenças conforme normas; dar ordens **por intermédio do Subcomandante**; atender ponderações justas dos subordinados.
- **NÃO** é atribuição transferir o militar considerando a localização da sua residência.

## Serviço interno — serviço de escala (compreende)
- Guarda do quartel; Sgt Dia SU; Guarda das SU (alojamentos, garagens etc.); serviço-de-dia ao rancho (Sgt Dia, cozinheiro, cassineiro).
- **NÃO** integra a escala: "portaria e serviços gerais".

## Boletim Interno (BI) — conteúdo
- Discriminação do serviço a executar; ordens/decisões do Cmt (mesmo já executadas); determinações de autoridades superiores (com citação da referência); alterações de pessoal e material.
- **NÃO** se publicam em BI assuntos **sigilosos** transmitidos em caráter sigiloso.

---

# Módulo 10 — Precedência Hierárquica na PMPE (SUNOR nº 20/2022)

Ordem (maior → menor precedência):
1. **Comandante-Geral**
2. **Subcomandante-Geral**
3. **Chefe do Estado-Maior Geral**
4. **Diretor Geral de Administração e Diretor de Planejamento Operacional**
5. 1ª EMG a 8ª EMG, DIM, DIRESP, DINTER I e II, DF, DEIP, DASDH, DAL, DGP, DS, DTec, DASIS, AG
6. APMP, CAS, CMH, CPM, COdonto, CFarm
7. DEAJA, ACG, CPA, CPL, CPO, CPP
8. Comandantes das Unidades Operacionais de Área e Especializadas
9. CSM/Int, CSM/MB, CSM/Moto, CRESEP, CReed, CTT, CIMus, CEFD
- Aos **Comandantes-Gerais de PM/CBM do Brasil**: tratamento, honras e precedência de **Oficial-General 2 estrelas**.

---

# Módulo 11 — Postos e Graduações das Forças Armadas

## Oficiais-Generais (equivalência entre as Forças)
| Marinha | Exército | Aeronáutica |
|---|---|---|
| Almirante | Marechal | Marechal-do-Ar |
| Almirante-de-Esquadra | General de Exército | Tenente-Brigadeiro |
| Vice-Almirante | General de Divisão | Major-Brigadeiro |
| Contra-Almirante | General de Brigada | Brigadeiro |

## Oficiais Superiores
| Marinha | Exército/Aeronáutica |
|---|---|
| Capitão-de-Mar-e-Guerra | Coronel |
| Capitão-de-Fragata | Tenente-Coronel |
| Capitão-de-Corveta | Major |

## Oficiais Intermediário e Subalternos
- Intermediário: **Capitão-Tenente** (Marinha) = **Capitão** (Ex/Aer).
- Subalternos: **1º Tenente**, **2º Tenente** (em todas); **Guarda-Marinha** (Marinha) ≈ Aspirante (Ex/Aer).`

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
  { modulo: "9", frente: "Atribuições do Cmt de OME (pegadinha)", verso:
`• NÃO é atribuição transferir o militar considerando a localização de sua residência.
• É: transcrever recompensas em BI, conceder licenças, ordenar via Subcomandante, atender ponderações justas.` },
  { modulo: "9", frente: "Serviço de escala e BI (exceções)", verso:
`• Escala NÃO inclui "portaria e serviços gerais".
• BI NÃO publica assuntos transmitidos em caráter SIGILOSO.
• BI publica: discriminação do serviço, ordens do Cmt (mesmo executadas), determinações superiores (com referência), alterações de pessoal/material.` },
  { modulo: "10", frente: "Precedência hierárquica PMPE (topo)", verso:
`1. Comandante-Geral
2. Subcomandante-Geral
3. Chefe do Estado-Maior Geral
4. Diretor Geral de Administração e Diretor de Planejamento Operacional
... 8. Cmt das Unidades Operacionais ... 9. CSM/Int, CRESEP, CTT, CEFD etc.` },
  { modulo: "11", frente: "Postos — Of-Generais (3 Forças)", verso:
`• Almirante = Marechal = Marechal-do-Ar
• Almirante-de-Esquadra = General de Exército = Tenente-Brigadeiro
• Vice-Almirante = General de Divisão = Major-Brigadeiro
• Contra-Almirante = General de Brigada = Brigadeiro` },
  { modulo: "11", frente: "Postos — Of. Superiores e Intermediário", verso:
`• Capitão-de-Mar-e-Guerra = Coronel
• Capitão-de-Fragata = Tenente-Coronel
• Capitão-de-Corveta = Major
• Intermediário: Capitão-Tenente (Marinha) = Capitão (Ex/Aer).` },
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
