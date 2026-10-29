import { z } from "zod";

/**
 * Schema do catálogo (SPEC C7). Puro: sem I/O. Usado pelo motor, pelos scripts e pela UI.
 */

export const SpecStatus = z.enum(["medido", "declarado_fabricante", "referencia", "estimado", "desconhecido"]);
export type SpecStatus = z.infer<typeof SpecStatus>;

const dataISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data no formato AAAA-MM-DD." });

/** Valor de especificação com fonte e data (SpecValue<T>). Todo campo crítico usa este formato. */
export function specValue<T extends z.ZodType, C extends z.ZodType = z.ZodString>(valor: T, condicao?: C) {
  return z.object({
    valor,
    unidade: z.string(),
    condicaoMedicao: (condicao ?? z.string()).optional(),
    /** URL ou nome de arquivo da ficha técnica. */
    fonte: z.string(),
    dataVerificacao: z.union([dataISO, z.literal("")]),
    status: SpecStatus,
  });
}

export type SpecValue<T, C = string> = {
  valor: T;
  unidade: string;
  condicaoMedicao?: C;
  fonte: string;
  dataVerificacao: string;
  status: SpecStatus;
};

/** Condição de medição de SPL máximo (SPEC C5). */
export const CondicaoSpl = z.enum(["continuo_campo_livre", "pico_campo_livre", "continuo_meio_espaco", "pico_meio_espaco", "desconhecida"]);
export type CondicaoSpl = z.infer<typeof CondicaoSpl>;

/** Critério da resposta de frequência. */
export const CondicaoResposta = z.enum(["-10dB", "-3dB", "-6dB", "desconhecida"]);

export const Montagem = z.enum(["pedestal", "parede", "suspensa", "chao"]);
export type Montagem = z.infer<typeof Montagem>;

export const Categoria = z.enum([
  "caixa_ativa",
  "vertical_array",
  "subwoofer",
  "mesa",
  "microfone_com_fio",
  "microfone_sem_fio",
  "in_ear",
  "monitor_chao",
  "di",
  "acessorio",
]);
export type Categoria = z.infer<typeof Categoria>;

export const Porte = z.enum(["entrada", "intermediaria", "profissional"]);
export type Porte = z.infer<typeof Porte>;

export const StatusProduto = z.enum(["rascunho", "revisado", "publicado", "descontinuado"]);

/** Uma linha da tabela de cobertura por configuração publicada pelo fabricante (AR-2). */
export const ConfiguracaoArray = z.object({
  modulos: z.number().int().min(1),
  anguloSplay: z.number().optional(),
  H: z.number().positive(),
  V: z.number().positive(),
  alcanceNominal_m: z.number().positive().optional(),
  /** Altura do centro acústico publicada para esta configuração (opcional). */
  alturaCentro_m: z.number().positive().optional(),
  /** SPL contínuo publicado por distância. O motor interpola, nunca extrapola. */
  spl_por_distancia: z.array(z.object({ distancia_m: z.number().positive(), spl_db: z.number() })).optional(),
});
export type ConfiguracaoArray = z.infer<typeof ConfiguracaoArray>;

const sv = specValue;

export const Especificacoes = z
  .object({
    // Caixas
    coberturaH: sv(z.number().positive()),
    coberturaV: sv(z.number().positive()),
    splMax: sv(z.number(), CondicaoSpl),
    respostaFrequencia: sv(z.object({ minHz: z.number().positive(), maxHz: z.number().positive() }), CondicaoResposta),
    modoMonitor: sv(z.boolean()),
    coberturaPorConfiguracao: sv(z.array(ConfiguracaoArray).min(1)),
    acessoriosObrigatorios: sv(z.array(z.string())),
    pareamento: sv(z.object({ topIds: z.array(z.string()), subsPorLado: z.number().int().min(1) })),
    // Mesa
    tipoMesa: sv(z.enum(["analogica", "digital"])),
    entradasMic: sv(z.number().int().min(0)),
    entradasTotais: sv(z.number().int().min(0)),
    auxMono: sv(z.number().int().min(0)),
    auxEstereo: sv(z.number().int().min(0)),
    phantom: sv(z.boolean()),
    controleRemoto: sv(z.boolean()),
    // Sem fio / in-ear
    faixaFrequencia: sv(z.object({ minMHz: z.number().positive(), maxMHz: z.number().positive() })),
    homologacaoAnatel: sv(z.string()),
    canaisSimultaneos: sv(z.number().int().min(1)),
    varreduraAutomatica: sv(z.boolean()),
    mixagensPorTransmissor: sv(z.number().int().min(1)),
    // Microfone com fio
    tipoMicrofone: sv(z.enum(["dinamico", "condensador"])),
    // Acessórios
    comprimento: sv(z.number().positive()),
  })
  .partial();
export type Especificacoes = z.infer<typeof Especificacoes>;

export const Product = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, { message: "id em minúsculas, números e hífen." }),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  categoria: Categoria,
  /** Ex.: "10" | "12" | "15" (caixa), "coluna" | "line_array_compacto" (array), "analogica" | "digital" (mesa). */
  subcategoria: z.string().default(""),
  porte: Porte.optional(),
  status: StatusProduto,
  especificacoes: Especificacoes,
  montagensPermitidas: sv(z.array(Montagem)).optional(),
  acessoriosCompativeis: z.array(z.string()).default([]),
  dimensoes: sv(z.object({ altura_m: z.number().positive(), largura_m: z.number().positive(), profundidade_m: z.number().positive() })).optional(),
  peso: sv(z.number().positive()).optional(),
  datasheetUrl: z.string().default(""),
  verificadoEm: z.union([dataISO, z.literal("")]).default(""),
  verificadoPor: z.string().default(""),
  /** Item fictício de demonstração. Proibido no catálogo de produção. */
  demo: z.boolean().default(false),
});
export type Product = z.infer<typeof Product>;

/** Oferta comercial. Existe no schema, mas NÃO aparece na UI do MVP. */
export const Offer = z.object({
  produtoId: z.string(),
  vendedor: z.string(),
  precoAVista: z.number().nonnegative(),
  precoParcelado: z.number().nonnegative().optional(),
  itensNaoIncluidos: z.array(z.string()).default([]),
  disponibilidade: z.enum(["pronta_entrega", "sob_encomenda", "indisponivel", "nao_verificado"]),
  dataVerificacao: dataISO,
  validadeDias: z.number().int().positive().default(30),
});
export type Offer = z.infer<typeof Offer>;

/** Faixa de investimento por categoria e porte, por unidade, em R$. */
export const FaixaInvestimento = z.object({
  id: z.string(),
  categoria: Categoria,
  subcategoria: z.string().default(""),
  porte: Porte,
  minimo: z.number().nonnegative(),
  maximo: z.number().nonnegative(),
  fonte: z.string().min(1),
  dataVerificacao: dataISO,
  validadeDias: z.number().int().positive().default(90),
  demo: z.boolean().default(false),
});
export type FaixaInvestimento = z.infer<typeof FaixaInvestimento>;

export const CatalogData = z.object({
  produtos: z.array(Product),
  faixas: z.array(FaixaInvestimento),
  ofertas: z.array(Offer),
});
export type CatalogData = z.infer<typeof CatalogData>;

export const CatalogMode = z.enum(["producao", "demo"]);
export type CatalogMode = z.infer<typeof CatalogMode>;

/** Snapshot imutável entregue ao motor. `version` é o hash do conteúdo. */
export const CatalogSnapshot = CatalogData.extend({
  version: z.string(),
  modo: CatalogMode,
});
export type CatalogSnapshot = z.infer<typeof CatalogSnapshot>;
