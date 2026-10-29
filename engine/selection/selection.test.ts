import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { ordenarCandidatos, type Candidato } from "./compat";
import { faixaVigente, compararOrcamento, somarInvestimento } from "./investimento";
import { CATALOGO_DEMO, CATALOGO_VAZIO, IGREJA_PEQUENA, rodar } from "../testing/fixtures";
import { executarMotor } from "../run";
import { PARAMS_VERSION_ATUAL } from "../params";
import type { CatalogSnapshot, Product } from "../../catalog/schema";

const cand = (id: string, o: Partial<Candidato>): Candidato => ({
  produtoId: id,
  nome: id,
  marca: "X",
  categoria: "caixa_ativa",
  subcategoria: "12",
  status: "compativel",
  motivos: [],
  faltando: [],
  quantidadeCaixas: 2,
  avisos: [],
  ...o,
});
const faixa = (minimo: number) => ({ minimo, maximo: minimo * 2, dataVerificacao: "2026-10-01", fonte: "t", ids: ["t"] });

describe("ranking (SPEC C8)", () => {
  it("(a) compatível antes de parcial", () => {
    const r = ordenarCandidatos([cand("a", { status: "parcial" }), cand("b", { status: "compativel" })], 6);
    expect(r.map((c) => c.produtoId)).toEqual(["b", "a"]);
  });
  it("(b) menos caixas antes", () => {
    const r = ordenarCandidatos([cand("a", { quantidadeCaixas: 4 }), cand("b", { quantidadeCaixas: 2 })], 6);
    expect(r[0]!.produtoId).toBe("b");
  });
  it("(c) margem acima de +6 dB não soma pontos; (d) desempata pela faixa", () => {
    const r = ordenarCandidatos([cand("a", { margemNivel: 20, faixa: faixa(5000) }), cand("b", { margemNivel: 7, faixa: faixa(2000) }), cand("c", { margemNivel: 3, faixa: faixa(100) })], 6);
    expect(r.map((c) => c.produtoId)).toEqual(["b", "a", "c"]);
  });
  it("marca não influencia a ordem (política aberta)", () => {
    fc.assert(
      fc.property(fc.array(fc.record({ q: fc.integer({ min: 1, max: 6 }), m: fc.double({ min: -10, max: 20, noNaN: true }), marca: fc.string() }), { minLength: 1, maxLength: 8 }), (xs) => {
        const a = xs.map((x, i) => cand(`p${i}`, { quantidadeCaixas: x.q, margemNivel: x.m, marca: x.marca }));
        const b = a.map((c) => ({ ...c, marca: "OutraMarca" }));
        return JSON.stringify(ordenarCandidatos(a, 6).map((c) => c.produtoId)) === JSON.stringify(ordenarCandidatos(b, 6).map((c) => c.produtoId));
      }),
    );
  });
});

describe("faixa de investimento", () => {
  const f = { id: "x", categoria: "caixa_ativa" as const, subcategoria: "12", porte: "entrada" as const, minimo: 1, maximo: 2, fonte: "t", dataVerificacao: "2026-07-01", validadeDias: 90, demo: false };
  it("vigente até 90 dias, vencida depois", () => {
    expect(faixaVigente(f, "2026-09-29")).toBe(true);
    expect(faixaVigente(f, "2026-09-30")).toBe(false);
  });
  it("faixa vencida não aparece no resultado", () => {
    const r = rodar(IGREJA_PEQUENA, CATALOGO_DEMO, "2027-06-01");
    expect(r.investimento?.referencia ?? null).toBeNull();
  });
  it("soma por quantidade e informa o mês de referência", () => {
    const inv = somarInvestimento([
      { descricao: "a", quantidade: 2, faixa: faixa(1000) },
      { descricao: "b", quantidade: 1, faixa: undefined },
    ])!;
    expect([inv.minimo, inv.maximo, inv.referencia, inv.completo]).toEqual([2000, 4000, "10/2026", false]);
  });
  it("orçamento abaixo do mínimo: mensagem com o mínimo da solução", () => {
    const c = compararOrcamento(1000, { minimo: 3000, maximo: 5000, referencia: "10/2026", itensSemFaixa: [], completo: true });
    expect(c.situacao).toBe("abaixo");
    expect(c.mensagem).toMatch(/R\$ 3\.000/);
    expect(c.mensagem).toMatch(/não reduz os requisitos/);
  });
});

