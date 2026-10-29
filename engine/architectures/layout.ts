import type { Montagem } from "../../catalog/schema";
import { splContinuoUtil, splNecessario } from "../acoustics/level";
import type { Trilha1 } from "../input/schema";
import type { Params } from "../params";
import { dist3, miraPara, type Mira, type Vec3 } from "../geometry/vec";
import type { Caixa, ContextoArquitetura, FonteCaixa, ModeloNivel, Papel } from "./types";

/** Modelo de nível de uma fonte pontual de produto, conforme a montagem (SPEC C5). */
export function nivelPontual(fonte: FonteCaixa, montagem: Montagem, params: Params): ModeloNivel {
  if (fonte.tipo === "generico") return { tipo: "requisito" };
  const u = splContinuoUtil(fonte.spl, montagem, params.picoParaContinuo.valor);
  if (u.status === "pendente") return { tipo: "pendente", motivo: u.motivo };
  return { tipo: "pontual", spl1m: u.valor, estimado: u.estimado, ...(u.aviso ? { aviso: u.aviso } : {}) };
}

export function comNivel(fonte: FonteCaixa, montagem: Montagem, params: Params): FonteCaixa {
  return fonte.tipo === "produto" ? { ...fonte, nivel: nivelPontual(fonte, montagem, params) } : fonte;
}

type Forma = Trilha1["instalacao"]["forma"];

/**
 * Escolhe a montagem (SPEC B2 item 11). Com preferência explícita, só ela vale.
 * Sem preferência: móvel -> pedestal, chão; fixa -> parede, pedestal, suspensa, chão.
 */
export function resolverMontagem(forma: Forma, mobilidade: "fixa" | "movel", permitidas: Montagem[] | null): Montagem | null {
  if (forma !== "sem_preferencia") return !permitidas || permitidas.includes(forma) ? forma : null;
  const ordem: Montagem[] = mobilidade === "movel" ? ["pedestal", "chao"] : ["parede", "pedestal", "suspensa", "chao"];
  return ordem.find((m) => !permitidas || permitidas.includes(m)) ?? null;
}

/** Altura do centro acústico por montagem (SPEC C4 AR-1). Sempre entre o chão e o pé-direito. */
export function alturaCentro(montagem: Montagem, meiaAltura: number, peDireito: number, params: Params): number {
  const teto = peDireito - params.folgaTeto.valor - meiaAltura;
  let z: number;
  if (montagem === "pedestal") z = params.alturaBasePedestal.valor + meiaAltura;
  else if (montagem === "chao") z = meiaAltura;
  else z = params.alturaMaxParede.valor;
  return Math.max(meiaAltura, Math.min(z, teto));
}

export function afastamentoLateral(montagem: Montagem, params: Params): number {
  return montagem === "parede" ? params.afastamentoParedeLateral.valor.parede : params.afastamentoParedeLateral.valor.outras;
}

/** y das caixas principais: recuo atrás da borda do palco. */
export function yPrincipal(ctx: ContextoArquitetura): number {
  return Math.max(0.2, ctx.caso.profundidadePalco.valor - ctx.params.recuoPalco.valor);
}

/**
 * Direção da caixa (SPEC C4 AR-1): horizontal mirando o centro da última fileira;
 * inclinação mirando 2/3 da profundidade da área (a partir de yInicio).
 */
export function miraPadrao(s: Vec3, ctx: ContextoArquitetura, yInicio: number): Mira {
  const { largura, profundidade } = ctx.caso.sala.valor;
  const zL = ctx.caso.areaPublico.alturaOuvinte;
  const alvoH = miraPara(s, { x: largura / 2, y: profundidade, z: zL });
  const yT = yInicio + (2 / 3) * (profundidade - yInicio);
  const cos = Math.cos((alvoH.yaw * Math.PI) / 180);
  const h = Math.max(0.1, (yT - s.y) / Math.max(0.05, cos));
  const pitch = (Math.atan2(zL - s.z, h) * 180) / Math.PI;
  return { yaw: alvoH.yaw, pitch };
}

