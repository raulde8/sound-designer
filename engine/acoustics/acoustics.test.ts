import { describe, it, expect } from "vitest";
import fc from "fast-check";
import biamp from "./fixtures/biamp-pag-nag.json";
import { nivelDireto, splContinuoUtil, interpolarSpl, splNecessario } from "./level";
import { classificarCobertura } from "./coverage";
import { calcularPag, calcularNag, classificarRisco } from "./pagnag";
import { classeReverberacao } from "./reverb";
import { nivelAlvo } from "./target";
import { PARAMS_V1 } from "../params";
import type { CondicaoSpl, SpecValue } from "../../catalog/schema";

const spl = (valor: number, condicaoMedicao?: CondicaoSpl): SpecValue<number, CondicaoSpl> => ({
  valor,
  unidade: "dB",
  ...(condicaoMedicao ? { condicaoMedicao } : {}),
  fonte: "teste",
  dataVerificacao: "2026-10-01",
  status: "declarado_fabricante",
});

describe("nível direto 20log (valores à mão)", () => {
  it("126 dB a 1 m -> 106 dB a 10 m", () => expect(nivelDireto(126, 10)).toBeCloseTo(106, 10));
  it("dobrar a distância perde 6,02 dB", () => expect(nivelDireto(100, 1) - nivelDireto(100, 2)).toBeCloseTo(6.0206, 4));
  it("SPL necessário: 85 dB a 10 m pede 105 dB a 1 m", () => expect(splNecessario(85, 10)).toBeCloseTo(105, 10));
  it("propriedade: splNecessario é o inverso de nivelDireto", () => {
    fc.assert(fc.property(fc.double({ min: 60, max: 140, noNaN: true }), fc.double({ min: 0.5, max: 100, noNaN: true }), (n, d) => Math.abs(nivelDireto(splNecessario(n, d), d) - n) < 1e-9));
  });
});

describe("conversão de condição de medição (SPEC C5)", () => {
  it("contínuo em campo livre: usa direto", () => expect(splContinuoUtil(spl(126, "continuo_campo_livre"), "pedestal", 6)).toEqual({ status: "ok", valor: 126, estimado: false }));
  it("pico em campo livre: contínuo = pico - 6, estimado", () => {
    const r = splContinuoUtil(spl(134, "pico_campo_livre"), "pedestal", 6);
    expect(r.status).toBe("estimado");
    if (r.status === "estimado") expect(r.valor).toBe(128);
  });
  it("meio espaço com caixa em pedestal: pendente", () => expect(splContinuoUtil(spl(124, "continuo_meio_espaco"), "pedestal", 6).status).toBe("pendente"));
  it("meio espaço com caixa no chão: usa, com aviso", () => {
    const r = splContinuoUtil(spl(124, "continuo_meio_espaco"), "chao", 6);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.aviso).toMatch(/meio espaço/);
  });
  it("sem condição de medição: pendente", () => expect(splContinuoUtil(spl(126), "pedestal", 6).status).toBe("pendente"));
  it("sem SPL: pendente", () => expect(splContinuoUtil(undefined, "pedestal", 6).status).toBe("pendente"));
  it("pico nunca é usado como contínuo", () => {
    fc.assert(
      fc.property(fc.double({ min: 90, max: 145, noNaN: true }), (v) => {
        const r = splContinuoUtil(spl(v, "pico_campo_livre"), "pedestal", 6);
        return r.status === "estimado" && r.valor < v;
      }),
    );
  });
});

describe("interpolação da tabela do fabricante (sem extrapolar)", () => {
  const t = [
    { distancia_m: 5, spl_db: 114 },
    { distancia_m: 10, spl_db: 110 },
    { distancia_m: 20, spl_db: 106 },
  ];
  it("ponto publicado devolve o valor publicado", () => expect(interpolarSpl(t, 10)).toBeCloseTo(110, 10));
  it("média geométrica de 5 e 10 m (7,07 m) fica no meio: 112 dB", () => expect(interpolarSpl(t, Math.sqrt(50))).toBeCloseTo(112, 10));
  it("abaixo do primeiro ponto: undefined", () => expect(interpolarSpl(t, 4.9)).toBeUndefined());
  it("acima do último ponto: undefined", () => expect(interpolarSpl(t, 20.1)).toBeUndefined());
  it("propriedade: resultado sempre entre os extremos publicados", () => {
    fc.assert(
      fc.property(fc.double({ min: 5, max: 20, noNaN: true }), (d) => {
        const v = interpolarSpl(t, d)!;
        return v <= 114 + 1e-9 && v >= 106 - 1e-9;
      }),
    );
  });
});

describe("classificação de cobertura nominal", () => {
  it("dentro de H/2 e V/2: coberto", () => expect(classificarCobertura({ h: 44.9, v: -29 }, 90, 60, 10)).toBe("coberto"));
  it("até 10° fora: borda", () => expect(classificarCobertura({ h: 54, v: 0 }, 90, 60, 10)).toBe("borda"));
  it("mais de 10° fora: fora", () => expect(classificarCobertura({ h: 56, v: 0 }, 90, 60, 10)).toBe("fora"));
  it("vertical fora da borda: fora", () => expect(classificarCobertura({ h: 0, v: -41 }, 90, 60, 10)).toBe("fora"));
});