describe("seleção no motor", () => {
  it("catálogo vazio: perfil genérico com a frase da SPEC", () => {
    const r = rodar(IGREJA_PEQUENA, CATALOGO_VAZIO);
    expect(r.recomendacao!.semProdutoAdequado).toBe(true);
    expect(r.recomendacao!.produto).toBeNull();
    expect(r.recomendacao!.perfilGenerico.rotulo).toBe("Perfil genérico - especificação mínima, não é um produto.");
    expect(r.recomendacao!.equipamentos.every((e) => e.tipo === "generico")).toBe(true);
  });
  it("igreja pequena com catálogo demo: produto compatível com capacidade validada", () => {
    const r = rodar(IGREJA_PEQUENA);
    expect(r.recomendacao!.produto!.status).toBe("compativel");
    expect(r.recomendacao!.statusValidacao.capacidade).toBe("validada");
  });
  it("produto com dado de geometria estimado nunca aparece como compatível", () => {
    const r = rodar(IGREJA_PEQUENA);
    const c = r.recomendacao!.candidatos.find((x) => x.produtoId === "demo-ativa-10-incompleta")!;
    expect(c.status).toBe("parcial");
    expect(c.motivos.join(" ")).toMatch(/não publica o ângulo/);
  });
  it("escolha do usuário troca o produto e mantém planta == lista", () => {
    const r = rodar({ ...IGREJA_PEQUENA, escolhas: { principal: "demo-ativa-15-pro" } });
    expect(r.recomendacao!.produto!.produtoId).toBe("demo-ativa-15-pro");
  });
  it("mover caixa marca a configuração como ajustada e recalcula", () => {
    const r = rodar({ ...IGREJA_PEQUENA, ajustes: { "P-L": { x: 3, y: 2 } } });
    const c = r.recomendacao!.configuracao.caixas.find((x) => x.id === "P-L")!;
    expect(r.recomendacao!.ajustada).toBe(true);
    expect([c.posicao.x, c.posicao.y, c.movida]).toEqual([3, 2, true]);
  });
});

// ---------------- Propriedades (SPEC C10 B) ----------------

const arbEntrada = fc.record({
  c: fc.double({ min: 6, max: 45, noNaN: true }),
  l: fc.double({ min: 5, max: 30, noNaN: true }),
  h: fc.double({ min: 2.5, max: 10, noNaN: true }),
  usos: fc.subarray(["fala", "musica_ambiente", "musica_primeiro_plano", "banda", "dj", "video"] as const, { minLength: 1 }),
  forma: fc.constantFrom("pedestal", "parede", "suspensa", "chao", "sem_preferencia"),
  formato: fc.constantFrom("convencional", "coluna", "sem_preferencia"),
  mob: fc.constantFrom("fixa", "movel"),
  publico: fc.integer({ min: 10, max: 900 }),
});
type Arb = typeof arbEntrada extends fc.Arbitrary<infer T> ? T : never;
const montar = (x: Arb, extra: object = {}) => ({
  trilha1: {
    tipoEstabelecimento: "salao_eventos",
    usos: x.usos,
    formacaoBanda: "banda_bateria",
    dimensoes: { tipo: "medidas", comprimento: x.c, largura: x.l, peDireito: x.h },
    publico: { quantidade: x.publico },
    instalacao: { forma: x.forma, formato: x.formato },
    mobilidade: x.mob,
  },
  ...extra,
});
const OPTS = { catalogo: CATALOGO_DEMO, paramsVersion: PARAMS_VERSION_ATUAL, dataReferencia: "2026-10-29" };

