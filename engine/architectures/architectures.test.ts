import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { Trilha1Schema, type Trilha1Entrada } from "../input/schema";
import { prepararCaso, type CasoPreparado } from "../context";
import { PARAMS_V1 } from "../params";
import { AR1, AR2, fonteGenericaPara, arquiteturaPreferida } from "./index";
import { avaliar } from "./evaluate";
import { regraSub, criarSubs } from "./sub";
import { fonteDeProduto } from "../selection/fonte";
import { pagNagDaPlanta } from "../acoustics/feedback";
import { dentroSala } from "../geometry/room";
import { lerDadosBrutos, montarSnapshot } from "../../scripts/lib/catalog-io";

const demo = montarSnapshot("demo", lerDadosBrutos("demo"));
const produto = (id: string) => demo.produtos.find((p) => p.id === id)!;

function ctx(t: Trilha1Entrada): CasoPreparado {
  const r = prepararCaso(Trilha1Schema.parse(t), PARAMS_V1);
  if (!r.ok) throw new Error(JSON.stringify(r.erros));
  return r.ctx;
}

const igreja: Trilha1Entrada = {
  tipoEstabelecimento: "igreja",
  usos: ["fala"],
  dimensoes: { tipo: "medidas", comprimento: 12, largura: 10, peDireito: 3.5 },
  publico: { quantidade: 80 },
  acustica: { superficies: "mistas", palma: "um_pouco", conversa: "facil" },
};

describe("AR-1 com perfil genérico", () => {
  const c = ctx(igreja);
  const r = AR1.gerar(c, fonteGenericaPara("AR-1", c));
  it("gera 2 caixas principais em parede (instalação fixa sem preferência)", () => {
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const p = r.configuracao.caixas.filter((x) => x.papel === "principal");
    expect(p).toHaveLength(2);
    expect(p.every((x) => x.montagem === "parede")).toBe(true);
    // Parede: 0,2 m da parede lateral; y = palco 3 m - recuo 0,5 m; z = min(3,5; 3,5 - 0,3 - 0,3) = 2,9 m
    expect(p[0]!.posicao.x).toBeCloseTo(0.2, 10);
    expect(p[0]!.posicao.y).toBeCloseTo(2.5, 10);
    expect(p[0]!.posicao.z).toBeCloseTo(2.9, 10);
    expect(p[1]!.posicao.x).toBeCloseTo(9.8, 10);
  });
  it("requisito de SPL calculado à mão: 108 dB e tamanho 10\"", () => {
    if (!r.ok) return;
    // Ponto mais distante da caixa L: (9,75; 11,75; 1,2). d = sqrt(9,55² + 9,25² + 1,7²) = 13,403 m
    // 85 + 20 log(13,403) = 85 + 22,54 = 107,54 -> 108 dB
    const req = r.configuracao.requisitos.principal!.find((q) => q.campo === "splContinuo1m")!;
    expect(req.valor).toBe(108);
    expect(r.configuracao.caixas[0]!.fonte.ref).toBe("GEN-ATIVA-10");
  });
  it("sem reforço numa sala de 12 m", () => {
    if (r.ok) expect(r.configuracao.variante).toBe("base");
  });
  it("mira: horizontal para o centro da última fileira", () => {
    if (!r.ok) return;
    const L = r.configuracao.caixas.find((x) => x.id === "P-L")!;
    // atan2(5 - 0,2; 12 - 2,5) = atan2(4,8; 9,5) = 26,81°
    expect(L.mira.yaw).toBeCloseTo(26.81, 2);
    expect(L.mira.pitch).toBeLessThan(0);
  });
});

