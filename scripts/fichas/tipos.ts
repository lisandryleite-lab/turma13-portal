// Formato das fichas padrão de batalhão (scripts/fichas/<slug>.ts).
// Gravar no banco: npx tsx scripts/gravar-ficha.ts <slug>
import type { BairroFicha, FonteFicha, LinkFicha, OperacaoFicha } from "../../lib/batalhoes-base"

export type Ficha = {
  endereco: string; referenciaMapa: string; telefone: string; email: string; distanciaBR: string
  comandante: string; subcomandante: string; cpm: string; estrutura: string; efetivo: string
  area: string; sobreArea: string; vagas: string | null; morarPerto: string; dicas: string
  bairros: BairroFicha[]; operacoes: OperacaoFicha[]; links: LinkFicha[]; fontes: FonteFicha[]
}
