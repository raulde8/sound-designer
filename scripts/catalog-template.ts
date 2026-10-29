import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { colunasTemplate, COLUNAS_ARRAY, COLUNAS_FAIXAS, CAMPOS_TEMPLATE, escaparCsv } from "../catalog/csv";
import { DIR_CATALOGO } from "./lib/catalog-io";

/** Gera os templates CSV a partir da definição dos campos (fonte única). */
const cols = colunasTemplate();
const exemplo: Record<string, string> = {
  id: "marca-modelo",
  marca: "Marca",
  modelo: "Modelo",
  categoria: "caixa_ativa",
  subcategoria: "12",
  porte: "intermediaria",
  status: "rascunho",
};
for (const c of CAMPOS_TEMPLATE) exemplo[`${c.campo}_unidade`] = c.unidade;
const formato: Record<string, string> = { id: "FORMATO ->" };
for (const c of CAMPOS_TEMPLATE) {
  formato[c.campo] = c.formato;
  formato[`${c.campo}_fonte`] = "URL ou arquivo da ficha";
  formato[`${c.campo}_data`] = "AAAA-MM-DD";
  formato[`${c.campo}_status`] = "medido|declarado_fabricante|referencia|estimado|desconhecido";
}
const linha = (o: Record<string, string>, c: readonly string[]) => c.map((k) => escaparCsv(o[k] ?? "")).join(",");
writeFileSync(join(DIR_CATALOGO, "template.csv"), [cols.join(","), linha(exemplo, cols)].join("\n") + "\n");
writeFileSync(join(DIR_CATALOGO, "template-formato.csv"), [cols.join(","), linha(formato, cols)].join("\n") + "\n");
writeFileSync(
  join(DIR_CATALOGO, "template-configuracoes-array.csv"),
  [COLUNAS_ARRAY.join(","), "marca-modelo-array,4,3,100,22,26,,5:114|10:110|20:106,URL da ficha,AAAA-MM-DD,declarado_fabricante"].join("\n") + "\n",
);
writeFileSync(join(DIR_CATALOGO, "template-faixas.csv"), [COLUNAS_FAIXAS.join(","), "caixa-ativa-12-intermediaria,caixa_ativa,12,intermediaria,0,0,fonte da pesquisa,AAAA-MM-DD,90"].join("\n") + "\n");
console.log(`Templates gerados (${cols.length} colunas em template.csv).`);
