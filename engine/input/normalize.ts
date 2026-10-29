import type { Params, UsoParam } from "../params";
import type { Sala, AreaPublico } from "../geometry/room";
import { criarAreaPublico, areaSala } from "../geometry/room";
import type { Trilha1 } from "./schema";

export type Origem = "usuario" | "default" | "preset" | "estimado";

export interface Valor<T> {
  valor: T;
  origem: Origem;
}

export interface ErroEntrada {
  campo: string;
  mensagem: string;
}

export type UsoEntrada = "fala" | "musica_ambiente" | "musica_primeiro_plano" | "banda" | "dj" | "video";
export type Formacao = "voz_violao" | "acustica" | "banda_bateria" | "varia";

export interface CasoNormalizado {
  tipo: Trilha1["tipoEstabelecimento"];
  usos: Valor<UsoEntrada[]>;
  formacao: Valor<Formacao> | null;
  /** Usos traduzidos para as linhas da tabela de níveis (banda -> formação). */
  usosParam: UsoParam[];
  sala: Valor<Sala>;
  paredePalco: Valor<"menor" | "maior">;
  profundidadePalco: Valor<number>;
  formato: Valor<"retangular" | "recorte" | "L" | "irregular">;
  publico: { quantidade: number; disposicao: Valor<"sentado" | "em_pe" | "mesas"> };
  estruturas: Valor<{ mezanino: boolean; colunas: boolean; conectados: boolean } | "nao_sei">;
  ambiente: Valor<"fechado" | "semiaberto" | "aberto">;
  acustica: {
    superficies: Valor<"duras" | "mistas" | "absorventes"> | null;
    palma: Valor<"sim" | "um_pouco" | "nao"> | null;
    conversa: Valor<"facil" | "dificil" | "muito_dificil"> | null;
  };
  instalacao: { forma: Trilha1["instalacao"]["forma"]; formato: Trilha1["instalacao"]["formato"] };
  mobilidade: Trilha1["mobilidade"];
  areaPublico: AreaPublico;
}

export type ResultadoNormalizacao = { ok: true; caso: CasoNormalizado } | { ok: false; erros: ErroEntrada[] };

function v<T>(valor: T, origem: Origem): Valor<T> {
  return { valor, origem };
}

/** Traduz usos + formação de banda para as linhas da tabela de níveis (SPEC C5). */
export function usosParaParam(usos: UsoEntrada[], formacao: Formacao | null): UsoParam[] {
  const out = new Set<UsoParam>();
  for (const u of usos) {
    if (u === "banda") {
      const f = formacao ?? "varia";
      // "varia" usa o pior caso (banda com bateria). "acustica" usa a linha de voz e violão (ver docs/DECISOES.md).
      out.add(f === "banda_bateria" || f === "varia" ? "banda_bateria" : "voz_violao");
    } else {
      out.add(u);
    }
  }
  return [...out].sort();
}

/**
 * Resolve "não sei", defaults e presets, e aplica os limites de entrada (SPEC B5).
 * Puro: não lê nada fora dos argumentos.
 */
