import { CatalogData, type CatalogMode, type Product } from "./schema";
import { FICHA_MINIMA, campoComFonte, campoPresente, camposCriticos, lerCampo } from "./ficha";

export interface RelatorioValidacao {
  erros: string[];
  avisos: string[];
}

function pareceDemo(p: { id: string; marca?: string; demo?: boolean }): boolean {
  return p.demo === true || p.id.startsWith("demo-") || (p.marca ?? "").trim().toLowerCase() === "demo";
}

/**
 * Valida o catálogo (SPEC C7). Erros quebram o build; avisos são informativos.
 * - Produto `publicado` com campo crítico sem fonte ou sem data: erro.
 * - Item demo no modo produção: erro.
 */
export function validarCatalogo(bruto: unknown, modo: CatalogMode): RelatorioValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const r = CatalogData.safeParse(bruto);
  if (!r.success) {
    for (const i of r.error.issues) erros.push(`Schema: ${i.path.join(".")}: ${i.message}`);
    return { erros, avisos };
  }
  const { produtos, faixas, ofertas } = r.data;
  const ids = new Set<string>();
  for (const p of produtos) {
    if (ids.has(p.id)) erros.push(`${p.id}: id duplicado.`);
    ids.add(p.id);
  }

  if (modo === "producao") {
    for (const p of produtos) if (pareceDemo(p)) erros.push(`${p.id}: item de demonstração no catálogo de produção.`);
    for (const f of faixas) if (f.demo || f.id.startsWith("demo-")) erros.push(`${f.id}: faixa de demonstração no catálogo de produção.`);
    if (produtos.length === 0) avisos.push("Catálogo de produção vazio. O site vai mostrar só perfis genéricos.");
  } else {
    for (const p of produtos) if (!pareceDemo(p)) erros.push(`${p.id}: o catálogo demo só aceita itens marcados como demo.`);
  }

  for (const p of produtos) validarProduto(p, ids, erros, avisos);

  for (const f of faixas) {
    if (f.minimo > f.maximo) erros.push(`${f.id}: mínimo maior que máximo.`);
  }
  for (const o of ofertas) if (!ids.has(o.produtoId)) erros.push(`Oferta para produto inexistente: ${o.produtoId}.`);
  return { erros, avisos };
}

function validarProduto(p: Product, ids: Set<string>, erros: string[], avisos: string[]): void {
  const publicado = p.status === "publicado";
  for (const campo of camposCriticos(p.categoria)) {
    if (!campoPresente(p, campo)) {
      if (publicado) avisos.push(`${p.id}: campo da ficha mínima ausente (${campo}). O produto fica "não avaliável" ou "parcial".`);
      continue;
    }
    if (publicado && !campoComFonte(p, campo)) erros.push(`${p.id}: produto publicado com campo crítico sem fonte ou sem data (${campo}).`);
  }
  if (publicado && (!p.verificadoEm || !p.verificadoPor)) avisos.push(`${p.id}: verificadoEm/verificadoPor não preenchidos.`);

  const spl = p.especificacoes.splMax;
  if (spl && !spl.condicaoMedicao) avisos.push(`${p.id}: splMax sem condição de medição. A capacidade sonora fica "pendente".`);

  const tab = p.especificacoes.coberturaPorConfiguracao?.valor ?? [];
  for (const c of tab) {
    const d = (c.spl_por_distancia ?? []).map((x) => x.distancia_m);
    if (d.some((x, i) => i > 0 && x <= d[i - 1]!)) erros.push(`${p.id}: spl_por_distancia da configuração de ${c.modulos} módulo(s) precisa estar em ordem crescente de distância.`);
  }

  const refs = [
    ...p.acessoriosCompativeis,
    ...(p.especificacoes.acessoriosObrigatorios?.valor ?? []),
    ...(p.especificacoes.pareamento?.valor.topIds ?? []),
  ];
  for (const id of refs) if (!ids.has(id)) avisos.push(`${p.id}: referência a produto inexistente (${id}).`);

  if (FICHA_MINIMA[p.categoria].geometria.includes("montagensPermitidas")) {
    const m = lerCampo(p, "montagensPermitidas");
    if (m && Array.isArray(m.valor) && m.valor.length === 0) avisos.push(`${p.id}: nenhuma montagem permitida.`);
  }
}
