import { classeReverberacao, type ClasseReverb } from "./acoustics/reverb";
import { nivelAlvo, type NivelAlvo } from "./acoustics/target";
import type { ContextoArquitetura } from "./architectures/types";
import { criarMalha, type Malha } from "./geometry/grid";
import { volumeSala } from "./geometry/room";
import { normalizarTrilha1, type CasoNormalizado, type ErroEntrada } from "./input/normalize";
import type { Trilha1 } from "./input/schema";
import type { Params } from "./params";

export interface CasoPreparado extends ContextoArquitetura {
  caso: CasoNormalizado;
  malha: Malha;
  alvo: NivelAlvo;
  reverb: ClasseReverb | null;
}

/** Normaliza a entrada e monta sala, malha, nível-alvo e classe de reverberação. */
export function prepararCaso(t: Trilha1, params: Params): { ok: true; ctx: CasoPreparado } | { ok: false; erros: ErroEntrada[] } {
  const n = normalizarTrilha1(t, params);
  if (!n.ok) return n;
  const caso = n.caso;
  const malha = criarMalha(caso.areaPublico, params.passoMalha.valor, params.maxPontosMalha.valor);
  const alvo = nivelAlvo(caso.usosParam, caso.acustica.conversa?.valor ?? null, params);
  // O modelo qualitativo de reverberação só vale para ambiente fechado (SPEC B2 item 9).
  const reverb =
    caso.ambiente.valor === "fechado"
      ? classeReverberacao({ superficies: caso.acustica.superficies?.valor ?? null, palma: caso.acustica.palma?.valor ?? null, volume: volumeSala(caso.sala.valor) }, params)
      : null;
  return { ok: true, ctx: { caso, params, malha, alvo, reverb } };
}
