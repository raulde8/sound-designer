import type { NivelAlvo } from "../acoustics/target";
import type { Caixa, FonteCaixa } from "./types";

export type RecomendacaoSub = "recomendado" | "opcional" | "nao_recomendado";

export const AVISO_GRAVES = "O comportamento dos graves depende da sala. Ajuste no local.";

/**
 * AR-3 (SPEC C4): recomendado com banda com bateria, DJ ou música em primeiro plano;
 * opcional para voz e violão e vídeo; não recomendado para fala e música ambiente.
 */
export function regraSub(alvo: NivelAlvo): RecomendacaoSub {
  return alvo.sub === "sim" ? "recomendado" : alvo.sub === "opcional" ? "opcional" : "nao_recomendado";
}

/** Subwoofers no chão, ao lado das caixas principais, deslocados para o centro. Sem mapa de cobertura. */
export function criarSubs(principais: Caixa[], fonte: FonteCaixa, porLado: number): Omit<Caixa, "numero">[] {
  const out: Omit<Caixa, "numero">[] = [];
  for (const p of principais.filter((c) => c.papel === "principal")) {
    const dir = p.lado === "L" ? 1 : -1;
    for (let k = 0; k < porLado; k++) {
      out.push({
        id: `SUB-${p.lado}-${k + 1}`,
        papel: "sub",
        lado: p.lado,
        posicao: { x: p.posicao.x + dir * 0.9 * (k + 1), y: p.posicao.y, z: fonte.meiaAltura },
        mira: { yaw: 0, pitch: 0 },
        montagem: "chao",
        fonte,
        movida: false,
      });
    }
  }
  return out;
}
