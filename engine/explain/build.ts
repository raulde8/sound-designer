import { ROTULO_PERFIL_GENERICO } from "../../catalog/generic-profiles";
import type { CasoPreparado } from "../context";
import { ref, type ParamRef } from "../params";
import type { ResultadoOk } from "../result";
import { brl } from "../selection/investimento";
import { fmt, render } from "./templates";
import type { Conclusao } from "./types";

type Parcial = Omit<ResultadoOk, "conclusoes" | "profissional" | "parametrosPendentes">;

const PAPEL: Record<string, string> = { principal: "principal", front_fill: "front-fill", reforco: "reforço/delay", sub: "subwoofer" };
const MONTAGEM: Record<string, string> = { pedestal: "em pedestal", parede: "na parede", suspensa: "suspensa", chao: "apoiada no chão" };
const USO: Record<string, string> = {
  fala: "fala/pregação",
  musica_ambiente: "música ambiente",
  musica_primeiro_plano: "música em primeiro plano",
  banda: "banda ao vivo",
  dj: "DJ",
  video: "vídeo",
  voz_violao: "voz e violão",
  banda_bateria: "banda com bateria",
};
const ORIGEM: Record<string, string> = { usuario: "informado", default: "padrão", preset: "presumido pelo tipo de local", estimado: "estimado" };

function c(id: string, titulo: string, texto: string, o: Partial<Omit<Conclusao, "id" | "titulo" | "texto">> = {}): Conclusao {
  return { id, titulo, texto, entradas: o.entradas ?? [], regra: o.regra ?? "", parametros: o.parametros ?? [], hipoteses: o.hipoteses ?? [], limitacoes: o.limitacoes ?? [] };
}

