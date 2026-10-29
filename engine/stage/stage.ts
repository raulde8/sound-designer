import { campoPresente, FICHA_MINIMA } from "../../catalog/ficha";
import { perfilGenerico } from "../../catalog/generic-profiles";
import type { CatalogSnapshot, Product } from "../../catalog/schema";
import type { Configuracao, Requisito } from "../architectures/types";
import type { CasoPreparado } from "../context";
import { dist2 } from "../geometry/vec";
import type { Trilha2 } from "../input/schema";
import type { Params } from "../params";
import { ORDEM_STATUS, produtosElegiveis, type StatusCompat } from "../selection/compat";
import { faixaDoProduto } from "../selection/investimento";
import { nomeProduto } from "../selection/nome";
import type { CandidatoMesa, ItemPalco, LinhaEntrada, ResultadoPalco } from "./types";

interface Respostas {
  vozesParadas: number;
  vozesMoveis: number;
  tipoSemFio: "mao" | "headset" | "lapela";
  pregador: boolean;
  instrumentos: Record<"violao" | "guitarra" | "baixo" | "teclado" | "bateria_acustica" | "bateria_eletronica" | "sopro" | "outros", number>;
  kitBateria: "basico" | "completo";
  fontes: { playback: boolean; celular: boolean; dj: boolean; video: boolean };
  mixagens: number;
  preferencia: "in_ear" | "monitor" | "misto";
  mixagensInEar?: number;
  musicosInEar?: number;
  operador: "voluntario" | "ocasional" | "fixo";
  controleRemoto: boolean;
  estimados: string[];
}

/** Resolve "não sei" com o preset do estabelecimento (SPEC B3). */
export function resolverRespostas(t: Trilha2, tipo: string, params: Params): Respostas {
  const pr = params.presetsPalco.valor[tipo] ?? params.presetsPalco.valor["outro"]!;
  const est: string[] = [];
  const v = t.vozes === "nao_sei" ? (est.push("vozes"), { paradas: pr.vozesParadas, moveis: pr.vozesMoveis, tipoSemFio: "mao" as const, pregador: pr.pregador }) : t.vozes;
  const zero = { violao: 0, guitarra: 0, baixo: 0, teclado: 0, bateria_acustica: 0, bateria_eletronica: 0, sopro: 0, outros: 0 };
  const ins =
    t.instrumentos === "nao_sei"
      ? (est.push("instrumentos"), { ...zero, violao: pr.violao, teclado: pr.teclado, baixo: pr.baixo, guitarra: pr.guitarra, bateria_acustica: pr.bateria_acustica, kitBateria: "basico" as const })
      : t.instrumentos;
  const f = t.outrasFontes === "nao_sei" ? (est.push("outras fontes"), { playback: pr.playback, celular: false, dj: false, video: false }) : t.outrasFontes;
  const r = t.retorno === "nao_sei" ? (est.push("retorno"), { mixagens: pr.mixagens, preferencia: pr.preferencia }) : t.retorno;
  const o = t.operacao === "nao_sei" ? (est.push("operação"), { operador: pr.operador, controleRemoto: false }) : t.operacao;
  const { kitBateria, ...instrumentos } = ins;
  return {
    vozesParadas: v.paradas,
    vozesMoveis: v.moveis,
    tipoSemFio: v.tipoSemFio,
    pregador: v.pregador,
    instrumentos,
    kitBateria,
    fontes: f,
    mixagens: r.mixagens,
    preferencia: r.preferencia,
    ...("mixagensInEar" in r && r.mixagensInEar !== undefined ? { mixagensInEar: r.mixagensInEar } : {}),
    ...("musicosInEar" in r && r.musicosInEar !== undefined ? { musicosInEar: r.musicosInEar } : {}),
    operador: o.operador,
    controleRemoto: o.controleRemoto,
    estimados: est,
  };
}

/** Arredonda para o próximo comprimento comercial (SPEC C6). Acima do maior, devolve undefined. */
export function comprimentoComercial(distancia: number, folga: number, comprimentos: number[]): number | undefined {
  const alvo = distancia * (1 + folga);
  return [...comprimentos].sort((a, b) => a - b).find((c) => c >= alvo - 1e-9);
}

