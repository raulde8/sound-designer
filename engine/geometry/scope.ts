import type { CasoNormalizado } from "../input/normalize";
import type { Params } from "../params";
import { areaPublicoM2 } from "./room";

export type StatusEscopo = "suportado" | "parcial" | "encaminhar";

export interface ItemEscopo {
  codigo: string;
  nivel: "parcial" | "encaminhar" | "aviso";
  texto: string;
}

export interface Escopo {
  status: StatusEscopo;
  itens: ItemEscopo[];
  /** A geometria real não é um retângulo simples: o modelo é uma aproximação. */
  geometriaForaDoModelo: boolean;
  recomendarProjetista: boolean;
  /** O que foi calculado e o que não foi (para "atendido parcialmente"). */
  naoCalculado: string[];
}

/** Envelope do MVP (SPEC B5). */
export function avaliarEscopo(caso: CasoNormalizado, params: Params): Escopo {
  const env = params.envelope.valor;
  const itens: ItemEscopo[] = [];
  const naoCalculado: string[] = [];
  const area = areaPublicoM2(caso.areaPublico);
  const dist = caso.sala.valor.profundidade - caso.profundidadePalco.valor;
  const h = caso.sala.valor.peDireito;
  let geometriaFora = false;

  if (caso.formato.valor === "L" || caso.formato.valor === "irregular") {
    itens.push({ codigo: "formato", nivel: "parcial", texto: "Ambiente em L ou irregular: o sistema calculou só o retângulo principal." });
    naoCalculado.push("Cobertura das partes fora do retângulo principal.");
    geometriaFora = true;
  } else if (caso.formato.valor === "recorte") {
    itens.push({ codigo: "formato", nivel: "parcial", texto: "Ambiente com recorte: o sistema tratou como retângulo." });
    geometriaFora = true;
  } else if (caso.formato.origem !== "usuario") {
    itens.push({ codigo: "formato", nivel: "aviso", texto: "Formato não informado: o sistema tratou como retangular." });
  }

  const e = caso.estruturas.valor;
  if (e === "nao_sei") {
    itens.push({ codigo: "estruturas", nivel: "aviso", texto: "Você não informou se há mezanino, colunas grandes ou ambientes conectados. Se houver, o resultado muda." });
  } else {
    if (e.mezanino) {
      itens.push({ codigo: "mezanino", nivel: "parcial", texto: "Mezanino/balcão fora do modelo: o sistema não calcula a cobertura do mezanino." });
      naoCalculado.push("Cobertura do mezanino/balcão.");
      geometriaFora = true;
    }
    if (e.colunas) {
      itens.push({ codigo: "colunas", nivel: "parcial", texto: "Colunas grandes podem bloquear o som. O sistema não considera obstáculos." });
      naoCalculado.push("Sombra acústica de colunas.");
      geometriaFora = true;
    }
    if (e.conectados) {
      itens.push({ codigo: "conectados", nivel: "parcial", texto: "Ambientes conectados: o sistema dimensiona só o ambiente principal. Várias zonas independentes pedem projetista." });
      naoCalculado.push("Ambientes conectados / zonas independentes.");
    }
  }

  if (caso.ambiente.valor === "semiaberto") itens.push({ codigo: "ambiente", nivel: "parcial", texto: "Ambiente semiaberto: a classe de reverberação não se aplica." });
  if (caso.ambiente.valor === "aberto") {
    itens.push({ codigo: "ambiente", nivel: "parcial", texto: "Ambiente aberto: a classe de reverberação não se aplica e o vento e o ruído externo não são considerados." });
    if (dist > env.profundidadeAbertoEncaminhar)
      itens.push({ codigo: "aberto_profundo", nivel: "encaminhar", texto: `Ambiente aberto com mais de ${env.profundidadeAbertoEncaminhar} m de profundidade.` });
  }

  if (area > env.areaPublicoSuportada) itens.push({ codigo: "area", nivel: "parcial", texto: `Área de público acima de ${env.areaPublicoSuportada} m².` });
  if (dist > env.distanciaParcial) itens.push({ codigo: "distancia", nivel: "encaminhar", texto: `Distância palco-última fileira acima de ${env.distanciaParcial} m.` });
  else if (dist > env.distanciaSuportada) itens.push({ codigo: "distancia", nivel: "parcial", texto: `Distância palco-última fileira entre ${env.distanciaSuportada} e ${env.distanciaParcial} m.` });
  if (h < env.peDireitoMin || h > env.peDireitoMax)
    itens.push({ codigo: "pe_direito", nivel: "parcial", texto: `Pé-direito fora da faixa suportada (${env.peDireitoMin} a ${env.peDireitoMax} m).` });
  if (caso.publico.quantidade > env.publicoEncaminhar) itens.push({ codigo: "publico", nivel: "encaminhar", texto: `Público acima de ${env.publicoEncaminhar} pessoas.` });

  const cap = params.areaPorPessoa.valor[caso.publico.disposicao.valor];
  if (caso.publico.quantidade * cap > area * 1.0001)
    itens.push({
      codigo: "ocupacao",
      nivel: "aviso",
      texto: `${caso.publico.quantidade} pessoas ${caso.publico.disposicao.valor === "em_pe" ? "em pé" : caso.publico.disposicao.valor === "mesas" ? "em mesas" : "sentadas"} precisam de cerca de ${Math.ceil(caso.publico.quantidade * cap)} m², mais que a área de público (${Math.round(area)} m²). Confira as medidas.`,
    });
  if (caso.sala.origem === "estimado") itens.push({ codigo: "sala_estimada", nivel: "aviso", texto: "As medidas da sala são estimadas a partir da faixa de tamanho escolhida." });

  const status: StatusEscopo = itens.some((i) => i.nivel === "encaminhar") ? "encaminhar" : itens.some((i) => i.nivel === "parcial") ? "parcial" : "suportado";
  const recomendarProjetista = status !== "suportado" || itens.some((i) => i.codigo === "mezanino" || i.codigo === "conectados");
  return { status, itens, geometriaForaDoModelo: geometriaFora, recomendarProjetista, naoCalculado };
}
