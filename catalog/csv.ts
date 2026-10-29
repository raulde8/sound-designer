/**
 * CSV (RFC 4180) e conversão das linhas do template para o schema do catálogo.
 * Puro: recebe texto, devolve objetos. A leitura de arquivos fica nos scripts.
 */

export function parseCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  const t = texto.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    if (aspas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          campo += '"';
          i++;
        } else aspas = false;
      } else campo += c;
      continue;
    }
    if (c === '"') aspas = true;
    else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      linha.push(campo);
      campo = "";
      if (linha.some((x) => x.length > 0)) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo.length > 0 || linha.length > 0) {
    linha.push(campo);
    if (linha.some((x) => x.length > 0)) linhas.push(linha);
  }
  return linhas;
}

export function csvParaObjetos(texto: string): Record<string, string>[] {
  const [cab, ...resto] = parseCsv(texto);
  if (!cab) return [];
  return resto.map((l) => Object.fromEntries(cab.map((h, i) => [h.trim(), (l[i] ?? "").trim()])));
}

export function escaparCsv(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// ---------------- Campos do template ----------------

type Codec = (texto: string) => unknown;

const num: Codec = (t) => Number(t.replace(",", "."));
const int: Codec = (t) => Math.round(Number(t));
const bool: Codec = (t) => ["sim", "s", "true", "1", "yes"].includes(t.toLowerCase());
const lista: Codec = (t) => t.split("|").map((x) => x.trim()).filter(Boolean);
const faixa = (a: string, b: string): Codec => (t) => {
  const [x, y] = t.split("-").map((s) => Number(s.trim().replace(",", ".")));
  return { [a]: x, [b]: y };
};
const texto: Codec = (t) => t;

/**
 * Campos da ficha. Cada um vira 6 colunas no template:
 * <campo>, <campo>_unidade, <campo>_condicao, <campo>_fonte, <campo>_data, <campo>_status.
 */
export const CAMPOS_TEMPLATE: { campo: string; codec: Codec; unidade: string; formato: string; topo?: boolean }[] = [
  { campo: "montagensPermitidas", codec: lista, unidade: "", formato: "pedestal|parede|suspensa|chao", topo: true },
  { campo: "peso", codec: num, unidade: "kg", formato: "número", topo: true },
  {
    campo: "dimensoes",
    codec: (t) => {
      const [a, l, p] = t.split("x").map((s) => Number(s.trim().replace(",", ".")));
      return { altura_m: a, largura_m: l, profundidade_m: p };
    },
    unidade: "m",
    formato: "altura x largura x profundidade (ex.: 0.62x0.38x0.36)",
    topo: true,
  },
  { campo: "coberturaH", codec: num, unidade: "graus", formato: "número" },
  { campo: "coberturaV", codec: num, unidade: "graus", formato: "número" },
  { campo: "splMax", codec: num, unidade: "dB SPL @1m", formato: "número; condição: continuo_campo_livre | pico_campo_livre | continuo_meio_espaco | pico_meio_espaco | desconhecida" },
  { campo: "respostaFrequencia", codec: faixa("minHz", "maxHz"), unidade: "Hz", formato: "min-max (ex.: 50-20000); condição: -10dB | -3dB | -6dB" },
  { campo: "modoMonitor", codec: bool, unidade: "", formato: "sim/nao" },
  { campo: "coberturaPorConfiguracao", codec: () => [], unidade: "", formato: "deixe o valor 'tabela' e preencha template-configuracoes-array.csv" },
  { campo: "acessoriosObrigatorios", codec: lista, unidade: "", formato: "ids separados por |" },
  {
    campo: "pareamento",
    codec: (t) => {
      const [tops, n] = t.split(";");
      return { topIds: lista(tops ?? ""), subsPorLado: Number(n ?? 1) };
    },
    unidade: "",
    formato: "ids dos tops separados por | ; subs por lado (ex.: jbl-x|jbl-y;1)",
  },
  { campo: "tipoMesa", codec: texto, unidade: "", formato: "analogica | digital" },
  { campo: "entradasMic", codec: int, unidade: "", formato: "inteiro" },
  { campo: "entradasTotais", codec: int, unidade: "", formato: "inteiro" },
  { campo: "auxMono", codec: int, unidade: "", formato: "inteiro" },
  { campo: "auxEstereo", codec: int, unidade: "", formato: "inteiro" },
  { campo: "phantom", codec: bool, unidade: "", formato: "sim/nao" },
  { campo: "controleRemoto", codec: bool, unidade: "", formato: "sim/nao" },
  { campo: "faixaFrequencia", codec: faixa("minMHz", "maxMHz"), unidade: "MHz", formato: "min-max (ex.: 614-698)" },
  { campo: "homologacaoAnatel", codec: texto, unidade: "", formato: "número do certificado" },
  { campo: "canaisSimultaneos", codec: int, unidade: "", formato: "inteiro" },
  { campo: "varreduraAutomatica", codec: bool, unidade: "", formato: "sim/nao" },
  { campo: "mixagensPorTransmissor", codec: int, unidade: "", formato: "inteiro" },
  { campo: "tipoMicrofone", codec: texto, unidade: "", formato: "dinamico | condensador" },
  { campo: "comprimento", codec: num, unidade: "m", formato: "número" },
];

export const COLUNAS_BASE = [
  "id",
  "marca",
  "modelo",
  "categoria",
  "subcategoria",
  "porte",
  "status",
  "datasheetUrl",
  "verificadoEm",
  "verificadoPor",
  "acessoriosCompativeis",
] as const;

export const SUFIXOS = ["", "_unidade", "_condicao", "_fonte", "_data", "_status"] as const;

export function colunasTemplate(): string[] {
  return [...COLUNAS_BASE, ...CAMPOS_TEMPLATE.flatMap((c) => SUFIXOS.map((s) => c.campo + s))];
}

export const COLUNAS_ARRAY = ["produto_id", "modulos", "angulo_splay", "H", "V", "alcance_nominal_m", "altura_centro_m", "spl_por_distancia", "fonte", "data", "status"] as const;

export const COLUNAS_FAIXAS = ["id", "categoria", "subcategoria", "porte", "minimo", "maximo", "fonte", "dataVerificacao", "validadeDias"] as const;

/** Converte uma linha do template em objeto de produto (ainda não validado). */
export function linhaParaProduto(l: Record<string, string>): Record<string, unknown> {
  const especificacoes: Record<string, unknown> = {};
  const topo: Record<string, unknown> = {};
  for (const c of CAMPOS_TEMPLATE) {
    const bruto = l[c.campo] ?? "";
    if (bruto === "") continue;
    const sv: Record<string, unknown> = {
      valor: c.codec(bruto),
      unidade: l[c.campo + "_unidade"] || c.unidade,
      fonte: l[c.campo + "_fonte"] ?? "",
      dataVerificacao: l[c.campo + "_data"] ?? "",
      status: l[c.campo + "_status"] || "declarado_fabricante",
    };
    const cond = l[c.campo + "_condicao"];
    if (cond) sv.condicaoMedicao = cond;
    (c.topo ? topo : especificacoes)[c.campo] = sv;
  }
  return {
    id: l.id,
    marca: l.marca,
    modelo: l.modelo,
    categoria: l.categoria,
    subcategoria: l.subcategoria ?? "",
    ...(l.porte ? { porte: l.porte } : {}),
    status: l.status || "rascunho",
    datasheetUrl: l.datasheetUrl ?? "",
    verificadoEm: l.verificadoEm ?? "",
    verificadoPor: l.verificadoPor ?? "",
    acessoriosCompativeis: lista(l.acessoriosCompativeis ?? "") as string[],
    especificacoes,
    ...topo,
  };
}

/** Converte linhas do CSV de configurações de array e anexa aos produtos. */
export function anexarConfiguracoes(produtos: Record<string, unknown>[], linhas: Record<string, string>[]): string[] {
  const erros: string[] = [];
  const porId = new Map<string, Record<string, unknown>[]>();
  const meta = new Map<string, { fonte: string; data: string; status: string }>();
  for (const l of linhas) {
    const id = l.produto_id ?? "";
    const cfg: Record<string, unknown> = { modulos: int(l.modulos ?? ""), H: num(l.H ?? ""), V: num(l.V ?? "") };
    if (l.angulo_splay) cfg.anguloSplay = num(l.angulo_splay);
    if (l.alcance_nominal_m) cfg.alcanceNominal_m = num(l.alcance_nominal_m);
    if (l.altura_centro_m) cfg.alturaCentro_m = num(l.altura_centro_m);
    if (l.spl_por_distancia)
      cfg.spl_por_distancia = l.spl_por_distancia.split("|").map((par) => {
        const [d, s] = par.split(":");
        return { distancia_m: num(d ?? ""), spl_db: num(s ?? "") };
      });
    porId.set(id, [...(porId.get(id) ?? []), cfg]);
    const m = meta.get(id);
    if (m && (m.fonte !== (l.fonte ?? "") || m.data !== (l.data ?? ""))) erros.push(`${id}: todas as linhas da tabela de configuração precisam da mesma fonte e data.`);
    meta.set(id, { fonte: l.fonte ?? "", data: l.data ?? "", status: l.status || "declarado_fabricante" });
  }
  for (const [id, cfgs] of porId) {
    const p = produtos.find((x) => x.id === id);
    if (!p) {
      erros.push(`Configuração de array para produto inexistente: ${id}.`);
      continue;
    }
    const m = meta.get(id)!;
    (p.especificacoes as Record<string, unknown>).coberturaPorConfiguracao = {
      valor: cfgs,
      unidade: "graus/m/dB",
      fonte: m.fonte,
      dataVerificacao: m.data,
      status: m.status,
    };
  }
  return erros;
}

export function linhaParaFaixa(l: Record<string, string>): Record<string, unknown> {
  return {
    id: l.id,
    categoria: l.categoria,
    subcategoria: l.subcategoria ?? "",
    porte: l.porte,
    minimo: num(l.minimo ?? ""),
    maximo: num(l.maximo ?? ""),
    fonte: l.fonte,
    dataVerificacao: l.dataVerificacao,
    validadeDias: l.validadeDias ? int(l.validadeDias) : 90,
  };
}
