import type { CatalogSnapshot } from "../../catalog/schema";
import type { Configuracao } from "../architectures/types";
import type { CasoPreparado } from "../context";
import type { Trilha2 } from "../input/schema";
import type { ResultadoPalco } from "./types";

/** Módulo de palco (SPEC C6). Implementado no incremento 5. */
export function calcularPalco(_t: Trilha2, _ctx: CasoPreparado, _cfg: Configuracao | null, _cat: CatalogSnapshot, _data: string): ResultadoPalco | null {
  return null;
}
