import { perfilGenerico } from "../../catalog/generic-profiles";
import type { Montagem } from "../../catalog/schema";
import { dist3, angulosForaEixo, round, type Vec3 } from "../geometry/vec";
import { avaliar } from "./evaluate";
import {
  afastamentoLateral,
  alturaCentro,
  comNivel,
  criarFrontFills,
  miraPadrao,
  numerar,
  resolverMontagem,
  splRequeridoPara,
  tamanhoPorSpl,
  yPrincipal,
} from "./layout";
import type { ArchitectureGenerator, AtrasoReferencia, Caixa, Configuracao, ContextoArquitetura, FonteCaixa, Requisito, ResultadoGeracao } from "./types";

export const AVISO_SUSPENSAO = "A suspensão exige projeto estrutural e ancoragem certificada. O sistema não dimensiona a fixação.";

function par(ctx: ContextoArquitetura, fonte: FonteCaixa, montagem: Montagem, y: number, yInicioMira: number, prefixo: string, papel: Caixa["papel"]): Omit<Caixa, "numero">[] {
  const { largura, peDireito } = ctx.caso.sala.valor;
  const z = alturaCentro(montagem, fonte.meiaAltura, peDireito, ctx.params);
  const a = Math.min(afastamentoLateral(montagem, ctx.params), largura / 4);
  return (["L", "R"] as const).map((lado) => {
    const pos: Vec3 = { x: lado === "L" ? a : largura - a, y, z };
    return { id: `${prefixo}-${lado}`, papel, lado, posicao: pos, mira: miraPadrao(pos, ctx, yInicioMira), montagem, fonte, movida: false };
  });
}

/** Pontos da primeira fileira nas duas extremidades laterais. */
function lateraisPrimeiraFileira(ctx: ContextoArquitetura): Vec3[] {
  const y0 = ctx.caso.areaPublico.retangulo.y0;
  const faixa = ctx.params.faixaPrimeiraFileira.valor;
  const primeira = ctx.malha.pontos.filter((p) => p.y <= y0 + faixa);
  if (primeira.length === 0) return [];
  const xMin = Math.min(...primeira.map((p) => p.x));
  const xMax = Math.max(...primeira.map((p) => p.x));
  return primeira.filter((p) => p.x === xMin || p.x === xMax);
}

/** A cobertura nominal horizontal das principais alcança as laterais da primeira fileira? (SPEC C4) */
export function horizontalAlcancaLaterais(principais: Pick<Caixa, "posicao" | "mira" | "fonte">[], laterais: Vec3[]): boolean {
  return laterais.every((p) => principais.some((c) => Math.abs(angulosForaEixo(c.posicao, c.mira, p).h) <= c.fonte.cobertura.H / 2 + 1e-9));
}

function fonteGenericaPorTamanho(base: FonteCaixa, tamanho: 10 | 12 | 15): FonteCaixa {
  const p = perfilGenerico(`GEN-ATIVA-${tamanho}`);
  return { ...base, ref: p.id, nome: p.nome };
}

