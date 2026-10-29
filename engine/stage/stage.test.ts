import { describe, it, expect } from "vitest";
import { comprimentoComercial } from "./stage";
import { rodar, IGREJA_PEQUENA, CATALOGO_VAZIO } from "../testing/fixtures";

const t2 = (o: object) => ({
  vozes: { paradas: 2, moveis: 0 },
  instrumentos: { violao: 1 },
  outrasFontes: { playback: true },
  retorno: { mixagens: 1, preferencia: "monitor" },
  operacao: { operador: "voluntario" },
  ...o,
});

describe("arredondamento de cabos (valores à mão)", () => {
  it("3,5 m + 20% = 4,2 -> 5 m", () => expect(comprimentoComercial(3.5, 0.2, [5, 10, 15, 20, 30])).toBe(5));
  it("8,4 m + 20% = 10,08 -> 15 m", () => expect(comprimentoComercial(8.4, 0.2, [5, 10, 15, 20, 30])).toBe(15));
  it("25 m + 20% = 30 -> 30 m", () => expect(comprimentoComercial(25, 0.2, [5, 10, 15, 20, 30])).toBe(30));
  it("26 m + 20% = 31,2 -> acima do maior: undefined", () => expect(comprimentoComercial(26, 0.2, [5, 10, 15, 20, 30])).toBeUndefined());
});

describe("contagem de entradas e mesa", () => {
  it("2 vozes + violão + playback = 5 canais; +20% = 6; mesa analógica para voluntário", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({}) }).palco!;
    // 2 vozes (1 cada) + violão (1, DI) + playback (2) = 5; ceil(5 * 1,2) = 6
    expect([p.totalCanais, p.canaisMic, p.canaisComReserva]).toEqual([5, 3, 6]);
    expect(p.mesa.tipo).toBe("analogica");
    expect(p.mesa.vantagens.join()).toMatch(/Controles físicos/);
    expect(p.di[0]!.quantidade).toBe(1);
  });
  it("tamanho da mesa: próximo tamanho do catálogo demo (8 entradas)", () => {
    expect(rodar({ ...IGREJA_PEQUENA, trilha2: t2({}) }).palco!.tamanhoMesa).toBe(8);
  });
  it("bateria acústica básica = 4 canais e exige phantom", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ instrumentos: { bateria_acustica: 1 } }) }).palco!;
    expect(p.entradas.find((e) => e.fonte.startsWith("Bateria acústica"))!.canais).toBe(4);
    expect(p.mesa.phantom).toBe(true);
  });
  it("2 in-ears -> digital; in-ear estéreo conta 2 aux", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ retorno: { mixagens: 2, preferencia: "in_ear" } }) }).palco!;
    expect(p.mesa.tipo).toBe("digital");
    expect(p.mixagens).toEqual({ total: 2, inEar: 2, monitor: 0 });
    expect(p.mesa.motivos.join()).toMatch(/in-ear/);
  });
  it("controle remoto pedido -> digital", () => {
    expect(rodar({ ...IGREJA_PEQUENA, trilha2: t2({ operacao: { operador: "voluntario", controleRemoto: true } }) }).palco!.mesa.tipo).toBe("digital");
  });
  it("técnico fixo com poucos canais -> faixa intermediária (as duas)", () => {
    expect(rodar({ ...IGREJA_PEQUENA, trilha2: t2({ operacao: { operador: "fixo" } }) }).palco!.mesa.tipo).toBe("ambas");
  });
  it("mesa escolhida atende entradas e auxiliares", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ instrumentos: { bateria_acustica: 1, baixo: 1, guitarra: 1, teclado: 1 }, retorno: { mixagens: 4, preferencia: "monitor" } }) }).palco!;
    expect(p.mesa.escolhida).not.toBeNull();
    expect(p.mesa.escolhida!.status).not.toBe("incompativel");
  });
});

describe("microfones, retorno e RF", () => {
  it("voz que anda usa sem fio; voz parada com fio", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ vozes: { paradas: 2, moveis: 1 } }) }).palco!;
    expect(p.microfones.find((m) => m.id === "voz-fio")!.quantidade).toBe(2);
    expect(p.microfones.find((m) => m.id === "voz-sem-fio")!.quantidade).toBe(1);
  });
  it("pregador sem voz móvel: um dos microfones vira sem fio", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ vozes: { paradas: 2, moveis: 0, pregador: true } }) }).palco!;
    expect(p.microfones.find((m) => m.id === "voz-sem-fio")!.quantidade).toBe(1);
    expect(p.microfones.find((m) => m.id === "voz-fio")!.quantidade).toBe(1);
  });
  it("RF: até 4 canais orientação simples; 5 a 12 coordenação; acima de 12 especialista", () => {
    const rf = (moveis: number) => rodar({ ...IGREJA_PEQUENA, trilha2: t2({ vozes: { paradas: 0, moveis } }) }).palco!.rf;
    expect(rf(4).nivel).toBe("simples");
    expect(rf(5).nivel).toBe("coordenacao");
    expect(rf(13).nivel).toBe("especialista");
    expect(rf(1).orientacoes.join(" ")).toMatch(/698-806 MHz/);
    expect(rf(1).orientacoes.join(" ")).toMatch(/Anatel/);
  });
  it("in-ear: 1 receptor por músico; transmissores por mixagem", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ retorno: { mixagens: 3, preferencia: "in_ear", musicosInEar: 4 } }) }).palco!;
    expect(p.retorno.find((r) => r.id === "in-ear-rx")!.quantidade).toBe(4);
    expect(p.retorno.find((r) => r.id === "in-ear-tx")!.quantidade).toBe(3);
  });
  it("monitor de chão usa caixa ativa com modo monitor do catálogo", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({ retorno: { mixagens: 2, preferencia: "monitor" } }) }).palco!;
    const m = p.retorno.find((r) => r.id === "monitor")!;
    expect(m.quantidade).toBe(2);
    expect(m.tipo).toBe("produto");
  });
});

describe("acessórios", () => {
  it("XLR: 1 por microfone com fio + 1 por DI + 1 por monitor + 1 por caixa ativa", () => {
    const r = rodar({ ...IGREJA_PEQUENA, trilha2: t2({}) });
    const p = r.palco!;
    const xlr = p.acessorios.filter((a) => a.id.startsWith("xlr")).reduce((s, a) => s + a.quantidade, 0);
    const caixas = r.recomendacao!.configuracao.caixas.length;
    // 2 vozes com fio + 1 DI (violão) + 1 monitor + caixas
    expect(xlr).toBe(2 + 1 + 1 + caixas);
  });
  it("'não sei' em tudo usa o preset e marca como estimado", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: { vozes: "nao_sei", instrumentos: "nao_sei", outrasFontes: "nao_sei", retorno: "nao_sei", operacao: "nao_sei" } }).palco!;
    expect(p.estimados).toEqual(["vozes", "instrumentos", "outras fontes", "retorno", "operação"]);
    expect(p.microfones.every((m) => m.estimado)).toBe(true);
  });
  it("catálogo vazio: itens de palco viram perfis genéricos", () => {
    const p = rodar({ ...IGREJA_PEQUENA, trilha2: t2({}) }, CATALOGO_VAZIO).palco!;
    expect(p.microfones.every((m) => m.tipo === "generico")).toBe(true);
    expect(p.mesa.escolhida).toBeNull();
    expect(p.tamanhoMesa).toBe(6);
  });
});