export function normalizarTrilha1(t: Trilha1, params: Params): ResultadoNormalizacao {
  const erros: ErroEntrada[] = [];
  const lim = params.limitesEntrada.valor;
  const preset = params.presetsEstabelecimento.valor[t.tipoEstabelecimento] ?? params.presetsEstabelecimento.valor["outro"]!;

  // Usos
  const usos: Valor<UsoEntrada[]> =
    t.usos === "nao_sei" ? v(preset.usos as UsoEntrada[], "preset") : v([...new Set(t.usos)].sort() as UsoEntrada[], "usuario");
  let formacao: Valor<Formacao> | null = null;
  if (usos.valor.includes("banda")) {
    if (t.formacaoBanda === undefined || t.formacaoBanda === "nao_sei") {
      // SPEC B2 item 3: "não sei" usa "varia" (pior caso).
      formacao = v("varia", t.formacaoBanda === "nao_sei" ? "default" : usos.origem === "preset" ? "preset" : "default");
    } else {
      formacao = v(t.formacaoBanda, "usuario");
    }
  }

  // Dimensões
  let c: number, l: number, h: number, origemSala: Origem;
  if (t.dimensoes.tipo === "medidas") {
    ({ comprimento: c, largura: l, peDireito: h } = t.dimensoes);
    origemSala = "usuario";
  } else {
    const f = params.faixasTamanho.valor[t.dimensoes.faixa];
    ({ comprimento: c, largura: l, peDireito: h } = f);
    origemSala = "estimado";
  }
  if (c > lim.dimensaoMax) erros.push({ campo: "dimensoes.comprimento", mensagem: `Comprimento acima do limite do sistema (${lim.dimensaoMax} m).` });
  if (l > lim.dimensaoMax) erros.push({ campo: "dimensoes.largura", mensagem: `Largura acima do limite do sistema (${lim.dimensaoMax} m).` });
  if (h < lim.peDireitoMinAbsoluto)
    erros.push({ campo: "dimensoes.peDireito", mensagem: `Pé-direito abaixo de ${lim.peDireitoMinAbsoluto.toString().replace(".", ",")} m. O sistema não dimensiona caixas para esta altura.` });
  if (h > lim.peDireitoMaxAbsoluto) erros.push({ campo: "dimensoes.peDireito", mensagem: `Pé-direito acima do limite do sistema (${lim.peDireitoMaxAbsoluto} m).` });

  const paredePalco: Valor<"menor" | "maior"> = t.palco.parede === "nao_sei" ? v("menor", "default") : v(t.palco.parede, "usuario");
  const maior = Math.max(c, l);
  const menor = Math.min(c, l);
  // Palco na parede menor: a profundidade (y) é a dimensão maior.
  const sala: Sala = paredePalco.valor === "menor" ? { largura: menor, profundidade: maior, peDireito: h } : { largura: maior, profundidade: menor, peDireito: h };
  if (areaSala(sala) > lim.areaSalaMax) erros.push({ campo: "dimensoes", mensagem: `Área da sala acima do limite do sistema (${lim.areaSalaMax} m²). Procure um projetista.` });

  const profundidadePalco: Valor<number> =
    t.palco.profundidade === "nao_sei" ? v(params.profundidadePalcoPadrao.valor, "default") : v(t.palco.profundidade, "usuario");
  if (profundidadePalco.valor > lim.profundidadePalcoMax)
    erros.push({ campo: "palco.profundidade", mensagem: `Profundidade do palco acima de ${lim.profundidadePalcoMax} m.` });
  if (profundidadePalco.valor >= sala.profundidade - 1)
    erros.push({ campo: "palco.profundidade", mensagem: "O palco ocupa quase toda a sala. Deixe pelo menos 1 m para o público." });

  if (erros.length > 0) return { ok: false, erros };

  const disposicao = t.publico.disposicao === "nao_sei" ? v("sentado" as const, "default") : v(t.publico.disposicao, "usuario");
  const alturaOuvinte = disposicao.valor === "em_pe" ? params.alturaOuvinteEmPe.valor : params.alturaOuvinteSentado.valor;

  const caso: CasoNormalizado = {
    tipo: t.tipoEstabelecimento,
    usos,
    formacao,
    usosParam: usosParaParam(usos.valor, formacao?.valor ?? null),
    sala: v(sala, origemSala),
    paredePalco,
    profundidadePalco,
    formato: t.formato === "nao_sei" ? v("retangular", "default") : v(t.formato, "usuario"),
    publico: { quantidade: t.publico.quantidade, disposicao },
    estruturas: t.estruturas === "nao_sei" ? v("nao_sei", "default") : v(t.estruturas, "usuario"),
    ambiente: t.ambiente === "nao_sei" ? v("fechado", "default") : v(t.ambiente, "usuario"),
    acustica: {
      superficies: t.acustica.superficies === "nao_sei" ? null : v(t.acustica.superficies, "usuario"),
      palma: t.acustica.palma === "nao_sei" ? null : v(t.acustica.palma, "usuario"),
      conversa: t.acustica.conversa === "nao_sei" ? null : v(t.acustica.conversa, "usuario"),
    },
    instalacao: t.instalacao,
    mobilidade: t.mobilidade,
    areaPublico: criarAreaPublico(sala, profundidadePalco.valor, alturaOuvinte),
  };
  return { ok: true, caso };
}
