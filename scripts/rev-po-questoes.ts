import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// id -> justificativa fundamentada na APOSTILA - PO.pdf
const EXPL: Record<string, string> = {
  // ── Módulo 1 — POP / apresentação ──
  cmptqahec000304kzgrmb43ok: "Correto. Diante da complexidade e diversidade das ocorrências, a padronização por Procedimentos Operacionais Padrão (POP) tornou-se indispensável para uniformizar a conduta dos militares estaduais.",
  cmptqahr8000504kziirr9poh: "Correto. Os POPs possuem importância estratégica, tática, jurídica e institucional, sendo pilares da legalidade, eficiência, segurança e transparência da atividade policial.",
  cmptqahxq000604kzvm61vk25: "Correto. A padronização das ações policiais busca assegurar legalidade, eficiência, segurança e transparência.",
  cmptqaiak000804kz3awp2ntl: "Correto. O POP é o conjunto de normas técnicas e diretrizes que orientam a execução de atividades específicas da atuação policial.",
  cmptqaini000a04kzc7f2ylde: "Correto. O atendimento de ocorrências exige preparo técnico, disciplina e responsabilidade do policial.",
  cmptqaitz000b04kzlbw4ep3x: "Correto. A disciplina aborda conceitos essenciais, a legislação nacional vigente e os procedimentos operacionais padrão adotados na PMPE.",
  cmptqaj0g000c04kznrueoq0h: "Correto. O objetivo do POP é uniformizar a conduta, garantindo ações seguras, eficientes, legais e padronizadas, independentemente da unidade ou do agente.",
  cmptqajdb000e04kzpkv5zpw5: "Correto. Procedimentos previamente definidos e institucionalmente padronizados reforçam a transparência da atividade policial.",
  cmptqah1c000104kz0xezp7a5: "Correto. A disciplina apresenta aos futuros oficiais tanto competências conceituais quanto procedimentos para o atendimento de ocorrências.",
  cmptqaguo000004kzncakimzp: "Correto. A disciplina de Procedimento em Ocorrências aborda as técnicas e protocolos para lidar com situações de emergência e ocorrências criminais.",

  // ── Módulo 2 — BOEPM (responsabilidades) ──
  cmptqakzu000m04kzv3q4x543: "Correto. O BOEPM documenta o crime/incidente, é fundamental para a investigação e pode ser usado como prova judicial.",
  cmptqal6a000n04kz4t9enkp3: "Correto. Preencher o BO com informações falsas/inexatas pode configurar falsidade ideológica, tipificada no art. 299 do Código Penal.",
  cmptqalpl000q04kz9i4s381u: "Correto. Quando o preenchimento falso visa incriminar alguém, configura-se denunciação caluniosa (que exige a intenção específica de incriminar).",
  cmptqalw1000r04kzb0g3efzh: "Correto. A responsabilidade administrativa impõe imparcialidade: o BO não deve refletir opiniões pessoais ou preconceitos do redator.",
  cmptqam2g000s04kzergc4a0c: "Correto. O art. 299 do CP tipifica a falsidade ideológica: omitir, inserir ou fazer inserir declaração falsa em documento, com o fim de prejudicar direito, criar obrigação ou alterar a verdade.",
  cmptqamfc000u04kzj9ytuwsx: "Correto. O BO pode ser utilizado como prova em processos judiciais.",
  cmptqams8000w04kzqgtxzo2f: "Correto. A falsidade ideológica pode gerar também consequências civis, especialmente quando a falsidade causa dano a terceiros.",
  cmptqan53000y04kzx3cvey2f: "Correto. O preenchimento preciso e verídico do BOEPM evita responsabilização nas esferas administrativa, penal e civil.",
  cmptqanbh000z04kzm67ogmne: "Correto. A responsabilidade administrativa abrange o dever de veracidade e de imparcialidade no registro das ocorrências.",
  cmptqanhx001004kzhqd3zi1n: "Correto. O policial que preenche o BO de forma dolosa pode ser responsabilizado nas esferas criminal e civil.",

  // ── Módulo 3 — BOEPM Geração 2 ──
  cmptqaqpj001h04kzfw4htu90: "Correto. No campo de objetos é possível descrevê-los, vinculá-los a um envolvido e anexar foto (no caso de arma ou drogas).",
  cmptqaqvy001i04kz109nsx1s: "Correto. No aplicativo, exclui-se um envolvido arrastando seu card para a esquerda da tela.",
  cmptqar8s001k04kzuomo1vi1: "Correto. O cadastro da equipe é simplificado: começa pelo prefixo da viatura e, no segundo campo, matrícula e nome do efetivo.",
  cmptqarf6001l04kzdgrk1zvw: "Correto. O BO só pode ser enviado quando estiver no status PRONTO, após o preenchimento de todos os campos.",
  cmptqarlm001m04kzvrxmpese: "Correto. A nova versão permite vincular a ocorrência a várias naturezas, conforme o discernimento do condutor.",
  cmptqap3q001804kzftrqfn22: "Correto. O BOEPM Geração 2 foi desenvolvido pela gerência de TI da SDS, com o processo conduzido por policiais da ativa e executado por empresa privada de software.",
  cmptqapa5001904kz6556ni6r: "Correto. O acesso ao sistema é feito com usuário e senha do Expresso/SEI.",
  cmptqaptg001c04kzbh4blaki: "Correto. O campo de dados complementares é obrigatório e consiste no relato da ocorrência.",
  cmptqapzv001d04kz1lhyvg55: "Correto. O aplicativo permite armazenar o BO para envio posterior, evitando perda de boletins preenchidos em áreas com internet fraca.",
  cmptqaqco001f04kzv34zit7q: "Correto. Nesta geração é possível compartilhar o boletim pelo WhatsApp, desde que instalado no aparelho.",

  // ── Módulo 4 — Algemas / escolta ──
  cmptqat7f001u04kz287mbi2c: "Correto. A Súmula Vinculante nº 11 do STF só admite o uso de algemas em casos de resistência, fundado receio de fuga ou perigo à integridade física do preso ou de terceiros.",
  cmptqatkb001w04kzrju3drll: "Correto. O uso de algemas deve ser justificado por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente.",
  cmptqatx5001y04kzloseo05n: "Correto. A ausência de justificativa escrita para as algemas pode acarretar a nulidade da prisão ou do ato processual.",
  cmptqau3k001z04kzvm6wlag7: "Correto. A SV 11 foi elaborada em consonância com o Pacto Internacional sobre Direitos Civis e Políticos e a Convenção Americana de Direitos Humanos (Pacto de São José da Costa Rica).",
  cmptqaugf002104kzkn5wk0k2: "Correto. O POP nº 0018 da PMPE regula o serviço de escoltas, conduções e custódia de presos.",
  cmptqauta002304kzpcrgyud4: "Correto. Nas escoltas mais complexas e de maior risco, as comunicações com o CIODS devem ocorrer a cada 30 minutos.",
  cmptqav68002504kzu7nr9yg8: "Correto. Ao chegar ao destino, a equipe realiza busca 360° nos arredores antes do desembarque do escoltado.",
  cmptqavco002604kzrjohrmru: "Correto. A identificação do escoltado é conferida com o documento de apresentação ao juízo.",
  cmptqavpk002804kzfxghddev: "Correto. Em regra, o giroflex é utilizado durante todo o deslocamento da escolta, para facilitar a visualização do comboio.",

  // ── Módulo 5 — Local de crime / sinistro de trânsito ──
  cmptqaztt002u04kz6t2c9t04: "Correto. A remoção inadequada ou sem registro de vestígios compromete a cadeia de custódia e a validade das provas.",
  cmptqaxhy002h04kzoygaohb3: "Correto. O isolamento é a delimitação física da área; a preservação engloba todas as medidas para manter a integridade dos vestígios (inclusive o isolamento).",
  cmptqaxuu002j04kz8266jr5d: "Correto. Adentrar ou remover vestígios sem autorização pode configurar fraude processual (art. 347 do Código Penal).",
  cmptqay1a002k04kzq8i2qxdh: "Correto. O POP nº 0028 da PMPE regula os procedimentos em locais de acidente de trânsito.",
  cmptqay7q002l04kz0yri7ju9: "Correto. Em acidentes noturnos, recomenda-se sinalizar a área com lanternas, coletes refletivos ou luzes improvisadas.",
  cmptqaykl002n04kzm3yk0vfj: "Correto. O art. 158-D do CPP, incluído pela Lei 13.964/2019 (Pacote Anticrime), disciplina o acondicionamento e o transporte de vestígios (cadeia de custódia).",
  cmptqayr0002o04kzqv921c6g: "Correto. A Lei nº 5.970/1973 autoriza a remoção imediata de veículos e vítimas da via pública quando a permanência comprometer o tráfego.",
  cmptqazae002r04kzlqezqscu: "Correto. A prioridade é o socorro às vítimas inconscientes ou gravemente feridas, acionando o SAMU ou o Corpo de Bombeiros.",
  cmptqazne002t04kzk1414qa2: "Correto. Nas infrações que deixam vestígios, o exame de corpo de delito é indispensável (Código de Processo Penal).",
  cmptqaz3w002q04kzuthjix4g: "Correto. Em acidentes com condutor sem habilitação ou sob efeito de álcool/drogas, é cabível a prisão em flagrante conforme o CTB.",

  // ── Módulo 6 — Autoridades / outras forças ──
  cmptqb1g4003204kzcee9df2m: "Correto. O POP nº 0020 da PMPE padroniza a conduta em ocorrências envolvendo autoridades dos três poderes, MP, Judiciário, Forças Armadas, polícias e advocacia.",
  cmptqb3sc003f04kzj2ug34a9: "Correto. Entre os erros comuns estão não reconhecer corretamente a autoridade, conduzi-la sem observar prerrogativas legais e divulgar informações sensíveis à mídia.",
  cmptqb3ll003e04kzdr20duth: "Correto. O cerne do POP nº 0020 é a atuação legal, proporcional e respeitosa, mesmo quando a autoridade figura como autora do delito.",
  cmptqb3f5003d04kzx47xjbm7: "Correto. Em crime afiançável, o parlamentar deve ser liberado após a identificação e o registro dos fatos.",
  cmptqb325003b04kz8cf2i1tq: "Correto. A documentação de ocorrência com diplomata é encaminhada ao Comando Geral, que notifica o Governo do Estado.",
  cmptqb2vq003a04kzssis2zqb: "Correto. As informações à imprensa nessas ocorrências devem ser centralizadas na Assessoria de Comunicação da PMPE.",
  cmptqb2io003804kzftrmuxdd: "Correto. O advogado em pleno exercício, em crime afiançável, é conduzido à delegacia com imediata liberação e comunicação à OAB.",
  cmptqb2c8003704kztmvqbfdd: "Correto. A Convenção de Viena sobre relações diplomáticas (aprovada pelo Decreto nº 56.435/1965) fundamenta o tratamento diferenciado às autoridades diplomáticas.",
  cmptqb25s003604kzl623vj0r: "Correto. Membro do Ministério Público preso em flagrante de crime inafiançável deve ser apresentado ao Procurador-Geral de Justiça.",
  cmptqb1sz003404kz9ue3mpor: "Correto. Deputados e senadores só podem ser presos em flagrante de crime inafiançável (racismo, tortura, tráfico de drogas e crimes hediondos).",

  // ── Módulo 7 — Morte de integrante da corporação ──
  cmptqb7jm003z04kzy4v8nikt: "Correto. O Grupamento Tático Aéreo (GTA) é acionado pelo coordenador do GCC/DPO para apoio às guarnições no terreno.",
  cmptqb6nb003u04kz7oefj7e8: "Correto. A Diretoria de Assistência Social (DAS) é acionada para assistir os familiares do policial vitimado, com apoio psicológico e auxílio funeral.",
  cmptqb5ko003o04kzhb6nwdmo: "Correto. O POP nº 051/PMPE normatiza as ações em ocorrências de morte de policiais militares em serviço.",
  cmptqb7q1004004kztwtm6ws6: "Correto. Ao final da ocorrência, o Oficial de Operações confecciona comunicação circunstanciada do fato para a apuração administrativa.",
  cmptqb70c003w04kzl7ltkycl: "Correto. As diligências para deter os suspeitos são realizadas sob o comando do oficial designado pelo Comandante do Batalhão da área onde ocorreu o fato.",
  cmptqb7d6003y04kz5eg67r4z: "Correto. O uso de drones/RPA está previsto como recurso de apoio em ocorrências críticas de morte de policial.",
  cmptqb6af003s04kzz9m0ihrj: "Correto. O GCC/DPO inclui, em sua composição, o Oficial do GCC/COPOM e o Comandante da unidade onde o fato ocorreu.",
  cmptqb5xl003q04kz98iq8p4z: "Correto. O policial de folga que deseje colaborar deve apresentar-se fardado em sua unidade de origem e aguardar autorização formal.",

  // ── Módulo 8 — Grupos vulneráveis ──
  cmptqb9or004a04kzbot7gkjx: "Correto. O POP nº 0009 da PMPE normatiza a conduta em ocorrências envolvendo pessoas com deficiência mental.",
  cmptqba1m004c04kzw1v5l6n4: "Correto. Após o controle da situação, a pessoa com deficiência mental é encaminhada para avaliação médica em hospital de referência, nunca mantida em custódia policial sem respaldo técnico.",
  cmptqba83004d04kznubr8xdu: "Correto. O POP nº 0021 da PMPE trata das ocorrências com crianças e adolescentes.",
  cmptqbakx004f04kz36149haw: "Correto. O POP nº 0005 da PMPE orienta a abordagem e a busca pessoal à população LGBTTI.",
  cmptqbaxs004h04kzhld48q07: "Correto. O nome social deve ser respeitado e anotado, inclusive nos registros policiais oficiais.",
  cmptqbb47004i04kz598753sl: "Correto. A Lei nº 10.216/2001 (saúde mental) e a Lei nº 13.060/2014 (uso de instrumentos de menor potencial ofensivo) fundamentam o atendimento a pessoas com deficiência mental.",
  cmptqbbh2004k04kzyo25w5pf: "Correto. O POP nº 0016 da PMPE regula o atendimento a ocorrências de violência contra a mulher.",
  cmptqbbni004l04kzhb6qmu69: "Correto. A busca pessoal em mulheres é feita preferencialmente por policial feminino; havendo necessidade operacional, por policial homem acompanhado de testemunha não policial.",
  cmptqbc0c004n04kz75r3e90e: "Correto. A entrevista da vítima de violência doméstica deve ser conduzida preferencialmente por policial mulher, para evitar a revitimização.",

  // ── Módulo 9 — Estatuto do Desarmamento ──
  cmptqbdsj004w04kzr6rgc14x: "Correto. O Estatuto do Desarmamento é a Lei nº 10.826/2003.",
  cmptqbdyx004x04kz4g1qif3z: "Correto. O POP nº 0017 da PMPE regula as ocorrências envolvendo armas de fogo.",
  cmptqbebr004z04kz66ws6obb: "Correto. Na abordagem a suspeito armado sem agressividade, o policial mantém a arma em posição segura (posição 4 ou pronto-alto).",
  cmptqbei6005004kzz0flnq24: "Correto. O protocolo (POP 0017) divide a abordagem em três categorias: porte sem agressividade, agressão iminente e agressão atual em curso.",
  cmptqbeok005104kztbh1h526: "Correto. O extravio de arma da corporação deve ser comunicado à autoridade competente no prazo máximo de 3 dias do conhecimento do fato.",
  cmptqbf1f005304kzym3j0zr1: "Correto. O SIGMA é o banco de dados do Exército Brasileiro que registra armas de fogo, inclusive as de CACs (caçadores, atiradores desportivos e colecionadores).",
  cmptqbf7u005404kzarya7zfw: "Correto. A regulamentação de arma de fogo na PMPE é dada pela Instrução Normativa do Comando Geral nº 612, de 22 de maio de 2024.",
  cmptqbfr5005704kz2t3eid0u: "Correto. O emprego de arma branca em crimes como roubo é circunstância agravante na dosimetria da pena.",
  cmptqbfxk005804kzo95otodf: "Correto. A identificação do abordado com arma de fogo inclui a verificação do porte e do Certificado de Registro de Arma de Fogo (CRAF).",
  cmptqbgaj005a04kz0kzhuv3n: "Correto. O porte ilegal (art. 14) é a ação de transportar/trazer consigo a arma em local público ou de acesso ao público — diferente da posse (art. 12), ligada ao local de guarda.",

  // ── Módulo 10 — Drogas ──
  cmptqbke8005w04kza0t4uktl: "Correto. A diferenciação entre usuário e traficante é tema complexo: a Lei de Drogas não traz critério objetivo geral, ficando a cargo da análise judicial, o que pode tornar a aplicação subjetiva.",
  cmptqbk1d005u04kz8efokis3: "Correto. Induzir ou instigar alguém ao uso indevido de droga é conduta do §2º do art. 33, com pena de detenção de 1 a 3 anos.",
  cmptqbjuy005t04kzclbfnz77: "Correto. Oferecer droga eventualmente e sem objetivo de lucro a pessoa do relacionamento, para juntos consumirem, é o §3º do art. 33 (detenção).",
  cmptqbji3005r04kzoyoua3et: "Correto. O §4º do art. 33 permite redução de 1/6 a 2/3 ao agente primário, de bons antecedentes, que não se dedique ao crime nem integre organização criminosa (tráfico privilegiado).",
  cmptqbjbn005q04kz95ypze1p: "Correto. Após a decisão do STF (2024), o porte para uso pessoal segue ilícito, mas não configura sanção penal — sujeitando-se apenas a medidas administrativas.",
  cmptqbj58005p04kzr28o75le: "Correto. A legislação trata o uso como problema de saúde pública (recuperação do usuário) e reprime o tráfico como crime organizado.",
  cmptqbi2r005j04kzhtqw1q4g: "Correto. Em junho de 2024 o STF fixou critério para a maconha: portar até 40 gramas ou cultivar até seis plantas fêmeas presume uso pessoal.",
  cmptqbifl005l04kzgchhqzav: "Correto. O usuário flagrado com pequena quantidade não é preso; sujeita-se a advertência, prestação de serviços à comunidade e comparecimento a cursos educativos (art. 28).",
  cmptqbilz005m04kz6zwevsqi: "Correto. O tráfico (art. 33 da Lei nº 11.343/2006) tem pena de reclusão de 5 a 15 anos e multa de 500 a 1.500 dias-multa.",
  cmptqbise005n04kz5gdx118n: "Correto. O POP nº 0036 da PMPE regula a lavratura do TCO (Termo Circunstanciado de Ocorrência) em ocorrência envolvendo entorpecentes.",

  // ── Módulo 11 — Poluição sonora ──
  cmptqbm6j006504kz99fezmvd: "Correto. A perturbação do sossego alheio está tipificada no art. 42 da Lei de Contravenções Penais.",
  cmptqbnys006f04kz1fj5o0tk: "Correto. Sons de 50-60 dB (equivalentes a uma conversa normal) não causam, em regra, dano à audição.",
  cmptqbmjd006704kzl9r75186: "Correto. A poluição sonora que cause dano à saúde humana ou ao meio ambiente pode configurar crime ambiental (art. 54 da Lei nº 9.605/98).",
  cmptqbn2o006a04kzi70grvmy: "Correto. Ruídos acima de 85 dB, com exposição prolongada, podem causar perda auditiva temporária ou permanente.",
  cmptqbn92006b04kzdp1abgxx: "Correto. A Lei das Contravenções Penais (Decreto-Lei nº 3.688/1941) é o principal diploma que disciplina as contravenções.",
  cmptqbnfj006c04kzp3o59f41: "Correto. A Lei estadual nº 12.789/2005 dispõe sobre ruídos urbanos, poluição sonora e proteção do sossego público em Pernambuco.",
  cmptqbo57006g04kz1ui2ibbd: "Correto. A partir de 60 dB o som já pode agredir o organismo e prejudicar o equilíbrio emocional.",
  cmptqbobn006h04kzg3w14el4: "Correto. A fiscalização da poluição sonora cabe a órgãos municipais, que podem ingressar em estabelecimentos para verificar o cumprimento da legislação.",
  cmptqboi2006i04kzfo39h896: "Correto. O Decreto nº 35.049/2021 do Recife proíbe o uso de fogos de artifício com estampido em eventos públicos promovidos pelo Executivo Municipal.",
  cmptqbm02006404kz9fbvrx5z: "Correto. A poluição sonora pode ser enquadrada como contravenção penal (perturbação do sossego) ou como crime ambiental, conforme o nível de perturbação e os danos.",

  // ── Módulo 12 — Crime/contravenção/ambiental/trânsito/decibéis ──
  cmptqbsly007404kz6wpp0gbb: "Correto. Ruídos intensos geram efeitos além da audição: estresse, ansiedade, insônia, falhas de memória e falta de concentração.",
  cmptqbsfi007304kzn4jsqyyo: "Correto. A exposição prolongada e repetida a sons a partir de 85 dB pode provocar perda auditiva temporária ou permanente.",
  cmptqbs93007204kzq1d2np84: "Correto. Em Pernambuco, a Lei nº 12.789/2005 dispõe sobre ruídos urbanos, poluição sonora e proteção do bem-estar e do sossego público.",
  cmptqbrw8007004kzxqiywvvw: "Correto. São crimes de trânsito do CTB: homicídio culposo, lesão corporal culposa, omissão de socorro, fuga do local e embriaguez ao volante.",
  cmptqbrje006y04kzrsl0t2r1: "Correto. As infrações de trânsito classificam-se em leves, médias, graves e gravíssimas, com penalidades como multa e pontos na CNH.",
  cmptqbrcy006x04kzrlu7148f: "Correto. A Lei nº 9.605/1998 trata das sanções penais e administrativas por condutas e atividades lesivas ao meio ambiente.",
  cmptqbr04006v04kzdndlxw47: "Correto. A perturbação do sossego é exemplo de contravenção penal (gritaria, abuso de instrumentos sonoros e práticas que prejudicam o descanso alheio).",
  cmptqbqtp006u04kzxbdovxc5: "Correto. A Lei das Contravenções Penais é o Decreto-Lei nº 3.688/1941.",
  cmptqbqgv006s04kzcakp91hz: "Correto. A PM atua na primeira intervenção de diversas infrações, preservando o local de crime, socorrendo vítimas e encaminhando ocorrências à autoridade competente.",
  cmptqbq3y006q04kzlujz7td8: "Correto. Pela teoria tripartida, o crime é o fato típico, antijurídico e culpável.",

  // ── Módulo 13 — Escolta e custódia ──
  cmptqbvak007i04kzcpzt4eua: "Correto. Na custódia em ambiente hospitalar é proibida a aproximação de terceiros junto ao preso.",
  cmptqbvgz007j04kzn6z4zvoi: "Correto. O fuzil calibre 7.62 mm é previsto para os casos mais complexos de escolta.",
  cmptqbwjj007p04kzx5xtj8lm: "Correto. Antes de iniciar a escolta, o comandante deve obrigatoriamente informar ao CIODS/COPOM os dados do conduzido e o início do deslocamento.",
  cmptqbw6o007n04kzj89e0rmm: "Correto. A custódia em hospital inclui o acompanhamento do preso em todos os deslocamentos internos (exames, banheiros etc.).",
  cmptqbvtt007l04kzygwqgybb: "Correto. No desembarque, a viatura é posicionada preferencialmente de ré para o prédio e de frente para uma via ou rota de fuga.",
  cmptqbuxp007g04kzni4vpd1z: "Correto. A custódia de preso em hospital deve ser realizada por, no mínimo, dois policiais militares.",
  cmptqbuku007e04kzdb755fno: "Correto. Em escoltas mais complexas, as comunicações com o CIODS devem ser feitas a cada 30 minutos.",
  cmptqbu7u007c04kzaw9rph11: "Correto. O POP nº 0018 da PMPE regula as ações de escolta, condução e custódia de pessoas presas ou apreendidas.",

  // ── Módulo 14 — Repressão qualificada ──
  cmptqc0nc008b04kz5gscobyo: "Correto. O BEPI é o Batalhão de Policiamento do Interior da PMPE.",
  cmptqc0gs008a04kzcfnrqa9x: "Correto. A abordagem comunitária integra as operações de repressão qualificada, fortalecendo a confiança da população.",
  cmptqc0ad008904kzkg7s155p: "Correto. O BPRp é o Batalhão de Policiamento de Radiopatrulha.",
  cmptqc03y008804kzmzsgnjza: "Correto. Nas operações de repressão qualificada, a Polícia Civil responde pelas investigações criminais e pela coleta de provas.",
  cmptqbzr3008604kz0sl2nvep: "Correto. O uso de tecnologia — câmeras de vigilância, drones e sistemas de monitoramento — é crucial para apoiar as operações de repressão qualificada.",
  cmptqbze8008404kzhcfce0bb: "Correto. BIESP é a sigla de Batalhões Integrados Especializados de Policiamento.",
  cmptqbz7t008304kz5x43sy4r: "Correto. A Operação de Repressão Qualificada integra o Plano Estadual de Segurança Pública (Juntos pela Segurança).",
  cmptqbyuy008104kztlqho5xk: "Correto. O GOE (Grupo de Operações Especiais) é unidade da Polícia Civil acionada em resgates de vítimas de extorsão mediante sequestro.",
  cmptqbyol008004kz2horwebc: "Correto. O GATE (Grupamento de Ações Táticas) é unidade especial da Polícia Militar que atua em situações de alto risco, como confrontos armados e resgates.",
  cmptqbybq007y04kzjuj5n4g2: "Correto. A Operação de Repressão Qualificada da SDS de Pernambuco foi criada para combater o crime organizado.",

  // ── Módulo 15 — Grandes eventos e manifestações ──
  cmptqc2fd008k04kzji97jjsg: "Correto. O POP nº 0049 da PMPE estabelece diretrizes para a atuação em manifestações pacíficas e democráticas.",
  cmptqc4qp008x04kzk2hkdptl: "Correto. 'Negociar' é estabelecer vínculo de mediação com manifestantes ou lideranças para convencê-los a não praticar atos que prejudiquem a ordem pública.",
  cmptqc4ka008w04kzodvniquk: "Correto. O envelopamento (retenção) é empregado diante de risco de desordem, com técnicas de isolamento e condução de infratores.",
  cmptqc4dv008v04kzeoc6xlmm: "Correto. 'Conter' é manter a multidão em uma área delimitada por meio de efetivo policial.",
  cmptqc47h008u04kz4525ooq1: "Correto. O contato prévio com os organizadores da manifestação é etapa importante do planejamento operacional.",
  cmptqc3un008s04kzmutu8t8g: "Correto. São erros operacionais comuns o uso de efetivo não treinado e a distribuição incorreta de equipamentos.",
  cmptqc3ht008q04kzhae9u5xr: "Correto. A atuação da imprensa deve ser acompanhada por porta-voz oficial pertencente à 5ª EMG (Comunicação Social).",
  cmptqc350008o04kzsh85chbn: "Correto. O GATI é a guarnição tática que fica a postos para intervenções rápidas em manifestações.",
  cmptqc2s8008m04kzzjeubhuk: "Correto. A estratégia em manifestações pode envolver intervenções indiretas (presença, contenção, negociação) e diretas (dissuasão, dispersão, repressão).",

  // ── Módulo 16 — Alta complexidade ──
  cmptqc6ix009604kzemfopn8s: "Correto. As ocorrências de alta complexidade exigem abordagem cuidadosa, estratégica e coordenada, com prioridade à preservação da vida.",
  cmptqc726009904kzs8jk5mv9: "Correto. As medidas preventivas em carros-fortes incluem segurança reforçada, blindagem, rastreamento, comunicação segura, treinamento e monitoramento.",
  cmptqc78l009a04kzjrfgjvky: "Correto. O POP nº 0025 trata das ocorrências de assaltos e arrombamentos a instituições financeiras na RMR.",
  cmptqc7li009c04kzrjaewqh5: "Correto. Ao confirmar a ação criminosa, as guarnições devem relatar ao COPOM dados como número de criminosos, armamento e veículos utilizados.",
  cmptqc7yd009e04kzxf9d6zkt: "Correto. Entre as medidas imediatas em uma crise estão identificar, acionar, conter, isolar e verbalizar.",
  cmptqc8b8009g04kzyqnq2qgy: "Correto. Isolar o ponto crítico envolve delimitar o local, interromper contatos indevidos com o exterior e evacuar pessoas não envolvidas.",
  cmptqc8hm009h04kz5u7aima2: "Correto. O POP nº 0015 trata da padronização das ações policiais em rebeliões em estabelecimentos prisionais.",
  cmptqc8o2009i04kzkuflvsqu: "Correto. Em rebeliões prisionais, ações isoladas sem autorização dos gerentes da crise são apontadas como erro operacional.",
  cmptqc90x009k04kzqqrxoffs: "Correto. O POP nº 0013 é voltado à primeira intervenção em ocorrência de tomada de reféns, com foco na preservação de vidas e na aplicação legal da lei.",
  cmptqc6vr009804kzxz2hqdc1: "Correto. Assaltos a carros-fortes podem envolver violência, armas de fogo, ameaças e danos materiais significativos.",
}

async function main() {
  let ok = 0, miss = 0
  for (const [id, explicacao] of Object.entries(EXPL)) {
    const r = await prisma.questao.updateMany({ where: { id, materia: "PO" }, data: { explicacao } })
    if (r.count) ok++; else { miss++; console.log("não encontrada:", id) }
  }
  console.log(`\nPO: ${ok} justificativas atualizadas, ${miss} não encontradas (de ${Object.keys(EXPL).length}).`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
