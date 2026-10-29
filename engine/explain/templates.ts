/**
 * Templates de texto (SPEC C9), em linguagem simples para quem não é técnico.
 * Placeholders: {nome}. Sem IA: o texto final é sempre um destes templates com valores do cálculo.
 */
export const TEMPLATES = {
  arquitetura: "Recomendamos {nomeSimples}. {motivo}",
  caixas: "Você vai precisar de: {lista}. A quantidade sai do tamanho da sala e foi conferida com {fonte}.",
  caixa:
    "Caixa {numero} ({papel}), {montagem}. Altura: {z} m do chão até o centro da caixa. Posição: {x} m da parede lateral e {y} m da parede do palco. Direção: {yaw}° para o lado e {pitch}° para baixo.",
  caixaMira: "Ela aponta para o centro da última fileira e fica levemente inclinada para baixo, mirando o público e não as paredes.",
  nivelAlvo: "Para este uso, o som precisa chegar a cerca de {alvo} dB em quem está sentado, com folga de {reserva} dB para os momentos mais fortes. Ou seja, a caixa precisa entregar {requerido} dB na área do público.",
  nivelAlvoMisto: "Como o local tem mais de um uso, valeu o mais exigente ({dominante}).",
  ruido: "Somamos {ajuste} dB por causa do barulho do local.",
  ruidoNaoSei: "Você não informou se o local é barulhento. Consideramos um meio-termo (+{ajuste} dB).",
  teto: "Limitamos o volume a {teto} dB, por segurança.",
  segurancaAuditiva: "Atenção: acima de {limiar} dB, ficar muito tempo exposto pode prejudicar a audição. Controle o volume e o tempo.",
  cobertura: "O som chega bem em {coberto}% da área do público, mais fraco em {borda}% e fica fora do alcance principal em {fora}%.",
  rotuloCobertura: "A área vem do ângulo que o fabricante declara para a caixa. É uma conta de geometria, não uma medição.",
  capacidadeValidada: "O volume é suficiente pelos dados do fabricante: no ponto mais distante chega a {min} dB e o necessário é {requerido} dB.",
  capacidadeEstimada: "Pela estimativa, {motivo}",
  capacidadePendente: "Ainda não dá para confirmar o volume: {motivo}",
  capacidadeInsuficiente: "O volume não é suficiente: {motivo}",
  capacidadeGenerica: "A caixa precisa fazer pelo menos {spl} dB a 1 metro (volume contínuo). Quando escolher o modelo, confira esse número.",
  geometriaDisponivel: "A posição das caixas está calculada.",
  geometriaAprox: "A posição das caixas está calculada, com aproximação.",
  geometriaFora: "Parte do ambiente fica fora do que o sistema calcula. As posições valem para a parte retangular principal.",
  requisitos: "O que a caixa principal precisa ter: {lista}.",
  produtos: "Avaliamos {n} modelo(s): {compat} atende(m), {parcial} atende(m) com dados a confirmar, {incompat} não atende(m) e {naoAval} sem dados suficientes.",
  semProduto: "Nenhum modelo do nosso catálogo atende a este requisito.",
  ranking: "A ordem segue só critérios técnicos: (1) se atende, (2) menos caixas, (3) mais folga de volume (até +{margem} dB), (4) menor investimento. Nenhuma marca ganha ponto extra.",
  subRecomendado: "Recomendamos subwoofer porque o uso inclui {motivo}, que pede grave forte.",
  subOpcional: "O subwoofer é opcional para este uso: ajuda na música, mas não é essencial.",
  subNao: "Não precisa de subwoofer para fala e música ambiente.",
  subQtd: "{porLado} por lado ({origem}), no chão, ao lado das caixas principais.",
  graves: "O grave se comporta diferente em cada sala: ajuste no local.",
  reforco: "Para quem senta longe, colocamos um segundo par de caixas a {y} m do palco. Atraso inicial sugerido: {ms} ms. Esse valor é só um ponto de partida e deve ser ajustado no local.",
  frontFill: "As primeiras fileiras ficam muito perto e fora do ângulo das caixas principais. Por isso entra uma caixa de apoio na beira do palco.",
  reverbAlto:
    "A sala tende a ter muito eco. Aumentar o volume não resolve: prefira caixas que mandam o som para o público (como colunas), aponte as caixas para as pessoas e não para as paredes. Cortinas, tapetes ou painéis podem ser necessários.",
  reverbMedio: "A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.",
  reverbBaixo: "A sala tem pouco eco. Bom para a voz ficar clara.",
  reverbNaoSei: "Você respondeu “não sei” em alguma pergunta sobre a sala; consideramos um meio-termo.",
  reverbNaoAplica: "A avaliação de eco só vale para ambientes fechados.",
  pagNag: "Risco de microfonia (apito): {risco}. Folga calculada de {margem} dB.",
  pagNagTexto: "É uma estimativa simples, pelas distâncias. Teste sempre no local.",
  investimento: "Investimento estimado em equipamentos: {min} a {max} (referência de preço de {ref}, sem instalação).",
  investimentoIncompleto: "Sem referência de preço para: {itens}.",
  semFaixa: "Sem referência de preço válida no catálogo.",
  escopoSuportado: "O seu espaço está dentro do que o sistema calcula.",
  escopoParcial: "Atendido em parte: {itens}",
  escopoEncaminhar: "Este caso precisa de um projetista de som: {itens}",
  palcoEntradas: "Vocês vão usar {total} canais na mesa ({mic} de microfone ou direct box). Com folga de {reserva}%: {comReserva}. Mesa sugerida: {tamanho} canais ou mais.",
  palcoMesa: "{tipo}. {motivos}",
  palcoMic: "{lista}.",
  palcoRetorno: "{mix} músico(s) com retorno próprio: {inEar} com fone (in-ear) e {monitor} com caixa no chão.",
  palcoRf: "{canais} aparelho(s) sem fio. {nivel}",
  palcoAcessorios: "Medimos na planta a distância da mesa ({mesa}) até cada ponto, somamos {folga}% de folga e arredondamos para os tamanhos de cabo vendidos ({comp} m).",
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export function render(id: TemplateId, vars: Record<string, string | number> = {}): string {
  return TEMPLATES[id].replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Número em formato brasileiro. */
export function fmt(v: number, casas = 1): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
