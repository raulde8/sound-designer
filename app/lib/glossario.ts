/**
 * Glossário em linguagem simples, usado nos "ⓘ" da interface.
 * Base: Dicionário do Som ao Vivo (material de treinamento fornecido pelo dono do produto) e SPEC.
 */
export interface Termo {
  termo: string;
  simples: string;
  /** Explicação mais longa, opcional. */
  mais?: string;
}

export const GLOSSARIO: Record<string, Termo> = {
  pa: {
    termo: "Caixas principais (PA)",
    simples: "As caixas que o público ouve. Ficam na frente, uma de cada lado do palco.",
    mais: "No mercado se chama PA. Na igreja muita gente chama só de 'as caixas de som'.",
  },
  caixaAtiva: { termo: "Caixa ativa", simples: "Caixa de som com amplificador dentro. Basta ligar na tomada e no cabo de sinal." },
  coluna: {
    termo: "Coluna / vertical array",
    simples: "Caixa alta e fina, com vários alto-falantes pequenos em fila. Leva o som mais longe e espalha menos nas paredes.",
    mais: "No mercado também se chama line array ou torre. A parte de baixo costuma ter um alto-falante de graves.",
  },
  subwoofer: { termo: "Subwoofer", simples: "Caixa só para o grave mais baixo (bumbo, baixo, DJ). Fica no chão." },
  retorno: { termo: "Retorno (monitor)", simples: "Caixa virada para quem está no palco, para o músico se ouvir." },
  inEar: { termo: "Fone de retorno (in-ear)", simples: "Fone no ouvido no lugar da caixa de retorno. Deixa o palco mais silencioso." },
  frontFill: {
    termo: "Caixa de apoio da frente",
    simples: "Caixa pequena na beira do palco para as primeiras fileiras, que ficam muito perto e abaixo das caixas principais.",
    mais: "No mercado se chama front-fill.",
  },
  delay: {
    termo: "Caixas de apoio no meio do salão",
    simples: "Um segundo par de caixas mais para o fundo, para o som chegar bem em quem senta longe.",
    mais: "No mercado se chama caixa de delay. Ela recebe um pequeno atraso para o som dela chegar junto com o som da frente.",
  },
  atraso: { termo: "Atraso (delay)", simples: "O tempo, em milésimos de segundo, que se dá à caixa de apoio para o som chegar junto com o da frente. O valor final é ajustado no local." },
  cobertura: { termo: "Cobertura", simples: "A área que a caixa alcança bem. Fora dela o som fica mais fraco e abafado." },
  db: { termo: "dB (decibel)", simples: "A unidade de volume. +6 dB parece bem mais alto; +10 dB parece o dobro." },
  volumeMaximo: {
    termo: "Volume máximo (SPL)",
    simples: "O volume mais alto que a caixa consegue fazer, medido a 1 metro dela.",
    mais: "Alguns fabricantes informam o pico (o momento mais alto) e outros o volume contínuo. Quando a ficha não diz qual é, tratamos como pico, por segurança.",
  },
  reserva: { termo: "Folga de volume (reserva)", simples: "Volume extra para os momentos mais fortes (refrão, bateria). Sem folga, o som distorce." },
  microfonia: { termo: "Microfonia", simples: "O apito: o som da caixa volta para o microfone e vira um assobio." },
  pagnag: {
    termo: "Risco de microfonia",
    simples: "Uma conta simples que compara as distâncias entre quem fala, o microfone, as caixas e o público.",
    mais: "Técnicos chamam de PAG/NAG (ganho disponível x ganho necessário). É uma estimativa, não substitui o teste no local.",
  },
  reverberacao: { termo: "Reverberação (eco da sala)", simples: "O som que continua soando na sala depois que a pessoa parou de falar. Paredes lisas e duras aumentam." },
  mesa: { termo: "Mesa de som", simples: "Onde todos os microfones e instrumentos se juntam e se ajusta o volume de cada um." },
  mesaDigital: { termo: "Mesa digital", simples: "Mesa que guarda os ajustes (cenas) e pode ser controlada pelo tablet." },
  mesaAnalogica: { termo: "Mesa analógica", simples: "Mesa com botões físicos para tudo. Mais fácil para quem está começando." },
  canal: { termo: "Canal", simples: "Cada entrada da mesa, com seus próprios controles. Um microfone usa um canal." },
  aux: { termo: "Auxiliar (AUX)", simples: "Saída da mesa para mandar uma mistura diferente, por exemplo para o retorno de um músico." },
  di: { termo: "Direct box (DI)", simples: "Pequena caixa que adapta violão, baixo ou teclado para a entrada de microfone da mesa." },
  phantom: { termo: "+48 V (phantom power)", simples: "Energia que a mesa manda pelo cabo para microfones condensadores (os sensíveis, como os de prato da bateria)." },
  condensador: { termo: "Microfone condensador", simples: "Microfone sensível, que pega detalhes. Precisa de +48 V." },
  dinamico: { termo: "Microfone dinâmico", simples: "Microfone robusto, sem energia. O mais indicado para voz em igreja e palco." },
  semFio: { termo: "Microfone sem fio", simples: "Microfone que transmite por rádio para um receptor ligado à mesa." },
  headset: { termo: "Headset", simples: "Microfone preso na cabeça, com a cápsula perto da boca. Deixa as mãos livres para quem prega." },
  anatel: { termo: "Homologação Anatel", simples: "Selo que mostra que o aparelho sem fio pode ser usado legalmente no Brasil." },
  rf: { termo: "Frequência de rádio (RF)", simples: "O 'canal de rádio' que o sem fio usa. Dois aparelhos no mesmo canal se atrapalham." },
  xlr: { termo: "Cabo XLR", simples: "Cabo de microfone, com conector de 3 pinos e trava." },
  multicabo: { termo: "Multicabo", simples: "Um cabo grosso com vários cabos dentro, do palco até a mesa." },
  inputList: { termo: "Lista de canais (input list)", simples: "A lista do que entra em cada canal da mesa. Ajuda a montar e a achar problemas rápido." },
  passagem: { termo: "Passagem de som", simples: "O ajuste de tudo antes do culto ou evento, com os músicos tocando." },
  linecheck: { termo: "Teste de canais (line check)", simples: "Testar cada canal, um por um, antes da passagem de som." },
  perfilGenerico: {
    termo: "Perfil genérico",
    simples: "Uma descrição do que a caixa precisa ter, sem marca. Aparece quando nenhum modelo do catálogo atende.",
  },
  estimado: {
    termo: "Dado estimado",
    simples: "Informação que o fabricante não publicou. Usamos um valor de referência e mostramos isso para você conferir.",
  },
  parametroPendente: {
    termo: "Valor a revisar por especialista",
    simples: "Um número de referência usado na conta que ainda vai ser revisado por um projetista de som.",
  },
};
