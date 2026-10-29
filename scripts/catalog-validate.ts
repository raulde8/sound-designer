import { validarCatalogo } from "../catalog/validate";
import { lerDadosBrutos, modoAtual } from "./lib/catalog-io";

const modo = modoAtual();
const rel = validarCatalogo(lerDadosBrutos(modo), modo);
console.log(`Validação do catálogo (modo: ${modo})`);
for (const a of rel.avisos) console.log(`  AVISO: ${a}`);
for (const e of rel.erros) console.error(`  ERRO: ${e}`);
if (rel.erros.length > 0) {
  console.error(`Falhou: ${rel.erros.length} erro(s).`);
  process.exit(1);
}
console.log(`OK: 0 erros, ${rel.avisos.length} aviso(s).`);
