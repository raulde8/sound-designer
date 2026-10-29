/**
 * Analytics anônimo (SPEC C2/C11). Sem dados pessoais: só nome do evento, etapa e números.
 * Interface substituível; o padrão escreve no console.
 */
export type EventoAnalytics =
  | { tipo: "etapa_iniciada"; trilha: 1 | 2; etapa: string }
  | { tipo: "etapa_concluida"; trilha: 1 | 2; etapa: string; segundos: number }
  | { tipo: "tempo_ate_resultado"; segundos: number }
  | { tipo: "abandono"; trilha: 1 | 2; etapa: string }
  | { tipo: "caso_fora_escopo"; status: "parcial" | "encaminhar" }
  | { tipo: "uso_trilha2" }
  | { tipo: "resultado_perfil_generico" }
  | { tipo: "clique_porque"; item: string }
  | { tipo: "pesquisa_utilidade"; resposta: "sim" | "em_parte" | "nao" };

export interface Analytics {
  registrar(e: EventoAnalytics): void;
}

export class AnalyticsConsole implements Analytics {
  registrar(e: EventoAnalytics): void {
    console.info("[analytics]", JSON.stringify(e));
  }
}

let atual: Analytics = new AnalyticsConsole();

export function analytics(): Analytics {
  return atual;
}

/** Troca o adaptador (ex.: serviço de analytics sem cookies, na fase 2). */
export function definirAnalytics(a: Analytics): void {
  atual = a;
}
