import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { executarMotor } from "../engine/run";
import { PARAMS_VERSION_ATUAL } from "../engine/params";
import { lerDadosBrutos, montarSnapshot, RAIZ } from "./lib/catalog-io";
import { CASOS } from "./casos";
import type { ResultadoOk } from "../engine/result";

/** Roda os 10 casos de referência no catálogo demo e salva a saída em docs/casos-referencia/. */
const DATA = process.env.DATA_REFERENCIA ?? "2026-10-29";
const MODO = process.env.CATALOG_MODE === "producao" ? "producao" : "demo";
const cat = montarSnapshot(MODO, lerDadosBrutos(MODO));
const dir = join(RAIZ, "docs", MODO === "demo" ? "casos-referencia" : "casos-referencia-producao");
mkdirSync(dir, { recursive: true });
const f1 = (v: number) => v.toFixed(1).replace(".", ",");
const indice: string[] = ["# Casos de referência (SPEC C10)", "", `Catálogo ${MODO} ${cat.version}, parâmetros ${PARAMS_VERSION_ATUAL}, data de referência ${DATA}. Gerado por \`npm run casos\`.`, "", "| Caso | Esperado (SPEC) | Obtido |", "|---|---|---|"];

for (const c of CASOS) {
  const r = executarMotor(c.entrada, { catalogo: cat, paramsVersion: PARAMS_VERSION_ATUAL, dataReferencia: DATA });
  writeFileSync(join(dir, `${c.id}.json`), JSON.stringify({ caso: c, resultado: r }, null, 2) + "\n");
  if (!r.ok) {
    indice.push(`| ${c.titulo} | ${c.esperado} | ERRO: ${r.erros.map((e) => e.mensagem).join("; ")} |`);
    continue;
  }
  const md = resumo(c, r);
  writeFileSync(join(dir, `${c.id}.md`), md);
  const rec = r.recomendacao;
  const obtido = rec
    ? `${rec.arquitetura}; ${rec.equipamentos.map((e) => `${e.quantidade}x ${e.nome}`).join(", ")}; geometria ${rec.statusValidacao.geometria}; capacidade ${rec.statusValidacao.capacidade}; escopo ${r.escopo.status}`
    : "sem arquitetura";
  indice.push(`| [${c.titulo}](${c.id}.md) | ${c.esperado} | ${obtido} |`);
}
writeFileSync(join(dir, "README.md"), indice.join("\n") + "\n");
console.log(`${CASOS.length} casos gravados em ${dir}`);

function resumo(c: (typeof CASOS)[number], r: ResultadoOk): string {
  const rec = r.recomendacao;
  const L: string[] = [`# ${c.titulo}`, "", `**Esperado (SPEC C10):** ${c.esperado}`, "", `Versões: motor ${r.versoes.engineVersion}, catálogo ${r.versoes.catalogVersion}, parâmetros ${r.versoes.paramsVersion}.`, ""];
  L.push(`## Escopo: ${r.escopo.status}`, ...r.escopo.itens.map((i) => `- (${i.nivel}) ${i.texto}`), "");
  L.push(`## Nível`, `Alvo ${r.alvo.alvo} dB + reserva ${r.alvo.reserva} dB = ${r.alvo.requerido} dB. Sub: ${r.alvo.sub}. Aviso de segurança auditiva: ${r.alvo.avisoSegurancaAuditiva ? "sim" : "não"}.`, "");
  if (rec) {
    L.push(`## Recomendação: ${rec.arquitetura} - ${rec.nomeSimples}`, rec.motivoEscolha, "");
    L.push(`Status: geometria ${rec.statusValidacao.geometria}; capacidade ${rec.statusValidacao.capacidade} (${rec.avaliacao.motivoCapacidade}); acústica ${rec.statusValidacao.acustica}.`, "");
    L.push("| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |", "|---|---|---|---|---|---|---|---|---|");
    for (const b of rec.configuracao.caixas) L.push(`| ${b.numero} | ${b.papel} | ${b.fonte.nome} | ${b.montagem} | ${f1(b.posicao.x)} | ${f1(b.posicao.y)} | ${f1(b.posicao.z)} | ${f1(b.mira.yaw)} | ${f1(b.mira.pitch)} |`);
    L.push("", `Cobertura: ${Math.round(rec.avaliacao.pct.coberto * 100)}% coberto, ${Math.round(rec.avaliacao.pct.borda * 100)}% borda, ${Math.round(rec.avaliacao.pct.fora * 100)}% fora.`);
    if (rec.configuracao.atrasos.length) L.push(`Atrasos de referência: ${rec.configuracao.atrasos.map((a) => `${a.caixaId} ${f1(a.ms)} ms`).join(", ")}.`);
    L.push("", "### Requisitos (perfil genérico)", ...rec.perfilGenerico.requisitos.map((q) => `- ${q.texto}`), "");
    L.push(`### Produtos do catálogo ${MODO}`, ...rec.candidatos.map((p) => `- ${p.nome}: **${p.status}** ${p.motivos.join(" ")}`), "");
    L.push(`Produto escolhido: ${rec.produto ? rec.produto.nome : "nenhum (perfil genérico)"}. Sub: ${rec.sub.regra}${rec.sub.incluido ? `, ${rec.sub.porLado} por lado (${rec.sub.escolhido?.nome ?? "perfil genérico"})` : ""}.`, "");
    if (r.alternativas.length) L.push("Alternativas: " + r.alternativas.map((a) => `${a.rotulo}: ${a.nome} (${a.arquitetura})`).join("; "), "");
  } else L.push("## Nenhuma arquitetura disponível", ...r.arquiteturas.map((a) => `- ${a.id}: ${a.motivo ?? "disponível"}`), "");
  if (r.reverb) L.push(`## Reverberação: classe ${r.reverb.classe} (${r.reverb.pontos} pontos)`, r.conclusoes.find((x) => x.id === "reverberacao")?.texto ?? "", "");
  if (r.pagNag) L.push(`## PAG/NAG`, `PAG ${f1(r.pagNag.pag)} dB, NAG ${f1(r.pagNag.nag)} dB, margem ${f1(r.pagNag.margem)} dB: risco ${r.pagNag.risco}.`, "");
  if (r.investimento?.referencia) L.push(`## Investimento (faixas demo)`, `R$ ${r.investimento.minimo} a R$ ${r.investimento.maximo} (ref. ${r.investimento.referencia}).`, "");
  if (r.orcamento) L.push(`## Orçamento`, r.orcamento.mensagem, "");
  if (r.palco) {
    const p = r.palco;
    L.push(`## Palco`, `${p.totalCanais} canais (${p.canaisComReserva} com reserva), mesa ${p.mesa.tipo} (${p.mesa.motivos.join(" ")}). Escolhida: ${p.mesa.escolhida?.nome ?? "perfil genérico"}.`);
    for (const i of [...p.microfones, ...p.di, ...p.retorno, ...p.acessorios]) L.push(`- ${i.quantidade}x ${i.descricao} (${i.nome})`);
    L.push(`RF: ${p.rf.canais} canais, nível ${p.rf.nivel}.`, "");
  }
  L.push("## Avisos", ...r.avisos.map((a) => `- ${a}`), "", "## Quando chamar um profissional", ...r.profissional.map((a) => `- ${a}`), "");
  L.push(`## Parâmetros pendentes usados (${r.parametrosPendentes.length})`, r.parametrosPendentes.map((p) => p.id).join(", "), "");
  return L.join("\n");
}
