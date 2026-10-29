import { campoPresente } from "../../catalog/ficha";
import type { Product } from "../../catalog/schema";
import type { FonteCaixa } from "../architectures/types";
import type { Params } from "../params";

/**
 * Converte um produto do catálogo na fonte usada pelos geradores.
 * Sem os campos de geometria da ficha mínima, o produto é "nao_avaliavel".
 */
export function fonteDeProduto(p: Product, params: Params): { ok: true; fonte: FonteCaixa } | { ok: false; faltando: string[] } {
  const meiaAltura = p.dimensoes ? p.dimensoes.valor.altura_m / 2 : params.meiaAlturaCaixaPadrao.valor;
  const montagens = p.montagensPermitidas && campoPresente(p, "montagensPermitidas") ? p.montagensPermitidas.valor : null;
  if (p.categoria === "vertical_array") {
    const faltando = ["coberturaPorConfiguracao", "montagensPermitidas"].filter((c) => !campoPresente(p, c));
    if (faltando.length > 0) return { ok: false, faltando };
    const tabela = p.especificacoes.coberturaPorConfiguracao!.valor;
    return {
      ok: true,
      fonte: {
        tipo: "produto",
        ref: p.id,
        nome: `${p.marca} ${p.modelo}`,
        cobertura: { H: tabela[0]!.H, V: tabela[0]!.V },
        nivel: { tipo: "pendente", motivo: "Nível definido pela configuração escolhida." },
        meiaAltura: 0,
        montagensPermitidas: montagens,
        subcategoria: p.subcategoria,
        tabelaArray: tabela,
      },
    };
  }
  const faltando = ["coberturaH", "coberturaV", "montagensPermitidas"].filter((c) => !campoPresente(p, c));
  if (faltando.length > 0) return { ok: false, faltando };
  return {
    ok: true,
    fonte: {
      tipo: "produto",
      ref: p.id,
      nome: `${p.marca} ${p.modelo}`,
      cobertura: { H: p.especificacoes.coberturaH!.valor, V: p.especificacoes.coberturaV!.valor },
      nivel: { tipo: "pendente", motivo: "Nível definido pela montagem." },
      meiaAltura,
      montagensPermitidas: montagens,
      subcategoria: p.subcategoria,
      ...(p.especificacoes.splMax ? { spl: p.especificacoes.splMax } : {}),
    },
  };
}
