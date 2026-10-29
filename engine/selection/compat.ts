import { FICHA_MINIMA, campoPresente } from "../../catalog/ficha";
import type { CatalogSnapshot, Categoria, Product } from "../../catalog/schema";
import { avaliar, type Avaliacao } from "../architectures/evaluate";
import type { ArchitectureGenerator, Configuracao, ContextoArquitetura } from "../architectures/types";
import { fonteDeProduto } from "./fonte";
import { faixaDoProduto, type FaixaUsada } from "./investimento";
import { nomeProduto } from "./nome";

export { nomeProduto };

export type StatusCompat = "compativel" | "parcial" | "incompativel" | "nao_avaliavel";

export const ORDEM_STATUS: Record<StatusCompat, number> = { compativel: 0, parcial: 1, incompativel: 2, nao_avaliavel: 3 };

export interface Candidato {
  produtoId: string;
  nome: string;
  marca: string;
  categoria: Categoria;
  subcategoria: string;
  porte?: string;
  status: StatusCompat;
  motivos: string[];
  /** Campos da ficha mínima que faltam. */
  faltando: string[];
  configuracao?: Configuracao;
  avaliacao?: Avaliacao;
  /** Caixas da solução (sem subwoofers). */
  quantidadeCaixas: number;
  /** Nível mínimo calculado - requerido (dB), quando a capacidade foi avaliada. */
  margemNivel?: number;
  faixa?: FaixaUsada;
  /** Avisos do layout recalculado (pico estimado, meio espaço, suspensão...). */
  avisos: string[];
}

/** Categorias de caixa usadas por cada arquitetura. */
export const CATEGORIA_POR_ARQUITETURA: Record<string, Categoria> = { "AR-1": "caixa_ativa", "AR-2": "vertical_array" };

export function produtosElegiveis(cat: CatalogSnapshot, categoria: Categoria): Product[] {
  // Produção: só "publicado". Demo: os itens demo são publicados.
  return cat.produtos.filter((p) => p.categoria === categoria && p.status === "publicado").sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Avalia um produto de caixa contra o caso (SPEC C7 e C8):
 * 1. ficha mínima de geometria -> senão "nao_avaliavel";
 * 2. recálculo do layout com os dados reais (direção, altura, quantidade);
 * 3. montagem e peso -> "incompativel" quando um dado presente viola o requisito;
 * 4. nível -> "insuficiente" vira "incompativel"; sem dado vira "parcial".
 * Ausência de dado nunca reprova nem aprova.
 */
export function avaliarCaixa(ctx: ContextoArquitetura, gerador: ArchitectureGenerator, p: Product, cat: CatalogSnapshot, dataReferencia: string, quantidadeGenerica: number): Candidato {
  const base: Candidato = {
    produtoId: p.id,
    nome: nomeProduto(p),
    marca: p.marca,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    ...(p.porte ? { porte: p.porte } : {}),
    status: "nao_avaliavel",
    motivos: [],
    faltando: [],
    quantidadeCaixas: 0,
    avisos: [],
  };
  const faixa = faixaDoProduto(cat, p.categoria, p.subcategoria, p.porte, dataReferencia);
  if (faixa) base.faixa = faixa;

  const f = fonteDeProduto(p, ctx.params);
  if (!f.ok) {
    return { ...base, status: "nao_avaliavel", faltando: f.faltando, motivos: [`Falta dado de geometria na ficha: ${f.faltando.join(", ")}.`] };
  }
  const g = gerador.gerar(ctx, f.fonte);
  if (!g.ok) return { ...base, status: g.violacao ? "incompativel" : "nao_avaliavel", motivos: [g.motivo] };

  const cfg = g.configuracao;
  const motivos: string[] = [];
  const faltando: string[] = [];
  let status: StatusCompat = "compativel";

  // Peso x montagem
  const principal = cfg.caixas.find((c) => c.papel === "principal")!;
  const pesoMax = ctx.params.pesoMaxPorMontagem.valor[principal.montagem];
  if (p.peso && campoPresente(p, "peso")) {
    if (p.peso.valor > pesoMax) {
      return { ...base, status: "incompativel", configuracao: cfg, motivos: [`Peso ${p.peso.valor} kg acima do limite de ${pesoMax} kg para ${principal.montagem}.`] };
    }
  }

  // Demais campos da ficha mínima
  const ficha = FICHA_MINIMA[p.categoria];
  for (const c of [...ficha.nivel, ...ficha.outros]) if (!campoPresente(p, c)) faltando.push(c);

  const av = avaliar(cfg, ctx.malha, ctx.params.bordaCobertura.valor, ctx.alvo.requerido);
  const qtd = cfg.caixas.filter((c) => c.papel !== "sub").length;
  if (av.capacidade === "insuficiente") {
    return { ...base, status: "incompativel", configuracao: cfg, avaliacao: av, quantidadeCaixas: qtd, motivos: [av.motivoCapacidade], faltando, avisos: cfg.avisos };
  }
  if (av.capacidade === "pendente") {
    status = "parcial";
    motivos.push(`Capacidade sonora pendente: ${av.motivoCapacidade}`);
  }
  const outrosFaltando = faltando.filter((c) => !ficha.nivel.includes(c));
  if (outrosFaltando.length > 0) {
    status = "parcial";
    motivos.push(`Falta na ficha: ${outrosFaltando.join(", ")}.`);
  }
  if (qtd > quantidadeGenerica) motivos.push(`Com os dados reais deste produto, o layout precisa de ${qtd} caixas (o perfil genérico usou ${quantidadeGenerica}).`);
  const avisos = [...cfg.avisos];
  if (av.nivel && av.nivel.uniformidade > ctx.params.uniformidadeMax.valor)
    avisos.push(`Variação de nível na área coberta de ${av.nivel.uniformidade.toFixed(1)} dB (critério: até ${ctx.params.uniformidadeMax.valor} dB). O modelo não atenua fora do eixo, então a variação real tende a ser diferente.`);
  const margem = av.capacidade === "validada" && av.nivel ? av.nivel.min - ctx.alvo.requerido : undefined;
  return {
    ...base,
    status,
    motivos,
    faltando,
    configuracao: cfg,
    avaliacao: av,
    quantidadeCaixas: qtd,
    ...(margem !== undefined ? { margemNivel: margem } : {}),
    avisos,
  };
}

/**
 * Ranking (SPEC C8 passo 4): (a) status; (b) menos caixas; (c) maior margem de nível,
 * limitada a +margemMax dB; (d) menor faixa de investimento. Sem bônus por marca.
 * Desempate final pelo id, para o resultado ser determinístico.
 */
export function ordenarCandidatos(c: Candidato[], margemMax: number): Candidato[] {
  const m = (x: Candidato) => (x.margemNivel === undefined ? -Infinity : Math.min(x.margemNivel, margemMax));
  return [...c].sort(
    (a, b) =>
      ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] ||
      a.quantidadeCaixas - b.quantidadeCaixas ||
      m(b) - m(a) ||
      (a.faixa?.minimo ?? Infinity) - (b.faixa?.minimo ?? Infinity) ||
      a.produtoId.localeCompare(b.produtoId),
  );
}

export function utilizavel(c: Candidato): boolean {
  return c.status === "compativel" || c.status === "parcial";
}
