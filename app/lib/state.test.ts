import { describe, it, expect } from "vitest";
import { codificar, decodificar, type EstadoUrl } from "./state";

const e: EstadoUrl = { v: 1, e: { trilha1: { tipoEstabelecimento: "igreja" } }, c: "abc", p: "params-v1", m: "0.1.0", d: "2026-10-29" };

describe("estado na URL", () => {
  it("ida e volta", () => expect(decodificar(codificar(e))).toEqual(e));
  it("lixo devolve null", () => {
    expect(decodificar("xyz")).toBeNull();
    expect(decodificar("")).toBeNull();
    expect(decodificar(null)).toBeNull();
  });
  it("estrutura inválida devolve null (validação Zod)", () => {
    expect(decodificar(codificar({ ...e, v: 2 } as unknown as EstadoUrl))).toBeNull();
    expect(decodificar(codificar({ ...e, d: "ontem" } as unknown as EstadoUrl))).toBeNull();
  });
  it("URL longa demais é rejeitada", () => expect(decodificar("a".repeat(20000))).toBeNull());
});
