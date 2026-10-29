import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { angulosForaEixo, dist3, miraPara } from "./vec";
import { areaSala, volumeSala, criarAreaPublico, areaPublicoM2 } from "./room";
import { criarMalha } from "./grid";

describe("distâncias e áreas (valores à mão)", () => {
  it("distância 3D: (0,0,0)->(2,3,6) = 7", () => {
    // sqrt(4 + 9 + 36) = sqrt(49) = 7
    expect(dist3({ x: 0, y: 0, z: 0 }, { x: 2, y: 3, z: 6 })).toBeCloseTo(7, 12);
  });
  it("área e volume de 12 x 10 x 3,5", () => {
    const s = { largura: 10, profundidade: 12, peDireito: 3.5 };
    expect(areaSala(s)).toBe(120);
    expect(volumeSala(s)).toBeCloseTo(420, 12);
  });
  it("área de público = sala menos o palco de 3 m", () => {
    const a = criarAreaPublico({ largura: 10, profundidade: 12, peDireito: 3.5 }, 3, 1.2);
    // 10 x (12 - 3) = 90 m²
    expect(areaPublicoM2(a)).toBe(90);
  });
});

describe("ângulos fora do eixo (valores à mão)", () => {
  const o = { x: 0, y: 0, z: 0 };
  it("ponto no eixo: h = 0, v = 0", () => {
    const a = angulosForaEixo(o, { yaw: 0, pitch: 0 }, { x: 0, y: 5, z: 0 });
    expect(a.h).toBeCloseTo(0, 9);
    expect(a.v).toBeCloseTo(0, 9);
  });
  it("ponto (1,1,0) com caixa para +y: h = 45° (para +x)", () => {
    expect(angulosForaEixo(o, { yaw: 0, pitch: 0 }, { x: 1, y: 1, z: 0 }).h).toBeCloseTo(45, 9);
  });
  it("ponto (-1,1,0): h = -45°", () => {
    expect(angulosForaEixo(o, { yaw: 0, pitch: 0 }, { x: -1, y: 1, z: 0 }).h).toBeCloseTo(-45, 9);
  });
  it("ponto (0,1,-1): v = -45°", () => {
    expect(angulosForaEixo(o, { yaw: 0, pitch: 0 }, { x: 0, y: 1, z: -1 }).v).toBeCloseTo(-45, 9);
  });
  it("caixa inclinada -45° mirando (0,1,-1): v = 0", () => {
    expect(angulosForaEixo(o, { yaw: 0, pitch: -45 }, { x: 0, y: 1, z: -1 }).v).toBeCloseTo(0, 9);
  });
  it("caixa girada 90° (para +x) e ponto (1,0,0): h = 0", () => {
    expect(angulosForaEixo(o, { yaw: 90, pitch: 0 }, { x: 1, y: 0, z: 0 }).h).toBeCloseTo(0, 9);
  });
  it("ponto atrás da caixa: |h| = 180°", () => {
    expect(Math.abs(angulosForaEixo(o, { yaw: 0, pitch: 0 }, { x: 0, y: -1, z: 0 }).h)).toBeCloseTo(180, 9);
  });
  it("caixa a 3 m de altura, ponto a 1,2 m e 1,8 m à frente: v = -45°", () => {
    // dz = -1,8; distância horizontal = 1,8 -> atan(1) = 45°
    expect(angulosForaEixo({ x: 0, y: 0, z: 3 }, { yaw: 0, pitch: 0 }, { x: 0, y: 1.8, z: 1.2 }).v).toBeCloseTo(-45, 9);
  });
});

describe("propriedades de geometria", () => {
  const coord = fc.double({ min: -50, max: 50, noNaN: true });
  const vec = fc.record({ x: coord, y: coord, z: coord });
  it("mirar para um ponto deixa o ponto no eixo", () => {
    fc.assert(
      fc.property(vec, vec, (c, p) => {
        fc.pre(dist3(c, p) > 0.01 && Math.hypot(p.x - c.x, p.y - c.y) > 0.01);
        const a = angulosForaEixo(c, miraPara(c, p), p);
        return Math.abs(a.h) < 1e-6 && Math.abs(a.v) < 1e-6;
      }),
    );
  });
  it("ângulos sempre dentro dos intervalos", () => {
    fc.assert(
      fc.property(vec, vec, fc.double({ min: -180, max: 180, noNaN: true }), fc.double({ min: -89, max: 89, noNaN: true }), (c, p, yaw, pitch) => {
        const a = angulosForaEixo(c, { yaw, pitch }, p);
        return a.h >= -180 && a.h <= 180 && a.v >= -90 && a.v <= 90;
      }),
    );
  });
  it("distância é simétrica e não negativa", () => {
    fc.assert(fc.property(vec, vec, (a, b) => dist3(a, b) >= 0 && Math.abs(dist3(a, b) - dist3(b, a)) < 1e-9));
  });
});

describe("malha de avaliação", () => {
  it("10 x 9 m com passo 0,5 -> 20 x 18 = 360 pontos", () => {
    const a = criarAreaPublico({ largura: 10, profundidade: 12, peDireito: 3.5 }, 3, 1.2);
    const m = criarMalha(a, 0.5, 20000);
    expect(m.pontos.length).toBe(360);
    expect(m.pontos[0]).toEqual({ x: 0.25, y: 3.25, z: 1.2 });
    expect(m.passoAumentado).toBe(false);
  });
  it("aumenta o passo acima do limite de pontos", () => {
    const a = criarAreaPublico({ largura: 100, profundidade: 100, peDireito: 5 }, 0, 1.2);
    const m = criarMalha(a, 0.5, 20000);
    expect(m.pontos.length).toBeLessThanOrEqual(20000);
    expect(m.passoAumentado).toBe(true);
  });
  it("propriedade: todos os pontos dentro da área de público e no plano do ouvinte", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 2, max: 60, noNaN: true }),
        fc.double({ min: 3, max: 60, noNaN: true }),
        fc.double({ min: 0, max: 2, noNaN: true }),
        (w, d, palco) => {
          const a = criarAreaPublico({ largura: w, profundidade: d, peDireito: 4 }, palco, 1.2);
          const m = criarMalha(a, 0.5, 20000);
          return (
            m.pontos.length <= 20000 &&
            m.pontos.every((p) => p.x >= 0 && p.x <= w && p.y >= palco && p.y <= d && p.z === 1.2)
          );
        },
      ),
      { numRuns: 50 },
    );
  });
});
