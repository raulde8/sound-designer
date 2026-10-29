import type { ConfiguracaoArray, Montagem } from "../../catalog/schema";
import { dist3, round, type Vec3 } from "../geometry/vec";
import { AVISO_SUSPENSAO } from "./ar1";
import { afastamentoLateral, criarFrontFills, numerar, resolverMontagem, yPrincipal } from "./layout";
import type { ArchitectureGenerator, Caixa, Configuracao, ContextoArquitetura, FonteCaixa, Requisito, ResultadoGeracao } from "./types";

const DEG = 180 / Math.PI;

interface Span {
  vPrimeira: number;
  vUltima: number;
  span: number;
  dUltima: number;
}

/** Ângulos verticais da caixa até a primeira fileira considerada e até a última fileira. */
function spanVertical(s: Vec3, ctx: ContextoArquitetura, yDe: number): Span {
  const { largura, profundidade } = ctx.caso.sala.valor;
  const zL = ctx.caso.areaPublico.alturaOuvinte;
  const vPrimeira = Math.atan2(zL - s.z, Math.max(0.05, yDe - s.y)) * DEG;
  const hUlt = Math.hypot(largura / 2 - s.x, profundidade - s.y);
  const vUltima = Math.atan2(zL - s.z, hUlt) * DEG;
  return { vPrimeira, vUltima, span: Math.abs(vUltima - vPrimeira), dUltima: dist3(s, { x: largura / 2, y: profundidade, z: zL }) };
}

function alturaArray(fonte: FonteCaixa, cfg: ConfiguracaoArray | undefined, montagem: Montagem, ctx: ContextoArquitetura): number {
  const p = ctx.params;
  const teto = ctx.caso.sala.valor.peDireito - p.folgaTeto.valor;
  const coluna = montagem === "chao";
  const padrao = coluna ? p.alturaCentroColunaPadrao.valor : p.alturaCentroArrayPadrao.valor;
  // Torre/coluna com altura publicada: centro dos alto-falantes numa fração da altura (parâmetro pendente).
  const daAltura = coluna && fonte.alturaTotal ? fonte.alturaTotal * p.fracaoAlturaCentroColuna.valor : undefined;
  return Math.max(0.5, Math.min(cfg?.alturaCentro_m ?? daAltura ?? padrao, teto));
}

/** Escolhe a montagem do array. Coluna portátil: base no chão. */
function montagemArray(ctx: ContextoArquitetura, fonte: FonteCaixa, coluna: boolean): Montagem | null {
  if (coluna && ctx.caso.instalacao.forma === "sem_preferencia") return !fonte.montagensPermitidas || fonte.montagensPermitidas.includes("chao") ? "chao" : null;
  if (!coluna && ctx.caso.instalacao.forma === "sem_preferencia") {
    const ordem: Montagem[] = ctx.caso.mobilidade === "fixa" ? ["pedestal", "chao"] : ["pedestal", "suspensa", "chao"];
    return ordem.find((m) => !fonte.montagensPermitidas || fonte.montagensPermitidas.includes(m)) ?? null;
  }
  return resolverMontagem(ctx.caso.instalacao.forma, ctx.caso.mobilidade, fonte.montagensPermitidas);
}

