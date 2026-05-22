import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

// Campos: mat, ng (nomeGuerra — não alterar), nc (nomeCompleto), email,
//         aniv (aniversario — não alterar), alojamento, canga (nome do par),
//         par (cangaPar — matrícula), plantao (grupoPlantao), faxina (grupoFaxina), admin?
const ALUNOS = [
  { mat: 1,   ng: "HELLTON FERNANDES", nc: "João Hellton Fernandes de Santana",            email: "joaohelltonfernandes@gmail.com",      aniv: "01/09", alojamento: "ALPHA",    canga: "JONAS",            par: 13,  plantao: "HOTEL",   faxina: "G2" },
  { mat: 7,   ng: "ALDO SILVA",        nc: "Aldo Mello da Silva",                          email: "aldomello60@gmail.com",              aniv: "13/05", alojamento: "BRAVO",    canga: "PABLO TORRES",     par: 37,  plantao: "GOLF",    faxina: "G8" },
  { mat: 13,  ng: "JONAS",             nc: "Jonas Glauber Oliveira Silva",                 email: "jonas-glauber@hotmail.com",          aniv: "03/03", alojamento: "ALPHA",    canga: "HELLTON FERNANDES",par: 1,   plantao: "HOTEL",   faxina: "G2" },
  { mat: 19,  ng: "THAIS FIGUEIREDO", nc: "Thais Faustino Figueiredo da Silva",            email: "thaisfigueiredo.adv@outlook.com",    aniv: "23/03", alojamento: "FEMININO", canga: "GABRIELE COSTA",   par: 45,  plantao: "GOLF",    faxina: "G7" },
  { mat: 23,  ng: "RODOLFO MOURA",    nc: "Rodolfo Moura de Carvalho",                     email: "rodolfo_moura_carvalho@hotmail.com", aniv: "21/07", alojamento: "ALPHA",    canga: "ANDRE",            par: 26,  plantao: "HOTEL",   faxina: "G4" },
  { mat: 26,  ng: "ANDRE",            nc: "Andre de Araujo Correia",                       email: "andrecorreia188@gmail.com",          aniv: "30/11", alojamento: "ALPHA",    canga: "RODOLFO MOURA",    par: 23,  plantao: "KILO",    faxina: "G8" },
  { mat: 37,  ng: "PABLO TORRES",     nc: "Pablo Rafael Torres",                           email: "Pablo.direitopenal22@gmail.com",     aniv: "22/06", alojamento: "BRAVO",    canga: "ALDO SILVA",       par: 7,   plantao: "KILO",    faxina: "G8" },
  { mat: 41,  ng: "ALAN SILVA",       nc: "Alan Gomes da Silva",                           email: "alan.gomes.da.silva@hotmail.com",    aniv: "07/01", alojamento: "BRAVO",    canga: "JOÃO NUNES",       par: 60,  plantao: "INDIA",   faxina: "G6" },
  { mat: 45,  ng: "GABRIELE COSTA",   nc: "Gabriele Rebeca de Sena Costa",                 email: "gabrieledesenacosta@gmail.com",      aniv: "08/07", alojamento: "FEMININO", canga: "THAIS FIGUEIREDO", par: 19,  plantao: "HOTEL",   faxina: "G7" },
  { mat: 54,  ng: "ELDER CARVALHO",   nc: "Elder de Carvalho Silva",                       email: "elder_carvalho.silva@hotmail.com",   aniv: "16/04", alojamento: "ALPHA",    canga: "CLEYTON",          par: 57,  plantao: "HOTEL",   faxina: "G7" },
  { mat: 55,  ng: "SHIRLAYNE",        nc: "Shirlayne Chapron Ribeiro",                     email: "shirlaynechapronr@gmail.com",        aniv: "25/07", alojamento: "FEMININO", canga: "KAUHANNI",         par: 65,  plantao: "JULIETT", faxina: "G6" },
  { mat: 57,  ng: "CLEYTON",          nc: "Cleyton Washington Lopes de Lima",              email: "cleyton.washington97@hotmail.com",   aniv: "01/09", alojamento: "ALPHA",    canga: "ELDER CARVALHO",   par: 54,  plantao: "GOLF",    faxina: "G7" },
  { mat: 60,  ng: "JOÃO NUNES",       nc: "João Nunes dos Santos Neto",                    email: "joaonetto.19@hotmail.com",           aniv: "27/06", alojamento: "BRAVO",    canga: "ALAN SILVA",       par: 41,  plantao: "INDIA",   faxina: "G6" },
  { mat: 65,  ng: "KAUHANNI",         nc: "Larissa Kauhanni Alves Ferreira Neto",          email: "larissaalveskau@gmail.com",          aniv: "23/04", alojamento: "FEMININO", canga: "SHIRLAYNE",        par: 55,  plantao: "KILO",    faxina: "G6" },
  { mat: 71,  ng: "LEIMIG",           nc: "José Gustavo Leimig de Oliveira Filho",         email: "josegugafilho@gmail.com",            aniv: "18/10", alojamento: "ALPHA",    canga: "ARAÚJO JR",        par: 76,  plantao: "JULIETT", faxina: "G5" },
  { mat: 76,  ng: "ARAUJO JUNIOR",    nc: "Ramiro Amado de Araujo Junior",                 email: "ramirojunior_28@hotmail.com",        aniv: "15/11", alojamento: "ALPHA",    canga: "LEIMIG",           par: 71,  plantao: "JULIETT", faxina: "G5" },
  { mat: 81,  ng: "FERNANDO ROCHA",   nc: "Ralzemberg Fernando Barbosa Rocha de Freitas",  email: "ralzembergfreitas@gmail.com",        aniv: "07/01", alojamento: "ALPHA",    canga: "RAFAEL RIBEIRO",   par: 106, plantao: "INDIA",   faxina: "G4" },
  { mat: 94,  ng: "ANDRÉ CARDOSO",    nc: "Bruno Andre Cardoso da Silva",                  email: "brunoandre1618@gmail.com",           aniv: "16/11", alojamento: "ALPHA",    canga: "SAMUEL SANTOS",    par: 144, plantao: "JULIETT", faxina: "G3" },
  { mat: 98,  ng: "JOSE MENEZES",     nc: "Jose Marcos Silva de Menezes",                  email: "marcosmenezes12@hotmail.com",        aniv: "12/10", alojamento: "BRAVO",    canga: "LUCAS EDUARDO",    par: 105, plantao: "KILO",    faxina: "G5" },
  { mat: 105, ng: "LUCAS EDUARDO",    nc: "Lucas Eduardo Rufino da Silva",                 email: "lucas.ers@hotmail.com",              aniv: "10/07", alojamento: "BRAVO",    canga: "JOSE MENEZES",     par: 98,  plantao: "HOTEL",   faxina: "G5" },
  { mat: 106, ng: "RAFAEL RIBEIRO",   nc: "Rafael Ribeiro da Silva",                       email: "rafaelribeiro@y7mail.com",          aniv: "23/07", alojamento: "ALPHA",    canga: "FERNANDO ROCHA",   par: 81,  plantao: "HOTEL",   faxina: "G4" },
  { mat: 108, ng: "LISANDRY",         nc: "Lisandry Julia Ferraz Leite de Souza",          email: "lisandryleite@gmail.com",            aniv: "08/02", alojamento: "FEMININO", canga: "JOSIANE FARIAS",   par: 114, plantao: "LIMA",    faxina: "G4", admin: true },
  { mat: 114, ng: "JOSIANE FARIAS",   nc: "Josiane Farias de Freitas",                     email: "Josiane.farias12@gmail.com",         aniv: "01/06", alojamento: "FEMININO", canga: "LISANDRY",         par: 108, plantao: "LIMA",    faxina: "G4" },
  { mat: 116, ng: "BERTIPALHA",       nc: "Guilherme Bertipalha Vieira",                   email: "guibertipalha@gmail.com",            aniv: "23/03", alojamento: "BRAVO",    canga: null,               par: null, plantao: "INDIA",  faxina: "G2" },
  { mat: 131, ng: "JOSÉ INACIO",      nc: "Glaybson Jose Inacio",                          email: "glaybsongji@yahoo.com.br",           aniv: "09/02", alojamento: "BRAVO",    canga: "KEVIN GOMES",      par: 165, plantao: "LIMA",    faxina: "G3" },
  { mat: 143, ng: "VIDAL",            nc: "Renan Nogueira Vidal",                          email: "renan_fortaleza07@hotmail.com",      aniv: "29/09", alojamento: "BRAVO",    canga: "GOMES NASCIMENTO", par: 191, plantao: "GOLF",    faxina: "G1" },
  { mat: 144, ng: "SAMUEL SANTOS",    nc: "Samuel da Silva Santos",                        email: "samuelpray00@gmail.com",             aniv: "15/11", alojamento: "ALPHA",    canga: "ANDRÉ CARDOSO",    par: 94,  plantao: "HOTEL",   faxina: "G3" },
  { mat: 153, ng: "HUGO",             nc: "Hugo Telis Cavalcante",                         email: "hugotelis@gmail.com",               aniv: "02/01", alojamento: "ALPHA",    canga: "ALEXANDRE",        par: 174, plantao: "INDIA",   faxina: "G1" },
  { mat: 165, ng: "KEVIN GOMES",      nc: "Kevin Schwantz Gomes da Silva",                 email: "schwaantz@gmail.com",               aniv: "25/06", alojamento: "BRAVO",    canga: "JOSÉ INÁCIO",      par: 131, plantao: "HOTEL",   faxina: "G3" },
  { mat: 167, ng: "GUSTAVO NETO",     nc: "Wendell Gustavo Ferreira Neto",                 email: "Wendellneto22@gmail.com",            aniv: "05/07", alojamento: "BRAVO",    canga: "SAMUEL SILVA",     par: 186, plantao: "LIMA",    faxina: "G2" },
  { mat: 174, ng: "ALEXANDRE",        nc: "Carlos Alexandre de Oliveira Filho",            email: "calexandredeof@gmail.com",           aniv: "12/03", alojamento: "ALPHA",    canga: "HUGO",             par: 153, plantao: "JULIETT", faxina: "G1" },
  { mat: 186, ng: "SAMUEL SILVA",     nc: "Samuel Dezinho da Silva",                       email: "samueldezinho50@gmail.com",          aniv: "20/09", alojamento: "BRAVO",    canga: "GUSTAVO NETO",     par: 167, plantao: "LIMA",    faxina: "G1" },
  { mat: 191, ng: "GOMES NASCIMENTO", nc: "Renato Gomes do Nascimento",                    email: "renatogomes72444@gmail.com",         aniv: "18/05", alojamento: "BRAVO",    canga: "VIDAL",            par: 143, plantao: "GOLF",    faxina: "G1" },
  { mat: 206, ng: "CESAR",            nc: "A complementar", email: "cesar206@turma13.local",    plantao: null, faxina: null, alojamento: null, canga: null, par: null },
  { mat: 207, ng: "HOBERDAN",         nc: "A complementar", email: "hoberdan207@turma13.local", plantao: null, faxina: null, alojamento: null, canga: null, par: null },
]

