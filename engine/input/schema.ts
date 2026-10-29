import { z } from "zod";

/**
 * Schemas de entrada do questionário (SPEC B2 e B3).
 * "nao_sei" só existe onde a SPEC permite.
 */
export const NAO_SEI = z.literal("nao_sei");
export type NaoSei = z.infer<typeof NAO_SEI>;

const ouNaoSei = <T extends z.ZodType>(s: T) => z.union([s, NAO_SEI]);

export const TipoEstabelecimento = z.enum(["igreja", "bar", "restaurante", "auditorio", "salao_eventos", "outro"]);
export const Uso = z.enum(["fala", "musica_ambiente", "musica_primeiro_plano", "banda", "dj", "video"]);
export const FormacaoBanda = z.enum(["voz_violao", "acustica", "banda_bateria", "varia"]);
export const FaixaTamanho = z.enum(["sala_aula", "salao_medio", "salao_grande", "quadra"]);
export const Formato = z.enum(["retangular", "recorte", "L", "irregular"]);
export const ParedePalco = z.enum(["menor", "maior"]);
export const Disposicao = z.enum(["sentado", "em_pe", "mesas"]);
export const Ambiente = z.enum(["fechado", "semiaberto", "aberto"]);
export const Superficies = z.enum(["duras", "mistas", "absorventes"]);
export const Palma = z.enum(["sim", "um_pouco", "nao"]);
export const Conversa = z.enum(["facil", "dificil", "muito_dificil"]);
export const FormaInstalacao = z.enum(["pedestal", "parede", "suspensa", "chao", "sem_preferencia"]);
export const FormatoCaixa = z.enum(["convencional", "coluna", "sem_preferencia"]);
export const Mobilidade = z.enum(["fixa", "movel"]);

const medida = (campo: string) =>
  z
    .number({ error: `${campo}: informe um número em metros.` })
    .refine(Number.isFinite, { message: `${campo}: valor inválido.` })
    .refine((v) => v > 0, { message: `${campo}: o valor precisa ser maior que zero.` });

export const DimensoesMedidas = z.object({
  tipo: z.literal("medidas"),
  comprimento: medida("Comprimento"),
  largura: medida("Largura"),
  peDireito: medida("Pé-direito"),
});

export const DimensoesFaixa = z.object({
  tipo: z.literal("faixa"),
  faixa: FaixaTamanho,
});

export const Dimensoes = z.discriminatedUnion("tipo", [DimensoesMedidas, DimensoesFaixa]);

export const Estruturas = z.object({
  mezanino: z.boolean(),
  colunas: z.boolean(),
  conectados: z.boolean(),
});

export const Trilha1Schema = z.object({
  tipoEstabelecimento: TipoEstabelecimento,
  usos: ouNaoSei(z.array(Uso).min(1, { message: "Escolha pelo menos um uso." })),
  formacaoBanda: ouNaoSei(FormacaoBanda).optional(),
  dimensoes: Dimensoes,
  formato: ouNaoSei(Formato).default("retangular"),
  palco: z
    .object({
      parede: ouNaoSei(ParedePalco).default("menor"),
      profundidade: ouNaoSei(z.number().min(0, { message: "Profundidade do palco não pode ser negativa." })).default("nao_sei"),
    })
    .default({ parede: "menor", profundidade: "nao_sei" }),
  publico: z.object({
    quantidade: z
      .number({ error: "Informe a quantidade de pessoas." })
      .int({ message: "A quantidade de pessoas precisa ser um número inteiro." })
      .min(1, { message: "Informe pelo menos 1 pessoa." })
      .max(10000, { message: "Quantidade acima do limite do sistema (10.000)." }),
    disposicao: ouNaoSei(Disposicao).default("sentado"),
  }),
  estruturas: ouNaoSei(Estruturas).default({ mezanino: false, colunas: false, conectados: false }),
  ambiente: ouNaoSei(Ambiente).default("fechado"),
  acustica: z
    .object({
      superficies: ouNaoSei(Superficies).default("nao_sei"),
      palma: ouNaoSei(Palma).default("nao_sei"),
      conversa: ouNaoSei(Conversa).default("nao_sei"),
    })
    .default({ superficies: "nao_sei", palma: "nao_sei", conversa: "nao_sei" }),
  instalacao: z
    .object({
      forma: FormaInstalacao.default("sem_preferencia"),
      formato: FormatoCaixa.default("sem_preferencia"),
    })
    .default({ forma: "sem_preferencia", formato: "sem_preferencia" }),
  mobilidade: Mobilidade.default("fixa"),
});

