import type { Categoria, Product } from "./schema";

/**
 * Ficha mínima por categoria (SPEC C7).
 * geometria: sem estes campos o produto é "nao_avaliavel".
 * nivel: sem estes campos o produto fica no máximo "parcial".
 * outros: campos da ficha mínima não críticos para a geometria; ausência = "parcial".
 */
export interface FichaMinima {
  geometria: string[];
  nivel: string[];
  outros: string[];
}

export const FICHA_MINIMA: Record<Categoria, FichaMinima> = {
  caixa_ativa: { geometria: ["coberturaH", "coberturaV", "montagensPermitidas"], nivel: ["splMax"], outros: ["respostaFrequencia", "peso"] },
  vertical_array: { geometria: ["coberturaPorConfiguracao", "montagensPermitidas"], nivel: ["splMax"], outros: ["acessoriosObrigatorios"] },
  subwoofer: { geometria: [], nivel: ["splMax"], outros: ["respostaFrequencia"] },
  mesa: { geometria: [], nivel: [], outros: ["tipoMesa", "entradasMic", "entradasTotais", "auxMono", "auxEstereo", "phantom", "controleRemoto"] },
  microfone_sem_fio: { geometria: [], nivel: [], outros: ["faixaFrequencia", "homologacaoAnatel", "canaisSimultaneos", "varreduraAutomatica"] },
  in_ear: { geometria: [], nivel: [], outros: ["faixaFrequencia", "homologacaoAnatel", "canaisSimultaneos", "varreduraAutomatica"] },
  microfone_com_fio: { geometria: [], nivel: [], outros: ["tipoMicrofone"] },
  monitor_chao: { geometria: ["coberturaH", "coberturaV"], nivel: ["splMax"], outros: [] },
  di: { geometria: [], nivel: [], outros: [] },
  acessorio: { geometria: [], nivel: [], outros: [] },
};

export function camposCriticos(c: Categoria): string[] {
  const f = FICHA_MINIMA[c];
  return [...f.geometria, ...f.nivel, ...f.outros];
}

interface SpecLike {
  valor: unknown;
  fonte: string;
  dataVerificacao: string;
  status: string;
}

/** Lê um campo da ficha (especificações ou campos de topo como peso/montagens). */
export function lerCampo(p: Product, campo: string): SpecLike | undefined {
  const topo = (p as unknown as Record<string, unknown>)[campo];
  if (topo && typeof topo === "object" && "valor" in (topo as object)) return topo as SpecLike;
  return (p.especificacoes as Record<string, SpecLike | undefined>)[campo];
}

/** Campo presente = existe, tem valor e não está "desconhecido". */
export function campoPresente(p: Product, campo: string): boolean {
  const s = lerCampo(p, campo);
  return !!s && s.status !== "desconhecido" && s.valor !== null && s.valor !== undefined;
}

export function campoComFonte(p: Product, campo: string): boolean {
  const s = lerCampo(p, campo);
  return !!s && s.fonte.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(s.dataVerificacao);
}
