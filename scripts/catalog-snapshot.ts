import { writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validarCatalogo } from "../catalog/validate";
import { DIR_CATALOGO, lerDadosBrutos, modoAtual, montarSnapshot } from "./lib/catalog-io";

/**
 * Gera os snapshots dos dois modos e o registro catalog/snapshots/registry.ts.
 * Snapshots antigos ficam na pasta para que links antigos reproduzam o resultado (SPEC C2).
 * O registro inclui SÓ os snapshots do modo atual (CATALOG_MODE): o build de produção
 * nunca empacota dados de demonstração.
 */
const dir = join(DIR_CATALOGO, "snapshots");
const modoBuild = modoAtual();
let atual = "";
for (const modo of [modoBuild]) {
  const bruto = lerDadosBrutos(modo);
  const rel = validarCatalogo(bruto, modo);
  if (rel.erros.length > 0) {
    console.error(`Catálogo ${modo} inválido. Rode "npm run catalog:validate".`);
    for (const e of rel.erros) console.error(`  ERRO: ${e}`);
    process.exit(1);
  }
  const snap = montarSnapshot(modo, bruto);
  const arquivo = join(dir, `${modo}-${snap.version}.json`);
  if (!existsSync(arquivo)) writeFileSync(arquivo, JSON.stringify(snap) + "\n");
  atual = snap.version;
  console.log(`${modo}: ${snap.version} (${snap.produtos.length} produtos)`);
}

const arquivos = readdirSync(dir)
  .filter((f) => new RegExp(`^${modoBuild}-[0-9a-f]{16}\\.json$`).test(f))
  .sort();
const linhas = arquivos.map((f, i) => `import s${i} from "./${f}";`);
const mapa = arquivos.map((f, i) => {
  const snap = JSON.parse(readFileSync(join(dir, f), "utf8")) as { version: string; modo: string };
  return `  "${snap.version}": { modo: "${snap.modo}", dados: s${i} as unknown },`;
});
const ts = `// Gerado por scripts/catalog-snapshot.ts. Não edite à mão.
${linhas.join("\n")}

export const SNAPSHOTS: Record<string, { modo: "producao" | "demo"; dados: unknown }> = {
${mapa.join("\n")}
};

export const MODO_BUILD = "${modoBuild}" as const;
export const SNAPSHOT_ATUAL = "${atual}";
`;
writeFileSync(join(dir, "registry.ts"), ts);
console.log(`Registro (${modoBuild}) com ${arquivos.length} snapshot(s).`);
