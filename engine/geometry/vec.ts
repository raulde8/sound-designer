export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const DEG = Math.PI / 180;

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function dist3(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function dist2(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function round(v: number, casas = 2): number {
  const f = 10 ** casas;
  return Math.round(v * f) / f;
}

/**
 * Direção de uma caixa.
 * yaw: rotação no plano xy, em graus. 0 = aponta para +y (do palco para o fundo).
 *      Positivo gira para +x.
 * pitch: inclinação vertical, em graus. Negativo = aponta para baixo.
 */
export interface Mira {
  yaw: number;
  pitch: number;
}

export interface AngulosForaEixo {
  /** Ângulo horizontal fora do eixo, em graus (-180..180). */
  h: number;
  /** Ângulo vertical fora do eixo, em graus (-90..90). */
  v: number;
}

/**
 * Converte o vetor caixa->ponto para o sistema local da caixa e devolve os
 * ângulos fora do eixo. Eixo local: frente = eixo da caixa, lateral = direita
 * da caixa, cima = perpendicular.
 * h = atan2(lateral, frente); v = atan2(cima, hypot(lateral, frente)).
 */
export function angulosForaEixo(caixa: Vec3, mira: Mira, ponto: Vec3): AngulosForaEixo {
  const d = sub(ponto, caixa);
  const yaw = mira.yaw * DEG;
  const pitch = mira.pitch * DEG;
  // Rotação de -yaw em torno de z: leva a direção da caixa para +y.
  const x1 = d.x * Math.cos(yaw) - d.y * Math.sin(yaw);
  const y1 = d.x * Math.sin(yaw) + d.y * Math.cos(yaw);
  const z1 = d.z;
  // Rotação de -pitch em torno do eixo x local: leva a inclinação para zero.
  const y2 = y1 * Math.cos(pitch) + z1 * Math.sin(pitch);
  const z2 = -y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
  const x2 = x1;
  const h = Math.atan2(x2, y2) / DEG;
  const v = Math.atan2(z2, Math.hypot(x2, y2)) / DEG;
  return { h, v };
}

/** Mira que aponta a caixa diretamente para um ponto. */
export function miraPara(caixa: Vec3, alvo: Vec3): Mira {
  const dx = alvo.x - caixa.x;
  const dy = alvo.y - caixa.y;
  const dz = alvo.z - caixa.z;
  const yaw = Math.atan2(dx, dy) / DEG;
  const pitch = Math.atan2(dz, Math.hypot(dx, dy)) / DEG;
  return { yaw, pitch };
}