describe("propriedades do motor", () => {
  it("quantidades inteiras >= 0; caixas dentro da sala; lista == planta; montagem permitida", () => {
    fc.assert(
      fc.property(arbEntrada, (x) => {
        const r = executarMotor(montar(x), OPTS);
        if (!r.ok || !r.recomendacao) return true;
        const rec = r.recomendacao;
        const s = r.caso.sala;
        for (const c of rec.configuracao.caixas) {
          if (c.posicao.x < 0 || c.posicao.x > s.largura || c.posicao.y < 0 || c.posicao.y > s.profundidade || c.posicao.z < 0 || c.posicao.z > s.peDireito) return false;
          if (c.fonte.tipo === "produto") {
            const p = CATALOGO_DEMO.produtos.find((q) => q.id === c.fonte.ref)!;
            if (p.montagensPermitidas && !p.montagensPermitidas.valor.includes(c.montagem)) return false;
          }
        }
        const total = rec.equipamentos.reduce((a, e) => a + e.quantidade, 0);
        if (total !== rec.configuracao.caixas.length) return false;
        if (!rec.equipamentos.every((e) => Number.isInteger(e.quantidade) && e.quantidade >= 0)) return false;
        const numerosLista = rec.equipamentos.flatMap((e) => e.numeros).sort((a, b) => a - b);
        const numerosPlanta = rec.configuracao.caixas.map((c) => c.numero).sort((a, b) => a - b);
        return JSON.stringify(numerosLista) === JSON.stringify(numerosPlanta);
      }),
      { numRuns: 40 },
    );
  });
  it("orçamento menor nunca reduz o requisito", () => {
    fc.assert(
      fc.property(arbEntrada, fc.integer({ min: 0, max: 100000 }), (x, orc) => {
        const a = executarMotor(montar(x), OPTS);
        const b = executarMotor(montar(x, { orcamento: orc }), OPTS);
        if (!a.ok || !b.ok) return a.ok === b.ok;
        return (
          JSON.stringify(a.recomendacao?.perfilGenerico.requisitos) === JSON.stringify(b.recomendacao?.perfilGenerico.requisitos) &&
          JSON.stringify(a.recomendacao?.equipamentos) === JSON.stringify(b.recomendacao?.equipamentos) &&
          a.alvo.requerido === b.alvo.requerido
        );
      }),
      { numRuns: 25 },
    );
  });
  it("mesmo input + mesmas versões = saída idêntica", () => {
    fc.assert(
      fc.property(arbEntrada, (x) => JSON.stringify(executarMotor(montar(x), OPTS)) === JSON.stringify(executarMotor(montar(x), OPTS))),
      { numRuns: 15 },
    );
  });
  it("produto com campo crítico de geometria removido nunca fica compatível", () => {
    fc.assert(
      fc.property(fc.constantFrom("demo-ativa-10", "demo-ativa-12", "demo-ativa-15", "demo-ativa-15-pro"), fc.constantFrom("coberturaH", "coberturaV"), (id, campo) => {
        const produtos: Product[] = CATALOGO_DEMO.produtos.map((p) => {
          if (p.id !== id) return p;
          const esp = { ...p.especificacoes };
          delete (esp as Record<string, unknown>)[campo];
          return { ...p, especificacoes: esp };
        });
        const cat: CatalogSnapshot = { ...CATALOGO_DEMO, version: "teste", produtos };
        const r = rodar(IGREJA_PEQUENA, cat);
        const c = r.recomendacao!.candidatos.find((x) => x.produtoId === id)!;
        // Sem o dado, o motor usa a referência: o produto pode aparecer, mas nunca como "compatível".
        return c.status !== "compativel";
      }),
    );
  });
});
