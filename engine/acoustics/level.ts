import type { CondicaoSpl, Montagem, SpecValue } from "../../catalog/schema";

/** Nível direto pela lei do inverso do quadrado (SPEC C5): L(d) = SPL_1m - 20 log10(d). */
export function nivelDireto(spl1m: number, d: number): number {
  return spl1m - 20 * Math.log10(Math.max(d, 1e-6));
}

/** SPL a 1 m necessário para entregar `nivel` a `d` metros. */
export function splNecessario(nivel: number, d: number): number {
  return nivel + 20 * Math.log10(Math.max(d, 1e-6));
}

export type SplUtil =
  | { status: "ok"; valor: number; estimado: false; aviso?: string }
  | { status: "estimado"; valor: number; estimado: true; aviso: string }
  | { status: "pendente"; motivo: string };

/**
 * Converte o SPL máximo da ficha em SPL contínuo utilizável (SPEC C5).
 * - contínuo em campo livre: usa direto.
 * - pico em campo livre: estima contínuo = pico - picoParaContinuo, marcado como estimado.
 * - meio espaço (plano ao terra): só para caixa apoiada no chão, com aviso.
 * - sem condição de medição: pendente.
 * Valor de pico nunca é usado como contínuo.
 */
export function splContinuoUtil(
  spl: SpecValue<number, CondicaoSpl> | undefined,
  montagem: Montagem,
  picoParaContinuo: number,
  desconhecidaComoPico = false,
): SplUtil {
  if (!spl || spl.status === "desconhecido") return { status: "pendente", motivo: "O fabricante não publica SPL máximo." };
  const c = spl.condicaoMedicao;
  if (!c || c === "desconhecida") {
    if (!desconhecidaComoPico) return { status: "pendente", motivo: "SPL máximo sem condição de medição conhecida." };
    return {
      status: "estimado",
      valor: spl.valor - picoParaContinuo,
      estimado: true,
      aviso: `O fabricante não informa se o volume máximo (${spl.valor} dB) é contínuo ou de pico. Por segurança, tratamos como pico: contínuo estimado = ${spl.valor} - ${picoParaContinuo} dB.`,
    };
  }
  const meio = c === "continuo_meio_espaco" || c === "pico_meio_espaco";
  if (meio && montagem !== "chao")
    return { status: "pendente", motivo: "SPL medido em meio espaço (plano ao terra). Só vale para caixa apoiada no chão." };
  const avisoMeio = meio ? "SPL medido em meio espaço (plano ao terra), aplicado porque a caixa fica apoiada no chão." : undefined;
  if (c === "continuo_campo_livre" || c === "continuo_meio_espaco") return { status: "ok", valor: spl.valor, estimado: false, ...(avisoMeio ? { aviso: avisoMeio } : {}) };
  return {
    status: "estimado",
    valor: spl.valor - picoParaContinuo,
    estimado: true,
    aviso: `O fabricante publica só SPL de pico. Contínuo estimado = pico - ${picoParaContinuo} dB.${avisoMeio ? " " + avisoMeio : ""}`,
  };
}

export interface PontoSpl {
  distancia_m: number;
  spl_db: number;
}

/**
 * Interpola o SPL publicado por distância (vertical array, SPEC C4 AR-2).
 * Interpolação linear em log10(distância) entre os dois pontos vizinhos.
 * Fora do intervalo publicado devolve undefined: nunca extrapola.
 */
export function interpolarSpl(tabela: PontoSpl[], d: number): number | undefined {
  if (tabela.length === 0) return undefined;
  const t = [...tabela].sort((a, b) => a.distancia_m - b.distancia_m);
  const primeiro = t[0]!;
  const ultimo = t[t.length - 1]!;
  if (d < primeiro.distancia_m - 1e-9 || d > ultimo.distancia_m + 1e-9) return undefined;
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i]!;
    const b = t[i + 1]!;
    if (d >= a.distancia_m - 1e-9 && d <= b.distancia_m + 1e-9) {
      const la = Math.log10(a.distancia_m);
      const lb = Math.log10(b.distancia_m);
      const f = lb === la ? 0 : (Math.log10(d) - la) / (lb - la);
      return a.spl_db + f * (b.spl_db - a.spl_db);
    }
  }
  return ultimo.spl_db;
}
