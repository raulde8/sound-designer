import type { Candidato } from "./compat";

/**
 * Política de marca (SPEC C8 passo 7). O MVP implementa só "aberta": nenhuma marca recebe bônus.
 * "preferencial" e "restrita" ficam para a fase 2, com sinalização "produto parceiro" na recomendação.
 */
export type TipoPolitica = "aberta" | "preferencial" | "restrita";

export interface BrandPolicy {
  tipo: TipoPolitica;
  /** Recebe os candidatos já ordenados por critério técnico. */
  ordenar(candidatos: Candidato[]): Candidato[];
  /** Rótulo exibido junto do produto (fase 2: "produto parceiro"). */
  rotulo(candidato: Candidato): string | undefined;
}

export const POLITICA_ABERTA: BrandPolicy = {
  tipo: "aberta",
  ordenar: (c) => c,
  rotulo: () => undefined,
};
