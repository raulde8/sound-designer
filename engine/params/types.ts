export type ParamStatus = "pendente_validacao" | "validado" | "referencia";

export interface Param<T> {
  id: string;
  valor: T;
  unidade?: string;
  status: ParamStatus;
  /** De onde veio o valor (seção da SPEC, fonte, decisão). */
  origem: string;
  nota: string;
}

/** Referência a um parâmetro usada nas explicações. */
export interface ParamRef {
  id: string;
  valor: unknown;
  status: ParamStatus;
}

export function ref<T>(p: Param<T>): ParamRef {
  return { id: p.id, valor: p.valor, status: p.status };
}

export function pendente<T>(id: string, valor: T, origem: string, nota: string, unidade?: string): Param<T> {
  return { id, valor, status: "pendente_validacao", origem, nota, ...(unidade ? { unidade } : {}) };
}

export function referencia<T>(id: string, valor: T, origem: string, nota: string, unidade?: string): Param<T> {
  return { id, valor, status: "referencia", origem, nota, ...(unidade ? { unidade } : {}) };
}