const DISCIPLINAS = [
  ["SSP","Sistema de Segurança Pública","MC-I",30,30,"Concluída"],
  ["TGA","Teoria Geral da Administração","MC-I",30,30,"Concluída"],
  ["GPGA","Gestão Pública Geral Aplicada","MC-I",30,22,"Em andamento"],
  ["GPCL","Gestão de Pessoas, Comando e Liderança","MC-I",30,30,"Concluída"],
  ["GLOFP","Gestão de Logística, Orçamento e Finanças Públicas","MC-I",40,40,"Concluída"],
  ["FPC","Fundamentos da Polícia Comunitária","MC-II",20,20,"Concluída"],
  ["PA","Psicologia Aplicada","MC-II",30,30,"Concluída"],
  ["ACE","Análise Criminal e Estatística","MC-II",30,30,"Concluída"],
  ["QAGV","Qualidade do Atendimento aos Grupos Vulneráveis","MC-II",20,0,"Início"],
  ["DHAAPM","Direitos Humanos Aplicados à Atividade Policial Militar","MC-III",30,30,"Concluída"],
  ["CMSCM","Gerenciamento de Crises","MC-IV",30,30,"Concluída"],
  ["SMQV","Saúde Mental e Qualidade de Vida","MC-V",20,20,"Concluída"],
  ["TFM1","Treinamento Físico Militar I","MC-V",60,60,"Concluída"],
  ["TFM2","Treinamento Físico Militar II","MC-V",60,7,"Em andamento"],
  ["GPSEI","Gestão de Processos no SEI e Correspondência Militar","MC-VI",30,30,"Concluída"],
  ["TIC","Tecnologia da Informação e Comunicação","MC-VI",40,40,"Concluída"],
  ["CMSCM2","Comunicação, Mídias Sociais e Cerimonial Militar","MC-VI",30,30,"Concluída"],
  ["IG","Inteligência e Sistema de Informação de Seg. Pública","MC-VI",30,30,"Concluída"],
  ["ECRI","Ética, Cidadania e Relações Interpessoais","MC-VII",20,20,"Concluída"],
  ["OU1","Ordem Unida I","MC-VII",40,40,"Concluída"],
  ["OU2","Ordem Unida II","MC-VII",40,0,"Início"],
  ["INSTG","Instrução Geral","MC-VII",40,40,"Concluída"],
  ["DPP1","Defesa Pessoal Policial I","MC-VIII",30,30,"Concluída"],
  ["DPP2","Defesa Pessoal Policial II","MC-VIII",30,30,"Concluída"],
  ["UDF","Uso Diferenciado da Força","MC-VIII",50,0,"Início"],
  ["PS","Pronto Socorrismo","MC-VIII",20,20,"Concluída"],
  ["APHT","Atendimento Pré-Hospitalar Tático","MC-VIII",20,0,"Início"],
  ["POE","Planejamento Operacional e Especializado","MTP-I",60,0,"Início"],
  ["EPCR","Elaboração de Projetos e Captação de Recursos","MTP-I",20,0,"Início"],
  ["PE","Planejamento Estratégico","MTP-I",20,0,"Início"],
  ["GRAPP","Gestão Por Resultados e Avaliação de Políticas Públicas","MTP-I",20,10,"Em andamento"],
  ["TCEM","Trabalho de Comando e Estado Maior","MTP-I",40,0,"Início"],
  ["PJM","Polícia Judiciária Militar","MTP-III",40,0,"Início"],
  ["DADM","Direito Administrativo Disciplinar Militar","MTP-III",60,46,"Em andamento"],
  ["DPPM","Direito Penal e Processual Penal Militar","MTP-III",60,0,"Início"],
  ["LPMO","Legislação Policial Militar e Organizacional","MTP-III",40,18,"Em andamento"],
  ["PO","Procedimento em Ocorrência","MTP-IV",40,14,"Em andamento"],
  ["EASE","Economia Aplicada ao Setor Público","MTP-VII",30,0,"Início"],
  ["HPMPE","História da PMPE","MTP-VII",20,20,"Concluída"],
  ["AP","Abordagem a Pessoas","MTP-VIII",50,0,"Início"],
  ["AV","Abordagem a Veículos","MTP-VIII",50,0,"Início"],
  ["AE","Abordagem a Edificações","MTP-VIII",50,0,"Início"],
  ["PU","Patrulhamento Urbano","MTP-VIII",40,0,"Início"],
  ["AM","Armamento e Munição","MTP-VIII",60,0,"Início"],
  ["TP","Tiro Policial","MTP-VIII",60,0,"Início"],
  ["TDV","Tiro Defensivo na Preservação da Vida","MTP-VIII",36,0,"Início"],
  ["ABAA","Ações Básicas de Apoio Aéreo","MTP-VIII",20,0,"Início"],
  ["MAP1","Manobras Acadêmicas Policiais Militares I","MTP-VIII",50,0,"Início"],
  ["MAP2","Manobras Acadêmicas Policiais Militares II","MTP-VIII",50,0,"Início"],
  ["MPC","Metodologia da Pesquisa Científica","MTP-IX",30,0,"Início"],
  ["TPE","Teoria e Prática do Ensino","MTP-IX",40,0,"Início"],
  ["TCC","Trabalho de Conclusão de Curso","MTP-IX",20,0,"Início"],
]

