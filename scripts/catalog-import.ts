import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { csvParaObjetos, linhaParaProduto, anexarConfiguracoes, linhaParaFaixa } from "../catalog/csv";
import { Product, FaixaInvestimento } from "../catalog/schema";
import { dirDados, modoAtual } from "./lib/catalog-io";

/**
 * Importa planilhas no formato do template para o JSON do catálogo.
 * Uso: npm run catalog:import -- produtos.csv [configuracoes-array.csv] [--faixas faixas.csv]
 * Produtos com o mesmo id são substituídos. Os demais são mantidos.
 */
const args = process.argv.slice(2);
const iFaixas = args.indexOf("--faixas");
const faixasCsv = iFaixas >= 0 ? args[iFaixas + 1] : undefined;
const posicionais = args.filter((_, i) => i !== iFaixas && i !== iFaixas + 1);
const [produtosCsv, configCsv] = posicionais;
const modo = modoAtual();
const dir = dirDados(modo);
let erros = 0;

if (produtosCsv) {
  const linhas = csvParaObjetos(readFileSync(produtosCsv, "utf8"));
  const brutos = linhas.map(linhaParaProduto);
  if (configCsv) {
    for (const e of anexarConfiguracoes(brutos, csvParaObjetos(readFileSync(configCsv, "utf8")))) {
      console.error(`ERRO: ${e}`);
      erros++;
    }
  }
  const caminho = join(dir, "produtos.json");
  const existentes = existsSync(caminho) ? (JSON.parse(readFileSync(caminho, "utf8")) as { id: string }[]) : [];
  const novos: unknown[] = [];
  brutos.forEach((b, i) => {
    const r = Product.safeParse(b);
    if (!r.success) {
      erros++;
      for (const is of r.error.issues) console.error(`ERRO linha ${i + 2} (${String(b.id)}): ${is.path.join(".")}: ${is.message}`);
    } else novos.push(r.data);
  });
  if (erros === 0) {
    const ids = new Set(novos.map((n) => (n as { id: string }).id));
    const final = [...existentes.filter((e) => !ids.has(e.id)), ...novos].sort((a, b) => ((a as { id: string }).id < (b as { id: string }).id ? -1 : 1));
    writeFileSync(caminho, JSON.stringify(final, null, 2) + "\n");
    console.log(`${novos.length} produto(s) importado(s) em ${caminho}.`);
  }
}

if (faixasCsv) {
  const linhas = csvParaObjetos(readFileSync(faixasCsv, "utf8")).map(linhaParaFaixa);
  const ok: unknown[] = [];
  linhas.forEach((l, i) => {
    const r = FaixaInvestimento.safeParse(l);
    if (!r.success) {
      erros++;
      for (const is of r.error.issues) console.error(`ERRO faixa linha ${i + 2}: ${is.path.join(".")}: ${is.message}`);
    } else ok.push(r.data);
  });
  if (erros === 0) {
    writeFileSync(join(dir, "faixas.json"), JSON.stringify(ok, null, 2) + "\n");
    console.log(`${ok.length} faixa(s) de investimento importada(s).`);
  }
}

if (!produtosCsv && !faixasCsv) {
  console.error("Uso: npm run catalog:import -- produtos.csv [configuracoes-array.csv] [--faixas faixas.csv]");
  process.exit(2);
}
if (erros > 0) {
  console.error(`Importação cancelada: ${erros} erro(s). Nada foi gravado.`);
  process.exit(1);
}
console.log('Agora rode "npm run catalog:validate".');
