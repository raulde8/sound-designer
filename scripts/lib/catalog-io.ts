import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CatalogData, CatalogMode, type CatalogSnapshot } from "../../catalog/schema";
import { hashConteudo } from "./canonical";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DIR_CATALOGO = join(RAIZ, "catalog");

export function modoAtual(): CatalogMode {
  const m = process.env.CATALOG_MODE ?? "producao";
  const r = CatalogMode.safeParse(m === "production" ? "producao" : m);
  if (!r.success) throw new Error(`CATALOG_MODE inválido: ${m}. Use "producao" ou "demo".`);
  return r.data;
}

export function dirDados(modo: CatalogMode): string {
  return join(DIR_CATALOGO, modo === "demo" ? "demo" : "data");
}

function lerJson(caminho: string): unknown {
  return existsSync(caminho) ? JSON.parse(readFileSync(caminho, "utf8")) : [];
}

export function lerDadosBrutos(modo: CatalogMode): unknown {
  const d = dirDados(modo);
  return {
    produtos: lerJson(join(d, "produtos.json")),
    faixas: lerJson(join(d, "faixas.json")),
    ofertas: lerJson(join(d, "ofertas.json")),
  };
}

export function montarSnapshot(modo: CatalogMode, bruto: unknown): CatalogSnapshot {
  const dados = CatalogData.parse(bruto);
  const version = hashConteudo({ modo, ...dados });
  return { version, modo, ...dados };
}
