import type { CondicaoSpl, ConfiguracaoArray, Montagem, SpecValue } from "../../catalog/schema";
import type { PontoSpl } from "../acoustics/level";
import type { NivelAlvo } from "../acoustics/target";
import type { Malha } from "../geometry/grid";
import type { Mira, Vec3 } from "../geometry/vec";
import type { CasoNormalizado } from "../input/normalize";
import type { Params } from "../params";

export type ArquiteturaId = "AR-1" | "AR-2" | "AR-4" | "AR-5";
export type Papel = "principal" | "front_fill" | "reforco" | "sub";

/** Como o motor calcula o nível de uma caixa. */
export type ModeloNivel =
  | { tipo: "pontual"; spl1m: number; estimado: boolean; aviso?: string }
  | { tipo: "tabela"; pontos: PontoSpl[] }
  | { tipo: "pendente"; motivo: string }
  /** Perfil genérico: o nível é um requisito calculado, não uma avaliação. */
  | { tipo: "requisito" };

/** De onde vêm os dados da caixa: perfil genérico ou produto do catálogo. */
export interface FonteCaixa {
  tipo: "generico" | "produto";
  /** Id do perfil genérico (GEN-...) ou do produto. */
  ref: string;
  nome: string;
  cobertura: { H: number; V: number };
  nivel: ModeloNivel;
  /** Distância da base ao centro acústico (m). */
  meiaAltura: number;
  montagensPermitidas: Montagem[] | null;
  /** Subcategoria do catálogo ("10", "12", "15", "coluna", "line_array_compacto"...). */
  subcategoria: string;
  /** Tabela de cobertura por configuração (vertical array de produto). */
  tabelaArray?: ConfiguracaoArray[];
  /** Configuração escolhida da tabela (vertical array de produto). */
  configuracaoArray?: ConfiguracaoArray;
  /** SPL máximo da ficha (fonte pontual de produto). O modelo de nível depende da montagem. */
  spl?: SpecValue<number, CondicaoSpl>;
}

export interface Caixa {
  id: string;
  /** Número exibido na planta e na lista. */
  numero: number;
  papel: Papel;
  lado: "L" | "R" | "C";
  posicao: Vec3;
  mira: Mira;
  montagem: Montagem;
  fonte: FonteCaixa;
  /** Posição alterada pelo usuário na planta. */
  movida: boolean;
}

export interface AtrasoReferencia {
  caixaId: string;
  referenciaId: string;
  distanciaExtra: number;
  ms: number;
}

/** Requisito mínimo calculado para um papel (vai para o perfil genérico e para o filtro). */
export interface Requisito {
  campo: "splContinuo1m" | "coberturaH" | "coberturaV" | "montagem" | "pesoMax" | "alcance";
  operador: ">=" | "<=" | "em";
  valor: number | string;
  unidade: string;
  texto: string;
}

/**
 * Objeto de configuração. A planta e a lista de equipamentos são geradas
 * a partir deste mesmo objeto (SPEC B7).
 */
export interface Configuracao {
  arquitetura: ArquiteturaId;
  variante: "base" | "reforco";
  caixas: Caixa[];
  atrasos: AtrasoReferencia[];
  frontFill: boolean;
  configArray?: { modulos: number; anguloSplay?: number; H: number; V: number; coberturaAPartirDe: number };
  requisitos: Partial<Record<Papel, Requisito[]>>;
  avisos: string[];
}

export interface ContextoArquitetura {
  caso: CasoNormalizado;
  params: Params;
  malha: Malha;
  alvo: NivelAlvo;
}

export type Disponibilidade = { disponivel: true } | { disponivel: false; motivo: string };

export type ResultadoGeracao = { ok: true; configuracao: Configuracao } | { ok: false; motivo: string; violacao: boolean };

/**
 * Gerador de arquitetura candidata. AR-1 e AR-2 implementados no MVP.
 * AR-4 (teto) e AR-5 (parede distribuída) ficam para a fase 1.1 e implementam esta mesma interface.
 */
export interface ArchitectureGenerator {
  id: ArquiteturaId;
  nome: string;
  disponibilidade(ctx: ContextoArquitetura): Disponibilidade;
  /** Gera a configuração para uma fonte (perfil genérico ou produto). */
  gerar(ctx: ContextoArquitetura, fonte: FonteCaixa): ResultadoGeracao;
}
