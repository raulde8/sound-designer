import { pendente, referencia, type Param } from "./types";

/**
 * Parâmetros versionados do motor (versão 1).
 * Todo valor marcado como pendente_validacao é hipótese inicial da SPEC
 * e precisa de revisão por um projetista de sistemas antes do lançamento.
 * Não altere valores sem criar uma nova versão de parâmetros.
 */
export const PARAMS_VERSION_V1 = "params-v1-2026-10-29";

export type UsoParam =
  | "fala"
  | "musica_ambiente"
  | "musica_primeiro_plano"
  | "voz_violao"
  | "banda_bateria"
  | "dj"
  | "video";

export interface NivelUso {
  alvo: number;
  reserva: number;
  sub: "sim" | "opcional" | "nao";
}

const SPEC = (s: string) => `SPEC ${s}`;

export const PARAMS_V1 = {
  // ---------------- Geometria (C3) ----------------
  alturaOuvinteSentado: pendente("alturaOuvinteSentado", 1.2, SPEC("C3"), "Altura do ouvido do público sentado. Biamp usa as mesmas categorias.", "m"),
  alturaOuvinteEmPe: pendente("alturaOuvinteEmPe", 1.7, SPEC("C3"), "Altura do ouvido do público em pé.", "m"),
  passoMalha: referencia("passoMalha", 0.5, SPEC("C3"), "Passo inicial da malha de avaliação. Ajustável.", "m"),
  maxPontosMalha: referencia("maxPontosMalha", 20000, SPEC("C3/C12"), "Acima disso, o passo aumenta automaticamente."),

  // ---------------- Envelope do MVP (B5) ----------------
  envelope: pendente(
    "envelope",
    {
      areaPublicoSuportada: 600,
      distanciaSuportada: 30,
      distanciaParcial: 45,
      peDireitoMin: 2.5,
      peDireitoMax: 10,
      publicoEncaminhar: 1000,
      profundidadeAbertoEncaminhar: 45,
    },
    SPEC("B5"),
    "Limites do envelope suportado. Fora deles: parcial ou encaminhar para projetista.",
  ),
  limitesEntrada: pendente(
    "limitesEntrada",
    { peDireitoMinAbsoluto: 2.2, dimensaoMax: 100, peDireitoMaxAbsoluto: 30, areaSalaMax: 3000, profundidadePalcoMax: 15 },
    SPEC("B5") + " + decisão de implementação",
    "Entradas fora destes limites são rejeitadas com mensagem específica. Pé-direito mínimo vem da SPEC; os demais são decisão de implementação (ver docs/DECISOES.md).",
  ),
  faixasTamanho: pendente(
    "faixasTamanho",
    {
      sala_aula: { comprimento: 8, largura: 6, peDireito: 3 },
      salao_medio: { comprimento: 15, largura: 10, peDireito: 4 },
      salao_grande: { comprimento: 25, largura: 15, peDireito: 6 },
      quadra: { comprimento: 30, largura: 18, peDireito: 8 },
    },
    SPEC("B2 item 4"),
    "Valores médios usados quando o usuário não sabe as medidas. O dado fica marcado como estimado.",
    "m",
  ),
  profundidadePalcoPadrao: pendente("profundidadePalcoPadrao", 3, SPEC("B2 item 6"), "Profundidade do palco quando o usuário não informa.", "m"),
  areaPorPessoa: pendente(
    "areaPorPessoa",
    { sentado: 0.8, em_pe: 0.5, mesas: 1.5 },
    "Decisão de implementação",
    "Usado só para avisar quando o público informado não cabe na área de público. Não altera o dimensionamento.",
    "m²/pessoa",
  ),

  presetsEstabelecimento: pendente(
    "presetsEstabelecimento",
    {
      igreja: { usos: ["fala", "banda"], formacao: "varia" },
      bar: { usos: ["musica_ambiente", "banda"], formacao: "varia" },
      restaurante: { usos: ["musica_ambiente"], formacao: "voz_violao" },
      auditorio: { usos: ["fala", "video"], formacao: "voz_violao" },
      salao_eventos: { usos: ["fala", "dj"], formacao: "varia" },
      outro: { usos: ["fala", "musica_ambiente"], formacao: "voz_violao" },
    } as Record<string, { usos: string[]; formacao: string }>,
    SPEC("B2 itens 2 e 3"),
    "Usos presumidos quando o usuário responde 'não sei'. 'varia' usa o pior caso.",
  ),
  presetsPalco: pendente(
    "presetsPalco",
    {
      igreja: { vozesParadas: 2, vozesMoveis: 1, pregador: true, violao: 1, teclado: 1, baixo: 0, guitarra: 0, bateria_acustica: 0, mixagens: 2, preferencia: "monitor", operador: "voluntario", playback: true },
      bar: { vozesParadas: 2, vozesMoveis: 0, pregador: false, violao: 1, teclado: 0, baixo: 1, guitarra: 1, bateria_acustica: 1, mixagens: 2, preferencia: "monitor", operador: "ocasional", playback: true },
      restaurante: { vozesParadas: 1, vozesMoveis: 0, pregador: false, violao: 1, teclado: 0, baixo: 0, guitarra: 0, bateria_acustica: 0, mixagens: 1, preferencia: "monitor", operador: "voluntario", playback: true },
      auditorio: { vozesParadas: 2, vozesMoveis: 1, pregador: true, violao: 0, teclado: 0, baixo: 0, guitarra: 0, bateria_acustica: 0, mixagens: 0, preferencia: "monitor", operador: "ocasional", playback: true },
      salao_eventos: { vozesParadas: 1, vozesMoveis: 1, pregador: false, violao: 0, teclado: 0, baixo: 0, guitarra: 0, bateria_acustica: 0, mixagens: 1, preferencia: "monitor", operador: "ocasional", playback: true },
      outro: { vozesParadas: 1, vozesMoveis: 0, pregador: false, violao: 0, teclado: 0, baixo: 0, guitarra: 0, bateria_acustica: 0, mixagens: 1, preferencia: "monitor", operador: "voluntario", playback: true },
    } as Record<
      string,
      {
        vozesParadas: number;
        vozesMoveis: number;
        pregador: boolean;
        violao: number;
        teclado: number;
        baixo: number;
        guitarra: number;
        bateria_acustica: number;
        mixagens: number;
        preferencia: "in_ear" | "monitor";
        operador: "voluntario" | "ocasional" | "fixo";
        playback: boolean;
      }
    >,
    SPEC("B3"),
    "Respostas presumidas da trilha 2 quando o usuário responde 'não sei'. O item fica marcado como estimado.",
  ),

  // ---------------- Arquiteturas (C4) ----------------
  alturaBasePedestal: pendente("alturaBasePedestal", 2.0, SPEC("C4 AR-1 (1,8 a 2,2 m)"), "Altura da base da caixa em pedestal.", "m"),
  alturaMaxParede: pendente("alturaMaxParede", 3.5, SPEC("C4 AR-1"), "Altura máxima para parede/suspensa, limitada por peDireito - folgaTeto.", "m"),
  folgaTeto: pendente("folgaTeto", 0.3, SPEC("C4 AR-1"), "Folga mínima entre a caixa e o teto.", "m"),
  meiaAlturaCaixaPadrao: pendente("meiaAlturaCaixaPadrao", 0.3, "Decisão de implementação", "Distância da base ao centro acústico quando o produto não informa dimensões.", "m"),
  afastamentoParedeLateral: pendente(
    "afastamentoParedeLateral",
    { parede: 0.2, outras: 0.5 },
    "Decisão de implementação",
    "Distância da caixa principal até a parede lateral. Caixa de parede fica junto à parede (suporte).",
    "m",
  ),
  recuoPalco: pendente("recuoPalco", 0.5, "Decisão de implementação", "As caixas principais ficam este recuo atrás da borda do palco.", "m"),
  alcanceFrontFill: pendente(
    "alcanceFrontFill",
    3,
    "Decisão de implementação (extensão da regra de front-fill da SPEC C4 para AR-2)",
    "Quando nenhuma configuração do array cobre a partir da primeira fileira, o array cobre a partir desta profundidade e um front-fill cobre as primeiras fileiras.",
    "m",
  ),
  coberturaReferenciaArray: pendente(
    "coberturaReferenciaArray",
    { coluna: { H: 120, V: 30 }, line_array_compacto: { H: 100, V: 30 } },
    "Decisão de implementação",
    "Cobertura horizontal usada só pelo perfil genérico de vertical array. A vertical é calculada como requisito.",
    "graus",
  ),
  vMaxArrayGenerico: pendente(
    "vMaxArrayGenerico",
    40,
    "Decisão de implementação",
    "Cobertura vertical máxima assumida para o perfil genérico de vertical array. Acima disso, entra front-fill.",
    "graus",
  ),
  posicaoMicrofone: pendente(
    "posicaoMicrofone",
    { recuoBordaPalco: 0.5, altura: 1.5 },
    SPEC("C5 PAG/NAG (o microfone fica na frente do palco)"),
    "Posição do microfone para o cálculo de PAG/NAG: centro do palco, este recuo atrás da borda, nesta altura.",
    "m",
  ),
  distMaxPontual: pendente("distMaxPontual", 20, SPEC("C4 AR-1"), "Acima desta distância, gerar variante com reforço/delay.", "m"),
  coberturaReferenciaPontual: pendente(
    "coberturaReferenciaPontual",
    { H: 90, V: 60 },
    "Decisão de implementação",
    "Cobertura usada só pelo perfil genérico para desenhar o layout inicial. Os produtos reais usam a cobertura da ficha.",
    "graus",
  ),
  coberturaReferenciaFrontFill: pendente("coberturaReferenciaFrontFill", { H: 90, V: 60 }, "Decisão de implementação", "Cobertura usada no perfil genérico de front-fill.", "graus"),
  larguraPorFrontFill: pendente("larguraPorFrontFill", 8, "Decisão de implementação", "Uma caixa de front-fill a cada N metros de largura do palco.", "m"),
  faixaPrimeiraFileira: pendente("faixaPrimeiraFileira", 1.0, "Decisão de implementação", "Profundidade considerada 'primeira fileira' para o teste de front-fill.", "m"),
  tamanhoPorSplRequerido: pendente(
    "tamanhoPorSplRequerido",
    [
      { ate: 124, tamanho: 10 },
      { ate: 128, tamanho: 12 },
      { ate: 999, tamanho: 15 },
    ],
    "Decisão de implementação",
    "Sugestão do tamanho do falante no perfil genérico a partir do SPL contínuo requerido a 1 m. O requisito real é o SPL, não o tamanho.",
    "dB SPL",
  ),
  alturaCentroColunaPadrao: pendente("alturaCentroColunaPadrao", 1.5, "Decisão de implementação", "Altura do centro acústico de coluna portátil quando a tabela não informa.", "m"),
  fracaoAlturaCentroColuna: pendente(
    "fracaoAlturaCentroColuna",
    0.7,
    "Decisão de implementação",
    "Torre/coluna com altura total publicada: o centro dos alto-falantes da coluna fica nesta fração da altura.",
    "fração",
  ),
  alturaCentroArrayPadrao: pendente("alturaCentroArrayPadrao", 3.0, "Decisão de implementação", "Altura do centro acústico de line array compacto quando a tabela não informa, limitada pelo pé-direito.", "m"),
  profundidadePreferenciaArray: pendente(
    "profundidadePreferenciaArray",
    18,
    "Decisão de implementação (SPEC C10 caso 5)",
    "Acima desta profundidade da área de público, a recomendação prefere vertical array quando o formato permite.",
    "m",
  ),
  subPorLadoPadrao: pendente("subPorLadoPadrao", 1, SPEC("C4 AR-3"), "Quantidade de subwoofers por lado quando o fabricante não publica pareamento."),

  // ---------------- Cálculos (C5) ----------------
  bordaCobertura: pendente("bordaCobertura", 10, SPEC("C5"), "Ponto até este ângulo fora da cobertura nominal é 'borda'.", "graus"),
  coberturaAusente: pendente(
    "coberturaAusente",
    "usar_referencia",
    "Decisão do dono do produto (29/10/2026): recomendar os modelos do catálogo mesmo sem ângulo de cobertura publicado",
    "Quando o fabricante não publica o ângulo de cobertura, o motor usa coberturaReferenciaPontual (90° x 60°) e marca o produto como 'parcial' (nunca 'compatível').",
  ),
  splCondicaoDesconhecida: pendente(
    "splCondicaoDesconhecida",
    "tratar_como_pico",
    "Decisão de implementação (conservadora)",
    "Quando o fabricante publica o SPL máximo sem dizer se é contínuo ou de pico, o motor trata como pico (contínuo = valor - picoParaContinuo) e marca o nível como estimado.",
  ),
  picoParaContinuo: pendente("picoParaContinuo", 6, SPEC("C5"), "Estimativa: SPL contínuo = pico - este valor, quando só existe pico.", "dB"),
  foraMaxValidada: pendente(
    "foraMaxValidada",
    0.05,
    "Decisão de implementação",
    "Fração máxima da área de público fora da cobertura nominal para a geometria ser 'validada'. Acima disso: 'validada com aproximação'.",
    "fração",
  ),
  uniformidadeMax: pendente("uniformidadeMax", 6, SPEC("C5"), "Diferença máxima entre o maior e o menor nível na área coberta.", "dB"),
  toleranciaNivel: pendente("toleranciaNivel", 3, "Decisão de implementação (SPEC C5 cita 'tolerância' sem valor)", "Tolerância abaixo do alvo antes de gerar reforço/delay.", "dB"),
  velocidadeSom: referencia("velocidadeSom", 343, SPEC("C5"), "Velocidade do som a ~20 °C.", "m/s"),
  niveisPorUso: pendente<Record<UsoParam, NivelUso>>(
    "niveisPorUso",
    {
      fala: { alvo: 75, reserva: 10, sub: "nao" },
      musica_ambiente: { alvo: 70, reserva: 6, sub: "nao" },
      musica_primeiro_plano: { alvo: 85, reserva: 10, sub: "sim" },
      voz_violao: { alvo: 85, reserva: 10, sub: "opcional" },
      banda_bateria: { alvo: 95, reserva: 10, sub: "sim" },
      dj: { alvo: 98, reserva: 10, sub: "sim" },
      video: { alvo: 80, reserva: 15, sub: "opcional" },
    },
    SPEC("C5 tabela de parâmetros por uso"),
    "Nível-alvo médio contínuo no ouvinte, reserva dinâmica e regra de subwoofer. Uso misto: vale o maior alvo.",
    "dB SPL",
  ),
  ajusteRuido: pendente("ajusteRuido", { facil: 0, dificil: 5, muito_dificil: 10 }, SPEC("C5"), "Acréscimo ao nível-alvo conforme o ruído do local.", "dB"),
  tetoAlvo: pendente("tetoAlvo", 100, SPEC("C5"), "Nível-alvo máximo depois do ajuste por ruído.", "dB SPL"),
  limiarSegurancaAuditiva: pendente("limiarSegurancaAuditiva", 95, SPEC("C5"), "Acima deste alvo, mostrar aviso de segurança auditiva.", "dB SPL"),

  reverberacao: pendente(
    "reverberacao",
    {
      superficies: { duras: 2, mistas: 1, absorventes: 0 },
      palma: { sim: 2, um_pouco: 1, nao: 0 },
      volumeLimiar: 1500,
      pontosVolume: 1,
      classes: { baixoAte: 1, medioAte: 3 },
    },
    SPEC("C5 classe de reverberação"),
    "Pontuação qualitativa. 0-1 baixo, 2-3 médio, 4-5 alto. Não calcula RT60.",
  ),

  pagNag: pendente(
    "pagNag",
    { dsMao: 0.15, dsGooseneck: 0.3, fsm: 6, margemBaixo: 3, margemModerado: 0 },
    SPEC("C5 PAG/NAG"),
    "Distância falante-microfone, margem de estabilidade (FSM) e faixas de risco.",
    "m / dB",
  ),

  // ---------------- Palco (C6) ----------------
  canaisPorInstrumento: pendente(
    "canaisPorInstrumento",
    {
      violao: 1,
      guitarra: 1,
      baixo: 1,
      teclado: 2,
      bateria_eletronica: 2,
      bateria_acustica_basico: 4,
      bateria_acustica_completo: 7,
      sopro: 1,
      outros: 1,
      playback: 2,
      celular: 2,
      dj: 2,
      video: 2,
    },
    SPEC("C6 contagem de entradas"),
    "Canais por fonte. Tabela editável.",
  ),
  diPorInstrumento: pendente(
    "diPorInstrumento",
    { violao: 1, guitarra: 0, baixo: 1, teclado: 2, bateria_eletronica: 2, playback: 0, celular: 0, dj: 0, video: 0 },
    SPEC("C6"),
    "Direct boxes por fonte. Guitarra usa microfone no amplificador. Fontes de linha entram direto na mesa.",
  ),
  reservaCanais: pendente("reservaCanais", 0.2, SPEC("C6"), "Reserva de canais sobre a soma.", "fração"),
  tamanhosMesaPadrao: pendente("tamanhosMesaPadrao", [4, 6, 8, 12, 16, 18, 24, 32, 40, 48, 64], "Decisão de implementação", "Tamanhos de mesa usados quando o catálogo não tem mesas.", "canais"),
  regraMesa: pendente(
    "regraMesa",
    { digitalAuxAcima: 4, digitalInEarsMin: 2, digitalCanaisAcima: 16, analogicaCanaisAte: 12, analogicaAuxAte: 2 },
    SPEC("C6 recomendação de mesa"),
    "Limiares da regra analógica/digital.",
  ),
  limiarCoordenacao: pendente("limiarCoordenacao", 4, SPEC("C6 RF"), "Acima deste número de canais sem fio: distribuidor de antenas e coordenação.", "canais"),
  limiarEspecialista: pendente("limiarEspecialista", 12, SPEC("C6 RF"), "Acima deste número de canais sem fio: encaminhar para especialista em RF.", "canais"),
  faixaRfEvitar: pendente("faixaRfEvitar", { minMHz: 698, maxMHz: 806 }, SPEC("C6 RF / fontes Anatel"), "Faixa destinada à telefonia móvel. Texto exato do Ato vigente a confirmar.", "MHz"),
  comprimentosCabo: referencia("comprimentosCabo", [5, 10, 15, 20, 30], SPEC("C6 acessórios"), "Comprimentos comerciais.", "m"),
  folgaCabo: pendente("folgaCabo", 0.2, SPEC("C6 acessórios"), "Folga sobre a distância medida na planta.", "fração"),
  limiarMulticabo: pendente("limiarMulticabo", 8, SPEC("C6 acessórios"), "Sugerir multicabo acima deste número de cabos no trajeto palco-mesa.", "cabos"),
  phantomBateriaAcustica: pendente("phantomBateriaAcustica", true, "Decisão de implementação", "Kit de bateria com overheads condensadores exige phantom power."),

  // ---------------- Seleção (C8) ----------------
  margemNivelMaxRanking: pendente("margemNivelMaxRanking", 6, SPEC("C8"), "Margem de nível acima do alvo que ainda soma pontos no ranking.", "dB"),
  pesoMaxPorMontagem: pendente(
    "pesoMaxPorMontagem",
    { pedestal: 30, parede: 40, suspensa: 60, chao: 999 },
    "Decisão de implementação",
    "Peso máximo de uma caixa por tipo de montagem. Não é dimensionamento estrutural.",
    "kg",
  ),
  validadeFaixaDias: referencia("validadeFaixaDias", 90, SPEC("C7"), "Validade da faixa de investimento.", "dias"),
} as const;

export type ParamsV1 = typeof PARAMS_V1;

/** Lista plana de todos os parâmetros, útil para documentação e UI. */
export function listarParams(p: ParamsV1): Param<unknown>[] {
  return Object.values(p) as Param<unknown>[];
}
