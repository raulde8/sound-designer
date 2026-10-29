import type { Configuracao, Papel } from "./architectures/types";
import type { Montagem } from "../catalog/schema";

export interface ItemEquipamento {
  ref: string;
  nome: string;
  tipo: "produto" | "generico";
  papel: Papel;
  montagem: Montagem;
  quantidade: number;
  /** Números das caixas na planta. */
  numeros: number[];
}

const ORDEM: Papel[] = ["principal", "front_fill", "reforco", "sub"];

/**
 * Lista de equipamentos gerada do MESMO objeto de configuração que desenha a planta (SPEC B7).
 * Agrupa por papel, referência e montagem.
 */
export function listaEquipamentos(cfg: Configuracao): ItemEquipamento[] {
  const grupos = new Map<string, ItemEquipamento>();
  for (const c of cfg.caixas) {
    const k = `${c.papel}|${c.fonte.ref}|${c.montagem}`;
    const g = grupos.get(k);
    if (g) {
      g.quantidade++;
      g.numeros.push(c.numero);
    } else grupos.set(k, { ref: c.fonte.ref, nome: c.fonte.nome, tipo: c.fonte.tipo, papel: c.papel, montagem: c.montagem, quantidade: 1, numeros: [c.numero] });
  }
  return [...grupos.values()].sort((a, b) => ORDEM.indexOf(a.papel) - ORDEM.indexOf(b.papel) || a.ref.localeCompare(b.ref));
}