describe("PAG/NAG", () => {
  it("exemplo publicado pela Rane/ProSoundWeb: PAG ≈ 18,4 dB e NAG ≈ 14 dB", () => {
    // D0 = 20, D1 = 10, D2 = 6, Ds = 2, D3 = 4 (pés), NOM = 1, FSM = 6.
    // PAG = 20 log(20*10 / (6*2)) - 0 - 6 = 20 log(16,667) - 6 = 24,437 - 6 = 18,437 dB
    // NAG = 20 log(20 / 4) = 13,979 dB
    const d = { D0: 20, D1: 10, D2: 6, D3: 4, Ds: 2, NOM: 1 };
    expect(calcularPag(d, 6)).toBeCloseTo(18.437, 3);
    expect(calcularNag(d)).toBeCloseTo(13.979, 3);
  });
  it("dobrar os microfones abertos reduz o PAG em 3,01 dB", () => {
    const d = { D0: 20, D1: 10, D2: 6, D3: 4, Ds: 2, NOM: 1 };
    expect(calcularPag(d, 6) - calcularPag({ ...d, NOM: 2 }, 6)).toBeCloseTo(3.0103, 4);
  });
  it("PAG não depende da unidade (pés ou metros)", () => {
    const f = 0.3048;
    const d = { D0: 20, D1: 10, D2: 6, D3: 4, Ds: 2, NOM: 1 };
    const m = { D0: 20 * f, D1: 10 * f, D2: 6 * f, D3: 4 * f, Ds: 2 * f, NOM: 1 };
    expect(calcularPag(m, 6)).toBeCloseTo(calcularPag(d, 6), 10);
  });
  it("faixas de risco: >= 3 baixo, 0 a 3 moderado, < 0 alto", () => {
    expect(classificarRisco(3, 3, 0)).toBe("baixo");
    expect(classificarRisco(1.5, 3, 0)).toBe("moderado");
    expect(classificarRisco(-0.1, 3, 0)).toBe("alto");
  });
  it.skipIf(!biamp.preenchido)("exemplo numérico da Biamp (PENDENTE: preencher fixtures/biamp-pag-nag.json)", () => {
    const e1 = biamp.exemplo1 as unknown as { D0: number; D1: number; D2: number; D3: number; Ds: number; NOM: number; FSM: number; PAG: number; NAG: number };
    const e2 = biamp.exemplo2 as unknown as { D0: number; D1: number; D2: number; D3: number; Ds: number; NOM: number; FSM: number; PAG: number };
    expect(Math.round(calcularPag(e1, e1.FSM))).toBe(e1.PAG);
    expect(Math.round(calcularNag(e1))).toBe(e1.NAG);
    expect(Math.round(calcularPag(e2, e2.FSM))).toBe(e2.PAG);
  });
});

describe("classe de reverberação", () => {
  const p = PARAMS_V1;
  it("superfícies duras + palma ecoa + volume > 1500: 5 pontos, alto", () => expect(classeReverberacao({ superficies: "duras", palma: "sim", volume: 2000 }, p)).toEqual({ classe: "alto", pontos: 5, estimado: false }));
  it("absorventes + não ecoa: 0, baixo", () => expect(classeReverberacao({ superficies: "absorventes", palma: "nao", volume: 300 }, p).classe).toBe("baixo"));
  it("'não sei' usa a classe média e marca estimado", () => expect(classeReverberacao({ superficies: null, palma: null, volume: 300 }, p)).toEqual({ classe: "medio", pontos: 2, estimado: true }));
});

describe("nível-alvo", () => {
  const p = PARAMS_V1;
  it("fala, conversa fácil: 75 + 10", () => {
    const a = nivelAlvo(["fala"], "facil", p);
    expect([a.alvo, a.reserva, a.requerido, a.sub]).toEqual([75, 10, 85, "nao"]);
  });
  it("uso misto: vale o maior alvo", () => expect(nivelAlvo(["fala", "banda_bateria"], "facil", p).alvo).toBe(95));
  it("DJ com conversa muito difícil: teto de 100 dB e aviso de segurança auditiva", () => {
    const a = nivelAlvo(["dj"], "muito_dificil", p);
    expect(a.alvo).toBe(100);
    expect(a.limitadoPeloTeto).toBe(true);
    expect(a.avisoSegurancaAuditiva).toBe(true);
  });
  it("ruído 'não sei' soma +5 dB (opção do meio)", () => expect(nivelAlvo(["fala"], null, p).alvo).toBe(80));
  it("sub: recomendado com bateria; opcional com vídeo; não para fala", () => {
    expect(nivelAlvo(["banda_bateria"], "facil", p).sub).toBe("sim");
    expect(nivelAlvo(["video", "fala"], "facil", p).sub).toBe("opcional");
    expect(nivelAlvo(["fala", "musica_ambiente"], "facil", p).sub).toBe("nao");
  });
});
