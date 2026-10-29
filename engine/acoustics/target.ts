import type { Params, UsoParam } from "../params";

export interface NivelAlvo {
  /** Nível-alvo médio contínuo no ouvinte, depois do ajuste por ruído e do teto. */
  alvo: number;
  reserva: number;
  /** alvo + reserva: critério de capacidade (SPEC C5). */
  requerido: number;
  usoDominante: UsoParam;
  ajusteRuido: number;
  ruidoEstimado: boolean;
  limitadoPeloTeto: boolean;
  avisoSegurancaAuditiva: boolean;
  sub: "sim" | "opcional" | "nao";
}

/**
 * Uso misto: vale o maior nível-alvo; a reserva é a do uso dominante (empate: a maior).
 * Ruído "não sei" usa a opção do meio ("difícil").
 */
export function nivelAlvo(usos: UsoParam[], conversa: "facil" | "dificil" | "muito_dificil" | null, params: Params): NivelAlvo {
  const tabela = params.niveisPorUso.valor;
  const lista = usos.length > 0 ? usos : (["fala"] as UsoParam[]);
  let dom = lista[0]!;
  for (const u of lista) {
    const a = tabela[u];
    const b = tabela[dom];
    if (a.alvo > b.alvo || (a.alvo === b.alvo && a.reserva > b.reserva)) dom = u;
  }
  const ruido = conversa ?? "dificil";
  const ajuste = params.ajusteRuido.valor[ruido];
  const bruto = tabela[dom].alvo + ajuste;
  const alvo = Math.min(bruto, params.tetoAlvo.valor);
  const reserva = tabela[dom].reserva;
  const subs = lista.map((u) => tabela[u].sub);
  const sub = subs.includes("sim") ? "sim" : subs.includes("opcional") ? "opcional" : "nao";
  return {
    alvo,
    reserva,
    requerido: alvo + reserva,
    usoDominante: dom,
    ajusteRuido: ajuste,
    ruidoEstimado: conversa === null,
    limitadoPeloTeto: bruto > params.tetoAlvo.valor,
    avisoSegurancaAuditiva: alvo > params.limiarSegurancaAuditiva.valor,
    sub,
  };
}
