import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { TurmaClient } from "./turma-client"

export const dynamic = "force-dynamic"

const HIERARQUIA = [
  { posto: "Cel PM",     nome: "Carneiro",      cargo: "Comandante da APMP" },
  { posto: "Ten Cel PM", nome: "Andreza",        cargo: "Subcomandante da APMP" },
  { posto: "Ten Cel PM", nome: "Thiago",         cargo: "Comandante do Corpo de Alunos" },
  { posto: "Maj PM",     nome: "Brayner",        cargo: "Chefe da Divisão de Ensino" },
  { posto: "Cap PM",     nome: "Arantes",        cargo: "Comandante do Grupamento de Alunos" },
  { posto: "Cap PM",     nome: "Nascimento",     cargo: "Chefe da Divisão Administrativa" },
  { posto: "1º Ten PM",  nome: "Vicente",        cargo: "Chefe da Seção de Provas" },
  { posto: "1º Ten PM",  nome: "Tenório",        cargo: "Comandante da 1ª Companhia" },
  { posto: "1º Ten PM",  nome: "Otávio Neto",    cargo: "Chefe da Seção Técnica de Ensino" },
  { posto: "2º Ten PM",  nome: "Ribeiro",        cargo: "Comandante da 2ª Companhia" },
  { posto: "2º Ten PM",  nome: "Paulo Lima",     cargo: "Chefe da Ajudância e Seção de Pessoal" },
  { posto: "2º Ten PM",  nome: "Thaysa",         cargo: "Cmt 1º, 2º e 3º Pelotões da 2ª CIA" },
  { posto: "2º Ten PM",  nome: "Pedro Lima",     cargo: "Chefe da Seção de Meios Auxiliares" },
  { posto: "2º Ten PM",  nome: "Vasconcelos",    cargo: "Cmt 4º, 5º e 6º Pelotões da 2ª CIA" },
  { posto: "2º Ten PM",  nome: "Viviane",        cargo: "Cmt Pelotões da 1ª CIA | Coord. Turma 13" },
  { posto: "2º Ten PM",  nome: "Brígida",        cargo: "Chefe da Tesouraria" },
  { posto: "2º Ten PM",  nome: "Guldenberg",     cargo: "Chefe da SSTRAN e Almoxarifado" },
  { posto: "2º Ten PM",  nome: "Melquezedec",    cargo: "Chefe da SSMB/SSCOM/TI" },
]

const FUNCOES_FIXAS = [
  { funcao: "P4 Fixa – Logística",        membros: "19 Thais · 165 Kevin" },
  { funcao: "Escala / Memento",           membros: "108 Lisandry" },
  { funcao: "Encerramento de Disciplina", membros: "108 Lisandry · 114 Josiane · 131 José Inácio" },
  { funcao: "Charlie Mike",               membros: "153 Hugo · 57 Cleyton · 114 Josiane · 167 Gustavo" },
  { funcao: "Motivação / Fé",             membros: "153 Hugo · 105 Lucas · 165 Kevin" },
  { funcao: "Financeiro Turma",           membros: "65 Kauhanni" },
  { funcao: "Financeiro DAG",             membros: "07 Aldo" },
  { funcao: "Financeiro COMASP",          membros: "60 João Nunes" },
  { funcao: "Aux. Documentação SEI",      membros: "114 Josiane · 144 Samuel Santos" },
  { funcao: "Aniversário / Comemorações", membros: "55 Shirlayne · 19 Thais · 45 Gabriele" },
  { funcao: "QTs / Provas / ASCOM",       membros: "07 Aldo (QTs) · 71 Leimig (provas) · 116 Bertipalha (drive)" },
]

export default async function TurmaPage() {
  const session = await auth()
  const minhaMatricula = session?.user?.matricula

  const alunos = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { matricula: "asc" },
    select: {
      matricula: true, nomeGuerra: true, nomeCompleto: true,
      email: true, canga: true, cangaPar: true,
      grupoPlantao: true, grupoFaxina: true, aniversario: true, alojamento: true,
    },
  })

  // Monta mapa matrícula → nomeGuerra para mostrar nome do par de canga
  const nomesPorMat: Record<number, string> = {}
  for (const a of alunos) nomesPorMat[a.matricula] = a.nomeGuerra

  return (
    <TurmaClient
      alunos={alunos}
      nomesPorMat={nomesPorMat}
      hierarquia={HIERARQUIA}
      funcoesFixas={FUNCOES_FIXAS}
      minhaMatricula={minhaMatricula}
    />
  )
}
