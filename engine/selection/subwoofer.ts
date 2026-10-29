import { FICHA_MINIMA, campoPresente } from "../../catalog/ficha";
import type { CatalogSnapshot } from "../../catalog/schema";
import type { Params } from "../params";
import { ORDEM_STATUS, nomeProduto, produtosElegiveis, type StatusCompat } from "./compat";
import { faixaDoProduto, type FaixaUsada } from "./investimento";

export interface CandidatoSub {
  produtoId: string;
  nome: string;
  marca: string;
  subcategoria: string;
  porte?: string;
  status: StatusCompat;
  motivos: string[];
  faltando: string[];
  porLado: number;
  /** A quantidade veio do pareamento publicado pelo fabricante para a caixa principal. */
  pareamentoFabricante: boolean;
  faixa?: FaixaUsada;
}

/**
 * Subwoofers (AR-3). Quantidade: pareamento publicado pelo fabricante para a caixa escolhida;
 * na falta dele, subPorLadoPadrao (hipótese). Sem mapa de graves.
 */
export function avaliarSubs(cat: CatalogSnapshot, topId: string | null, params: Params, dataReferencia: string): CandidatoSub[] {
  const ficha = FICHA_MINIMA.subwoofer;
  const out = produtosElegiveis(cat, "subwoofer").map((p): CandidatoSub => {
    const faltando = [...ficha.nivel, ...ficha.outros].filter((c) => !campoPresente(p, c));
    const motivos: string[] = [];
    let status: StatusCompat = faltando.length > 0 ? "parcial" : "compativel";
    if (faltando.length > 0) motivos.push(`Falta na ficha: ${faltando.join(", ")}.`);
    const mont = p.montagensPermitidas?.valor;
    if (mont && !mont.includes("chao")) {
      status = "incompativel";
      motivos.push("O fabricante não declara montagem no chão.");
    }
    const par = p.especificacoes.pareamento?.valor;
    const casa = !!(topId && par && par.topIds.includes(topId));
    const faixa = faixaDoProduto(cat, p.categoria, p.subcategoria, p.porte, dataReferencia, p.id);
    return {
      produtoId: p.id,
      nome: nomeProduto(p),
      marca: p.marca,
      subcategoria: p.subcategoria,
      ...(p.porte ? { porte: p.porte } : {}),
      status,
      motivos,
      faltando,
      porLado: casa ? par!.subsPorLado : params.subPorLadoPadrao.valor,
      pareamentoFabricante: casa,
      ...(faixa ? { faixa } : {}),
    };
  });
  return out.sort(
    (a, b) =>
      ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] ||
      Number(b.pareamentoFabricante) - Number(a.pareamentoFabricante) ||
      a.porLado - b.porLado ||
      (a.faixa?.minimo ?? Infinity) - (b.faixa?.minimo ?? Infinity) ||
      a.produtoId.localeCompare(b.produtoId),
  );
}
