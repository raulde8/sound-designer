import { CatalogSnapshot, type CatalogMode } from "@catalog/schema";
import { SNAPSHOTS, SNAPSHOT_ATUAL, MODO_BUILD } from "@catalog/snapshots/registry";

/**
 * Catálogo embarcado no build (SPEC B5: "catálogo indisponível -> usa o embarcado").
 * O registro só contém snapshots do modo do build: produção nunca carrega dados demo.
 */
const cache = new Map<string, CatalogSnapshot>();

export function modoCatalogo(): CatalogMode {
  return MODO_BUILD;
}

export function versaoCatalogoAtual(): string {
  return SNAPSHOT_ATUAL;
}

export function obterCatalogo(versao: string): CatalogSnapshot | undefined {
  const c = cache.get(versao);
  if (c) return c;
  const s = SNAPSHOTS[versao];
  if (!s) return undefined;
  const parsed = CatalogSnapshot.parse(s.dados);
  cache.set(versao, parsed);
  return parsed;
}

export function catalogoAtual(): CatalogSnapshot {
  return obterCatalogo(SNAPSHOT_ATUAL)!;
}