const XERIFES = [
  { mat: 186, ng: "SAMUEL SILVA", ini: "2026-01-12", fim: "2026-01-20" },
  { mat: 106, ng: "RAFAEL RIBEIRO", ini: "2026-01-20", fim: "2026-02-03" },
  { mat: 55, ng: "SHIRLAYNE", ini: "2026-02-03", fim: "2026-02-13" },
  { mat: 114, ng: "JOSIANE FARIAS", ini: "2026-02-13", fim: "2026-02-23" },
  { mat: 116, ng: "BERTIPALHA", ini: "2026-02-23", fim: "2026-03-02" },
  { mat: 131, ng: "JOSÉ INACIO", ini: "2026-03-02", fim: "2026-03-09" },
  { mat: 143, ng: "VIDAL", ini: "2026-03-09", fim: "2026-03-16" },
  { mat: 144, ng: "SAMUEL SANTOS", ini: "2026-03-16", fim: "2026-03-23" },
  { mat: 153, ng: "HUGO", ini: "2026-03-23", fim: "2026-03-30" },
  { mat: 167, ng: "GUSTAVO NETO", ini: "2026-03-30", fim: "2026-04-07" },
  { mat: 7, ng: "ALDO SILVA", ini: "2026-04-07", fim: "2026-04-14" },
  { mat: 108, ng: "LISANDRY", ini: "2026-04-14", fim: "2026-04-21" },
  { mat: 71, ng: "LEIMIG", ini: "2026-04-21", fim: "2026-04-28" },
  { mat: 98, ng: "JOSE MENEZES", ini: "2026-04-28", fim: "2026-05-08" },
  { mat: 45, ng: "GABRIELE COSTA", ini: "2026-05-08", fim: "2026-05-18" },
  { mat: 23, ng: "RODOLFO MOURA", ini: "2026-05-18", fim: null, atual: true },
]

