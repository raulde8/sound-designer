import type { Configuracao } from "../architectures/types";
import type { Malha } from "../geometry/grid";
import { dist3, type Vec3 } from "../geometry/vec";
import type { CasoNormalizado } from "../input/normalize";
import type { Params } from "../params";
import { calcularNag, calcularPag, classificarRisco, type DistanciasPagNag, type RiscoMicrofonia } from "./pagnag";

export interface ResultadoPagNag {
  distancias: DistanciasPagNag;
  pag: number;
  nag: number;
  margem: number;
  risco: RiscoMicrofonia;
  tipoMicrofone: "mao" | "gooseneck";
  microfone: Vec3;
  falante: Vec3;
}

/**
 * PAG/NAG a partir da planta (SPEC C5). Microfone no centro, na frente do palco.
 * Falante atrás do microfone, à distância Ds.
 */
export function pagNagDaPlanta(cfg: Configuracao, malha: Malha, caso: CasoNormalizado, params: Params, nom: number, tipo: "mao" | "gooseneck" = "mao"): ResultadoPagNag | null {
  const caixas = cfg.caixas.filter((c) => c.papel !== "sub");
  if (caixas.length === 0 || malha.pontos.length === 0) return null;
  const pp = params.pagNag.valor;
  const pm = params.posicaoMicrofone.valor;
  const Ds = tipo === "mao" ? pp.dsMao : pp.dsGooseneck;
  const yMic = Math.max(0.3, caso.profundidadePalco.valor - pm.recuoBordaPalco);
  const microfone = { x: caso.sala.valor.largura / 2, y: yMic, z: pm.altura };
  const falante = { x: microfone.x, y: Math.max(0, yMic - Ds), z: pm.altura };
  let longe = malha.pontos[0]!;
  let perto = malha.pontos[0]!;
  for (const p of malha.pontos) {
    if (dist3(falante, p) > dist3(falante, longe)) longe = p;
    if (dist3(falante, p) < dist3(falante, perto)) perto = p;
  }
  const maisProxima = (p: Vec3) => Math.min(...caixas.map((c) => dist3(c.posicao, p)));
  const d: DistanciasPagNag = {
    D0: dist3(falante, longe),
    D1: maisProxima(microfone),
    D2: maisProxima(longe),
    D3: dist3(falante, perto),
    Ds: dist3(falante, microfone),
    NOM: Math.max(1, nom),
  };
  const pag = calcularPag(d, pp.fsm);
  const nag = calcularNag(d);
  return { distancias: d, pag, nag, margem: pag - nag, risco: classificarRisco(pag - nag, pp.margemBaixo, pp.margemModerado), tipoMicrofone: tipo, microfone, falante };
}
