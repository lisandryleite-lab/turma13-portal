/**
 * Preenche as fichas "Conheça o batalhão" (OpmInfo) com dados públicos.
 *
 * Fontes:
 *  - Relação dos comandantes, chefes e diretores da PMPE (EMG/5ª Seção),
 *    publicada em pm.pe.gov.br em mar/2026 — comandante, endereço, telefone.
 *  - Páginas de cada BPM em pm.pe.gov.br — endereço, e-mail e responsabilidade
 *    territorial por companhia; página da DIM — subordinação.
 *  - Lei estadual de 2025 que extinguiu a CIATur e criou o BPTur (DIRESP).
 *  - Deslocamentos: rotas de carro (OSRM/OpenStreetMap) da sede até Paudalho
 *    (APMP) e até o Marco Zero, SEM trânsito — estimativa.
 * Efetivo e subcomandante não são publicados — ficam em branco.
 * Só preenche campo vazio; não sobrescreve o que o admin já editou (--forcar
 * para regravar tudo).
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const DIM = "DIM — Diretoria Integrada Metropolitana"
const FONTE_CMT = " (relação de comandantes da PMPE, mar/2026)"
const desloc = (acesso: string, apmpKm: number, apmpMin: number, mzKm: number, mzMin: number) =>
  `${acesso}\nAté a APMP (Paudalho): ~${String(apmpKm).replace(".", ",")} km, ~${apmpMin} min de carro sem trânsito.\nAté o Marco Zero (Recife): ~${String(mzKm).replace(".", ",")} km, ~${mzMin} min sem trânsito.`
const MORAR = "\n(Sugestão inicial — complete no mural com valores de aluguel e dicas.)"

type Ficha = Partial<Record<"comandante" | "cpm" | "sede" | "endereco" | "telefone" | "email" | "area" | "sobreArea" | "morarPerto" | "distanciaBR", string>>

const FICHAS: Record<string, Ficha> = {
  "1º BPM": {
    comandante: "TC PM Lenildo de Freitas Paixão" + FONTE_CMT, cpm: DIM, sede: "Rio Doce, Olinda",
    endereco: "Av. Gov. Carlos de Lima Cavalcanti, 5075 – Rio Doce, Olinda-PE",
    telefone: "(81) 3181-1720 / 3181-1721 / 3181-1722 / 3181-1723", email: "1bpm@pm.pe.gov.br",
    area: "Município de Olinda (o site da PMPE não detalha as companhias).",
    sobreArea: "Olinda inteira, cidade de alta densidade urbana. O Sítio Histórico (Carmo, Varadouro, Amparo) tem policiamento turístico próprio da 1ª Cia do BPTur.",
    morarPerto: "Rio Doce, Casa Caiada, Bairro Novo, Jardim Atlântico e Janga (Paulista) ficam próximos da sede." + MORAR,
    distanciaBR: desloc("Acesso pela PE-15, que liga Olinda a Paulista e ao Recife.", 55.2, 49, 12.7, 14),
  },
  "6º BPM": {
    comandante: "TEN CEL PM Carlos Fernando de Souza Santos" + FONTE_CMT, cpm: DIM, sede: "Prazeres, Jaboatão dos Guararapes",
    endereco: "Estrada da Batalha, s/n – Prazeres, Jaboatão dos Guararapes-PE",
    telefone: "(81) 3181-1650 / 3181-1657 · (81) 3183-5442 / 5443 / 5454", email: "6bpm@pm.pe.gov.br",
    area: "Jaboatão dos Guararapes (o site da PMPE não detalha as companhias). A região de Jaboatão Centro, Cavaleiro, Curado e Moreno é do 25º BPM.",
    sobreArea: "Município populoso da RMR, vizinho à Zona Sul do Recife, com área urbana e litoral.",
    morarPerto: "Prazeres, Piedade, Candeias e Boa Viagem (Recife) ficam próximos da sede." + MORAR,
    distanciaBR: desloc("Prazeres é cortado pela BR-101 Sul.", 46.8, 44, 11.5, 15),
  },
  "11º BPM": {
    comandante: "TC QOPM Marcos Antonio Vasconcelos de Melo Junior" + FONTE_CMT, cpm: DIM, sede: "Apipucos, Recife",
    endereco: "Rua Apipucos, 15 – Apipucos, Recife-PE",
    telefone: "(81) 3183-5459 / 3183-5460 / 3183-5474", email: "11bpm@pm.pe.gov.br",
    area: "Zona Norte do Recife.\n1ª CIA: Apipucos, Macaxeira, Nova Descoberta, Brejo de Beberibe, Brejo da Guabiraba, Córrego do Jenipapo, Dois Irmãos, Sítio dos Pintos, Guabiraba, Monteiro, Alto do Mandu, Pau Ferro, Bom Clima, Burity, Singapura, Vila Aritana.\n2ª CIA: Alto José do Pinho, Mangabeira, Morro da Conceição, Vasco da Gama.\n3ª CIA: Bomba do Hemetério, Alto Santa Terezinha, Alto José Bonifácio, Linha do Tiro, Dois Unidos, Passarinho, Beberibe, Porto da Madeira.\n4ª CIA: Jaqueira, Santana, Poço da Panela, Parnamirim, Casa Forte, Tamarineira, Casa Amarela.",
    sobreArea: "Área bem diversa: bairros residenciais de alto padrão (Casa Forte, Jaqueira, Parnamirim) ao lado de morros e comunidades populosas (Alto José do Pinho, Morro da Conceição, Passarinho) e áreas de mata (Dois Irmãos, Guabiraba).",
    morarPerto: "Casa Forte, Parnamirim, Tamarineira, Casa Amarela, Monteiro e Apipucos." + MORAR,
    distanciaBR: desloc("Zona Norte do Recife.", 34.5, 35, 10, 14),
  },
  "12º BPM": {
    comandante: "TC QOPM Everaldo Vitor Alves Júnior" + FONTE_CMT, cpm: DIM, sede: "Várzea, Recife",
    endereco: "Rua Dona Maria Lacerda, s/n – Várzea, Recife-PE",
    telefone: "(81) 3183-5392 / 3183-5393 / 3183-5394 / 3183-5395", email: "12bpm@pm.pe.gov.br",
    area: "Zona Oeste do Recife: Afogados, Jiquiá, Estância, Areias, Caçote, Ilha do Retiro, Prado, Bongi, Mustardinha, Mangueira, San Martin, Jardim São Paulo, Barro, Tejipió, Sancho, Totó, Coqueiral, Torrões, Engenho do Meio, Cidade Universitária, Várzea, Caxangá e Curado (I a IV).",
    sobreArea: "Zona Oeste do Recife, com a Cidade Universitária (UFPE), a Ilha do Retiro e bairros populosos como Afogados, San Martin e Jardim São Paulo; na divisa com Jaboatão e Camaragibe.",
    morarPerto: "Várzea, Cidade Universitária, Engenho do Meio, Caxangá, Iputinga e Madalena." + MORAR,
    distanciaBR: desloc("A área inclui o Curado, onde a BR-232 se liga à BR-101.", 32.9, 33, 14.5, 17),
  },
  "13º BPM": {
    comandante: "TC PM Carla Cristina de Oliveira" + FONTE_CMT, cpm: DIM, sede: "Santo Amaro, Recife",
    endereco: "Av. Agamenon Magalhães, 700 – Santo Amaro, Recife-PE",
    telefone: "(81) 3183-5426 / 3183-5428 / 3183-5429 / 3183-5438", email: "13bpm@pm.pe.gov.br",
    area: "Recife: Campo Grande, Torreão, Espinheiro, Aflitos, Derby, Graças, Rosarinho, Encruzilhada, Hipódromo, Ponto de Parada, Cordeiro, Zumbi, Madalena, Torre, Iputinga, Água Fria, Campina do Barreto, Arruda, Fundão, Cajueiro e Chã de Estrelas.",
    sobreArea: "Faixa central-norte do Recife, ao longo da Av. Agamenon Magalhães: bairros residenciais e comerciais (Graças, Espinheiro, Madalena, Torre) e áreas populosas (Água Fria, Arruda, Campo Grande).",
    morarPerto: "Graças, Espinheiro, Aflitos, Madalena, Torre e Rosarinho." + MORAR,
    distanciaBR: desloc("Área central do Recife, na Av. Agamenon Magalhães.", 44, 38, 4.1, 7),
  },
  "16º BPM": {
    comandante: "TC QOPM Rodrigo Jorge Grisi da Costa Vasconcelos" + FONTE_CMT, cpm: DIM, sede: "São José, Recife",
    endereco: "Cais de Santa Rita, s/n (antiga Rodoviária) – São José, Recife-PE",
    telefone: "(81) 3181-1782 / 3181-1783 / 3181-1791", email: "16bpm@pm.pe.gov.br",
    area: "Centro do Recife: Recife Antigo, Santo Antônio, São José, Cabanga, Joana Bezerra, Coelhos, Ilha do Leite, Paissandu, Boa Vista, Soledade e Santo Amaro.",
    sobreArea: "Centro histórico e comercial do Recife, com grande circulação de pessoas, comércio popular (São José, Santo Antônio), o polo médico da Ilha do Leite e grandes eventos.",
    morarPerto: "Boa Vista, Ilha do Leite, Graças e Derby, ou Boa Viagem pela Zona Sul." + MORAR,
    distanciaBR: desloc("Centro do Recife.", 45.5, 39, 1.5, 2),
  },
  "17º BPM": {
    comandante: "TC QOPM Carlos André Ferraz da Silva" + FONTE_CMT, cpm: DIM + " · AIS-8", sede: "Aurora, Paulista",
    endereco: "Rua Nova Mangueira, 05 – Aurora, Paulista-PE (site da PMPE). A relação de comandantes de mar/2026 informa Av. Senador Salgado Filho, 500, Centro, Paulista.",
    telefone: "(81) 3181-3600 / 3181-3602 / 3181-3603", email: "17bpm@pm.pe.gov.br",
    area: "Paulista e Abreu e Lima.\n1ª Cia (Paulista): Centro, Nobre, Alto do Bigode, Vila Torres Galvão, Sítio Fragoso, Jardim Paulista Baixo e Alto, Mirueira, Arthur Lundgren I e II, Paratibe, Jardim Velho, Jaguaribe.\n2ª Cia (Paulista): Tururu, Conjunto Beira Mar, Janga, Maranguape I, II e III, Riacho do Prata, Alameda Paulista, Nossa Senhora do Ó, Pau Amarelo, Maria Farinha, Conceição, Jaguaruana, Poty, Conjunto Dom Helder, Praia do Janga.\n3ª Cia (Abreu e Lima): Centro, Caetés I, II e III, Caetés Velho, Timbó, Fosfato, Matinha, Jardim Planalto, Alto São Miguel, Desterro, Alto da Bela Vista.",
    sobreArea: "Litoral norte da RMR (Janga, Pau Amarelo, Maria Farinha), com áreas urbanas populosas em Paulista e Abreu e Lima.",
    morarPerto: "Paulista Centro, Janga, Maranguape e Casa Caiada/Rio Doce (Olinda)." + MORAR,
    distanciaBR: desloc("A BR-101 Norte e a PE-15 cortam a área (Paulista e Abreu e Lima).", 45.9, 47, 17.4, 22),
  },
  "18º BPM": {
    comandante: "TC QOPM Rubens Jorge Rocha Barreto Filho" + FONTE_CMT, cpm: DIM, sede: "Vila da COHAB, Cabo de Santo Agostinho",
    endereco: "Rua 53, s/n – Vila da COHAB, Cabo de Santo Agostinho-PE",
    telefone: "(81) 3181-3540 / 3181-3541 / 3181-3542 / 3181-3543", email: "18bpm@pm.pe.gov.br",
    area: "Cabo de Santo Agostinho e Ipojuca.\n1ª CIA (Cabo): Centro, Charnequinha, Torrinha, Malaquias, Vila Cohab, São Francisco, Gaibu, Suape, Rosário, Charneca, Pirapama, Cidade Garapu, Enseada dos Corais, Itapuama, Praia do Paiva, Calhetas, Vila de Nazaré e engenhos.\n2ª CIA: Ponte dos Carvalhos, Pontezinha, Vila Nova, João de Deus, Alto do Sol e loteamentos vizinhos.\n3ª CIA (Ipojuca): Centro, Rurópolis, Camela, Engenho Guerra.\n4ª CIA (Ipojuca): Porto de Galinhas, Nossa Senhora do Ó, Serrambi, Maracaípe, Toquinho, Muro Alto, Cupe.",
    sobreArea: "Área extensa no litoral sul: inclui o Complexo Industrial Portuário de Suape e o polo turístico de Porto de Galinhas, Muro Alto e Maracaípe, além de zona rural com engenhos.",
    morarPerto: "Cabo Centro, Ponte dos Carvalhos, Gaibu, ou Candeias e Piedade (Jaboatão) para quem prefere ficar mais perto do Recife." + MORAR,
    distanciaBR: desloc("O Cabo é cortado pela BR-101 Sul; a PE-060 segue para o litoral sul (Suape e Ipojuca).", 65.7, 59, 34.3, 34),
  },
  "19º BPM": {
    comandante: "TC QOPM Davidson Michel Ramos da Cunha" + FONTE_CMT, cpm: DIM, sede: "Pina, Recife",
    endereco: "Rua Manoel de Brito, s/n – Pina, Recife-PE (relação de mar/2026). O site da PMPE ainda informa Rua Francisco Barreto, s/n, Ipsep.",
    telefone: "(81) 3181-3561 / 3181-3562 / 3181-3563 / 3181-3573", email: "19bpm@pm.pe.gov.br",
    area: "Zona Sul do Recife.\n1ª CIA: Boa Viagem, Pina, Brasília Teimosa, Setúbal, Jardim Beira Rio, Jardim Boa Viagem.\n2ª CIA: Imbiribeira, Ipsep, Ilha de Deus, Jardim Imbiribeira.\n3ª CIA: Jordão Alto e Baixo, Ibura Baixo, Jardim Jordão.\n4ª CIA: URs I, II, III, IV, X e XII, Jardim Monte Verde, Lagoa Encantada, Zumbi do Pacheco, Três Carneiros, Dois Carneiros, Milagres, Pantanal, Candeeiro.",
    sobreArea: "Zona Sul: orla de Boa Viagem e Pina (comércio, turismo e alta densidade de prédios) e bairros populosos do Ibura, Jordão e das URs.",
    morarPerto: "Boa Viagem, Pina, Setúbal e Imbiribeira." + MORAR,
    distanciaBR: desloc("Zona Sul do Recife.", 45, 39, 4.7, 6),
  },
  "20º BPM": {
    comandante: "TC QOPM Ilson de Oliveira Gonçalves" + FONTE_CMT, cpm: DIM, sede: "Muribara / Parque Capibaribe, São Lourenço da Mata",
    endereco: "Av. Um, s/n – Muribara, São Lourenço da Mata-PE",
    telefone: "(81) 3181-3580 / 3181-3581 / 3181-3582 / 3181-3583 / 3181-3584", email: "20bpm@pm.pe.gov.br",
    area: "São Lourenço da Mata e Camaragibe.\n1ª CIA (São Lourenço): Centro, Matriz da Luz, Bela Vista, Caiara, Capibaribe, Chã de Tábua, Ercina Lapenda, Muribara, Nova Tiuma, Parque Capibaribe, Penedo, Pixete, Tiuma, Várzea Fria, Vila do Reinado e área rural (Lages, Tapacurá).\n2ª CIA (Camaragibe): Centro, Alberto Maia, Santana, Timbi, Santa Mônica, Bairro Novo, Céu Azul, Bairro dos Estados, Viana, João Paulo II, Santa Tereza, Estação Nova, Areeiro, Alto Boa Vista.\n3ª CIA: Aldeia, Tabatinga, Jardim Primavera, Vila da Fábrica, Vera Cruz, São Pedro, Aldeia de Baixo, Nazaré, Vila da Inabi.",
    sobreArea: "Oeste da RMR, com áreas urbanas em São Lourenço e Camaragibe, a região de Aldeia (condomínios e mata) e zona rural. É o batalhão mais próximo da APMP.",
    morarPerto: "Camaragibe, Aldeia, São Lourenço Centro, ou Várzea e Cidade Universitária (Recife)." + MORAR,
    distanciaBR: desloc("Na BR-408, que liga o Recife a Paudalho (APMP) e Carpina.", 20.6, 17, 28.7, 27),
  },
  "25º BPM": {
    comandante: "TC QOPM Ladstone Pereira da Silva" + FONTE_CMT, cpm: DIM, sede: "Centro, Jaboatão dos Guararapes",
    endereco: "Rua Padre Chromácio Leão, s/n – Centro, Jaboatão dos Guararapes-PE",
    telefone: "(81) 3181-1650 / 3181-1662 / 3181-1663",
    area: "Jaboatão dos Guararapes (Centro e oeste) e Moreno.\n1ª CIA: Moreno (Centro e bairros) e o Distrito de Bonança, com dezenas de engenhos.\n2ª CIA: Cavaleiro (UR-6), Curado I a IV (UR-11), Dois Carneiros, Zumbi do Pacheco, Sucupira.\n3ª CIA: Bulhões, Engenho Velho, Floriano, Manassu, Santo Aleixo, Vila Rica, Vista Alegre, Sant'Ana, Socorro, 13 de Maio, Padre Roma, Entre Rios, Vargem Fria, Malvina, Colônia dos Padres, Cascata, Mundo Novo.",
    sobreArea: "Jaboatão Centro, a região de Cavaleiro e Curado e o município de Moreno, que tem grande zona rural (Bonança e engenhos).",
    morarPerto: "Jaboatão Centro, Cavaleiro, Curado, ou Piedade e Candeias pelo litoral." + MORAR,
    distanciaBR: desloc("A BR-232 passa pela área (Curado e Moreno).", 37.5, 31, 22.3, 24),
  },
  "26º BPM": {
    comandante: "TC QOPM Fábio Carneiro Pereira" + FONTE_CMT, cpm: DIM, sede: "Centro (Grêmio), Itapissuma",
    endereco: "Rua Barão de Itapissuma, s/n – Grêmio, Itapissuma-PE · CEP 53700-000",
    telefone: "(81) 3181-1749 / 3181-1750", email: "26bpm@pm.pe.gov.br",
    area: "Araçoiaba, Igarassu, Itamaracá e Itapissuma.",
    sobreArea: "Litoral norte da RMR: a Ilha de Itamaracá (turismo de praia), a cidade histórica de Igarassu e áreas rurais de Araçoiaba.",
    morarPerto: "Igarassu, Itapissuma, Itamaracá, ou Paulista e Abreu e Lima." + MORAR,
    distanciaBR: desloc("Acesso pela BR-101 Norte (Igarassu) e pela PE-35, que leva à Ilha de Itamaracá.", 48, 65, 39.5, 49),
  },
  "BPTur": {
    comandante: "TC QOPM Arthur Cezar Belo dos Santos — cmt interino da CIATur, que deu origem ao BPTur" + FONTE_CMT + "; confirmar o comando atual",
    cpm: "DIRESP — Diretoria Integrada Especializada", sede: "Bairro do Recife; 1ª Cia no Carmo, Olinda",
    endereco: "1ª Cia: Praça do Carmo, 85 – Carmo, Olinda-PE. A sede do batalhão é prevista no Bairro do Recife (Recife Antigo).",
    telefone: "(81) 3181-3700 / 3181-3702 / 3181-1700", email: "ciatur@pm.pe.gov.br",
    area: "Policiamento turístico: Sítio Histórico de Olinda (1ª Cia) e Bairro do Recife.",
    sobreArea: "Batalhão especializado criado em 2025, por lei estadual que extinguiu a CIATur (Companhia Independente de Apoio ao Turista). Atua nos polos turísticos e nos grandes eventos, como o carnaval de Olinda e do Recife Antigo.",
    morarPerto: "Olinda (Carmo, Bairro Novo, Casa Caiada) ou o centro do Recife (Boa Vista, Santo Amaro)." + MORAR,
    distanciaBR: desloc("Entre o Sítio Histórico de Olinda e o Recife Antigo, pela PE-15 e pela Av. Cruz Cabugá.", 50.4, 44, 7.9, 10),
  },
}

const forcar = process.argv.includes("--forcar")

async function main() {
  for (const [sigla, ficha] of Object.entries(FICHAS)) {
    const opm = await prisma.oPM.findUnique({ where: { sigla }, include: { info: true } })
    if (!opm) { console.log(`⚠ ${sigla} não existe no banco`); continue }
    const atual = opm.info as Record<string, unknown> | null
    const dados: Record<string, string> = {}
    for (const [k, v] of Object.entries(ficha)) if (v && (forcar || !atual?.[k])) dados[k] = v
    await prisma.opmInfo.upsert({
      where: { opmId: opm.id },
      update: { ...dados, atualizadoPor: "Portal — fontes públicas" },
      create: { opmId: opm.id, ...dados, atualizadoPor: "Portal — fontes públicas" },
    })
    console.log(`✓ ${sigla.padEnd(8)} ${Object.keys(dados).length} campo(s)`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
