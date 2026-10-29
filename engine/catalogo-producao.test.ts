import { describe, it, expect } from "vitest";
import { lerDadosBrutos, montarSnapshot } from "../scripts/lib/catalog-io";
import { rodar, IGREJA_PEQUENA } from "./testing/fixtures";
import { CASOS } from "../scripts/casos";

/** Catálogo de produção (Armer/AZ, fichas do dono do produto): dados incompletos nunca viram "compatível". */
const PROD = montarSnapshot("producao", lerDadosBrutos("producao"));

describe("catálogo de produção", () => {
  it("não tem itens demo e todo produto tem fonte e data", () => {
    expect(PROD.produtos.every((p) => !p.demo)).toBe(true);
    for (const p of PROD.produtos) for (const s of Object.values(p.especificacoes)) expect(s?.fonte && s.dataVerificacao).toBeTruthy();
  });
  it("igreja pequena: recomenda um modelo do catálogo, marcado como dado a confirmar", () => {
    const r = rodar(IGREJA_PEQUENA, PROD);
    expect(r.recomendacao!.produto).not.toBeNull();
    expect(r.recomendacao!.produto!.status).toBe("parcial");
    expect(r.recomendacao!.statusValidacao.capacidade).toBe("estimada");
  });
  it("nenhum caso de referência mostra produto como 'compatível' (fichas sem ângulo de cobertura)", () => {
    for (const c of CASOS) {
      const r = rodar(c.entrada, PROD);
      for (const k of r.recomendacao?.candidatos ?? []) expect(k.status).not.toBe("compativel");
    }
  });
  it("palco: sistema sem fio duplo conta sistemas, não microfones", () => {
    const r = rodar({ ...IGREJA_PEQUENA, trilha2: { vozes: { paradas: 0, moveis: 4 }, instrumentos: {}, outrasFontes: {}, retorno: { mixagens: 0 }, operacao: { operador: "voluntario" } } }, PROD);
    const sf = r.palco!.microfones.find((m) => m.id === "voz-sem-fio")!;
    expect(sf.tipo).toBe("produto");
    const p = PROD.produtos.find((x) => x.id === sf.ref)!;
    expect(sf.quantidade).toBe(Math.ceil(4 / (p.especificacoes.transmissoresPorSistema?.valor ?? 1)));
  });
  it("lista de canais tem uma linha por canal", () => {
    const r = rodar({ ...IGREJA_PEQUENA, trilha2: { vozes: { paradas: 2, moveis: 1 }, instrumentos: { violao: 1, teclado: 1, bateria_acustica: 1 }, outrasFontes: { playback: true }, retorno: { mixagens: 2 }, operacao: { operador: "voluntario" } } }, PROD);
    expect(r.palco!.inputList.length).toBe(r.palco!.totalCanais);
    expect(r.palco!.inputList.filter((l) => l.phantom).length).toBe(2);
  });
});
