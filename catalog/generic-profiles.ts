import type { Categoria } from "./schema";

/**
 * Perfis genéricos (SPEC C7). Um perfil é só um conjunto de requisitos mínimos
 * calculados para o caso. Nunca tem marca, preço nem foto.
 * Os valores dos requisitos são preenchidos pelo motor; aqui só há a identidade do perfil.
 */
export interface GenericProfileDef {
  id: string;
  categoria: Categoria;
  subcategoria: string;
  nome: string;
}

export const ROTULO_PERFIL_GENERICO = "Perfil genérico - especificação mínima, não é um produto.";

export const PERFIS_GENERICOS: GenericProfileDef[] = [
  { id: "GEN-ATIVA-10", categoria: "caixa_ativa", subcategoria: "10", nome: 'Caixa ativa 10" (perfil genérico)' },
  { id: "GEN-ATIVA-12", categoria: "caixa_ativa", subcategoria: "12", nome: 'Caixa ativa 12" (perfil genérico)' },
  { id: "GEN-ATIVA-15", categoria: "caixa_ativa", subcategoria: "15", nome: 'Caixa ativa 15" (perfil genérico)' },
  { id: "GEN-COLUNA", categoria: "vertical_array", subcategoria: "coluna", nome: "Coluna / vertical array portátil (perfil genérico)" },
  { id: "GEN-LINE-COMPACTO", categoria: "vertical_array", subcategoria: "line_array_compacto", nome: "Line array compacto (perfil genérico)" },
  { id: "GEN-SUB", categoria: "subwoofer", subcategoria: "", nome: "Subwoofer ativo (perfil genérico)" },
  { id: "GEN-MESA-ANALOGICA", categoria: "mesa", subcategoria: "analogica", nome: "Mesa de som analógica (perfil genérico)" },
  { id: "GEN-MESA-DIGITAL", categoria: "mesa", subcategoria: "digital", nome: "Mesa de som digital (perfil genérico)" },
  { id: "GEN-MIC-FIO", categoria: "microfone_com_fio", subcategoria: "dinamico", nome: "Microfone de mão dinâmico com fio (perfil genérico)" },
  { id: "GEN-KIT-BATERIA", categoria: "microfone_com_fio", subcategoria: "kit_bateria", nome: "Kit de microfones de bateria (perfil genérico)" },
  { id: "GEN-MIC-SEM-FIO", categoria: "microfone_sem_fio", subcategoria: "", nome: "Sistema de microfone sem fio (perfil genérico)" },
  { id: "GEN-IN-EAR", categoria: "in_ear", subcategoria: "", nome: "Sistema de in-ear (perfil genérico)" },
  { id: "GEN-MONITOR", categoria: "monitor_chao", subcategoria: "", nome: "Monitor de chão (perfil genérico)" },
  { id: "GEN-DI", categoria: "di", subcategoria: "", nome: "Direct box (perfil genérico)" },
  { id: "GEN-PEDESTAL-CAIXA", categoria: "acessorio", subcategoria: "pedestal_caixa", nome: "Pedestal de caixa (perfil genérico)" },
  { id: "GEN-PEDESTAL-MIC", categoria: "acessorio", subcategoria: "pedestal_microfone", nome: "Pedestal de microfone (perfil genérico)" },
  { id: "GEN-SUPORTE-PAREDE", categoria: "acessorio", subcategoria: "suporte_parede", nome: "Suporte de parede (perfil genérico)" },
  { id: "GEN-CABO-XLR", categoria: "acessorio", subcategoria: "cabo_xlr", nome: "Cabo XLR balanceado (perfil genérico)" },
  { id: "GEN-REGUA", categoria: "acessorio", subcategoria: "regua", nome: "Régua/filtro de linha (perfil genérico)" },
  { id: "GEN-MULTICABO", categoria: "acessorio", subcategoria: "multicabo", nome: "Multicabo / snake (perfil genérico)" },
];

export function perfilGenerico(id: string): GenericProfileDef {
  const p = PERFIS_GENERICOS.find((x) => x.id === id);
  if (!p) throw new Error(`Perfil genérico inexistente: ${id}`);
  return p;
}
