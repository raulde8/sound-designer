import { describe, it, expect } from "vitest";
import { CASOS } from "../scripts/casos";
import { rodar, CATALOGO_DEMO } from "./testing/fixtures";

/** Casos de referência da SPEC C10: comportamento esperado, sem respostas fixas no motor. */
const caso = (id: string) => rodar(CASOS.find((c) => c.id.startsWith(id))!.entrada, CATALOGO_DEMO);

describe("casos de referência (SPEC C10)", () => {
  it("1: igreja pequena, fala -> AR-1, 2 caixas 10/12, sem sub, PAG/NAG, suportado", () => {
    const r = caso("01");
    const p = r.recomendacao!.configuracao.caixas.filter((c) => c.papel === "principal");
    expect(r.recomendacao!.arquitetura).toBe("AR-1");
    expect(p).toHaveLength(2);
    expect(["10", "12"]).toContain(p[0]!.fonte.subcategoria);
    expect(r.recomendacao!.sub.incluido).toBe(false);
    expect(r.pagNag).not.toBeNull();
    expect(r.escopo.status).toBe("suportado");
  });
  it("2: igreja média com banda -> sub, mesa digital, revisão profissional", () => {
    const r = caso("02");
    expect(["AR-1", "AR-2"]).toContain(r.recomendacao!.arquitetura);
    expect(r.recomendacao!.sub.regra).toBe("recomendado");
    expect(r.palco!.mesa.tipo).toBe("digital");
    expect(r.profissional.length).toBeGreaterThan(1);
  });
  it("3: restaurante, música ambiente -> AR-1 em parede, sem sub, aviso de sistema distribuído", () => {
    const r = caso("03");
    expect(r.recomendacao!.arquitetura).toBe("AR-1");
    expect(r.recomendacao!.configuracao.caixas.every((c) => c.montagem === "parede")).toBe(true);
    expect(r.recomendacao!.sub.incluido).toBe(false);
    expect(r.avisos.join(" ")).toMatch(/distribuído/);
  });
  it("4: bar com banda e DJ -> sub e aviso de segurança auditiva", () => {
    const r = caso("04");
    expect(r.recomendacao!.sub.incluido).toBe(true);
    expect(r.alvo.avisoSegurancaAuditiva).toBe(true);
  });
  it("5: auditório -> AR-2 preferido, revisão profissional", () => {
    const r = caso("05");
    expect(r.recomendacao!.arquitetura).toBe("AR-2");
    expect(r.profissional.length).toBeGreaterThan(1);
  });
  it("6: reflexivo -> risco alto e aviso específico, sem aumentar o alvo", () => {
    const r = caso("06");
    expect(r.reverb!.classe).toBe("alto");
    expect(r.conclusoes.find((c) => c.id === "reverberacao")!.texto).toMatch(/Aumentar o volume não resolve/);
    expect(r.alvo.requerido).toBe(85);
  });
  it("7: mezanino -> atendido parcialmente, mezanino não calculado", () => {
    const r = caso("07");
    expect(r.escopo.status).toBe("parcial");
    expect(r.escopo.naoCalculado.join(" ")).toMatch(/mezanino/);
    expect(r.recomendacao!.statusValidacao.geometria).toBe("fora_do_modelo");
  });
  it("8: sem produto adequado -> perfil genérico", () => {
    const r = caso("08");
    expect(r.recomendacao!.semProdutoAdequado).toBe(true);
    expect(r.recomendacao!.equipamentos.every((e) => e.tipo === "generico")).toBe(true);
  });
  it("9: dados insuficientes -> capacidade pendente, produto parcial", () => {
    const r = caso("09");
    expect(r.recomendacao!.statusValidacao.capacidade).toBe("pendente");
    expect(r.recomendacao!.produto!.status).toBe("parcial");
  });
  it("10: orçamento incompatível -> mensagem com mínimo, requisitos iguais ao caso 1", () => {
    const r10 = caso("10");
    const r1 = caso("01");
    expect(r10.orcamento!.situacao).toBe("abaixo");
    expect(r10.orcamento!.mensagem).toMatch(/R\$/);
    expect(r10.recomendacao!.perfilGenerico.requisitos).toEqual(r1.recomendacao!.perfilGenerico.requisitos);
    expect(r10.recomendacao!.equipamentos).toEqual(r1.recomendacao!.equipamentos);
  });
});
