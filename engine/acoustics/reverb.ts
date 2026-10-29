import type { Params } from "../params";

export type ClasseRisco = "baixo" | "medio" | "alto";

export interface EntradaReverb {
  superficies: "duras" | "mistas" | "absorventes" | null;
  palma: "sim" | "um_pouco" | "nao" | null;
  volume: number;
}

export interface ClasseReverb {
  classe: ClasseRisco;
  pontos: number;
  /** Respostas "não sei" substituídas pela opção do meio. */
  estimado: boolean;
}

/**
 * Classe qualitativa de reverberação (SPEC C5, nível C). Não calcula RT60 nem STI.
 * "Não sei" usa a opção do meio (classe média), com aviso.
 */
export function classeReverberacao(e: EntradaReverb, params: Params): ClasseReverb {
  const r = params.reverberacao.valor;
  const sup = e.superficies ?? "mistas";
  const pal = e.palma ?? "um_pouco";
  const pontos = r.superficies[sup] + r.palma[pal] + (e.volume > r.volumeLimiar ? r.pontosVolume : 0);
  const classe: ClasseRisco = pontos <= r.classes.baixoAte ? "baixo" : pontos <= r.classes.medioAte ? "medio" : "alto";
  return { classe, pontos, estimado: e.superficies === null || e.palma === null };
}