async function main() {
  console.log("Seeding database...")

  // Limpa tudo
  await prisma.xerife.deleteMany()
  await prisma.disciplina.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Hash padrão: matrícula como senha
  for (const a of ALUNOS) {
    const senhaHash = await bcrypt.hash(String(a.mat), 12)
    await prisma.user.create({
      data: {
        matricula: a.mat,
        nomeGuerra: a.ng,
        nomeCompleto: a.nc,
        email: a.email.toLowerCase(),
        password: senhaHash,
        isAdmin: !!(a as any).admin,
        aniversario: (a as any).aniv || null,
        alojamento: (a as any).alojamento || null,
        canga: (a as any).canga || null,
        cangaPar: (a as any).par ?? null,
        grupoPlantao: (a as any).plantao || null,
        grupoFaxina: (a as any).faxina || null,
      },
    })
    console.log(`✓ ${a.mat} ${a.ng}`)
  }

  // Disciplinas
  for (const [sigla, nome, modulo, cargaTotal, cargaMinistrada, status] of DISCIPLINAS) {
    await prisma.disciplina.create({
      data: { sigla: sigla as string, nome: nome as string, modulo: modulo as string, cargaTotal: cargaTotal as number, cargaMinistrada: cargaMinistrada as number, status: status as string },
    })
  }
  console.log(`✓ ${DISCIPLINAS.length} disciplinas`)

  // Xerifes
  for (const x of XERIFES) {
    await prisma.xerife.create({
      data: {
        matricula: x.mat,
        nomeGuerra: x.ng,
        dataInicio: new Date(x.ini),
        dataFim: x.fim ? new Date(x.fim) : null,
        atual: !!(x as any).atual,
      },
    })
  }
  console.log(`✓ ${XERIFES.length} xerifes`)

  console.log("\nSeed concluído! Senha padrão de cada aluno = número da matrícula.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