function item(id: string, descricao: string, quantidade: number, p: Product | undefined, genId: string, estimado: boolean, detalhe?: string): ItemPalco {
  return {
    id,
    descricao,
    quantidade,
    ref: p ? p.id : genId,
    nome: p ? nomeProduto(p) : perfilGenerico(genId).nome,
    tipo: p ? "produto" : "generico",
    estimado,
    ...(detalhe ? { detalhe } : {}),
  };
}

function primeiro(cat: CatalogSnapshot, categoria: Product["categoria"], pred: (p: Product) => boolean = () => true): Product | undefined {
  return produtosElegiveis(cat, categoria).find(pred);
}

export function calcularPalco(t: Trilha2, ctx: CasoPreparado, cfg: Configuracao | null, cat: CatalogSnapshot, data: string): ResultadoPalco {
  const { params, caso } = ctx;
  const R = resolverRespostas(t, caso.tipo, params);
  const est = (k: string) => R.estimados.includes(k);
  const tab = params.canaisPorInstrumento.valor;
  const diTab = params.diPorInstrumento.valor;
  const avisos: string[] = [];

  // ---------------- Vozes ----------------
  // Voz que anda, ou pregador: sem fio. Voz parada: microfone de mão dinâmico com fio.
  const pregadorDeParadas = R.pregador && R.vozesMoveis === 0;
  const vozesSemFio = R.vozesMoveis + (pregadorDeParadas ? 1 : 0);
  const vozesComFio = Math.max(0, R.vozesParadas - (pregadorDeParadas && R.vozesParadas > 0 ? 1 : 0));

  // ---------------- Entradas (SPEC C6) ----------------
  const entradas: LinhaEntrada[] = [];
  const add = (fonte: string, quantidade: number, cpu: number, mic: boolean, di: number) => {
    if (quantidade <= 0) return;
    entradas.push({ fonte, quantidade, canaisPorUnidade: cpu, canais: quantidade * cpu, canaisMic: mic ? quantidade * cpu : 0, di: quantidade * di });
  };
  add("Voz (com fio)", vozesComFio, 1, true, 0);
  add("Voz (sem fio)", vozesSemFio, 1, true, 0);
  const I = R.instrumentos;
  // Direct box entra na entrada de microfone da mesa.
  add("Violão", I.violao, tab.violao, true, diTab.violao);
  add("Guitarra (microfone no amplificador)", I.guitarra, tab.guitarra, true, diTab.guitarra);
  add("Baixo", I.baixo, tab.baixo, true, diTab.baixo);
  add("Teclado (estéreo)", I.teclado, tab.teclado, true, diTab.teclado);
  add(`Bateria acústica (kit ${R.kitBateria === "completo" ? "completo" : "básico"})`, I.bateria_acustica, R.kitBateria === "completo" ? tab.bateria_acustica_completo : tab.bateria_acustica_basico, true, 0);
  add("Bateria eletrônica (estéreo)", I.bateria_eletronica, tab.bateria_eletronica, true, diTab.bateria_eletronica);
  add("Sopro", I.sopro, tab.sopro, true, 0);
  add("Outros instrumentos", I.outros, tab.outros, true, 0);
  add("Computador/playback", R.fontes.playback ? 1 : 0, tab.playback, false, 0);
  add("Celular", R.fontes.celular ? 1 : 0, tab.celular, false, 0);
  add("Controladora de DJ", R.fontes.dj ? 1 : 0, tab.dj, false, 0);
  add("Vídeo", R.fontes.video ? 1 : 0, tab.video, false, 0);
  const totalCanais = entradas.reduce((s, e) => s + e.canais, 0);
  const canaisMic = entradas.reduce((s, e) => s + e.canaisMic, 0);
  const totalDi = entradas.reduce((s, e) => s + e.di, 0);
  const canaisComReserva = Math.ceil(totalCanais * (1 + params.reservaCanais.valor) - 1e-9);
  const mesas = produtosElegiveis(cat, "mesa");
  const tamanhosCat = [...new Set(mesas.map((m) => m.especificacoes.entradasTotais?.valor).filter((v): v is number => typeof v === "number"))].sort((a, b) => a - b);
  const tamanhos = tamanhosCat.length > 0 ? tamanhosCat : params.tamanhosMesaPadrao.valor;
  const tamanhoMesa = tamanhos.find((x) => x >= canaisComReserva) ?? canaisComReserva;
  if (tamanhosCat.length > 0 && !tamanhosCat.some((x) => x >= canaisComReserva)) avisos.push(`Nenhuma mesa do catálogo tem ${canaisComReserva} entradas.`);

  // ---------------- Mixagens ----------------
  const mixInEar = R.preferencia === "in_ear" ? R.mixagens : R.preferencia === "monitor" ? 0 : Math.min(R.mixagens, R.mixagensInEar ?? Math.ceil(R.mixagens / 2));
  const mixMonitor = R.mixagens - mixInEar;
  const receptores = mixInEar > 0 ? Math.max(mixInEar, R.musicosInEar ?? mixInEar) : 0;
  // In-ear estéreo conta 2 aux mono, ou 1 aux estéreo se a mesa declarar.
  const auxEquivalente = mixMonitor + 2 * mixInEar;
  const phantom = I.bateria_acustica > 0 && params.phantomBateriaAcustica.valor;

  // ---------------- Regra analógica/digital ----------------
  const rm = params.regraMesa.valor;
  const motivosDigital: string[] = [];
  if (auxEquivalente > rm.digitalAuxAcima) motivosDigital.push(`${auxEquivalente} auxiliares necessários (mais de ${rm.digitalAuxAcima})`);
  if (receptores >= rm.digitalInEarsMin) motivosDigital.push(`${receptores} músicos com in-ear`);
  if (canaisComReserva > rm.digitalCanaisAcima) motivosDigital.push(`${canaisComReserva} canais (mais de ${rm.digitalCanaisAcima})`);
  if (R.controleRemoto) motivosDigital.push("controle pelo celular/tablet pedido");
  if (caso.formacao?.valor === "varia") motivosDigital.push("uso com troca frequente de formação");
  const analogica = canaisComReserva <= rm.analogicaCanaisAte && auxEquivalente <= rm.analogicaAuxAte && R.operador === "voluntario" && !R.controleRemoto;
  const tipoMesa: "analogica" | "digital" | "ambas" = motivosDigital.length > 0 ? "digital" : analogica ? "analogica" : "ambas";
  const motivos =
    tipoMesa === "digital"
      ? motivosDigital.map((m) => `Digital porque: ${m}.`)
      : tipoMesa === "analogica"
        ? [`Analógica: até ${rm.analogicaCanaisAte} canais, até ${rm.analogicaAuxAte} auxiliares, operador voluntário e sem controle remoto.`]
        : ["Faixa intermediária: as duas opções atendem."];
  const vantagens =
    tipoMesa === "analogica"
      ? ["Controles físicos visíveis.", "Curva de aprendizado curta para o operador voluntário."]
      : tipoMesa === "ambas"
        ? ["Analógica: controles físicos visíveis e aprendizado rápido.", "Digital: cenas salvas, mais auxiliares e processamento interno; exige mais treino."]
        : ["Cenas salvas para cada formação.", "Mais mixagens de retorno e processamento interno."];

  const requisitosMesa: Requisito[] = [
    { campo: "alcance", operador: ">=", valor: canaisMic, unidade: "entradas", texto: `Entradas de microfone: pelo menos ${canaisMic}` },
    { campo: "alcance", operador: ">=", valor: canaisComReserva, unidade: "entradas", texto: `Entradas totais: pelo menos ${canaisComReserva} (com ${Math.round(params.reservaCanais.valor * 100)}% de reserva)` },
    { campo: "alcance", operador: ">=", valor: auxEquivalente, unidade: "aux", texto: `Auxiliares: ${mixMonitor} mono${mixInEar > 0 ? ` + ${mixInEar} estéreo (ou ${2 * mixInEar} mono) para in-ear` : ""}` },
    ...(phantom ? [{ campo: "alcance" as const, operador: "em" as const, valor: "sim", unidade: "", texto: "Phantom power (microfones condensadores da bateria)" }] : []),
    ...(R.controleRemoto ? [{ campo: "alcance" as const, operador: "em" as const, valor: "sim", unidade: "", texto: "Controle remoto por celular/tablet" }] : []),
  ];

  const candidatosMesa: CandidatoMesa[] = mesas
    .map((m): CandidatoMesa => {
      const e = m.especificacoes;
      const faltando = FICHA_MINIMA.mesa.outros.filter((c) => !campoPresente(m, c));
      const viol: string[] = [];
      const tipo = e.tipoMesa?.valor ?? m.subcategoria;
      if (tipoMesa !== "ambas" && tipo && tipo !== tipoMesa) viol.push(`Mesa ${tipo}; a regra indica ${tipoMesa}.`);
      if (e.entradasMic && e.entradasMic.valor < canaisMic) viol.push(`${e.entradasMic.valor} entradas de microfone (precisa de ${canaisMic}).`);
      if (e.entradasTotais && e.entradasTotais.valor < canaisComReserva) viol.push(`${e.entradasTotais.valor} entradas totais (precisa de ${canaisComReserva}).`);
      if (e.auxMono && e.auxEstereo) {
        const est = Math.min(e.auxEstereo.valor, mixInEar);
        const monoNec = mixMonitor + 2 * (mixInEar - est);
        if (e.auxMono.valor < monoNec) viol.push(`Auxiliares insuficientes para ${R.mixagens} mixagem(ns).`);
      }
      if (phantom && e.phantom && !e.phantom.valor) viol.push("Sem phantom power.");
      if (R.controleRemoto && e.controleRemoto && !e.controleRemoto.valor) viol.push("Sem controle remoto.");
      const status: StatusCompat = viol.length > 0 ? "incompativel" : faltando.length > 0 ? "parcial" : "compativel";
      const faixa = faixaDoProduto(cat, "mesa", m.subcategoria, m.porte, data);
      return {
        produtoId: m.id,
        nome: nomeProduto(m),
        marca: m.marca,
        tipo: tipo ?? "",
        status,
        motivos: [...viol, ...(faltando.length ? [`Falta na ficha: ${faltando.join(", ")}.`] : [])],
        ...(faixa ? { faixa } : {}),
      };
    })
    .sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] || (a.faixa?.minimo ?? Infinity) - (b.faixa?.minimo ?? Infinity) || a.produtoId.localeCompare(b.produtoId));
  const escolhida = candidatosMesa.find((m) => m.status === "compativel" || m.status === "parcial") ?? null;

  // ---------------- Microfones ----------------
  const microfones: ItemPalco[] = [];
  const micFio = primeiro(cat, "microfone_com_fio", (p) => p.subcategoria === "dinamico");
  if (vozesComFio > 0) microfones.push(item("voz-fio", "Microfone de mão com fio para voz parada", vozesComFio, micFio, "GEN-MIC-FIO", est("vozes")));
  if (vozesSemFio > 0) {
    const sf = primeiro(cat, "microfone_sem_fio", (p) => p.subcategoria === R.tipoSemFio) ?? primeiro(cat, "microfone_sem_fio");
    const tipoTxt = R.tipoSemFio === "mao" ? "de mão" : R.tipoSemFio;
    microfones.push(item("voz-sem-fio", `Microfone sem fio (${tipoTxt}) para voz que anda${R.pregador ? " ou pregador" : ""}`, vozesSemFio, sf, "GEN-MIC-SEM-FIO", est("vozes")));
  }
  if (I.bateria_acustica > 0)
    microfones.push(item("kit-bateria", `Kit de microfones de bateria (${R.kitBateria === "completo" ? 7 : 4} peças)`, I.bateria_acustica, primeiro(cat, "microfone_com_fio", (p) => p.subcategoria === "kit_bateria"), "GEN-KIT-BATERIA", est("instrumentos")));
  const micInst = I.guitarra + I.sopro + I.outros;
  if (micInst > 0) microfones.push(item("inst-mic", "Microfone dinâmico para instrumento (amplificador de guitarra, sopro, outros)", micInst, micFio, "GEN-MIC-FIO", est("instrumentos")));

  // ---------------- DI ----------------
  const di: ItemPalco[] = totalDi > 0 ? [item("di", "Direct box (violão, baixo, teclado, bateria eletrônica)", totalDi, primeiro(cat, "di"), "GEN-DI", est("instrumentos"))] : [];

  // ---------------- Retorno ----------------
  const retorno: ItemPalco[] = [];
  const inEarProd = primeiro(cat, "in_ear");
  if (mixInEar > 0) {
    const porTx = inEarProd?.especificacoes.mixagensPorTransmissor?.valor ?? 1;
    const tx = Math.ceil(mixInEar / porTx);
    retorno.push(item("in-ear-tx", "Transmissor de in-ear", tx, inEarProd, "GEN-IN-EAR", est("retorno"), `${mixInEar} mixagem(ns), ${porTx} por transmissor`));
    retorno.push(item("in-ear-rx", "Receptor de in-ear (1 por músico)", receptores, inEarProd, "GEN-IN-EAR", est("retorno")));
  }
  if (mixMonitor > 0) {
    const mon =
      primeiro(cat, "monitor_chao") ??
      primeiro(cat, "caixa_ativa", (p) => (p.subcategoria === "10" || p.subcategoria === "12") && p.especificacoes.modoMonitor?.valor === true);
    retorno.push(item("monitor", "Monitor de chão (1 por mixagem)", mixMonitor, mon, "GEN-MONITOR", est("retorno")));
  }

  // ---------------- RF (orientação, não coordenação) ----------------
  const txInEar = retorno.find((r) => r.id === "in-ear-tx")?.quantidade ?? 0;
  const canaisRf = vozesSemFio + txInEar;
  const fx = params.faixaRfEvitar.valor;
  const orientacoes: string[] = [];
  let nivelRf: ResultadoPalco["rf"]["nivel"] = "nenhum";
  if (canaisRf > 0) {
    nivelRf = canaisRf > params.limiarEspecialista.valor ? "especialista" : canaisRf > params.limiarCoordenacao.valor ? "coordenacao" : "simples";
    orientacoes.push(
      "Use apenas equipamento homologado pela Anatel.",
      `Evite a faixa de ${fx.minMHz}-${fx.maxMHz} MHz, destinada à telefonia móvel (4G/5G).`,
      "Prefira sistemas da mesma família/fabricante, com varredura automática de frequência.",
      "Mantenha linha de visada entre o transmissor e a antena.",
      "Afaste as antenas dos transmissores de in-ear das antenas dos receptores de microfone.",
    );
    if (nivelRf === "coordenacao" || nivelRf === "especialista")
      orientacoes.push(`Com mais de ${params.limiarCoordenacao.valor} canais sem fio: use distribuidor de antenas e faça a coordenação de frequências com a ferramenta do fabricante ou com um técnico.`);
    if (nivelRf === "especialista") orientacoes.push(`Com mais de ${params.limiarEspecialista.valor} canais sem fio: procure um especialista em RF.`);
    orientacoes.push("O espectro livre varia por cidade. O sistema não verifica as frequências locais.");
    for (const p of [primeiro(cat, "microfone_sem_fio"), inEarProd]) {
      const f = p?.especificacoes.faixaFrequencia?.valor;
      if (p && f && f.maxMHz > fx.minMHz && f.minMHz < fx.maxMHz) avisos.push(`${nomeProduto(p)} opera em faixa que cruza ${fx.minMHz}-${fx.maxMHz} MHz.`);
    }
  }

  // ---------------- Acessórios ----------------
  const { largura, profundidade } = caso.sala.valor;
  const mesaPos = t.posicaoMesa ?? { x: largura / 2, y: Math.max(caso.areaPublico.retangulo.y0, profundidade - 0.5) };
  const palcoPos = { x: largura / 2, y: Math.max(0.5, caso.profundidadePalco.valor / 2) };
  const comp = params.comprimentosCabo.valor;
  const folga = params.folgaCabo.valor;
  const cabos = new Map<string, number>();
  const somaCabo = (dist: number, n: number) => {
    if (n <= 0) return;
    const c = comprimentoComercial(dist, folga, comp);
    const k = c === undefined ? `acima de ${comp[comp.length - 1]} m` : `${c} m`;
    cabos.set(k, (cabos.get(k) ?? 0) + n);
  };
  const micsComFio = vozesComFio + I.bateria_acustica * (R.kitBateria === "completo" ? tab.bateria_acustica_completo : tab.bateria_acustica_basico) + micInst;
  const dPalco = dist2(mesaPos, palcoPos);
  somaCabo(dPalco, micsComFio + totalDi + mixMonitor);
  const caixasAtivas = cfg?.caixas ?? [];
  for (const c of caixasAtivas) somaCabo(dist2(mesaPos, c.posicao), 1);
  const acessorios: ItemPalco[] = [];
  for (const [k, n] of [...cabos.entries()].sort((a, b) => parseFloat(a[0].replace(/\D+/g, "") || "999") - parseFloat(b[0].replace(/\D+/g, "") || "999"))) {
    acessorios.push(item(`xlr-${k.replace(/\s/g, "")}`, `Cabo XLR ${k}`, n, primeiro(cat, "acessorio", (p) => p.subcategoria === "cabo_xlr"), "GEN-CABO-XLR", false, "Comprimento medido na planta entre a mesa e o ponto, com folga."));
    if (k.startsWith("acima")) avisos.push(`Há trajetos de cabo com mais de ${comp[comp.length - 1]} m. Considere multicabo ou envio digital.`);
  }
  if (vozesComFio > 0) acessorios.push(item("pedestal-mic", "Pedestal de microfone (voz parada)", vozesComFio, primeiro(cat, "acessorio", (p) => p.subcategoria === "pedestal_microfone"), "GEN-PEDESTAL-MIC", est("vozes")));
  const emPedestal = caixasAtivas.filter((c) => c.montagem === "pedestal" && c.papel !== "sub").length;
  const emParede = caixasAtivas.filter((c) => c.montagem === "parede").length;
  const acessorioCompat = (sub: string) => {
    const refs = new Set(caixasAtivas.filter((c) => c.fonte.tipo === "produto").map((c) => c.fonte.ref));
    const compat = cat.produtos.filter((p) => refs.has(p.id)).flatMap((p) => p.acessoriosCompativeis);
    return primeiro(cat, "acessorio", (p) => p.subcategoria === sub && compat.includes(p.id));
  };
  if (emPedestal > 0) acessorios.push(item("pedestal-caixa", "Pedestal de caixa", emPedestal, acessorioCompat("pedestal_caixa"), "GEN-PEDESTAL-CAIXA", false));
  if (emParede > 0) acessorios.push(item("suporte-parede", "Suporte de parede", emParede, acessorioCompat("suporte_parede"), "GEN-SUPORTE-PAREDE", false, "Use o suporte compatível indicado pelo fabricante. A fixação não é dimensionada."));
  // Alimentação: 1 régua por posição de equipamento ativo (agrupa equipamentos a até 1,5 m).
  const posicoes: { x: number; y: number }[] = [];
  const addPos = (p: { x: number; y: number }) => {
    if (!posicoes.some((q) => dist2(p, q) <= 1.5)) posicoes.push(p);
  };
  for (const c of caixasAtivas) addPos(c.posicao);
  addPos(mesaPos);
  if (mixMonitor > 0 || mixInEar > 0 || I.teclado > 0 || I.bateria_eletronica > 0) addPos(palcoPos);
  acessorios.push(item("regua", "Régua/filtro de linha (1 por posição de equipamento ativo)", posicoes.length, primeiro(cat, "acessorio", (p) => p.subcategoria === "regua"), "GEN-REGUA", false, "O sistema não dimensiona a instalação elétrica."));
  const nTrajeto = micsComFio + totalDi + mixMonitor + caixasAtivas.filter((c) => c.posicao.y <= caso.profundidadePalco.valor + 1).length;
  if (nTrajeto > params.limiarMulticabo.valor) {
    const c = comprimentoComercial(dPalco, folga, comp);
    acessorios.push(item("multicabo", `Multicabo/snake com pelo menos ${nTrajeto} vias`, 1, primeiro(cat, "acessorio", (p) => p.subcategoria === "multicabo"), "GEN-MULTICABO", false, `${nTrajeto} cabos no trajeto palco-mesa${c ? `; comprimento sugerido ${c} m` : ""}.`));
  }

  return {
    estimados: R.estimados,
    entradas,
    totalCanais,
    canaisMic,
    canaisComReserva,
    tamanhoMesa,
    mixagens: { total: R.mixagens, inEar: mixInEar, monitor: mixMonitor },
    auxNecessarios: { mono: mixMonitor, inEarEstereo: mixInEar },
    mesa: { tipo: tipoMesa, motivos, vantagens, requisitos: requisitosMesa, phantom, candidatos: candidatosMesa, escolhida },
    microfones,
    retorno,
    di,
    acessorios,
    rf: { canais: canaisRf, nivel: nivelRf, orientacoes },
    avisos,
  };
}
