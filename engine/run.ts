import { PERFIS_GENERICOS, ROTULO_PERFIL_GENERICO, perfilGenerico } from "../catalog/generic-profiles";
import type { CatalogSnapshot } from "../catalog/schema";
import { pagNagDaPlanta } from "./acoustics/feedback";
import { avaliar, type Avaliacao } from "./architectures/evaluate";
import { GERADORES, NOMES_SIMPLES, arquiteturaPreferida, fonteGenericaPara } from "./architectures/index";
import { aplicarAjustes, numerar } from "./architectures/layout";
import { AVISO_GRAVES, criarSubs, regraSub } from "./architectures/sub";
import type { ArquiteturaId, Configuracao, FonteCaixa, Requisito } from "./architectures/types";
import { prepararCaso, type CasoPreparado } from "./context";
import { listaEquipamentos } from "./equipment";
import { montarConclusoes } from "./explain/build";
import { areaPublicoM2 } from "./geometry/room";
import { avaliarEscopo } from "./geometry/scope";
import { dist3, round } from "./geometry/vec";
import { EntradaSchema, type Entrada } from "./input/schema";
import { obterParams, type ParamRef } from "./params";
import type { Alternativa, MapaCobertura, PerfilGenericoResultado, Recomendacao, Resultado, ResultadoOk, StatusGeometria, Versoes } from "./result";
import { CATEGORIA_POR_ARQUITETURA, avaliarCaixa, ordenarCandidatos, produtosElegiveis, utilizavel, type Candidato } from "./selection/compat";
import { compararOrcamento, faixaDaCategoria, somarInvestimento, type ItemInvestimento } from "./selection/investimento";
import { POLITICA_ABERTA, type BrandPolicy } from "./selection/policy";
import { avaliarSubs } from "./selection/subwoofer";
import { calcularPalco } from "./stage/stage";
import { ENGINE_VERSION } from "./version";

export interface OpcoesMotor {
  catalogo: CatalogSnapshot;
  paramsVersion: string;
  /** Data de referência (AAAA-MM-DD) para a validade das faixas. Vem de fora: o motor não lê o relógio. */
  dataReferencia: string;
  politica?: BrandPolicy;
}

interface Solucao {
  arquitetura: ArquiteturaId;
  generica: Configuracao;
  candidatos: Candidato[];
}

function mapaDe(ctx: CasoPreparado, av: Avaliacao): MapaCobertura {
  const m = ctx.malha;
  const cel = new Array<string>(m.nx * m.ny).fill(" ");
  m.indices.forEach((idx, i) => {
    const e = av.estados[i];
    cel[idx] = e === "coberto" ? "c" : e === "borda" ? "b" : "f";
  });
  return { passo: m.passo, x0: m.x0, y0: m.y0, nx: m.nx, ny: m.ny, celulas: cel.join("") };
}

function perfilResultado(id: string, requisitos: Requisito[], ctx: CasoPreparado, cat: CatalogSnapshot, data: string): PerfilGenericoResultado {
  const def = perfilGenerico(id);
  const faixa = faixaDaCategoria(cat, def.categoria, def.subcategoria || undefined, data);
  return { ...def, rotulo: ROTULO_PERFIL_GENERICO, requisitos, ...(faixa ? { faixa } : {}) };
}

/** Recalcula os atrasos de referência depois de o usuário mover caixas. */
function recalcularAtrasos(cfg: Configuracao, velocidade: number): Configuracao {
  const atrasos = cfg.atrasos.map((a) => {
    const c = cfg.caixas.find((x) => x.id === a.caixaId);
    const r = cfg.caixas.find((x) => x.id === a.referenciaId);
    if (!c || !r) return a;
    const d = dist3(c.posicao, r.posicao);
    return { ...a, distanciaExtra: round(d, 2), ms: round((1000 * d) / velocidade, 1) };
  });
  return { ...cfg, atrasos };
}

function sanitizarCandidato(c: Candidato): Candidato {
  // Os estados da malha de cada candidato não vão para o resultado (só os da recomendação).
  return c.avaliacao ? { ...c, avaliacao: { ...c.avaliacao, estados: [], nivelPorLinha: [] } } : c;
}

/**
 * Motor determinístico: Entrada + catálogo + versão de parâmetros -> Resultado.
 * Sem I/O, sem rede, sem relógio, sem aleatoriedade.
 */
