import { classificarCobertura, melhorEstado, type EstadoCobertura } from "../acoustics/coverage";
import { interpolarSpl, nivelDireto } from "../acoustics/level";
import type { Malha } from "../geometry/grid";
import { angulosForaEixo, dist3 } from "../geometry/vec";
import type { Caixa, Configuracao } from "./types";

export type StatusCapacidade = "validada" | "pendente" | "insuficiente";

export interface Avaliacao {
  /** Estado de cada ponto da malha (mesma ordem de malha.pontos). Subwoofers não entram. */
  estados: EstadoCobertura[];
  pct: { coberto: number; borda: number; fora: number };
  nivel: { min: number; max: number; uniformidade: number; pontosAvaliados: number } | null;
  /** Pontos cobertos por caixa de produto sem nível calculável (sem dado ou fora da tabela). */
  pontosSemNivel: number;
  /** Pontos cobertos só por caixa genérica (front-fill genérico, por exemplo). */
  pontosSoGenericos: number;
  capacidade: StatusCapacidade;
  motivoCapacidade: string;
  /** Nível mínimo por linha da malha (y), só pontos com nível. */
  nivelPorLinha: { y: number; min: number }[];
}

function nivelCaixa(c: Caixa, d: number): number | undefined {
  const n = c.fonte.nivel;
  if (n.tipo === "pontual") return nivelDireto(n.spl1m, d);
  if (n.tipo === "tabela") return interpolarSpl(n.pontos, d);
  return undefined;
}

/**
 * Avalia cobertura nominal e nível direto de uma configuração (SPEC C5).
 * Combinação de fontes: cada ponto recebe o nível da fonte mais forte que o cobre.
 * O motor não soma fontes (sinais correlacionados). Isso é conservador.
 */
export function avaliar(cfg: Configuracao, malha: Malha, borda: number, requerido: number): Avaliacao {
  const caixas = cfg.caixas.filter((c) => c.papel !== "sub");
  const estados: EstadoCobertura[] = [];
  const niveis: (number | undefined)[] = [];
  let semNivel = 0;
  let soGenericos = 0;
  for (const p of malha.pontos) {
    let estado: EstadoCobertura = "fora";
    let melhor: number | undefined;
    let cobertoPorProduto = false;
    let cobertoPorProdutoComNivel = false;
    let cobertoPorGenerico = false;
    for (const c of caixas) {
      const e = classificarCobertura(angulosForaEixo(c.posicao, c.mira, p), c.fonte.cobertura.H, c.fonte.cobertura.V, borda);
      estado = melhorEstado(estado, e);
      if (e !== "coberto") continue;
      if (c.fonte.tipo === "generico") {
        cobertoPorGenerico = true;
        continue;
      }
      cobertoPorProduto = true;
      const n = nivelCaixa(c, dist3(c.posicao, p));
      if (n !== undefined) {
        cobertoPorProdutoComNivel = true;
        melhor = melhor === undefined ? n : Math.max(melhor, n);
      }
    }
    estados.push(estado);
    niveis.push(melhor);
    if (cobertoPorProduto && !cobertoPorProdutoComNivel) semNivel++;
    if (!cobertoPorProduto && cobertoPorGenerico) soGenericos++;
  }
  const total = Math.max(1, estados.length);
  const conta = (s: EstadoCobertura) => estados.filter((e) => e === s).length / total;
  const vals = niveis.filter((n): n is number => n !== undefined);
  const nivel = vals.length > 0 ? { min: Math.min(...vals), max: Math.max(...vals), uniformidade: Math.max(...vals) - Math.min(...vals), pontosAvaliados: vals.length } : null;

  const porLinha = new Map<number, number>();
  malha.pontos.forEach((p, i) => {
    const n = niveis[i];
    if (n === undefined) return;
    const y = Math.round(p.y * 1000) / 1000;
    porLinha.set(y, Math.min(porLinha.get(y) ?? Infinity, n));
  });
  const nivelPorLinha = [...porLinha.entries()].sort((a, b) => a[0] - b[0]).map(([y, min]) => ({ y, min }));

  const temProduto = caixas.some((c) => c.fonte.tipo === "produto");
  let capacidade: StatusCapacidade;
  let motivo: string;
  if (!temProduto) {
    capacidade = "pendente";
    motivo = "Perfil genérico: o nível é um requisito mínimo, não uma avaliação de produto.";
  } else if (nivel && nivel.min < requerido - 1e-9) {
    capacidade = "insuficiente";
    motivo = `Nível mínimo calculado ${nivel.min.toFixed(1)} dB abaixo do requerido ${requerido.toFixed(0)} dB.`;
  } else if (semNivel > 0 || !nivel) {
    capacidade = "pendente";
    const m = caixas.find((c) => c.fonte.tipo === "produto" && c.fonte.nivel.tipo === "pendente");
    motivo =
      m && m.fonte.nivel.tipo === "pendente"
        ? m.fonte.nivel.motivo
        : "O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.";
  } else {
    capacidade = "validada";
    motivo = `Nível mínimo calculado ${nivel.min.toFixed(1)} dB >= requerido ${requerido.toFixed(0)} dB.`;
  }
  return {
    estados,
    pct: { coberto: conta("coberto"), borda: conta("borda"), fora: conta("fora") },
    nivel,
    pontosSemNivel: semNivel,
    pontosSoGenericos: soGenericos,
    capacidade,
    motivoCapacidade: motivo,
    nivelPorLinha,
  };
}
