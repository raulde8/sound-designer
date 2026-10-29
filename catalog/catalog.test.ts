import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCsv, csvParaObjetos, linhaParaProduto, anexarConfiguracoes, colunasTemplate, escaparCsv } from "./csv";
import { validarCatalogo } from "./validate";
import { Product } from "./schema";
import { lerDadosBrutos, montarSnapshot, DIR_CATALOGO } from "../scripts/lib/catalog-io";
import { jsonCanonico } from "../scripts/lib/canonical";

describe("CSV", () => {
  it("lida com aspas, vírgulas e quebra de linha dentro do campo", () => {
    expect(parseCsv('a,b\n"x, y","linha1\nlinha2"\n"aspas ""duplas""",z\n')).toEqual([
      ["a", "b"],
      ["x, y", "linha1\nlinha2"],
      ['aspas "duplas"', "z"],
    ]);
  });
  it("escapa e volta igual", () => {
    const v = 'a,"b"\nc';
    expect(parseCsv(escaparCsv(v) + "\n")).toEqual([[v]]);
  });
  it("template tem uma coluna por campo com fonte e data", () => {
    const cab = readFileSync(join(DIR_CATALOGO, "template.csv"), "utf8").split("\n")[0]!.split(",");
    expect(cab).toEqual(colunasTemplate());
    for (const c of ["coberturaH", "splMax", "montagensPermitidas", "peso", "homologacaoAnatel"]) {
      expect(cab).toContain(`${c}_fonte`);
      expect(cab).toContain(`${c}_data`);
      expect(cab).toContain(`${c}_condicao`);
    }
  });
});

const CSV_PRODUTO = [
  "id,marca,modelo,categoria,subcategoria,porte,status,coberturaH,coberturaH_fonte,coberturaH_data,coberturaV,coberturaV_fonte,coberturaV_data,splMax,splMax_condicao,splMax_fonte,splMax_data,montagensPermitidas,montagensPermitidas_fonte,montagensPermitidas_data,peso,peso_fonte,peso_data",
  "teste-cx12,Teste,CX12,caixa_ativa,12,intermediaria,publicado,90,ficha.pdf,2026-10-01,60,ficha.pdf,2026-10-01,126,continuo_campo_livre,ficha.pdf,2026-10-01,pedestal|parede,ficha.pdf,2026-10-01,17,ficha.pdf,2026-10-01",
].join("\n");

describe("importação CSV -> JSON", () => {
  it("converte a linha do template em produto válido", () => {
    const [linha] = csvParaObjetos(CSV_PRODUTO);
    const p = Product.parse(linhaParaProduto(linha!));
    expect(p.especificacoes.coberturaH?.valor).toBe(90);
    expect(p.especificacoes.splMax?.condicaoMedicao).toBe("continuo_campo_livre");
    expect(p.montagensPermitidas?.valor).toEqual(["pedestal", "parede"]);
    expect(p.peso?.valor).toBe(17);
  });
  it("anexa a tabela de configurações de array", () => {
    const brutos = [linhaParaProduto({ id: "teste-line", marca: "T", modelo: "L", categoria: "vertical_array", status: "rascunho" })];
    const erros = anexarConfiguracoes(brutos, csvParaObjetos("produto_id,modulos,H,V,spl_por_distancia,fonte,data\nteste-line,4,100,22,5:114|10:110,f.pdf,2026-10-01\n"));
    expect(erros).toEqual([]);
    const p = Product.parse(brutos[0]);
    expect(p.especificacoes.coberturaPorConfiguracao?.valor[0]?.spl_por_distancia).toEqual([
      { distancia_m: 5, spl_db: 114 },
      { distancia_m: 10, spl_db: 110 },
    ]);
  });
});

function catalogoCom(produtos: unknown[]) {
  return { produtos, faixas: [], ofertas: [] };
}

describe("catalog:validate", () => {
  const base = () => Product.parse(linhaParaProduto(csvParaObjetos(CSV_PRODUTO)[0]!));
  it("produto publicado completo passa", () => {
    expect(validarCatalogo(catalogoCom([base()]), "producao").erros).toEqual([]);
  });
  it("falha se produto publicado tem campo crítico sem fonte", () => {
    const p = base();
    p.especificacoes.coberturaH!.fonte = "";
    expect(validarCatalogo(catalogoCom([p]), "producao").erros.join()).toMatch(/sem fonte ou sem data \(coberturaH\)/);
  });
  it("falha se produto publicado tem campo crítico sem data", () => {
    const p = base();
    p.especificacoes.splMax!.dataVerificacao = "";
    expect(validarCatalogo(catalogoCom([p]), "producao").erros.join()).toMatch(/splMax/);
  });
  it("rascunho sem fonte não falha", () => {
    const p = { ...base(), status: "rascunho" as const };
    p.especificacoes.coberturaH!.fonte = "";
    expect(validarCatalogo(catalogoCom([p]), "producao").erros).toEqual([]);
  });
  it("falha se houver item demo no modo produção", () => {
    const demo = lerDadosBrutos("demo") as { produtos: unknown[] };
    const r = validarCatalogo(catalogoCom([demo.produtos[0]]), "producao");
    expect(r.erros.join()).toMatch(/demonstração no catálogo de produção/);
  });
  it("catálogo demo é válido no modo demo", () => {
    expect(validarCatalogo(lerDadosBrutos("demo"), "demo").erros).toEqual([]);
  });
  it("catálogo de produção do repositório é válido e sem itens demo", () => {
    expect(validarCatalogo(lerDadosBrutos("producao"), "producao").erros).toEqual([]);
  });
  it("todos os itens demo têm nome com 'Demo' e fonte fictícia", () => {
    const demo = montarSnapshot("demo", lerDadosBrutos("demo"));
    for (const p of demo.produtos) {
      expect(p.modelo.startsWith("Demo")).toBe(true);
      expect(p.demo).toBe(true);
    }
  });
});

describe("snapshot e hash", () => {
  it("hash não depende da ordem das chaves", () => {
    expect(jsonCanonico({ a: 1, b: { c: 2, d: 3 } })).toBe(jsonCanonico({ b: { d: 3, c: 2 }, a: 1 }));
  });
  it("mesmo conteúdo = mesmo hash; conteúdo diferente = hash diferente", () => {
    const a = montarSnapshot("demo", lerDadosBrutos("demo"));
    const b = montarSnapshot("demo", lerDadosBrutos("demo"));
    expect(a.version).toBe(b.version);
    const bruto = lerDadosBrutos("demo") as { produtos: { modelo: string }[] };
    bruto.produtos[0]!.modelo = "Demo Alterado";
    expect(montarSnapshot("demo", bruto).version).not.toBe(a.version);
  });
});
