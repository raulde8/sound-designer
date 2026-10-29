import { PARAMS_V1, PARAMS_VERSION_V1, type ParamsV1 } from "./v1";

export type Params = ParamsV1;
export * from "./types";
export { PARAMS_V1, PARAMS_VERSION_V1, listarParams } from "./v1";
export type { UsoParam, NivelUso } from "./v1";

/** Registro de versões de parâmetros. Versões antigas ficam aqui para reproduzir links antigos. */
const REGISTRO: Record<string, Params> = {
  [PARAMS_VERSION_V1]: PARAMS_V1,
};

export const PARAMS_VERSION_ATUAL = PARAMS_VERSION_V1;

export function obterParams(versao: string): Params | undefined {
  return REGISTRO[versao];
}

export function versoesParams(): string[] {
  return Object.keys(REGISTRO);
}