export function executarMotor(entradaBruta: unknown, op: OpcoesMotor): Resultado {
  const versoes: Versoes = { engineVersion: ENGINE_VERSION, catalogVersion: op.catalogo.version, paramsVersion: op.paramsVersion };
  const params = obterParams(op.paramsVersion);
  if (!params) return { ok: false, versoes, erros: [{ campo: "paramsVersion", mensagem: `Versão de parâmetros desconhecida: ${op.paramsVersion}.` }] };
  const parsed = EntradaSchema.safeParse(entradaBruta);
  if (!parsed.success) return { ok: false, versoes, erros: parsed.error.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })) };
  const entrada: Entrada = parsed.data;
  const prep = prepararCaso(entrada.trilha1, params);
  if (!prep.ok) return { ok: false, versoes, erros: prep.erros };
  const ctx = prep.ctx;
  const { caso, alvo } = ctx;
  const cat = op.catalogo;
  const data = op.dataReferencia;
  const politica = op.politica ?? POLITICA_ABERTA;
  const escopo = avaliarEscopo(caso, params);
  const avisos: string[] = [];

  // 1. Arquiteturas candidatas com perfil genérico (SPEC C8 passo 1).
  const arquiteturas: ResultadoOk["arquiteturas"] = [];
  const solucoes: Solucao[] = [];
  for (const g of GERADORES) {
    const d = g.disponibilidade(ctx);
    arquiteturas.push({ id: g.id, nome: g.nome, disponivel: d.disponivel, ...(d.disponivel ? {} : { motivo: d.motivo }) });
    if (!d.disponivel) continue;
    const gen = g.gerar(ctx, fonteGenericaPara(g.id, ctx));
    if (!gen.ok) {
      arquiteturas[arquiteturas.length - 1] = { id: g.id, nome: g.nome, disponivel: false, motivo: gen.motivo };
      continue;
    }
    const qtdGen = gen.configuracao.caixas.filter((c) => c.papel !== "sub").length;
    // 2-3. Filtro, revalidação com dados reais e ranking (SPEC C8 passos 2-4).
    const cands = produtosElegiveis(cat, CATEGORIA_POR_ARQUITETURA[g.id]!).map((p) => avaliarCaixa(ctx, g, p, cat, data, qtdGen));
    solucoes.push({ arquitetura: g.id, generica: gen.configuracao, candidatos: politica.ordenar(ordenarCandidatos(cands, params.margemNivelMaxRanking.valor)) });
  }

  const profPublico = caso.sala.valor.profundidade - caso.areaPublico.retangulo.y0;
  const pref = arquiteturaPreferida(
    solucoes.map((s) => s.arquitetura),
    profPublico,
    ctx.reverb?.classe ?? null,
    params.profundidadePreferenciaArray.valor,
  );

  let recomendacao: Recomendacao | null = null;
  let alternativas: Alternativa[] = [];
  if (pref) {
    const escolhaArq = entrada.escolhas["arquitetura"] as ArquiteturaId | undefined;
    const temUtil = (s: Solucao) => s.candidatos.some(utilizavel);
    let sol = solucoes.find((s) => s.arquitetura === pref)!;
    let motivoEscolha =
      solucoes.length > 1
        ? sol.arquitetura === "AR-2"
          ? `Vertical array preferido: a área de público tem ${round(profPublico, 1)} m de profundidade${ctx.reverb?.classe === "alto" ? " e a sala tem risco alto de reverberação" : ""}.`
          : `Caixas convencionais preferidas: a área de público tem ${round(profPublico, 1)} m de profundidade (limite de preferência do vertical array: ${params.profundidadePreferenciaArray.valor} m).`
        : `Única arquitetura disponível para as respostas dadas.`;
    if (!temUtil(sol)) {
      const outra = solucoes.find((s) => s.arquitetura !== pref && temUtil(s));
      if (outra) {
        sol = outra;
        motivoEscolha = `A arquitetura preferida não tem produto compatível no catálogo verificado. ${outra.arquitetura === "AR-1" ? "Caixas convencionais" : "Vertical array"} atende com produto do catálogo.`;
      }
    }
    if (escolhaArq && escolhaArq !== sol.arquitetura) {
      const s = solucoes.find((x) => x.arquitetura === escolhaArq);
      if (s) {
        sol = s;
        motivoEscolha = "Arquitetura escolhida por você entre as alternativas.";
      }
    }

    const escolhaProd = entrada.escolhas["principal"];
    const util = sol.candidatos.filter(utilizavel);
    let produto: Candidato | null = util[0] ?? null;
    if (escolhaProd) {
      const c = util.find((x) => x.produtoId === escolhaProd);
      if (c) produto = c;
      else avisos.push("O produto escolhido não atende a esta configuração. O sistema voltou para a recomendação.");
    }
    let cfg: Configuracao = produto?.configuracao ?? sol.generica;
    if (produto && produto.status === "parcial" && produto.avaliacao?.capacidade === "pendente") {
      const insuf = sol.candidatos.filter((c) => c.status === "incompativel" && c.avaliacao?.capacidade === "insuficiente");
      if (insuf.length > 0)
        avisos.push(
          `Os ${insuf.length} produto(s) do catálogo com SPL publicado não atingem o nível requerido nesta configuração. O produto recomendado não tem dado de nível suficiente: confirme a capacidade com o fabricante antes de comprar.`,
        );
    }

    // Subwoofer (AR-3)
    const regra = regraSub(alvo);
    const subs = avaliarSubs(cat, produto?.produtoId ?? null, params, data);
    const subsUteis = subs.filter((s) => s.status === "compativel" || s.status === "parcial");
    let subEscolhido = subsUteis[0] ?? null;
    const escolhaSub = entrada.escolhas["sub"];
    if (escolhaSub) subEscolhido = subsUteis.find((s) => s.produtoId === escolhaSub) ?? subEscolhido;
    const incluiSub = regra === "recomendado" || (regra === "opcional" && entrada.escolhas["incluirSub"] === "sim");
    const porLado = subEscolhido?.porLado ?? params.subPorLadoPadrao.valor;
    const subPerfil =
      regra !== "nao_recomendado"
        ? perfilResultado(
            "GEN-SUB",
            [
              { campo: "montagem", operador: "em", valor: "chao", unidade: "", texto: "Subwoofer ativo apoiado no chão" },
              { campo: "splContinuo1m", operador: ">=", valor: "publicado", unidade: "", texto: "SPL máximo com condição de medição publicada" },
              {
                campo: "alcance",
                operador: "em",
                valor: "pareamento",
                unidade: "",
                texto: "Pareamento recomendado pelo fabricante da caixa principal, quando houver",
              },
            ],
            ctx,
            cat,
            data,
          )
        : null;
    if (incluiSub) {
      const fonteSub: FonteCaixa = subEscolhido
        ? { tipo: "produto", ref: subEscolhido.produtoId, nome: subEscolhido.nome, cobertura: { H: 360, V: 180 }, nivel: { tipo: "requisito" }, meiaAltura: params.meiaAlturaCaixaPadrao.valor, montagensPermitidas: ["chao"], subcategoria: subEscolhido.subcategoria }
        : { tipo: "generico", ref: "GEN-SUB", nome: perfilGenerico("GEN-SUB").nome, cobertura: { H: 360, V: 180 }, nivel: { tipo: "requisito" }, meiaAltura: params.meiaAlturaCaixaPadrao.valor, montagensPermitidas: null, subcategoria: "" };
      cfg = { ...cfg, caixas: numerar([...cfg.caixas.filter((c) => c.papel !== "sub"), ...criarSubs(cfg.caixas, fonteSub, porLado)]) };
      avisos.push(AVISO_GRAVES);
    }

    // Caixas movidas pelo usuário na planta.
    const ajustada = Object.keys(entrada.ajustes).some((id) => cfg.caixas.some((c) => c.id === id));
    if (ajustada) {
      cfg = recalcularAtrasos({ ...cfg, caixas: aplicarAjustes(cfg.caixas, entrada.ajustes, caso.sala.valor.largura, caso.sala.valor.profundidade) }, params.velocidadeSom.valor);
      avisos.push("Você moveu caixas na planta. O resultado abaixo foi recalculado com as novas posições.");
    }
    const av = avaliar(cfg, ctx.malha, params.bordaCobertura.valor, alvo.requerido);

    const geometria: StatusGeometria = escopo.geometriaForaDoModelo
      ? "fora_do_modelo"
      : produto && av.pct.fora <= params.foraMaxValidada.valor && caso.sala.origem === "usuario"
        ? "validada"
        : "validada_aproximacao";
    const perfilPrincipalId = sol.generica.caixas.find((c) => c.papel === "principal")!.fonte.ref;
    const perfil = perfilResultado(perfilPrincipalId, sol.generica.requisitos.principal ?? [], ctx, cat, data);

    recomendacao = {
      arquitetura: sol.arquitetura,
      nome: GERADORES.find((g) => g.id === sol.arquitetura)!.nome,
      nomeSimples: NOMES_SIMPLES[sol.arquitetura],
      motivoEscolha,
      configuracao: cfg,
      equipamentos: listaEquipamentos(cfg),
      avaliacao: {
        pct: av.pct,
        nivel: av.nivel ? { min: av.nivel.min, max: av.nivel.max, uniformidade: av.nivel.uniformidade } : null,
        capacidade: av.capacidade,
        motivoCapacidade: av.motivoCapacidade,
      },
      mapa: mapaDe(ctx, av),
      produto: produto ? sanitizarCandidato(produto) : null,
      perfilGenerico: perfil,
      candidatos: sol.candidatos.map(sanitizarCandidato),
      semProdutoAdequado: produto === null,
      sub: { regra, incluido: incluiSub, escolhido: subEscolhido, perfilGenerico: subPerfil, candidatos: subs, porLado },
      statusValidacao: { geometria, capacidade: av.capacidade, acustica: ctx.reverb?.classe ?? "nao_aplicavel" },
      ajustada,
    };

    // Alternativas: no máximo 3, só quando há soluções distintas de verdade (SPEC B4).
    const todas = solucoes.flatMap((s) => s.candidatos.filter(utilizavel).map((c) => ({ s, c })));
    const chave = (a: { s: Solucao; c: Candidato }) => `${a.s.arquitetura}|${a.c.produtoId}`;
    const distintas = new Map(todas.map((a) => [chave(a), a]));
    if (distintas.size >= 2 && produto) {
      const lista = [...distintas.values()];
      const comFaixa = lista.filter((a) => a.c.faixa);
      const menorCusto = [...comFaixa].sort((a, b) => a.c.faixa!.minimo * a.c.quantidadeCaixas - b.c.faixa!.minimo * b.c.quantidadeCaixas || chave(a).localeCompare(chave(b)))[0];
      const maiorCap = [...lista].filter((a) => a.c.margemNivel !== undefined).sort((a, b) => b.c.margemNivel! - a.c.margemNivel! || chave(a).localeCompare(chave(b)))[0];
      const equilibrio = { s: sol, c: produto };
      const picks: [Alternativa["rotulo"], { s: Solucao; c: Candidato } | undefined][] = [
        ["menor custo", menorCusto],
        ["equilíbrio", equilibrio],
        ["maior capacidade", maiorCap],
      ];
      const vistos = new Set<string>();
      for (const [rotulo, a] of picks) {
        if (!a || vistos.has(chave(a))) continue;
        vistos.add(chave(a));
        alternativas.push({
          rotulo,
          arquitetura: a.s.arquitetura,
          nome: a.c.nome,
          produtoId: a.c.produtoId,
          quantidadeCaixas: a.c.quantidadeCaixas,
          status: a.c.status,
          ...(a.c.margemNivel !== undefined ? { margemNivel: a.c.margemNivel } : {}),
          ...(a.c.faixa ? { faixa: a.c.faixa } : {}),
        });
      }
      if (alternativas.length < 2) alternativas = [];
    }
  } else {
    avisos.push("Nenhuma arquitetura do MVP atende às preferências de instalação informadas.");
  }

  // Música ambiente: a fase 1.1 (sistema distribuído) tende a ser melhor (SPEC C10 caso 3).
  if (caso.usos.valor.every((u) => u === "musica_ambiente" || u === "fala") && caso.usos.valor.includes("musica_ambiente"))
    avisos.push(
      "Para música ambiente, um sistema distribuído (caixas de teto ou de parede espalhadas pelo salão) costuma dar som mais uniforme e em volume mais baixo. Essa arquitetura entra na próxima fase do sistema; consulte um profissional.",
    );

  // Módulo de palco (trilha 2), com cabos medidos na planta.
  const palco = entrada.trilha2 ? calcularPalco(entrada.trilha2, ctx, recomendacao?.configuracao ?? null, cat, data) : null;

  // PAG/NAG: com fala no uso ou microfones na trilha 2 (SPEC C5).
  const temFala = caso.usos.valor.includes("fala");
  const vozes = palco ? palco.microfones.filter((m) => m.id.startsWith("voz")).reduce((s, m) => s + m.quantidade, 0) : 0;
  const pn = recomendacao && (temFala || vozes > 0) ? pagNagDaPlanta(recomendacao.configuracao, ctx.malha, caso, params, Math.max(1, vozes)) : null;

  // Investimento: só faixa por categoria, com data (SPEC C7). Sem preço de produto.
  let investimento = null;
  if (recomendacao) {
    const itens: ItemInvestimento[] = recomendacao.equipamentos.map((e) => {
      if (e.papel === "principal" || e.papel === "reforco") {
        const f = e.tipo === "produto" ? recomendacao!.produto?.faixa : faixaDaCategoria(cat, perfilGenerico(e.ref).categoria, perfilGenerico(e.ref).subcategoria || undefined, data);
        return { descricao: e.nome, quantidade: e.quantidade, faixa: f };
      }
      if (e.papel === "sub") {
        const f = e.tipo === "produto" ? recomendacao!.sub.escolhido?.faixa : faixaDaCategoria(cat, "subwoofer", undefined, data);
        return { descricao: e.nome, quantidade: e.quantidade, faixa: f };
      }
      const def = PERFIS_GENERICOS.find((p) => p.id === e.ref);
      return { descricao: e.nome, quantidade: e.quantidade, faixa: def ? faixaDaCategoria(cat, def.categoria, def.subcategoria || undefined, data) : undefined };
    });
    if (palco) {
      const m = palco.mesa.escolhida;
      itens.push({
        descricao: m ? m.nome : `Mesa ${palco.mesa.tipo === "analogica" ? "analógica" : "digital"}`,
        quantidade: 1,
        faixa: m?.faixa ?? faixaDaCategoria(cat, "mesa", palco.mesa.tipo === "ambas" ? undefined : palco.mesa.tipo, data),
      });
    }
    investimento = somarInvestimento(itens);
  }
  const orcamento = entrada.orcamento !== undefined ? compararOrcamento(entrada.orcamento, investimento) : null;

  const parcial: Omit<ResultadoOk, "conclusoes" | "profissional" | "parametrosPendentes"> = {
    ok: true,
    versoes,
    dataReferencia: data,
    caso: {
      tipo: caso.tipo,
      sala: caso.sala.valor,
      salaOrigem: caso.sala.origem,
      profundidadePalco: caso.profundidadePalco.valor,
      areaPublicoM2: areaPublicoM2(caso.areaPublico),
      alturaOuvinte: caso.areaPublico.alturaOuvinte,
      publico: caso.publico.quantidade,
      disposicao: caso.publico.disposicao.valor,
      usos: caso.usos.valor,
      usosOrigem: caso.usos.origem,
      formacao: caso.formacao?.valor ?? null,
      ambiente: caso.ambiente.valor,
      formato: caso.formato.valor,
      instalacao: caso.instalacao,
      mobilidade: caso.mobilidade,
      passoMalha: ctx.malha.passo,
      passoAumentado: ctx.malha.passoAumentado,
    },
    escopo,
    alvo,
    reverb: ctx.reverb,
    arquiteturas,
    recomendacao,
    alternativas,
    pagNag: pn ? { ...pn, aplicavel: true } : null,
    investimento,
    orcamento,
    palco,
    avisos: [...new Set([...avisos, ...(recomendacao?.configuracao.avisos ?? []), ...(palco?.avisos ?? [])])],
  };
  const { conclusoes, profissional } = montarConclusoes(parcial, ctx);
  const pend = new Map<string, ParamRef>();
  for (const c of conclusoes) for (const p of c.parametros) if (p.status === "pendente_validacao") pend.set(p.id, p);
  return { ...parcial, conclusoes, profissional, parametrosPendentes: [...pend.values()].sort((a, b) => a.id.localeCompare(b.id)) };
}
