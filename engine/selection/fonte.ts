import { campoPresente } from "../../catalog/ficha";
import type { Product } from "../../catalog/schema";
import type { FonteCaixa } from "../architectures/types";
import type { Params } from "../params";
import { nomeProduto } from "./nome";

/**
 * Converte um produto do catálogo na fonte usada pelos geradores.
 * Sem montagem publicada, o produto é "nao_avaliavel".
 * Sem ângulo de cobertura (caixa) ou sem tabela por configuração (array), o motor usa a referência
 * do perfil genérico (parâmetro pendente) e registra a estimativa: o produto fica no máximo "parcial".
 */
export function fonteDeProduto(p: Product, params: Params): { ok: true; fonte: FonteCaixa } | { ok: false; faltando: string[] } {
  const montagens = p.montagensPermitidas && campoPresente(p, "montagensPermitidas") ? p.montagensPermitidas.valor : null;
  const usarReferencia = params.coberturaAusente.valor === "usar_referencia";
  if (p.categoria === "vertical_array") {
    const semTabela = !campoPresente(p, "coberturaPorConfiguracao");
    const faltando = [...(semTabela && !usarReferencia ? ["coberturaPorConfiguracao"] : []), ...(montagens ? [] : ["montagensPermitidas"])];
    if (faltando.length > 0) return { ok: false, faltando };
    const tabela = semTabela ? undefined : p.especificacoes.coberturaPorConfiguracao!.valor;
    const ref = p.subcategoria === "coluna" ? params.coberturaReferenciaArray.valor.coluna : params.coberturaReferenciaArray.valor.line_array_compacto;
    return {
      ok: true,
      fonte: {
        tipo: "produto",
        ref: p.id,
        nome: nomeProduto(p),
        cobertura: tabela ? { H: tabela[0]!.H, V: tabela[0]!.V } : ref,
        nivel: { tipo: "pendente", motivo: semTabela ? "O fabricante não publica a tabela de cobertura e volume por distância deste array." : "Nível definido pela configuração escolhida." },
        meiaAltura: 0,
        montagensPermitidas: montagens,
        subcategoria: p.subcategoria,
        ...(tabela ? { tabelaArray: tabela } : {}),
        ...(p.dimensoes ? { alturaTotal: p.dimensoes.valor.altura_m } : {}),
        ...(semTabela ? { estimativas: ["O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância."] } : {}),
      },
    };
  }
  const semH = !campoPresente(p, "coberturaH");
  const semV = !campoPresente(p, "coberturaV");
  const faltando = [...((semH || semV) && !usarReferencia ? ["coberturaH", "coberturaV"].filter((c) => !campoPresente(p, c)) : []), ...(montagens ? [] : ["montagensPermitidas"])];
  if (faltando.length > 0) return { ok: false, faltando };
  const ref = params.coberturaReferenciaPontual.valor;
  const H = semH ? ref.H : p.especificacoes.coberturaH!.valor;
  const V = semV ? ref.V : p.especificacoes.coberturaV!.valor;
  const meiaAltura = p.dimensoes ? p.dimensoes.valor.altura_m / 2 : params.meiaAlturaCaixaPadrao.valor;
  return {
    ok: true,
    fonte: {
      tipo: "produto",
      ref: p.id,
      nome: nomeProduto(p),
      cobertura: { H, V },
      nivel: { tipo: "pendente", motivo: "Nível definido pela montagem." },
      meiaAltura,
      montagensPermitidas: montagens,
      subcategoria: p.subcategoria,
      ...(p.especificacoes.splMax ? { spl: p.especificacoes.splMax } : {}),
      ...(semH || semV
        ? { estimativas: [`O fabricante não publica o ângulo de cobertura. Usamos ${H}° x ${V}° (valor de referência de caixas de duas vias, pendente de confirmação).`] }
        : {}),
    },
  };
}
