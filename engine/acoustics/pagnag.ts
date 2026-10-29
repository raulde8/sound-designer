/**
 * Risco de microfonia (SPEC C5). Fórmulas de Biamp/Shure:
 * PAG = 20 log10(D0*D1 / (D2*Ds)) - 10 log10(NOM) - FSM
 * NAG = 20 log10(D0 / D3)
 * D0: falante -> ouvinte mais distante; D1: microfone -> caixa mais próxima;
 * D2: ouvinte mais distante -> caixa mais próxima dele; D3: falante -> ouvinte mais próximo;
 * Ds: falante -> microfone; NOM: microfones abertos (automixer = 1); FSM: margem de estabilidade.
 * Modelo omnidirecional: pior caso.
 */
export interface DistanciasPagNag {
  D0: number;
  D1: number;
  D2: number;
  D3: number;
  Ds: number;
  NOM: number;
}

export function calcularPag(d: DistanciasPagNag, fsm: number): number {
  return 20 * Math.log10((d.D0 * d.D1) / (d.D2 * d.Ds)) - 10 * Math.log10(Math.max(1, d.NOM)) - fsm;
}

export function calcularNag(d: Pick<DistanciasPagNag, "D0" | "D3">): number {
  return 20 * Math.log10(d.D0 / d.D3);
}

export type RiscoMicrofonia = "baixo" | "moderado" | "alto";

export function classificarRisco(margem: number, limiarBaixo: number, limiarModerado: number): RiscoMicrofonia {
  if (margem >= limiarBaixo) return "baixo";
  if (margem >= limiarModerado) return "moderado";
  return "alto";
}

export const TEXTO_PAG_NAG = "Estimativa simplificada (lei do inverso do quadrado). Não substitui teste no local.";