/** Monta as explicações de cada conclusão (SPEC C9) e a lista "quando chamar um profissional". */
export function montarConclusoes(r: Parcial, ctx: CasoPreparado): { conclusoes: Conclusao[]; profissional: string[] } {
  const P = ctx.params;
  const caso = ctx.caso;
  const out: Conclusao[] = [];
  const prof: string[] = [];
  const s = r.caso.sala;
  const entradasSala = [
    `Sala: ${fmt(s.largura)} m de largura x ${fmt(s.profundidade)} m de profundidade x ${fmt(s.peDireito)} m de pé-direito (${ORIGEM[r.caso.salaOrigem]})`,
    `Palco: ${fmt(r.caso.profundidadePalco)} m de profundidade (${ORIGEM[caso.profundidadePalco.origem]})`,
    `Público: ${r.caso.publico} pessoas, ${r.caso.disposicao === "em_pe" ? "em pé" : r.caso.disposicao === "mesas" ? "em mesas" : "sentadas"} (altura do ouvinte ${fmt(r.caso.alturaOuvinte)} m)`,
  ];
  const entradasUso = [`Usos: ${r.caso.usos.map((u) => USO[u] ?? u).join(", ")} (${ORIGEM[r.caso.usosOrigem]})`, ...(r.caso.formacao ? [`Formação da banda: ${r.caso.formacao}`] : [])];
  const limitGeo = ["Sala modelada como retângulo, sem obstáculos.", "Não calcula reflexões, RT60 nem STI."];

  // ---------------- Nível-alvo ----------------
  const a = r.alvo;
  const txtAlvo = [render("nivelAlvo", { alvo: a.alvo, reserva: a.reserva, requerido: a.requerido })];
  if (ctx.caso.usosParam.length > 1) txtAlvo.push(render("nivelAlvoMisto", { dominante: USO[a.usoDominante] ?? a.usoDominante }));
  txtAlvo.push(a.ruidoEstimado ? render("ruidoNaoSei", { ajuste: a.ajusteRuido }) : render("ruido", { ajuste: a.ajusteRuido }));
  if (a.limitadoPeloTeto) txtAlvo.push(render("teto", { teto: P.tetoAlvo.valor }));
  if (a.avisoSegurancaAuditiva) txtAlvo.push(render("segurancaAuditiva", { limiar: P.limiarSegurancaAuditiva.valor }));
  out.push(
    c("nivel-alvo", "Nível sonoro necessário", txtAlvo.join(" "), {
      entradas: [...entradasUso, `Ruído com o local funcionando: ${caso.acustica.conversa?.valor ?? "não sei"}`],
      regra: "C5: maior nível-alvo entre os usos + ajuste por ruído, com teto",
      parametros: [ref(P.niveisPorUso), ref(P.ajusteRuido), ref(P.tetoAlvo), ref(P.limiarSegurancaAuditiva)],
      hipoteses: a.ruidoEstimado ? ["Ruído 'não sei' = opção do meio."] : [],
      limitacoes: ["Nível médio contínuo de referência. Não garante limite de ruído para vizinhos nem segurança auditiva."],
    }),
  );
  if (a.avisoSegurancaAuditiva) prof.push("Nível acima de 95 dB: avalie limites de exposição e de ruído para a vizinhança com um profissional.");

  // ---------------- Escopo ----------------
  const e = r.escopo;
  const itensTxt = e.itens.filter((i) => i.nivel !== "aviso").map((i) => i.texto).join(" ");
  out.push(
    c("escopo", "Dentro do modelo?", e.status === "suportado" ? render("escopoSuportado") : e.status === "parcial" ? render("escopoParcial", { itens: itensTxt }) : render("escopoEncaminhar", { itens: itensTxt }), {
      entradas: entradasSala,
      regra: "B5: envelope do MVP",
      parametros: [ref(P.envelope), ref(P.areaPorPessoa)],
      limitacoes: e.naoCalculado,
    }),
  );
  if (e.status === "encaminhar") prof.push("O ambiente está fora do envelope do MVP: procure um projetista de sistemas de sonorização.");
  else if (e.recomendarProjetista) prof.push("Partes do ambiente ficaram fora do modelo (mezanino, ambientes conectados, formato irregular): uma visita técnica é recomendada.");

  const rec = r.recomendacao;
  if (rec) {
    const cfg = rec.configuracao;
    const generico = rec.produto === null;
    const pmain = cfg.caixas.find((x) => x.papel === "principal")!;
    const paramsLayout: ParamRef[] = [ref(P.afastamentoParedeLateral), ref(P.recuoPalco), ref(P.folgaTeto)];
    if (pmain.montagem === "pedestal") paramsLayout.push(ref(P.alturaBasePedestal));
    if (pmain.montagem === "parede" || pmain.montagem === "suspensa") paramsLayout.push(ref(P.alturaMaxParede));

    out.push(
      c("arquitetura", "Configuração recomendada", render("arquitetura", { nomeSimples: rec.nomeSimples, motivo: rec.motivoEscolha }), {
        entradas: [...entradasSala, `Instalação: ${caso.instalacao.forma}, formato ${caso.instalacao.formato}, ${caso.mobilidade}`],
        regra: `C4: ${rec.arquitetura}; preferência por vertical array acima de ${P.profundidadePreferenciaArray.valor} m de profundidade ou com reverberação alta`,
        parametros: [ref(P.profundidadePreferenciaArray)],
        hipoteses: ["A preferência entre caixas convencionais e vertical array é uma regra inicial do produto."],
        limitacoes: limitGeo,
      }),
    );

    const lista = rec.equipamentos.map((q) => `${q.quantidade} x ${q.nome} (${PAPEL[q.papel]}, ${MONTAGEM[q.montagem]})`).join("; ");
    out.push(
      c("caixas", "Quantidade e tipo de caixas", render("caixas", { lista, arq: rec.arquitetura, fonte: generico ? "o perfil genérico" : "os dados reais do produto" }), {
        entradas: entradasSala,
        regra: rec.arquitetura === "AR-1" ? "C4 AR-1: 2 caixas L/R; front-fill e reforço quando necessários" : "C4 AR-2: 1 array por lado; configuração pela tabela do fabricante",
        parametros: [...paramsLayout, ref(P.distMaxPontual), ...(cfg.frontFill ? [ref(P.faixaPrimeiraFileira), ref(P.larguraPorFrontFill)] : [])],
        hipoteses: cfg.frontFill ? [render("frontFill")] : [],
        limitacoes: rec.arquitetura === "AR-2" ? ["O array é avaliado só pela tabela publicada pelo fabricante. Sem fórmula genérica e sem soma de módulos."] : [],
      }),
    );

    for (const cx of cfg.caixas) {
      const sub = cx.papel === "sub";
      out.push(
        c(
          `caixa:${cx.id}`,
          `Caixa ${cx.numero}`,
          render("caixa", {
            numero: cx.numero,
            papel: PAPEL[cx.papel]!,
            montagem: MONTAGEM[cx.montagem]!,
            z: fmt(cx.posicao.z, 2),
            x: fmt(cx.posicao.x, 2),
            y: fmt(cx.posicao.y, 2),
            yaw: fmt(cx.mira.yaw, 0),
            pitch: fmt(cx.mira.pitch, 0),
          }) + (sub ? " " + render("graves") : cx.papel === "front_fill" ? "" : " " + render("caixaMira")) + (cx.movida ? " Posição alterada por você." : ""),
          {
            entradas: entradasSala,
            regra: sub ? "C4 AR-3: no chão, sob ou ao lado das caixas principais" : cx.papel === "front_fill" ? "C4 AR-1: front-fill" : "C4 AR-1/AR-2: posição, altura e direção",
            parametros: sub ? [ref(P.subPorLadoPadrao)] : paramsLayout,
            hipoteses: [`Fonte: ${cx.fonte.nome}${cx.fonte.tipo === "generico" ? " — " + ROTULO_PERFIL_GENERICO : ""}`],
            limitacoes: cx.montagem === "suspensa" || cx.montagem === "parede" ? ["O sistema não dimensiona suporte, ancoragem nem estrutura."] : [],
          },
        ),
      );
    }

    // Cobertura
    const pc = rec.avaliacao.pct;
    out.push(
      c("cobertura", "Cobertura nominal", `${render("cobertura", { coberto: fmt(pc.coberto * 100, 0), borda: fmt(pc.borda * 100, 0), fora: fmt(pc.fora * 100, 0) })} ${render("rotuloCobertura")}`, {
        entradas: [...entradasSala, `Cobertura usada: ${pmain.fonte.cobertura.H}° x ${pmain.fonte.cobertura.V}° (H x V)`],
        regra: "C5 nível A: ponto coberto se |h| <= H/2 e |v| <= V/2; borda até +10°",
        parametros: [ref(P.bordaCobertura), ref(P.passoMalha), ref(P.alturaOuvinteSentado), ref(P.alturaOuvinteEmPe), ref(P.foraMaxValidada), ...(generico ? [ref(P.coberturaReferenciaPontual)] : [])],
        hipoteses: generico ? ["Cobertura de referência do perfil genérico; o produto real recalcula o layout."] : [],
        limitacoes: ["Não atribui atenuação em dB fora do eixo.", ...limitGeo],
      }),
    );

    // Capacidade
    const av = rec.avaliacao;
    const reqSpl = rec.perfilGenerico.requisitos.find((q) => q.campo === "splContinuo1m");
    const estimado = cfg.caixas.some((x) => x.fonte.nivel.tipo === "pontual" && x.fonte.nivel.estimado);
    const txtCap = generico
      ? reqSpl && typeof reqSpl.valor === "number"
        ? render("capacidadeGenerica", { spl: reqSpl.valor })
        : render("capacidadePendente", { motivo: "depende da tabela do fabricante." })
      : av.capacidade === "validada"
        ? render("capacidadeValidada", { min: fmt(av.nivel!.min), requerido: a.requerido })
        : av.capacidade === "pendente"
          ? render("capacidadePendente", { motivo: av.motivoCapacidade })
          : render("capacidadeInsuficiente", { motivo: av.motivoCapacidade });
    out.push(
      c("capacidade", "Capacidade sonora", `${rec.statusValidacao.geometria === "fora_do_modelo" ? render("geometriaFora") : render("geometriaDisponivel")} ${txtCap}`, {
        entradas: [`Requerido: ${a.requerido} dB (alvo ${a.alvo} + reserva ${a.reserva})`],
        regra: "C5 nível B: L(d) = SPL contínuo a 1 m - 20 log10(d), só dentro da cobertura nominal; cada ponto recebe a fonte mais forte",
        parametros: [ref(P.uniformidadeMax), ref(P.toleranciaNivel), ...(estimado ? [ref(P.picoParaContinuo)] : []), ...(generico ? [ref(P.tamanhoPorSplRequerido)] : [])],
        hipoteses: estimado ? ["SPL contínuo estimado a partir do pico."] : [],
        limitacoes: ["O sistema não soma fontes (sinais correlacionados): o resultado é conservador.", "Só nível direto, sem contribuição da sala."],
      }),
    );
    if (av.capacidade !== "validada") prof.push("A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.");

    // Requisitos e produtos
    out.push(
      c("requisitos", "Características mínimas de cada caixa", render("requisitos", { lista: rec.perfilGenerico.requisitos.map((q) => q.texto).join("; ") }), {
        regra: "C8 passo 2: requisitos calculados para o caso",
        parametros: [ref(P.pesoMaxPorMontagem), ...(generico ? [ref(P.tamanhoPorSplRequerido)] : [])],
        hipoteses: [ROTULO_PERFIL_GENERICO],
        limitacoes: ["Peso máximo por montagem não é dimensionamento estrutural."],
      }),
    );
    const n = (st: string) => rec.candidatos.filter((x) => x.status === st).length;
    out.push(
      c(
        "produtos",
        "Produtos do catálogo",
        `${rec.semProdutoAdequado ? render("semProduto") + " " : ""}${render("produtos", { n: rec.candidatos.length, compat: n("compativel"), parcial: n("parcial"), incompat: n("incompativel"), naoAval: n("nao_avaliavel") })} ${render("ranking", { margem: P.margemNivelMaxRanking.valor })}`,
        {
          regra: "C7 status de compatibilidade; C8 ranking",
          parametros: [ref(P.margemNivelMaxRanking)],
          hipoteses: ["Ausência de dado nunca reprova nem aprova um produto."],
          limitacoes: ["Só produtos do catálogo verificado são avaliados."],
        },
      ),
    );
    for (const cand of rec.candidatos) {
      out.push(
        c(`produto:${cand.produtoId}`, cand.nome, `Status: ${cand.status.replace("_", " ")}. ${cand.motivos.join(" ")}`.trim(), {
          entradas: cand.faltando.length ? [`Falta na ficha: ${cand.faltando.join(", ")}`] : [],
          regra: "C7 status de compatibilidade",
          parametros: [ref(P.pesoMaxPorMontagem), ref(P.uniformidadeMax)],
          limitacoes: cand.avisos,
        }),
      );
    }

    // Sub
    const sb = rec.sub;
    const motivoSub = ctx.caso.usosParam
      .filter((u) => P.niveisPorUso.valor[u].sub === "sim")
      .map((u) => USO[u] ?? u)
      .join(", ");
    const txtSub =
      sb.regra === "recomendado" ? render("subRecomendado", { motivo: motivoSub }) : sb.regra === "opcional" ? render("subOpcional") : render("subNao");
    out.push(
      c(
        "sub",
        "Subwoofer",
        `${txtSub}${sb.incluido ? " " + render("subQtd", { porLado: sb.porLado, origem: sb.escolhido?.pareamentoFabricante ? "pareamento publicado pelo fabricante" : "regra padrão, sem pareamento publicado" }) + " " + render("graves") : ""}`,
        {
          entradas: entradasUso,
          regra: "C4 AR-3: regra por uso; quantidade pelo pareamento do fabricante",
          parametros: [ref(P.niveisPorUso), ref(P.subPorLadoPadrao)],
          limitacoes: ["Sem mapa de graves."],
        },
      ),
    );

    // Reforço
    if (cfg.atrasos.length > 0) {
      const rf = cfg.caixas.find((x) => x.papel === "reforco")!;
      const at = cfg.atrasos[0]!;
      out.push(
        c("reforco", "Reforço / delay", render("reforco", { y: fmt(rf.posicao.y), ms: fmt(at.ms), dist: fmt(at.distanciaExtra, 2), vel: P.velocidadeSom.valor }), {
          regra: "C5: reforço na posição em que o nível cai abaixo do alvo, ou na distância máxima da fonte pontual",
          parametros: [ref(P.distMaxPontual), ref(P.toleranciaNivel), ref(P.velocidadeSom)],
          limitacoes: ["O atraso é só referência. O valor final de delay e EQ é ajustado com medição no local."],
        }),
      );
      prof.push("Há caixas de reforço/delay: o ajuste final de atraso e equalização precisa de medição no local.");
    }
    if (cfg.caixas.some((x) => x.montagem === "suspensa")) prof.push("Caixa suspensa: a fixação exige projeto estrutural e ancoragem certificada.");
  }

  // Reverberação
  const rv = r.reverb;
  out.push(
    c(
      "reverberacao",
      "Acústica da sala",
      rv ? `Classe ${rv.classe === "medio" ? "média" : rv.classe} (${rv.pontos} pontos). ${render(rv.classe === "alto" ? "reverbAlto" : rv.classe === "medio" ? "reverbMedio" : "reverbBaixo")}${rv.estimado ? " " + render("reverbNaoSei") : ""}` : render("reverbNaoAplica"),
      {
        entradas: [
          `Superfícies: ${caso.acustica.superficies?.valor ?? "não sei"}`,
          `Palma ecoa: ${caso.acustica.palma?.valor ?? "não sei"}`,
          `Volume: ${fmt(s.largura * s.profundidade * s.peDireito, 0)} m³`,
          `Ambiente: ${r.caso.ambiente}`,
        ],
        regra: "C5 nível C: pontuação qualitativa",
        parametros: [ref(P.reverberacao)],
        hipoteses: rv?.estimado ? ["'Não sei' = opção do meio."] : [],
        limitacoes: ["O sistema não calcula RT60 nem STI: Sabine e Eyring assumem campo difuso, e essa hipótese falha em muitas salas reais."],
      },
    ),
  );
  if (rv?.classe === "alto") prof.push("Sala com risco alto de reverberação: avalie tratamento acústico com um especialista.");

  // PAG/NAG
  const pn = r.pagNag;
  if (pn) {
    const d = pn.distancias;
    out.push(
      c("pagnag", "Risco de microfonia", `${render("pagNag", { pag: fmt(pn.pag), nag: fmt(pn.nag), margem: fmt(pn.margem), risco: pn.risco })} ${render("pagNagTexto")}`, {
        entradas: [
          `D0 (falante -> ouvinte mais distante): ${fmt(d.D0, 2)} m`,
          `D1 (microfone -> caixa mais próxima): ${fmt(d.D1, 2)} m`,
          `D2 (ouvinte mais distante -> caixa mais próxima): ${fmt(d.D2, 2)} m`,
          `D3 (falante -> ouvinte mais próximo): ${fmt(d.D3, 2)} m`,
          `Ds (falante -> microfone): ${fmt(d.Ds, 2)} m (microfone de mão)`,
          `NOM (microfones abertos): ${d.NOM}`,
        ],
        regra: "C5: PAG = 20log(D0·D1/(D2·Ds)) - 10log(NOM) - 6; NAG = 20log(D0/D3) (Biamp, Shure)",
        parametros: [ref(P.pagNag), ref(P.posicaoMicrofone)],
        hipoteses: ["Componentes omnidirecionais: pior caso.", "Microfone no centro, na frente do palco."],
        limitacoes: ["Sinal de risco, não garantia."],
      }),
    );
    if (pn.risco === "alto") prof.push("Risco alto de microfonia: teste o sistema no local com um técnico antes do uso.");
  }

  // Investimento
  const inv = r.investimento;
  if (inv) {
    out.push(
      c(
        "investimento",
        "Investimento estimado",
        inv.referencia
          ? `${render("investimento", { min: brl(inv.minimo), max: brl(inv.maximo), ref: inv.referencia })}${inv.itensSemFaixa.length ? " " + render("investimentoIncompleto", { itens: inv.itensSemFaixa.join(", ") }) : ""}`
          : render("semFaixa"),
        {
          regra: "C7: soma das faixas por categoria e porte; faixa vencida não aparece",
          parametros: [ref(P.validadeFaixaDias)],
          limitacoes: ["Não inclui instalação, frete nem acessórios sem faixa.", "Não é preço de produto."],
        },
      ),
    );
  }

  // Palco
  const pl = r.palco;
  if (pl) {
    const est = pl.estimados.length ? [`Presumido pelo tipo de local: ${pl.estimados.join(", ")}`] : [];
    out.push(
      c("palco:entradas", "Canais da mesa", render("palcoEntradas", { total: pl.totalCanais, mic: pl.canaisMic, reserva: Math.round(P.reservaCanais.valor * 100), comReserva: pl.canaisComReserva, tamanho: pl.tamanhoMesa }), {
        entradas: [...pl.entradas.map((x) => `${x.fonte}: ${x.quantidade} x ${x.canaisPorUnidade} canal(is)`), ...est],
        regra: "C6: soma das entradas + reserva, arredondada para o próximo tamanho de mesa",
        parametros: [ref(P.canaisPorInstrumento), ref(P.diPorInstrumento), ref(P.reservaCanais), ref(P.tamanhosMesaPadrao)],
        hipoteses: est,
      }),
    );
    out.push(
      c("palco:mesa", "Mesa de som", render("palcoMesa", { tipo: pl.mesa.tipo === "analogica" ? "Mesa analógica" : pl.mesa.tipo === "digital" ? "Mesa digital" : "Analógica ou digital", motivos: [...pl.mesa.motivos, ...pl.mesa.vantagens].join(" ") }), {
        entradas: pl.mesa.requisitos.map((q) => q.texto),
        regra: "C6: digital se qualquer condição; analógica se todas as condições",
        parametros: [ref(P.regraMesa), ref(P.phantomBateriaAcustica)],
      }),
    );
    out.push(
      c("palco:microfones", "Microfones", render("palcoMic", { lista: pl.microfones.map((m) => `${m.quantidade} x ${m.descricao}`).join("; ") || "Nenhum microfone" }), {
        regra: "C6: voz parada com fio; voz que anda ou pregador sem fio; instrumento com saída de linha usa DI",
        hipoteses: est,
      }),
    );
    out.push(
      c("palco:retorno", "Retorno", render("palcoRetorno", { mix: pl.mixagens.total, inEar: pl.mixagens.inEar, monitor: pl.mixagens.monitor }), {
        regra: "C6: in-ear com 1 receptor por músico; monitor de chão 1 por mixagem; in-ear estéreo conta 2 aux",
        hipoteses: est,
      }),
    );
    const nivelTxt =
      pl.rf.nivel === "nenhum"
        ? "Sem equipamento sem fio."
        : pl.rf.nivel === "simples"
          ? "Siga as orientações básicas."
          : pl.rf.nivel === "coordenacao"
            ? "Use distribuidor de antenas e coordene as frequências."
            : "Encaminhe para um especialista em RF.";
    out.push(
      c("palco:rf", "Sem fio (RF)", `${render("palcoRf", { canais: pl.rf.canais, nivel: nivelTxt })} ${pl.rf.orientacoes.join(" ")}`.trim(), {
        regra: "C6: orientação, não coordenação de frequências",
        parametros: [ref(P.limiarCoordenacao), ref(P.limiarEspecialista), ref(P.faixaRfEvitar)],
        limitacoes: ["O MVP não verifica as frequências livres da cidade.", "Texto exato do Ato Anatel vigente a confirmar."],
      }),
    );
    out.push(
      c("palco:acessorios", "Acessórios", render("palcoAcessorios", { mesa: "no fundo, centro", folga: Math.round(P.folgaCabo.valor * 100), comp: P.comprimentosCabo.valor.join(", ") }), {
        regra: "C6: XLR por microfone com fio, DI, monitor e caixa ativa; pedestais e suportes por regra; 1 régua por posição; multicabo acima do limiar",
        parametros: [ref(P.folgaCabo), ref(P.comprimentosCabo), ref(P.limiarMulticabo)],
        limitacoes: ["O sistema não dimensiona a instalação elétrica."],
      }),
    );
    if (pl.rf.nivel === "especialista") prof.push("Muitos canais sem fio: procure um especialista em RF para coordenar as frequências.");
    else if (pl.rf.nivel === "coordenacao") prof.push("Mais de 4 canais sem fio: faça a coordenação de frequências com a ferramenta do fabricante ou com um técnico.");
  }

  prof.push("Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.");
  return { conclusoes: out, profissional: [...new Set(prof)] };
}
