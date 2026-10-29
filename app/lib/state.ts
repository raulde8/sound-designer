import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { z } from "zod";

/**
 * Estado compartilhável na URL (SPEC C2): entrada do usuário + versões.
 * Toda leitura passa pelo Zod (SPEC C12). A entrada em si é validada de novo pelo motor.
 */
export const EstadoUrl = z.object({
  v: z.literal(1),
  /** Entrada bruta do questionário (validada pelo EntradaSchema do motor). */
  e: z.record(z.string(), z.unknown()),
  /** Hash do catálogo usado. */
  c: z.string().max(64),
  /** Versão de parâmetros. */
  p: z.string().max(64),
  /** Versão do motor. */
  m: z.string().max(32),
  /** Data de referência (validade das faixas). */
  d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type EstadoUrl = z.infer<typeof EstadoUrl>;

const MAX_URL = 12000;

export function codificar(e: EstadoUrl): string {
  return compressToEncodedURIComponent(JSON.stringify(e));
}

export function decodificar(s: string | null | undefined): EstadoUrl | null {
  if (!s || s.length > MAX_URL) return null;
  try {
    const json = decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const r = EstadoUrl.safeParse(JSON.parse(json));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

// ---------------- Rascunho no localStorage ----------------

const CHAVE = "sound-designer:rascunho:v1";

export function salvarRascunho(dados: unknown): void {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Sem localStorage (modo privado, cota cheia): o rascunho não é salvo.
  }
}

export function lerRascunho(): unknown {
  try {
    const s = window.localStorage.getItem(CHAVE);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function apagarRascunho(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    // ignora
  }
}

/** Data local no formato AAAA-MM-DD. A UI lê o relógio; o motor não. */
export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
