import { describe, it, expect } from "vitest";
import { rodar, IGREJA_PEQUENA } from "../testing/fixtures";
import { render, TEMPLATES } from "./templates";

const t2 = { vozes: { paradas: 2, moveis: 1 }, instrumentos: { violao: 1 }, outrasFontes: { playback: true }, retorno: { mixagens: 1 }, operacao: { operador: "voluntario" } };

describe("explicações", () => {
  const r = rodar({ ...IGREJA_PEQUENA, trilha2: t2 });
  it("toda conclusão tem entradas/regra/parâmetros/hipóteses/limitações", () => {
    for (const c of r.conclusoes) {
      expect(c.regra.length).toBeGreaterThan(0);
      expect(Array.isArray(c.entradas) && Array.isArray(c.parametros) && Array.isArray(c.hipoteses) && Array.isArray(c.limitacoes)).toBe(true);
      expect(c.texto).not.toMatch(/\{\w+\}/);
    }
  });
  it("cada caixa da planta tem um 'Por quê?'", () => {
    for (const cx of r.recomendacao!.configuracao.caixas) expect(r.conclusoes.some((c) => c.id === `caixa:${cx.id}`)).toBe(true);
  });
  it("cada item de B4 tem explicação", () => {
    for (const id of ["arquitetura", "caixas", "cobertura", "capacidade", "requisitos", "produtos", "sub", "reverberacao", "pagnag", "escopo", "nivel-alvo", "palco:mesa", "palco:rf", "palco:acessorios"])
      expect(r.conclusoes.map((c) => c.id)).toContain(id);
  });
  it("parâmetros pendentes ficam visíveis com status", () => {
    expect(r.parametrosPendentes.length).toBeGreaterThan(5);
    expect(r.parametrosPendentes.every((p) => p.status === "pendente_validacao")).toBe(true);
    expect(r.parametrosPendentes.map((p) => p.id)).toContain("niveisPorUso");
  });
  it("texto do PAG/NAG traz o aviso obrigatório", () => {
    const c = r.conclusoes.find((x) => x.id === "pagnag")!;
    expect(c.texto).toMatch(/Teste sempre no local/);
    expect(c.limitacoes).toContain("Estimativa simplificada (lei do inverso do quadrado). Não substitui teste no local.");
  });
  it("cobertura traz o rótulo obrigatório", () => {
    expect(r.conclusoes.find((c) => c.id === "cobertura")!.limitacoes).toContain("Cobertura nominal declarada pelo fabricante. Aproximação geométrica, não é medição.");
  });
  it("sem palavras proibidas de neutralidade em nenhum template", () => {
    const tudo = Object.values(TEMPLATES).join(" ").toLowerCase();
    for (const p of ["independente", "imparcial", "sem vínculo"]) expect(tudo).not.toContain(p);
  });
  it("render substitui placeholders", () => expect(render("teto", { teto: 100 })).toBe("Limitamos o volume a 100 dB, por segurança."));
  it("sala reverberante: aviso específico, sem aumentar o nível", () => {
    const base = rodar({ trilha1: { ...IGREJA_PEQUENA.trilha1, acustica: { superficies: "absorventes", palma: "nao", conversa: "facil" } } });
    const rev = rodar({ trilha1: { ...IGREJA_PEQUENA.trilha1, acustica: { superficies: "duras", palma: "sim", conversa: "facil" } } });
    expect(rev.reverb!.classe).toBe("alto");
    expect(rev.conclusoes.find((c) => c.id === "reverberacao")!.texto).toMatch(/Aumentar o volume não resolve/);
    expect(rev.alvo.requerido).toBe(base.alvo.requerido);
  });
});
