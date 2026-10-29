import type { Requisito } from "../architectures/types";
import type { StatusCompat } from "../selection/compat";
import type { FaixaUsada } from "../selection/investimento";

export interface LinhaEntrada {
  fonte: string;
  quantidade: number;
  canaisPorUnidade: number;
  canais: number;
  /** Canais que entram por microfone (contam para entradas de microfone e phantom). */
  canaisMic: number;
  di: number;
}

export interface CandidatoMesa {
  produtoId: string;
  nome: string;
  marca: string;
  tipo: string;
  status: StatusCompat;
  motivos: string[];
  faixa?: FaixaUsada;
}

export interface ItemPalco {
  id: string;
  descricao: string;
  quantidade: number;
  /** Produto do catálogo (id) ou perfil genérico (GEN-...). */
  ref: string;
  nome: string;
  tipo: "produto" | "generico";
  detalhe?: string;
  estimado: boolean;
}

/** Uma linha da lista de canais (input list) do palco. */
export interface LinhaInput {
  canal: number;
  fonte: string;
  captacao: string;
  pedestal: string;
  phantom: boolean;
}

export interface ResultadoPalco {
  /** Lista de canais sugerida, na ordem usual: bateria, baixo, guitarra, teclado, violão, vozes, linhas. */
  inputList: LinhaInput[];
  /** Perguntas respondidas com "não sei" e preenchidas pelo preset. */
  estimados: string[];
  entradas: LinhaEntrada[];
  totalCanais: number;
  canaisMic: number;
  canaisComReserva: number;
  tamanhoMesa: number;
  mixagens: { total: number; inEar: number; monitor: number };
  auxNecessarios: { mono: number; inEarEstereo: number };
  mesa: {
    tipo: "analogica" | "digital" | "ambas";
    motivos: string[];
    vantagens: string[];
    requisitos: Requisito[];
    phantom: boolean;
    candidatos: CandidatoMesa[];
    escolhida: CandidatoMesa | null;
  };
  microfones: ItemPalco[];
  retorno: ItemPalco[];
  di: ItemPalco[];
  acessorios: ItemPalco[];
  rf: {
    canais: number;
    nivel: "nenhum" | "simples" | "coordenacao" | "especialista";
    orientacoes: string[];
  };
  avisos: string[];
}