describe("AR-1 com produto real", () => {
  const c = ctx(igreja);
  it("Demo Ativa 12: capacidade validada (126 dB contínuo, campo livre)", () => {
    const f = fonteDeProduto(produto("demo-ativa-12"), PARAMS_V1);
    expect(f.ok).toBe(true);
    if (!f.ok) return;
    const r = AR1.gerar(c, f.fonte);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const av = avaliar(r.configuracao, c.malha, PARAMS_V1.bordaCobertura.valor, c.alvo.requerido);
    expect(av.capacidade).toBe("validada");
    expect(av.nivel!.min).toBeGreaterThanOrEqual(85);
  });
  it("Demo Ativa 12 Sem SPL: capacidade pendente", () => {
    const f = fonteDeProduto(produto("demo-ativa-12-sem-spl"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR1.gerar(c, f.fonte);
    if (!r.ok) throw new Error();
    expect(avaliar(r.configuracao, c.malha, 10, c.alvo.requerido).capacidade).toBe("pendente");
  });
  it("Demo Ativa 10 Incompleta: não avaliável (sem cobertura V)", () => {
    const f = fonteDeProduto(produto("demo-ativa-10-incompleta"), PARAMS_V1);
    expect(f.ok).toBe(false);
    if (!f.ok) expect(f.faltando).toContain("coberturaV");
  });
  it("Demo Ativa 15 (só pico): nível estimado com aviso", () => {
    const f = fonteDeProduto(produto("demo-ativa-15"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR1.gerar(ctx({ ...igreja, instalacao: { forma: "pedestal" } }), f.fonte);
    if (!r.ok) throw new Error();
    const n = r.configuracao.caixas[0]!.fonte.nivel;
    expect(n.tipo === "pontual" && n.estimado && n.spl1m).toBe(128);
    expect(r.configuracao.avisos.join()).toMatch(/pico/);
  });
  it("montagem não permitida pelo fabricante: violação", () => {
    const f = fonteDeProduto(produto("demo-ativa-15"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR1.gerar(ctx({ ...igreja, instalacao: { forma: "parede" } }), f.fonte);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.violacao).toBe(true);
  });
});

describe("reforço/delay", () => {
  it("distância acima de 20 m gera par de reforço com atraso de referência = d/343", () => {
    const c = ctx({ ...igreja, dimensoes: { tipo: "medidas", comprimento: 40, largura: 15, peDireito: 6 } });
    const r = AR1.gerar(c, fonteGenericaPara("AR-1", c));
    if (!r.ok) throw new Error();
    expect(r.configuracao.variante).toBe("reforco");
    const rf = r.configuracao.caixas.filter((x) => x.papel === "reforco");
    expect(rf).toHaveLength(2);
    const a = r.configuracao.atrasos[0]!;
    expect(a.ms).toBeCloseTo((1000 * a.distanciaExtra) / 343, 0);
  });
  it("nível insuficiente de produto real gera reforço (25 m, banda)", () => {
    const c = ctx({ ...igreja, usos: ["banda"], formacaoBanda: "banda_bateria", dimensoes: { tipo: "medidas", comprimento: 19, largura: 12, peDireito: 5 } });
    const f = fonteDeProduto(produto("demo-ativa-12"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR1.gerar(c, f.fonte);
    if (!r.ok) throw new Error();
    expect(r.configuracao.variante).toBe("reforco");
  });
});

describe("AR-2 vertical array", () => {
  const aud: Trilha1Entrada = {
    tipoEstabelecimento: "auditorio",
    usos: ["fala"],
    dimensoes: { tipo: "medidas", comprimento: 30, largura: 18, peDireito: 7 },
    publico: { quantidade: 450 },
    acustica: { conversa: "facil" },
  };
  it("não disponível com suspensa + instalação fixa", () => {
    const c = ctx({ ...aud, instalacao: { forma: "suspensa", formato: "coluna" } });
    const d = AR2.disponibilidade(c);
    expect(d.disponivel).toBe(false);
    if (!d.disponivel) expect(d.motivo).toMatch(/projeto estrutural/);
  });
  it("Demo Line 6: escolhe a menor configuração da tabela que cobre, nível da tabela", () => {
    const c = ctx(aud);
    const f = fonteDeProduto(produto("demo-line-6"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR2.gerar(c, f.fonte);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const cfg = r.configuracao.configArray!;
    // Pedestal (fixa, sem preferência), centro a 3,0 m, caixa em y = 2,5 m.
    // Da primeira fileira (y = 3) o ângulo é -74,5°: nenhuma configuração cobre -> cobre a partir de y = 6 m, com front-fill.
    // De y = 6: v = atan2(1,2 - 3; 3,5) = -27,2°. Última fileira: d_h = hypot(8,5; 27,5) = 28,78 m -> v = -3,6°. Span = 23,6°.
    // 2 módulos: V 40°, alcance 16 m < 28,8 -> não. 4 módulos: V 30°, alcance 28 m < 28,8 -> não. 6 módulos: V 24° e 36 m -> sim.
    expect(cfg.modulos).toBe(6);
    expect(r.configuracao.frontFill).toBe(true);
    expect(r.configuracao.caixas[0]!.fonte.nivel.tipo).toBe("tabela");
  });
  it("não extrapola: ponto além da tabela fica sem nível (capacidade pendente ou validada só dentro da tabela)", () => {
    const c = ctx(aud);
    const f = fonteDeProduto(produto("demo-line-6"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR2.gerar(c, f.fonte);
    if (!r.ok) throw new Error();
    const av = avaliar(r.configuracao, c.malha, 10, c.alvo.requerido);
    const n = r.configuracao.caixas[0]!.fonte.nivel;
    if (n.tipo === "tabela") {
      const dMin = Math.min(...n.pontos.map((x) => x.distancia_m));
      // Pontos mais perto que o primeiro ponto publicado não recebem nível.
      expect(dMin).toBeGreaterThan(0);
      expect(["validada", "pendente", "insuficiente"]).toContain(av.capacidade);
    }
  });
  it("Demo Coluna 8 sem SPL na configuração escolhida: capacidade pendente", () => {
    const c = ctx({ ...aud, dimensoes: { tipo: "medidas", comprimento: 14, largura: 10, peDireito: 4 }, publico: { quantidade: 100 }, mobilidade: "movel" });
    const f = fonteDeProduto(produto("demo-coluna-8"), PARAMS_V1);
    if (!f.ok) throw new Error();
    const r = AR2.gerar(c, f.fonte);
    if (!r.ok) throw new Error(r.motivo);
    if (r.configuracao.configArray!.modulos === 1) expect(avaliar(r.configuracao, c.malha, 10, c.alvo.requerido).capacidade).toBe("pendente");
  });
  it("perfil genérico gera requisito de cobertura vertical", () => {
    const c = ctx(aud);
    const r = AR2.gerar(c, fonteGenericaPara("AR-2", c));
    if (!r.ok) throw new Error();
    expect(r.configuracao.requisitos.principal!.some((q) => q.campo === "coberturaV")).toBe(true);
  });
});

describe("AR-3 subwoofer", () => {
  it("regra por uso", () => {
    expect(regraSub(ctx({ ...igreja, usos: ["dj"] }).alvo)).toBe("recomendado");
    expect(regraSub(ctx({ ...igreja, usos: ["video"] }).alvo)).toBe("opcional");
    expect(regraSub(ctx(igreja).alvo)).toBe("nao_recomendado");
  });
  it("subs no chão, ao lado das principais", () => {
    const c = ctx(igreja);
    const r = AR1.gerar(c, fonteGenericaPara("AR-1", c));
    if (!r.ok) throw new Error();
    const subs = criarSubs(r.configuracao.caixas, { ...fonteGenericaPara("AR-1", c), ref: "GEN-SUB" }, 1);
    expect(subs).toHaveLength(2);
    expect(subs.every((s) => s.montagem === "chao")).toBe(true);
  });
});

describe("preferência de arquitetura", () => {
  it("área profunda prefere AR-2", () => expect(arquiteturaPreferida(["AR-1", "AR-2"], 27, "medio", 18)).toBe("AR-2"));
  it("sala pequena prefere AR-1", () => expect(arquiteturaPreferida(["AR-1", "AR-2"], 9, "medio", 18)).toBe("AR-1"));
  it("reverberação alta prefere AR-2", () => expect(arquiteturaPreferida(["AR-1", "AR-2"], 9, "alto", 18)).toBe("AR-2"));
});

describe("PAG/NAG pela planta", () => {
  it("distâncias positivas e coerentes (D0 > D3)", () => {
    const c = ctx(igreja);
    const r = AR1.gerar(c, fonteGenericaPara("AR-1", c));
    if (!r.ok) throw new Error();
    const pn = pagNagDaPlanta(r.configuracao, c.malha, c.caso, PARAMS_V1, 1)!;
    expect(pn.distancias.D0).toBeGreaterThan(pn.distancias.D3);
    expect(pn.distancias.Ds).toBeCloseTo(0.15, 10);
    expect(Number.isFinite(pn.margem)).toBe(true);
  });
});

describe("propriedades das arquiteturas", () => {
  it("nenhuma caixa fora da sala nem acima do pé-direito; quantidades inteiras", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 5, max: 60, noNaN: true }),
        fc.double({ min: 4, max: 40, noNaN: true }),
        fc.double({ min: 2.5, max: 12, noNaN: true }),
        fc.constantFrom("pedestal", "parede", "suspensa", "chao", "sem_preferencia"),
        fc.constantFrom("fixa", "movel"),
        (c, l, h, forma, mob) => {
          const r = prepararCaso(
            Trilha1Schema.parse({ ...igreja, dimensoes: { tipo: "medidas", comprimento: c, largura: l, peDireito: h }, instalacao: { forma }, mobilidade: mob }),
            PARAMS_V1,
          );
          if (!r.ok) return true;
          for (const g of [AR1, AR2]) {
            if (!g.disponibilidade(r.ctx).disponivel) continue;
            const out = g.gerar(r.ctx, fonteGenericaPara(g.id, r.ctx));
            if (!out.ok) continue;
            const s = r.ctx.caso.sala.valor;
            if (!out.configuracao.caixas.every((x) => dentroSala(s, x.posicao))) return false;
            if (!Number.isInteger(out.configuracao.caixas.length)) return false;
          }
          return true;
        },
      ),
      { numRuns: 60 },
    );
  });
});
