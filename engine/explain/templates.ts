/**
 * Templates de texto (SPEC C9). Placeholders: {nome}. Sem IA: o texto final é
 * sempre um destes templates com valores do cálculo.
 */
export const TEMPLATES = {
  arquitetura: "Recomendação: {nomeSimples}. {motivo}",
  caixas: "{lista}. A quantidade sai da regra da arquitetura {arq} e do recálculo com {fonte}.",
  caixa:
    "Caixa {numero} ({papel}): {montagem}, centro acústico a {z} m de altura, em x = {x} m e y = {y} m. Direção: {yaw}° na horizontal (0° = para o fundo) e {pitch}° na vertical.",
  caixaMira: "A direção horizontal mira o centro da última fileira; a inclinação mira 2/3 da profundidade da área de público.",
  nivelAlvo: "Nível-alvo médio de {alvo} dB SPL no ouvinte, com reserva dinâmica de {reserva} dB. A caixa precisa entregar {requerido} dB na área coberta.",
  nivelAlvoMisto: "Uso misto: vale o maior nível-alvo entre os usos ({dominante}).",
  ruido: "Ajuste por ruído do local: +{ajuste} dB.",
  ruidoNaoSei: "Você não informou o ruído do local. O sistema usou a opção do meio (+{ajuste} dB).",
  teto: "O alvo foi limitado ao teto de {teto} dB.",
  segurancaAuditiva: "Atenção: nível acima de {limiar} dB. Exposição longa pode causar dano auditivo. Controle o volume e o tempo de exposição.",
  cobertura: "{coberto}% da área de público fica dentro da cobertura nominal, {borda}% na borda e {fora}% fora.",
  rotuloCobertura: "Cobertura nominal declarada pelo fabricante. Aproximação geométrica, não é medição.",
  capacidadeValidada: "Capacidade sonora validada com dados do fabricante: nível mínimo calculado {min} dB, requerido {requerido} dB.",
  capacidadePendente: "Validação de capacidade sonora pendente: {motivo}",
  capacidadeInsuficiente: "Capacidade sonora insuficiente: {motivo}",
  capacidadeGenerica: "Requisito de nível calculado: a caixa precisa de SPL contínuo de pelo menos {spl} dB a 1 m. A validação depende do produto.",
  geometriaDisponivel: "Recomendação geométrica disponível.",
  geometriaAprox: "Recomendação geométrica disponível, com aproximação.",
  geometriaFora: "O ambiente tem partes fora do modelo. A geometria calculada vale só para o retângulo principal.",
  requisitos: "Características mínimas de cada caixa principal: {lista}.",
  produtos: "{n} produto(s) do catálogo avaliado(s): {compat} compatível(is), {parcial} parcial(is), {incompat} incompatível(is), {naoAval} não avaliável(is).",
  semProduto: "Nenhum modelo do nosso catálogo verificado atende a este requisito.",
  ranking: "Ordem: (1) status de compatibilidade, (2) menos caixas, (3) maior margem de nível até +{margem} dB, (4) menor faixa de investimento. Nenhuma marca recebe bônus.",
  subRecomendado: "Subwoofer recomendado: o uso inclui {motivo}.",
  subOpcional: "Subwoofer opcional para este uso.",
  subNao: "Subwoofer não recomendado para fala e música ambiente.",
  subQtd: "{porLado} por lado ({origem}), no chão, ao lado das caixas principais.",
  graves: "O comportamento dos graves depende da sala. Ajuste no local.",
  reforco: "Par de reforço em y = {y} m. Atraso de referência: {ms} ms ({dist} m / {vel} m/s). Referência inicial. O valor final é ajustado com medição no local.",
  frontFill: "Front-fill na boca do palco: a cobertura horizontal nominal das caixas principais não alcança as laterais da primeira fileira.",
  reverbAlto:
    "O ambiente tende a ser reverberante. Mais potência não resolve isso: priorize caixas com cobertura controlada e mire as caixas no público, não nas paredes. Tratamento acústico pode ser necessário.",
  reverbMedio: "Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.",
  reverbBaixo: "Baixo risco de reverberação excessiva.",
  reverbNaoSei: "Você respondeu 'não sei' em pergunta de acústica. O sistema usou a classe média.",
  reverbNaoAplica: "A classe de reverberação só vale para ambiente fechado.",
  pagNag: "PAG {pag} dB, NAG {nag} dB, margem {margem} dB: risco {risco} de microfonia.",
  pagNagTexto: "Estimativa simplificada (lei do inverso do quadrado). Não substitui teste no local.",
  investimento: "Investimento estimado em equipamentos: {min} a {max} (referência de mercado em {ref}, sem instalação).",
  investimentoIncompleto: "Sem faixa vigente para: {itens}.",
  semFaixa: "Sem faixa de investimento vigente no catálogo.",
  escopoSuportado: "O ambiente está dentro do envelope do MVP.",
  escopoParcial: "Atendido parcialmente: {itens}",
  escopoEncaminhar: "Caso para projetista: {itens}",
  palcoEntradas: "{total} canais ({mic} de microfone). Com {reserva}% de reserva: {comReserva}. Mesa de {tamanho} canais.",
  palcoMesa: "{tipo}. {motivos}",
  palcoMic: "{lista}.",
  palcoRetorno: "{mix} mixagem(ns): {inEar} in-ear e {monitor} monitor de chão.",
  palcoRf: "{canais} canal(is) sem fio. {nivel}",
  palcoAcessorios: "Cabos com comprimento medido na planta (mesa {mesa}) + {folga}% de folga, arredondado para {comp} m.",
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function render(id: TemplateId, vars: Record<string, string | number> = {}): string {
  return TEMPLATES[id].replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Número em formato brasileiro. */
export function fmt(v: number, casas = 1): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
