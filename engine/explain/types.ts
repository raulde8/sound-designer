import type { ParamRef } from "../params";

/** Explicação de uma conclusão (SPEC C9). Texto vem de templates, nunca de IA. */
export interface Conclusao {
  /** Id estável do item explicado (ex.: "arquitetura", "caixa:P-L", "palco:mesa"). */
  id: string;
  titulo: string;
  texto: string;
  entradas: string[];
  regra: string;
  parametros: ParamRef[];
  hipoteses: string[];
  limitacoes: string[];
}
