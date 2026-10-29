import type { Vec3 } from "./vec";

/**
 * Modelo do ambiente (SPEC C3).
 * Origem: canto da sala na parede do palco, à esquerda de quem olha para o público.
 * x = largura, y = profundidade (palco -> fundo), z = altura. Unidades: metros.
 */
export interface Sala {
  largura: number;
  profundidade: number;
  peDireito: number;
}

export interface Retangulo {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface AreaPublico {
  /** Retângulo da área de público (sala menos a zona de palco). */
  retangulo: Retangulo;
  /** Exclusões (retângulos sem público). Vazio no MVP retangular. */
  exclusoes: Retangulo[];
  alturaOuvinte: number;
}

export function areaSala(s: Sala): number {
  return s.largura * s.profundidade;
}

export function volumeSala(s: Sala): number {
  return s.largura * s.profundidade * s.peDireito;
}

export function areaRetangulo(r: Retangulo): number {
  return Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
}

export function criarAreaPublico(sala: Sala, profundidadePalco: number, alturaOuvinte: number, exclusoes: Retangulo[] = []): AreaPublico {
  const y0 = Math.min(Math.max(0, profundidadePalco), sala.profundidade);
  return {
    retangulo: { x0: 0, y0, x1: sala.largura, y1: sala.profundidade },
    exclusoes,
    alturaOuvinte,
  };
}

export function areaPublicoM2(a: AreaPublico): number {
  const bruto = areaRetangulo(a.retangulo);
  const excl = a.exclusoes.reduce((s, r) => s + areaRetangulo(intersecao(r, a.retangulo)), 0);
  return Math.max(0, bruto - excl);
}

export function intersecao(a: Retangulo, b: Retangulo): Retangulo {
  return {
    x0: Math.max(a.x0, b.x0),
    y0: Math.max(a.y0, b.y0),
    x1: Math.min(a.x1, b.x1),
    y1: Math.min(a.y1, b.y1),
  };
}

export function dentroRetangulo(r: Retangulo, x: number, y: number): boolean {
  return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
}

export function dentroSala(s: Sala, p: Vec3): boolean {
  return p.x >= 0 && p.x <= s.largura && p.y >= 0 && p.y <= s.profundidade && p.z >= 0 && p.z <= s.peDireito;
}
