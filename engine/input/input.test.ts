import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { Trilha1Schema, Trilha2Schema } from "./schema";
import { normalizarTrilha1, usosParaParam } from "./normalize";
import { PARAMS_V1 } from "../params";

const base = {
  tipoEstabelecimento: "igreja",
  usos: ["fala"],
  dimensoes: { tipo: "medidas", comprimento: 12, largura: 10, peDireito: 3.5 },
  publico: { quantidade: 80 },
} as const;

describe("schema da trilha 1", () => {
  it("aplica defaults da SPEC B2", () => {
    const t = Trilha1Schema.parse(base);
    expect(t.formato).toBe("retangular");
    expect(t.palco).toEqual({ parede: "menor", profundidade: "nao_sei" });
    expect(t.publico.disposicao).toBe("sentado");
    expect(t.ambiente).toBe("fechado");
    expect(t.mobilidade).toBe("fixa");
    expect(t.instalacao).toEqual({ forma: "sem_preferencia", formato: "sem_preferencia" });
  });
  it("rejeita dimensão negativa com mensagem específica", () => {
    const r = Trilha1Schema.safeParse({ ...base, dimensoes: { ...base.dimensoes, largura: -2 } });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]!.path).toEqual(["dimensoes", "largura"]);
      expect(r.error.issues[0]!.message).toMatch(/Largura/);
    }
  });
  it("aceita 'não sei' nos usos", () => {
    expect(Trilha1Schema.parse({ ...base, usos: "nao_sei" }).usos).toBe("nao_sei");
  });
  it("trilha 2 aceita 'não sei' em todas as perguntas", () => {
    const t = Trilha2Schema.parse({ vozes: "nao_sei", instrumentos: "nao_sei", outrasFontes: "nao_sei", retorno: "nao_sei", operacao: "nao_sei" });
    expect(t.vozes).toBe("nao_sei");
  });
});

describe("normalização", () => {
  it("palco na parede menor: profundidade = dimensão maior", () => {
    const r = normalizarTrilha1(Trilha1Schema.parse(base), PARAMS_V1);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.caso.sala.valor).toEqual({ largura: 10, profundidade: 12, peDireito: 3.5 });
      expect(r.caso.profundidadePalco).toEqual({ valor: 3, origem: "default" });
      expect(r.caso.areaPublico.alturaOuvinte).toBe(1.2);
    }
  });
  it("pé-direito < 2,2 m gera erro no campo", () => {
    const r = normalizarTrilha1(Trilha1Schema.parse({ ...base, dimensoes: { ...base.dimensoes, peDireito: 2.1 } }), PARAMS_V1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros[0]!.campo).toBe("dimensoes.peDireito");
  });
  it("faixa de tamanho marca a sala como estimada", () => {
    const r = normalizarTrilha1(Trilha1Schema.parse({ ...base, dimensoes: { tipo: "faixa", faixa: "sala_aula" } }), PARAMS_V1);
    expect(r.ok && r.caso.sala.origem).toBe("estimado");
  });
  it("'não sei' nos usos usa o preset do estabelecimento", () => {
    const r = normalizarTrilha1(Trilha1Schema.parse({ ...base, usos: "nao_sei" }), PARAMS_V1);
    expect(r.ok && r.caso.usos.origem).toBe("preset");
  });
  it("banda com formação 'varia' vira o pior caso (banda com bateria)", () => {
    expect(usosParaParam(["banda", "fala"], "varia")).toEqual(["banda_bateria", "fala"]);
    expect(usosParaParam(["banda"], "voz_violao")).toEqual(["voz_violao"]);
  });
  it("propriedade: entrada válida sempre normaliza ou devolve erros com campo", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 120, noNaN: true }),
        fc.double({ min: 0.5, max: 120, noNaN: true }),
        fc.double({ min: 1, max: 35, noNaN: true }),
        (c, l, h) => {
          const r = normalizarTrilha1(Trilha1Schema.parse({ ...base, dimensoes: { tipo: "medidas", comprimento: c, largura: l, peDireito: h } }), PARAMS_V1);
          return r.ok ? r.caso.sala.valor.largura <= r.caso.sala.valor.profundidade : r.erros.every((e) => e.campo.length > 0);
        },
      ),
    );
  });
});