export function fonteGenerica(ref: string, nome: string, cobertura: { H: number; V: number }, meiaAltura: number, subcategoria = ""): FonteCaixa {
  return { tipo: "generico", ref, nome, cobertura, nivel: { tipo: "requisito" }, meiaAltura, montagensPermitidas: null, subcategoria };
}

/** Numera as caixas na ordem: principais, front-fill, reforço, subs. */
export function numerar(caixas: Omit<Caixa, "numero">[]): Caixa[] {
  const ordem: Papel[] = ["principal", "front_fill", "reforco", "sub"];
  const ord = [...caixas].sort((a, b) => ordem.indexOf(a.papel) - ordem.indexOf(b.papel) || a.id.localeCompare(b.id));
  return ord.map((c, i) => ({ ...c, numero: i + 1 }));
}

/**
 * Front-fills na boca do palco, apoiados no chão, mirando as primeiras fileiras.
 * Quantidade: 1 a cada `larguraPorFrontFill` metros.
 */
export function criarFrontFills(ctx: ContextoArquitetura): Omit<Caixa, "numero">[] {
  const { largura } = ctx.caso.sala.valor;
  const p = ctx.params;
  const n = Math.max(1, Math.ceil(largura / p.larguraPorFrontFill.valor));
  const fonte = fonteGenerica("GEN-ATIVA-10", "Front-fill compacto (perfil genérico)", p.coberturaReferenciaFrontFill.valor, p.meiaAlturaCaixaPadrao.valor, "10");
  const y = Math.max(0.2, ctx.caso.profundidadePalco.valor - 0.2);
  const zL = ctx.caso.areaPublico.alturaOuvinte;
  const y0 = ctx.caso.areaPublico.retangulo.y0;
  const out: Omit<Caixa, "numero">[] = [];
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) * largura) / n;
    const pos = { x, y, z: fonte.meiaAltura };
    out.push({
      id: `FF-${i + 1}`,
      papel: "front_fill",
      lado: "C",
      posicao: pos,
      mira: miraPara(pos, { x, y: y0 + p.alcanceFrontFill.valor / 2, z: zL }),
      montagem: "chao",
      fonte,
      movida: false,
    });
  }
  return out;
}

/** SPL contínuo a 1 m necessário para que a caixa entregue `requerido` no ponto mais distante que ela precisa cobrir. */
export function splRequeridoPara(caixa: { posicao: Vec3 }, pontos: Vec3[], requerido: number): { spl: number; distancia: number } {
  const d = pontos.reduce((m, p) => Math.max(m, dist3(caixa.posicao, p)), 0);
  return { spl: Math.ceil(splNecessario(requerido, Math.max(d, 1))), distancia: d };
}

/** Sugestão do tamanho do falante no perfil genérico (parâmetro pendente). */
export function tamanhoPorSpl(spl: number, params: Params): 10 | 12 | 15 {
  const t = params.tamanhoPorSplRequerido.valor.find((x) => spl <= x.ate) ?? params.tamanhoPorSplRequerido.valor[params.tamanhoPorSplRequerido.valor.length - 1]!;
  return t.tamanho as 10 | 12 | 15;
}

/** Aplica as posições movidas pelo usuário. A mira não muda. Altura não muda. */
export function aplicarAjustes(caixas: Caixa[], ajustes: Record<string, { x: number; y: number }>, largura: number, profundidade: number): Caixa[] {
  return caixas.map((c) => {
    const a = ajustes[c.id];
    if (!a) return c;
    const x = Math.min(Math.max(0, a.x), largura);
    const y = Math.min(Math.max(0, a.y), profundidade);
    return { ...c, posicao: { ...c.posicao, x, y }, movida: true };
  });
}
