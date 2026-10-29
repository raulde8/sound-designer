import type { AngulosForaEixo } from "../geometry/vec";

export type EstadoCobertura = "coberto" | "borda" | "fora";

/**
 * Cobertura geométrica nominal (SPEC C5, nível A).
 * coberto: |h| <= H/2 e |v| <= V/2. borda: até `borda` graus fora. fora: o resto.
 * Não atribui atenuação em dB fora do eixo.
 */
export function classificarCobertura(a: AngulosForaEixo, H: number, V: number, borda: number): EstadoCobertura {
  const dh = Math.abs(a.h) - H / 2;
  const dv = Math.abs(a.v) - V / 2;
  if (dh <= 1e-9 && dv <= 1e-9) return "coberto";
  if (dh <= borda + 1e-9 && dv <= borda + 1e-9) return "borda";
  return "fora";
}

/** Combina estados de várias caixas: o melhor estado vence. */
export function melhorEstado(a: EstadoCobertura, b: EstadoCobertura): EstadoCobertura {
  if (a === "coberto" || b === "coberto") return "coberto";
  if (a === "borda" || b === "borda") return "borda";
  return "fora";
}

export const ROTULO_COBERTURA = "Cobertura nominal declarada pelo fabricante. Aproximação geométrica, não é medição.";
