import type { AreaPublico } from "./room";
import { dentroRetangulo } from "./room";
import type { Vec3 } from "./vec";

export interface Malha {
  passo: number;
  /** Origem da primeira célula (canto inferior esquerdo). */
  x0: number;
  y0: number;
  nx: number;
  ny: number;
  /** Pontos no centro de cada célula, linha por linha (y externo, x interno). */
  pontos: Vec3[];
  /** Índice da célula (iy * nx + ix) de cada ponto. */
  indices: number[];
  /** O passo foi aumentado por causa do limite de pontos. */
  passoAumentado: boolean;
}

/**
 * Malha de avaliação no plano do ouvinte, só na área de público (SPEC C3).
 * Pontos no centro de células quadradas de lado `passo`.
 * Se o número de pontos passar de maxPontos, o passo aumenta.
 */
export function criarMalha(area: AreaPublico, passoInicial: number, maxPontos: number): Malha {
  const r = area.retangulo;
  const w = Math.max(0, r.x1 - r.x0);
  const d = Math.max(0, r.y1 - r.y0);
  let passo = passoInicial;
  let passoAumentado = false;
  // Aumenta o passo em incrementos de 0,25 m até caber no limite.
  while (Math.ceil(w / passo) * Math.ceil(d / passo) > maxPontos) {
    passo = Math.round((passo + 0.25) * 100) / 100;
    passoAumentado = true;
  }
  const nx = w > 0 ? Math.ceil(w / passo - 1e-9) : 0;
  const ny = d > 0 ? Math.ceil(d / passo - 1e-9) : 0;
  const pontos: Vec3[] = [];
  const indices: number[] = [];
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      // Centro da célula, limitado ao retângulo (última célula pode ser parcial).
      const xa = r.x0 + ix * passo;
      const ya = r.y0 + iy * passo;
      const x = (xa + Math.min(xa + passo, r.x1)) / 2;
      const y = (ya + Math.min(ya + passo, r.y1)) / 2;
      if (area.exclusoes.some((e) => dentroRetangulo(e, x, y))) continue;
      pontos.push({ x, y, z: area.alturaOuvinte });
      indices.push(iy * nx + ix);
    }
  }
  return { passo, x0: r.x0, y0: r.y0, nx, ny, pontos, indices, passoAumentado };
}