export const AR1: ArchitectureGenerator = {
  id: "AR-1",
  nome: "Caixas ativas na frente (fontes pontuais)",
  disponibilidade(ctx) {
    if (ctx.caso.instalacao.formato === "coluna") return { disponivel: false, motivo: "Você preferiu coluna/vertical array." };
    return { disponivel: true };
  },
  gerar(ctx, fonteEntrada): ResultadoGeracao {
    const { caso, params, malha, alvo } = ctx;
    const { largura, profundidade } = caso.sala.valor;
    const zL = caso.areaPublico.alturaOuvinte;
    const y0 = caso.areaPublico.retangulo.y0;
    const montagem = resolverMontagem(caso.instalacao.forma, caso.mobilidade, fonteEntrada.montagensPermitidas);
    if (!montagem)
      return {
        ok: false,
        violacao: true,
        motivo: `O fabricante não permite a montagem escolhida (${caso.instalacao.forma === "sem_preferencia" ? "nenhuma montagem compatível" : caso.instalacao.forma}).`,
      };
    const avisos: string[] = [];
    if (montagem === "suspensa") avisos.push(AVISO_SUSPENSAO);
    let fonte = comNivel(fonteEntrada, montagem, params);
    if (fonte.nivel.tipo === "pontual" && fonte.nivel.aviso) avisos.push(fonte.nivel.aviso);
    const yP = yPrincipal(ctx);
    let principais = par(ctx, fonte, montagem, yP, y0, "P", "principal");

    // Front-fill (SPEC C4): cobertura horizontal nominal não alcança as laterais da primeira fileira.
    const precisaFrontFill = !horizontalAlcancaLaterais(principais, lateraisPrimeiraFileira(ctx));
    const frontFills = precisaFrontFill ? criarFrontFills(ctx) : [];
    if (precisaFrontFill) avisos.push("A cobertura horizontal das caixas principais não alcança as laterais da primeira fileira. Front-fill adicionado.");

    const base: Configuracao = {
      arquitetura: "AR-1",
      variante: "base",
      caixas: numerar([...principais, ...frontFills]),
      atrasos: [],
      frontFill: precisaFrontFill,
      requisitos: {},
      avisos,
    };

    // Reforço/delay (SPEC C4): distância > distMaxPontual ou nível na última fileira abaixo do alvo menos a tolerância.
    const linhas = [...new Set(malha.pontos.map((p) => p.y))].sort((a, b) => a - b);
    const ref = principais[0]!;
    const dUltima = dist3(ref.posicao, { x: largura / 2, y: profundidade, z: zL });
    const porDistancia = dUltima > params.distMaxPontual.valor;
    let yNivel: number | undefined;
    if (fonte.tipo === "produto" && fonte.nivel.tipo !== "pendente") {
      const av = avaliar(base, malha, params.bordaCobertura.valor, alvo.requerido);
      const ultima = av.nivelPorLinha[av.nivelPorLinha.length - 1];
      if (av.nivel && ultima && ultima.min < alvo.requerido - params.toleranciaNivel.valor) {
        yNivel = av.nivelPorLinha.find((l) => l.min < alvo.requerido)?.y;
      }
    }
    let yR: number | undefined;
    if (porDistancia || yNivel !== undefined) {
      const yDist = porDistancia ? [...linhas].reverse().find((y) => dist3(ref.posicao, { x: largura / 2, y, z: zL }) <= params.distMaxPontual.valor) : undefined;
      const candidatos = [yDist, yNivel].filter((v): v is number => v !== undefined);
      yR = candidatos.length > 0 ? Math.min(...candidatos) : undefined;
      if (yR !== undefined) yR = Math.min(Math.max(yR, y0 + 2), profundidade - 2);
      if (yR !== undefined && profundidade - y0 < 6) {
        avisos.push("A área de público é curta demais para um par de reforço. O sistema não adicionou reforço.");
        yR = undefined;
      }
    }

    let reforcos: Omit<Caixa, "numero">[] = [];
    const atrasos: AtrasoReferencia[] = [];
    if (yR !== undefined) {
      const preferida: Montagem = caso.mobilidade === "fixa" ? "parede" : "pedestal";
      const montR = !fonte.montagensPermitidas || fonte.montagensPermitidas.includes(preferida) ? preferida : montagem;
      reforcos = par(ctx, comNivel(fonteEntrada, montR, params), montR, yR, yR, "RF", "reforco");
      if (montR === "suspensa" && !avisos.includes(AVISO_SUSPENSAO)) avisos.push(AVISO_SUSPENSAO);
      for (const r of reforcos) {
        const m = principais.find((p) => p.lado === r.lado)!;
        const d = dist3(m.posicao, r.posicao);
        atrasos.push({ caixaId: r.id, referenciaId: m.id, distanciaExtra: round(d, 2), ms: round((1000 * d) / params.velocidadeSom.valor, 1) });
      }
      avisos.push(
        porDistancia
          ? `A distância até a última fileira (${round(dUltima, 1)} m) passa de ${params.distMaxPontual.valor} m. Par de reforço adicionado.`
          : "O nível na última fileira fica abaixo do alvo. Par de reforço adicionado.",
      );
    }

    // Requisitos do caso (SPEC C8 passo 2).
    const pontosPrincipal = malha.pontos.filter((p) => yR === undefined || p.y <= yR);
    const pontosReforco = yR === undefined ? [] : malha.pontos.filter((p) => p.y > yR!);
    const reqP = Math.max(...principais.map((c) => splRequeridoPara(c, pontosPrincipal, alvo.requerido).spl));
    const reqR = reforcos.length > 0 ? Math.max(...reforcos.map((c) => splRequeridoPara(c, pontosReforco, alvo.requerido).spl)) : 0;
    const reqBase = (spl: number, m: Montagem): Requisito[] => [
      { campo: "splContinuo1m", operador: ">=", valor: spl, unidade: "dB SPL", texto: `SPL máximo contínuo a 1 m de pelo menos ${spl} dB (campo livre)` },
      {
        campo: "montagem",
        operador: "em",
        valor: m,
        unidade: "",
        texto:
          caso.instalacao.forma === "sem_preferencia"
            ? `Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou ${m})`
            : `Montagem permitida pelo fabricante: ${m}`,
      },
      { campo: "pesoMax", operador: "<=", valor: params.pesoMaxPorMontagem.valor[m], unidade: "kg", texto: `Peso de até ${params.pesoMaxPorMontagem.valor[m]} kg para ${m}` },
    ];

    if (fonte.tipo === "generico") {
      fonte = fonteGenericaPorTamanho(fonte, tamanhoPorSpl(reqP, params));
      principais = principais.map((c) => ({ ...c, fonte }));
      if (reforcos.length > 0) {
        const fr = fonteGenericaPorTamanho(fonteEntrada, tamanhoPorSpl(reqR, params));
        reforcos = reforcos.map((c) => ({ ...c, fonte: fr }));
      }
    }

    const cfg: Configuracao = {
      ...base,
      variante: reforcos.length > 0 ? "reforco" : "base",
      caixas: numerar([...principais, ...frontFills, ...reforcos]),
      atrasos,
      requisitos: {
        principal: [
          ...reqBase(reqP, montagem),
          { campo: "coberturaH", operador: ">=", valor: fonteEntrada.cobertura.H, unidade: "graus", texto: `Cobertura usada no layout: ${fonteEntrada.cobertura.H}° x ${fonteEntrada.cobertura.V}° (H x V)` },
        ],
        ...(reforcos.length > 0 ? { reforco: reqBase(reqR, reforcos[0]!.montagem) } : {}),
        ...(frontFills.length > 0
          ? { front_fill: [{ campo: "montagem", operador: "em", valor: "chao", unidade: "", texto: "Caixa compacta apoiada na boca do palco" } as Requisito] }
          : {}),
      },
      avisos,
    };
    return { ok: true, configuracao: cfg };
  },
};
