export const fmt = (v: number, casas = 1) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export const STATUS_COMPAT: Record<string, string> = {
  compativel: "Compatível",
  parcial: "Parcial",
  incompativel: "Incompatível",
  nao_avaliavel: "Não avaliável",
};

export const STATUS_GEOMETRIA: Record<string, string> = {
  validada: "Geometria validada",
  validada_aproximacao: "Geometria validada com aproximação",
  fora_do_modelo: "Geometria fora do modelo",
};

export const STATUS_CAPACIDADE: Record<string, string> = {
  validada: "Capacidade sonora validada com dados do fabricante",
  pendente: "Capacidade sonora pendente (dados insuficientes)",
  insuficiente: "Capacidade sonora insuficiente",
};

export const STATUS_ACUSTICA: Record<string, string> = {
  baixo: "Acústica: baixo risco",
  medio: "Acústica: risco médio",
  alto: "Acústica: alto risco",
  nao_aplicavel: "Acústica: classe não se aplica (ambiente não fechado)",
};

export const PAPEL: Record<string, string> = { principal: "Principal", front_fill: "Front-fill", reforco: "Reforço / delay", sub: "Subwoofer" };
export const MONTAGEM: Record<string, string> = { pedestal: "Pedestal", parede: "Parede", suspensa: "Suspensa", chao: "No chão" };
