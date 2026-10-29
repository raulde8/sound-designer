import type { GenericProfileDef } from "../catalog/generic-profiles";
import type { ResultadoPagNag } from "./acoustics/feedback";
import type { ClasseReverb } from "./acoustics/reverb";
import type { NivelAlvo } from "./acoustics/target";
import type { StatusCapacidade } from "./architectures/evaluate";
import type { RecomendacaoSub } from "./architectures/sub";
import type { ArquiteturaId, Configuracao, Requisito } from "./architectures/types";
import type { ItemEquipamento } from "./equipment";
import type { Conclusao } from "./explain/types";
import type { Escopo } from "./geometry/scope";
import type { Sala } from "./geometry/room";
import type { ErroEntrada, Origem } from "./input/normalize";
import type { ParamRef } from "./params";
import type { Candidato } from "./selection/compat";
import type { ComparacaoOrcamento, FaixaUsada, Investimento } from "./selection/investimento";
import type { CandidatoSub } from "./selection/subwoofer";
import type { ResultadoPalco } from "./stage/types";

export interface Versoes {
  engineVersion: string;
  catalogVersion: string;
  paramsVersion: string;
}

export interface PerfilGenericoResultado extends GenericProfileDef {
  rotulo: string;
  requisitos: Requisito[];
  faixa?: FaixaUsada;
}

export type StatusGeometria = "validada" | "validada_aproximacao" | "fora_do_modelo";

export interface MapaCobertura {
  passo: number;
  x0: number;
  y0: number;
  nx: number;
  ny: number;
  /** Um caractere por célula (iy * nx + ix): c = coberto, b = borda, f = fora, espaço = sem público. */
  celulas: string;
}

export interface ResumoAvaliacao {
  pct: { coberto: number; borda: number; fora: number };
  nivel: { min: number; max: number; uniformidade: number } | null;
  capacidade: StatusCapacidade;
  motivoCapacidade: string;
}

export interface Recomendacao {
  arquitetura: ArquiteturaId;
  nome: string;
  nomeSimples: string;
  motivoEscolha: string;
  /** Objeto de configuração único: planta e lista de equipamentos saem daqui. */
  configuracao: Configuracao;
  equipamentos: ItemEquipamento[];
  avaliacao: ResumoAvaliacao;
  mapa: MapaCobertura;
  /** Produto escolhido para as caixas principais, ou null quando vale o perfil genérico. */
  produto: Candidato | null;
  perfilGenerico: PerfilGenericoResultado;
  candidatos: Candidato[];
  semProdutoAdequado: boolean;
  sub: {
    regra: RecomendacaoSub;
    incluido: boolean;
    escolhido: CandidatoSub | null;
    perfilGenerico: PerfilGenericoResultado | null;
    candidatos: CandidatoSub[];
    porLado: number;
  };
  statusValidacao: {
    geometria: StatusGeometria;
    capacidade: StatusCapacidade;
    acustica: "baixo" | "medio" | "alto" | "nao_aplicavel";
  };
  ajustada: boolean;
}

export interface Alternativa {
  rotulo: "menor custo" | "equilíbrio" | "maior capacidade";
  arquitetura: ArquiteturaId;
  nome: string;
  produtoId: string | null;
  quantidadeCaixas: number;
  status: Candidato["status"] | "generico";
  margemNivel?: number;
  faixa?: FaixaUsada;
}

export interface ResumoCaso {
  tipo: string;
  sala: Sala;
  salaOrigem: Origem;
  profundidadePalco: number;
  areaPublicoM2: number;
  alturaOuvinte: number;
  publico: number;
  disposicao: string;
  usos: string[];
  usosOrigem: Origem;
  formacao: string | null;
  ambiente: string;
  formato: string;
  instalacao: { forma: string; formato: string };
  mobilidade: string;
  passoMalha: number;
  passoAumentado: boolean;
}

export interface ResultadoOk {
  ok: true;
  versoes: Versoes;
  dataReferencia: string;
  caso: ResumoCaso;
  escopo: Escopo;
  alvo: NivelAlvo;
  reverb: ClasseReverb | null;
  arquiteturas: { id: ArquiteturaId; nome: string; disponivel: boolean; motivo?: string }[];
  recomendacao: Recomendacao | null;
  alternativas: Alternativa[];
  pagNag: (ResultadoPagNag & { aplicavel: true }) | null;
  investimento: Investimento | null;
  orcamento: ComparacaoOrcamento | null;
  palco: ResultadoPalco | null;
  conclusoes: Conclusao[];
  avisos: string[];
  profissional: string[];
  /** Parâmetros pendentes de validação que influenciaram este resultado. */
  parametrosPendentes: ParamRef[];
}

export interface ResultadoErro {
  ok: false;
  versoes: Versoes;
  erros: ErroEntrada[];
}

export type Resultado = ResultadoOk | ResultadoErro;
