import type { CatalogSnapshot, Categoria, FaixaInvestimento } from "../../catalog/schema";

export interface FaixaUsada {
  minimo: number;
  maximo: number;
  dataVerificacao: string;
  fonte: string;
  ids: string[];
}

function diasEntre(a: string, b: string): number {
  const ta = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  const tb = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
  return Math.round((tb - ta) / 86400000);
}

/** Faixa vencida não aparece (SPEC C7). */
export function faixaVigente(f: FaixaInvestimento, dataReferencia: string): boolean {
  const d = diasEntre(f.dataVerificacao, dataReferencia);
  return d >= 0 && d <= f.validadeDias;
}

export function faixaDoProduto(
  cat: CatalogSnapshot,
  categoria: Categoria,
  subcategoria: string,
  porte: string | undefined,
  dataReferencia: string,
  produtoId?: string,
): FaixaUsada | undefined {
  // Faixa específica do produto tem prioridade; depois, a faixa por categoria e porte.
  const especifica = produtoId ? cat.faixas.find((x) => x.produtoId === produtoId && faixaVigente(x, dataReferencia)) : undefined;
  if (!porte && !especifica) return undefined;
  const f = especifica ?? cat.faixas.find((x) => !x.produtoId && x.categoria === categoria && x.subcategoria === subcategoria && x.porte === porte && faixaVigente(x, dataReferencia));
  return f ? { minimo: f.minimo, maximo: f.maximo, dataVerificacao: f.dataVerificacao, fonte: f.fonte, ids: [f.id] } : undefined;
}

/** Faixa de um perfil genérico: do menor mínimo ao maior máximo entre os portes vigentes da categoria. */
export function faixaDaCategoria(cat: CatalogSnapshot, categoria: Categoria, subcategoria: string | undefined, dataReferencia: string): FaixaUsada | undefined {
  const fs = cat.faixas.filter((x) => x.categoria === categoria && (subcategoria === undefined || x.subcategoria === subcategoria) && faixaVigente(x, dataReferencia));
  if (fs.length === 0) return undefined;
  return {
    minimo: Math.min(...fs.map((f) => f.minimo)),
    maximo: Math.max(...fs.map((f) => f.maximo)),
    dataVerificacao: fs.map((f) => f.dataVerificacao).sort()[0]!,
    fonte: [...new Set(fs.map((f) => f.fonte))].join("; "),
    ids: fs.map((f) => f.id).sort(),
  };
}

export interface ItemInvestimento {
  descricao: string;
  quantidade: number;
  faixa: FaixaUsada | undefined;
}

export interface Investimento {
  minimo: number;
  maximo: number;
  /** Mês/ano da referência mais antiga usada. */
  referencia: string | null;
  itensSemFaixa: string[];
  completo: boolean;
}

export function somarInvestimento(itens: ItemInvestimento[]): Investimento | null {
  const com = itens.filter((i) => i.faixa && i.quantidade > 0);
  const sem = itens.filter((i) => !i.faixa && i.quantidade > 0).map((i) => i.descricao);
  if (com.length === 0) return { minimo: 0, maximo: 0, referencia: null, itensSemFaixa: [...new Set(sem)], completo: false };
  const datas = com.map((i) => i.faixa!.dataVerificacao).sort();
  const d = datas[0]!;
  return {
    minimo: com.reduce((s, i) => s + i.quantidade * i.faixa!.minimo, 0),
    maximo: com.reduce((s, i) => s + i.quantidade * i.faixa!.maximo, 0),
    referencia: `${d.slice(5, 7)}/${d.slice(0, 4)}`,
    itensSemFaixa: [...new Set(sem)],
    completo: sem.length === 0,
  };
}

export interface ComparacaoOrcamento {
  situacao: "abaixo" | "dentro" | "acima" | "sem_faixa";
  mensagem: string;
}

const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

/** O orçamento só é comparado com a faixa total. Ele nunca reduz um requisito (SPEC C8 passo 6). */
export function compararOrcamento(orcamento: number, inv: Investimento | null): ComparacaoOrcamento {
  if (!inv || inv.referencia === null) return { situacao: "sem_faixa", mensagem: "Não há faixa de investimento vigente para comparar com o orçamento." };
  if (orcamento < inv.minimo)
    return {
      situacao: "abaixo",
      mensagem: `O orçamento informado (${brl(orcamento)}) fica abaixo do mínimo estimado para a solução que atende aos requisitos (${brl(inv.minimo)}). O sistema não reduz os requisitos para caber no orçamento.`,
    };
  if (orcamento > inv.maximo) return { situacao: "acima", mensagem: `O orçamento informado (${brl(orcamento)}) fica acima da faixa estimada.` };
  return { situacao: "dentro", mensagem: `O orçamento informado (${brl(orcamento)}) fica dentro da faixa estimada.` };
}

export { brl };
