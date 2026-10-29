import { AR1 } from "./ar1";
import { AR2 } from "./ar2";
import { fonteGenerica } from "./layout";
import type { ArchitectureGenerator, ArquiteturaId, ContextoArquitetura, FonteCaixa } from "./types";

export * from "./types";
export { AR1, AR2 };

/** Geradores do MVP. A fase 1.1 adiciona AR-4 (teto) e AR-5 (parede) aqui. */
export const GERADORES: ArchitectureGenerator[] = [AR1, AR2];

export const NOMES_SIMPLES: Record<ArquiteturaId, string> = {
  "AR-1": "Duas caixas ativas na frente, uma de cada lado do palco",
  "AR-2": "Duas colunas (vertical array) na frente, uma de cada lado do palco",
  "AR-4": "Caixas distribuídas no teto (fase 1.1)",
  "AR-5": "Caixas distribuídas nas paredes (fase 1.1)",
};

/** Perfil genérico usado para gerar o layout inicial de cada arquitetura (SPEC C8 passo 1). */
export function fonteGenericaPara(arq: ArquiteturaId, ctx: ContextoArquitetura): FonteCaixa {
  const p = ctx.params;
  if (arq === "AR-2") {
    const coluna = ctx.caso.mobilidade === "movel" || ctx.caso.instalacao.forma === "chao";
    return coluna
      ? fonteGenerica("GEN-COLUNA", "Coluna / vertical array portátil (perfil genérico)", p.coberturaReferenciaArray.valor.coluna, 0, "coluna")
      : fonteGenerica("GEN-LINE-COMPACTO", "Line array compacto (perfil genérico)", p.coberturaReferenciaArray.valor.line_array_compacto, 0, "line_array_compacto");
  }
  return fonteGenerica("GEN-ATIVA-12", 'Caixa ativa 12" (perfil genérico)', p.coberturaReferenciaPontual.valor, p.meiaAlturaCaixaPadrao.valor, "12");
}

/**
 * Preferência entre AR-1 e AR-2 quando as duas estão disponíveis [Hipótese - parâmetro pendente]:
 * vertical array quando a área de público é profunda ou a sala tem risco alto de reverberação.
 */
export function arquiteturaPreferida(disponiveis: ArquiteturaId[], profundidadePublico: number, classeReverb: "baixo" | "medio" | "alto" | null, limiar: number): ArquiteturaId | null {
  if (disponiveis.length === 0) return null;
  if (disponiveis.length === 1) return disponiveis[0]!;
  return profundidadePublico > limiar || classeReverb === "alto" ? "AR-2" : "AR-1";
}