export const AR2: ArchitectureGenerator = {
  id: "AR-2",
  nome: "Vertical array na frente (coluna ou line array compacto)",
  disponibilidade(ctx) {
    if (ctx.caso.instalacao.formato === "convencional") return { disponivel: false, motivo: "Você preferiu caixas convencionais." };
    if (ctx.caso.instalacao.forma === "suspensa" && ctx.caso.mobilidade === "fixa")
      return { disponivel: false, motivo: `${AVISO_SUSPENSAO} Por isso o vertical array suspenso não é dimensionado.` };
    return { disponivel: true };
  },
  gerar(ctx, fonte): ResultadoGeracao {
    const { caso, params, alvo } = ctx;
    const { largura } = caso.sala.valor;
    const y0 = caso.areaPublico.retangulo.y0;
    const tipoColuna = fonte.subcategoria === "coluna";
    const montagem = montagemArray(ctx, fonte, tipoColuna);
    if (!montagem) return { ok: false, violacao: true, motivo: "O fabricante não permite a montagem escolhida." };
    const avisos: string[] = [];
    if (montagem === "suspensa") avisos.push(AVISO_SUSPENSAO);
    const y = yPrincipal(ctx);
    const a = Math.min(afastamentoLateral(montagem, params), largura / 4);
    const xs = { L: a, R: largura - a };

    const tabela = fonte.tipo === "produto" ? (fonte.tabelaArray ?? []) : [];
    let escolhida: ConfiguracaoArray | undefined;
    let deY = y0;
    let frontFill = false;
    let span: Span;
    let z: number;

    const semTabela = fonte.tipo === "generico" || tabela.length === 0;
    if (semTabela) {
      // Perfil genérico, ou produto sem tabela publicada: geometria de referência, sem nível.
      z = alturaArray(fonte, undefined, montagem, ctx);
      span = spanVertical({ x: xs.L, y, z }, ctx, y0);
      // Se a cobertura vertical exigida passa da referência do perfil genérico, o array cobre a partir de alcanceFrontFill e entra front-fill.
      if (span.span > params.vMaxArrayGenerico.valor) {
        deY = y0 + params.alcanceFrontFill.valor;
        frontFill = true;
        span = spanVertical({ x: xs.L, y, z }, ctx, deY);
      }
    } else {
      // Menor configuração da tabela cuja cobertura vertical cobre da primeira à última fileira (SPEC C4 AR-2).
      const ordenada = [...tabela].sort((p, q) => p.modulos - q.modulos);
      const tenta = (yDe: number) =>
        ordenada.find((c) => {
          const zc = alturaArray(fonte, c, montagem, ctx);
          const sp = spanVertical({ x: xs.L, y, z: zc }, ctx, yDe);
          return c.V >= sp.span - 1e-9 && (c.alcanceNominal_m === undefined || c.alcanceNominal_m >= sp.dUltima - 1e-9);
        });
      escolhida = tenta(y0);
      if (!escolhida) {
        deY = y0 + params.alcanceFrontFill.valor;
        escolhida = tenta(deY);
        frontFill = escolhida !== undefined;
      }
      if (!escolhida)
        return { ok: false, violacao: true, motivo: "Nenhuma configuração publicada pelo fabricante cobre da primeira à última fileira com o alcance necessário." };
      z = alturaArray(fonte, escolhida, montagem, ctx);
      span = spanVertical({ x: xs.L, y, z }, ctx, deY);
    }

    const pitch = (span.vPrimeira + span.vUltima) / 2;
    const H = escolhida?.H ?? fonte.cobertura.H;
    const V = escolhida?.V ?? Math.ceil(span.span / 5) * 5;
    const nivel: FonteCaixa["nivel"] =
      fonte.tipo === "generico"
        ? { tipo: "requisito" }
        : semTabela
          ? { tipo: "pendente", motivo: "O fabricante não publica o volume por distância deste array." }
        : escolhida?.spl_por_distancia && escolhida.spl_por_distancia.length > 0
          ? { tipo: "tabela", pontos: escolhida.spl_por_distancia }
          : { tipo: "pendente", motivo: "O fabricante não publica SPL por distância para esta configuração." };
    const fonteCfg: FonteCaixa = { ...fonte, cobertura: { H, V }, nivel, ...(escolhida ? { configuracaoArray: escolhida } : {}) };

    const principais: Omit<Caixa, "numero">[] = (["L", "R"] as const).map((lado) => {
      const pos = { x: xs[lado], y, z };
      const yaw = (Math.atan2(largura / 2 - pos.x, caso.sala.valor.profundidade - pos.y) * 180) / Math.PI;
      return { id: `P-${lado}`, papel: "principal", lado, posicao: pos, mira: { yaw, pitch }, montagem, fonte: fonteCfg, movida: false };
    });
    const ff = frontFill ? criarFrontFills(ctx) : [];
    if (frontFill)
      avisos.push(`O array não cobre as primeiras fileiras a partir da altura de montagem. Ele cobre a partir de ${round(deY - y0, 1)} m da primeira fileira; front-fill adicionado.`);

    const requisitos: Requisito[] = [
      { campo: "coberturaV", operador: ">=", valor: Math.ceil(span.span), unidade: "graus", texto: `Cobertura vertical publicada de pelo menos ${Math.ceil(span.span)}° numa configuração da tabela` },
      { campo: "coberturaH", operador: ">=", valor: H, unidade: "graus", texto: `Cobertura horizontal de referência: ${H}°` },
      { campo: "alcance", operador: ">=", valor: Math.ceil(span.dUltima), unidade: "m", texto: `Alcance nominal de pelo menos ${Math.ceil(span.dUltima)} m` },
      {
        campo: "montagem",
        operador: "em",
        valor: montagem,
        unidade: "",
        texto:
          caso.instalacao.forma === "sem_preferencia"
            ? `Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou ${montagem})`
            : `Montagem permitida pelo fabricante: ${montagem}`,
      },
      {
        campo: "splContinuo1m",
        operador: ">=",
        valor: alvo.requerido,
        unidade: "dB SPL",
        texto: `SPL contínuo publicado por distância que entregue ${alvo.requerido} dB a ${Math.ceil(span.dUltima)} m`,
      },
    ];
    const cfg: Configuracao = {
      arquitetura: "AR-2",
      variante: "base",
      caixas: numerar([...principais, ...ff]),
      atrasos: [],
      frontFill,
      configArray: { modulos: escolhida?.modulos ?? 0, ...(escolhida?.anguloSplay !== undefined ? { anguloSplay: escolhida.anguloSplay } : {}), H, V, coberturaAPartirDe: round(deY, 2) },
      requisitos: { principal: requisitos, ...(ff.length ? { front_fill: [{ campo: "montagem", operador: "em", valor: "chao", unidade: "", texto: "Caixa compacta apoiada na boca do palco" } as Requisito] } : {}) },
      avisos,
    };
    return { ok: true, configuracao: cfg };
  },
};
