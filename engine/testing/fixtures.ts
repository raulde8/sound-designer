import { lerDadosBrutos, montarSnapshot } from "../../scripts/lib/catalog-io";
import { PARAMS_VERSION_ATUAL } from "../params";
import { executarMotor } from "../run";
import type { ResultadoOk } from "../result";
import type { CatalogSnapshot } from "../../catalog/schema";

/** Helpers só para testes (lêem arquivos via scripts/lib). O motor em si não faz I/O. */
export const CATALOGO_DEMO = montarSnapshot("demo", lerDadosBrutos("demo"));
export const CATALOGO_VAZIO = montarSnapshot("producao", { produtos: [], faixas: [], ofertas: [] });
export const DATA_REF = "2026-10-29";

export function rodar(entrada: unknown, catalogo: CatalogSnapshot = CATALOGO_DEMO, data = DATA_REF): ResultadoOk {
  const r = executarMotor(entrada, { catalogo, paramsVersion: PARAMS_VERSION_ATUAL, dataReferencia: data });
  if (!r.ok) throw new Error(JSON.stringify(r.erros));
  return r;
}

export const IGREJA_PEQUENA = {
  trilha1: {
    tipoEstabelecimento: "igreja",
    usos: ["fala"],
    dimensoes: { tipo: "medidas", comprimento: 12, largura: 10, peDireito: 3.5 },
    publico: { quantidade: 80 },
    acustica: { superficies: "mistas", palma: "um_pouco", conversa: "facil" },
  },
};
