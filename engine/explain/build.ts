import type { CasoPreparado } from "../context";
import type { ResultadoOk } from "../result";
import type { Conclusao } from "./types";

/** Explicações (SPEC C9). Implementado no incremento 6. */
export function montarConclusoes(_r: Omit<ResultadoOk, "conclusoes" | "profissional" | "parametrosPendentes">, _ctx: CasoPreparado): { conclusoes: Conclusao[]; profissional: string[] } {
  return { conclusoes: [], profissional: [] };
}