export type Trilha1 = z.infer<typeof Trilha1Schema>;
export type Trilha1Entrada = z.input<typeof Trilha1Schema>;

// ---------------- Trilha 2 (B3) ----------------

export const TipoSemFio = z.enum(["mao", "headset", "lapela"]);
export const Operador = z.enum(["voluntario", "ocasional", "fixo"]);
export const PreferenciaRetorno = z.enum(["in_ear", "monitor", "misto"]);
export const KitBateria = z.enum(["basico", "completo"]);

const contagem = z.number().int().min(0).max(64);

export const Instrumentos = z.object({
  violao: contagem.default(0),
  guitarra: contagem.default(0),
  baixo: contagem.default(0),
  teclado: contagem.default(0),
  bateria_acustica: contagem.default(0),
  bateria_eletronica: contagem.default(0),
  sopro: contagem.default(0),
  outros: contagem.default(0),
});

export const Trilha2Schema = z.object({
  vozes: ouNaoSei(
    z.object({
      paradas: contagem,
      moveis: contagem,
      tipoSemFio: TipoSemFio.default("mao"),
      pregador: z.boolean().default(false),
    }),
  ),
  instrumentos: ouNaoSei(Instrumentos.extend({ kitBateria: KitBateria.default("basico") })),
  outrasFontes: ouNaoSei(
    z.object({
      playback: z.boolean().default(false),
      celular: z.boolean().default(false),
      dj: z.boolean().default(false),
      video: z.boolean().default(false),
    }),
  ),
  retorno: ouNaoSei(
    z.object({
      mixagens: contagem,
      preferencia: PreferenciaRetorno.default("monitor"),
      /** Quantas das mixagens são in-ear (só para preferência "misto"). */
      mixagensInEar: contagem.optional(),
      /** Músicos que usam in-ear (receptores). Padrão: 1 por mixagem in-ear. */
      musicosInEar: contagem.optional(),
    }),
  ),
  operacao: ouNaoSei(
    z.object({
      operador: Operador,
      controleRemoto: z.boolean().default(false),
    }),
  ),
  /** Posição da mesa na planta (metros). Padrão: fundo, centro. */
  posicaoMesa: z.object({ x: z.number(), y: z.number() }).optional(),
});

export type Trilha2 = z.infer<typeof Trilha2Schema>;
export type Trilha2Entrada = z.input<typeof Trilha2Schema>;

// ---------------- Ajustes do usuário na planta ----------------

export const AjusteCaixa = z.object({ x: z.number(), y: z.number() });

export const EntradaSchema = z.object({
  trilha1: Trilha1Schema,
  trilha2: Trilha2Schema.optional(),
  /** Caixas movidas pelo usuário na planta (id da caixa -> nova posição). */
  ajustes: z.record(z.string(), AjusteCaixa).default({}),
  /** Orçamento opcional informado no resultado (R$). Nunca altera requisito. */
  orcamento: z.number().min(0).optional(),
  /** Produto escolhido pelo usuário em cada papel (opcional). */
  escolhas: z.record(z.string(), z.string()).default({}),
});

export type Entrada = z.infer<typeof EntradaSchema>;
export type EntradaBruta = z.input<typeof EntradaSchema>;
