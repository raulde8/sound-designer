import { executarMotor, ENGINE_VERSION, PARAMS_VERSION_ATUAL, obterParams, type Resultado } from "@engine/index";
import { obterCatalogo, versaoCatalogoAtual } from "./catalog";
import { hojeISO, type EstadoUrl } from "./state";

export type Execucao =
  | { tipo: "ok"; resultado: Resultado; estado: EstadoUrl }
  | { tipo: "versao_indisponivel"; motivos: string[]; estado: EstadoUrl };

/** Novo estado com as versões atuais do motor, do catálogo e dos parâmetros. */
export function estadoAtual(entrada: Record<string, unknown>, data = hojeISO()): EstadoUrl {
  return { v: 1, e: entrada, c: versaoCatalogoAtual(), p: PARAMS_VERSION_ATUAL, m: ENGINE_VERSION, d: data };
}

/** Roda o motor com as versões gravadas no link. Se alguma não existir mais, avisa. */
export function executar(estado: EstadoUrl): Execucao {
  const motivos: string[] = [];
  const cat = obterCatalogo(estado.c);
  if (!cat) motivos.push(`O catálogo usado neste link (${estado.c}) não está mais disponível.`);
  if (!obterParams(estado.p)) motivos.push(`A versão de parâmetros deste link (${estado.p}) não está mais disponível.`);
  if (estado.m !== ENGINE_VERSION) motivos.push(`O link foi gerado com o motor ${estado.m}; a versão atual é ${ENGINE_VERSION}.`);
  if (motivos.length > 0 || !cat) return { tipo: "versao_indisponivel", motivos, estado };
  return { tipo: "ok", resultado: executarMotor(estado.e, { catalogo: cat, paramsVersion: estado.p, dataReferencia: estado.d }), estado };
}

export function recalcularComVersaoAtual(estado: EstadoUrl): EstadoUrl {
  return estadoAtual(estado.e);
}
