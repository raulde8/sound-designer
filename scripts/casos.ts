/** Os 10 casos de referência da SPEC C10 (entradas). O comportamento esperado é verificado em engine/casos.test.ts. */
const acustMedia = { superficies: "mistas", palma: "um_pouco", conversa: "facil" };
const med = (comprimento: number, largura: number, peDireito: number) => ({ tipo: "medidas", comprimento, largura, peDireito });

export const CASOS: { id: string; titulo: string; esperado: string; entrada: Record<string, unknown> }[] = [
  {
    id: "01-igreja-pequena-fala",
    titulo: "Igreja 12 x 10 x 3,5 m, 80 pessoas, fala",
    esperado: 'AR-1 com 2 caixas 10" ou 12"; sem sub; PAG/NAG calculado; suportado.',
    entrada: { trilha1: { tipoEstabelecimento: "igreja", usos: ["fala"], dimensoes: med(12, 10, 3.5), publico: { quantidade: 80 }, acustica: acustMedia } },
  },
  {
    id: "02-igreja-media-banda",
    titulo: "Igreja 25 x 15 x 6 m, 350 pessoas, banda com bateria",
    esperado: "AR-1 ou AR-2; sub sim; trilha 2 gera mesa digital; possível reforço; nível B depende dos dados; revisão profissional recomendada.",
    entrada: {
      trilha1: { tipoEstabelecimento: "igreja", usos: ["fala", "banda"], formacaoBanda: "banda_bateria", dimensoes: med(25, 15, 6), publico: { quantidade: 350 }, acustica: acustMedia },
      trilha2: {
        vozes: { paradas: 3, moveis: 1, pregador: true },
        instrumentos: { violao: 1, guitarra: 1, baixo: 1, teclado: 1, bateria_acustica: 1 },
        outrasFontes: { playback: true },
        retorno: { mixagens: 4, preferencia: "misto", mixagensInEar: 2 },
        operacao: { operador: "voluntario" },
      },
    },
  },
  {
    id: "03-restaurante-ambiente",
    titulo: "Restaurante 15 x 10 x 3 m, 100 pessoas, música ambiente",
    esperado: "AR-1 com caixas pequenas em parede, ou aviso de que a arquitetura distribuída (fase 1.1) seria melhor; sem sub.",
    entrada: { trilha1: { tipoEstabelecimento: "restaurante", usos: ["musica_ambiente"], dimensoes: med(15, 10, 3), publico: { quantidade: 100, disposicao: "mesas" }, acustica: acustMedia, instalacao: { forma: "parede" } } },
  },
  {
    id: "04-bar-banda-dj",
    titulo: "Bar 18 x 12 x 4 m, 180 pessoas, banda e DJ",
    esperado: "AR-1 ou AR-2 com sub; aviso de nível alto e segurança auditiva.",
    entrada: { trilha1: { tipoEstabelecimento: "bar", usos: ["banda", "dj"], formacaoBanda: "banda_bateria", dimensoes: med(18, 12, 4), publico: { quantidade: 180, disposicao: "em_pe" }, acustica: { ...acustMedia, conversa: "dificil" } } },
  },
  {
    id: "05-auditorio-palestras",
    titulo: "Auditório 30 x 18 x 7 m, 450 pessoas, palestras",
    esperado: "AR-2 preferido; distância no limite; reforço provável; revisão profissional recomendada.",
    entrada: { trilha1: { tipoEstabelecimento: "auditorio", usos: ["fala", "video"], dimensoes: med(30, 18, 7), publico: { quantidade: 450 }, acustica: acustMedia } },
  },
  {
    id: "06-ambiente-reflexivo",
    titulo: "Ambiente muito reflexivo (igreja 20 x 12 x 7 m, superfícies duras, palma ecoa)",
    esperado: "Classe de risco alto e aviso específico, sem aumentar a potência.",
    entrada: { trilha1: { tipoEstabelecimento: "igreja", usos: ["fala"], dimensoes: med(20, 12, 7), publico: { quantidade: 200 }, acustica: { superficies: "duras", palma: "sim", conversa: "facil" } } },
  },
  {
    id: "07-mezanino",
    titulo: "Ambiente com mezanino (igreja 20 x 12 x 7 m)",
    esperado: '"Atendido parcialmente", sem cobertura do mezanino.',
    entrada: { trilha1: { tipoEstabelecimento: "igreja", usos: ["fala"], dimensoes: med(20, 12, 7), publico: { quantidade: 250 }, estruturas: { mezanino: true, colunas: false, conectados: false }, acustica: acustMedia } },
  },
  {
    id: "08-sem-produto-adequado",
    titulo: "Catálogo sem produto adequado (vertical array na parede)",
    esperado: "Perfil genérico exibido.",
    entrada: { trilha1: { tipoEstabelecimento: "salao_eventos", usos: ["fala"], dimensoes: med(14, 10, 4), publico: { quantidade: 120 }, acustica: acustMedia, instalacao: { forma: "parede", formato: "coluna" } } },
  },
  {
    id: "09-dados-insuficientes",
    titulo: "Dados insuficientes (coluna portátil sem SPL publicado para a configuração)",
    esperado: 'Status "pendente" correto nos produtos.',
    entrada: { trilha1: { tipoEstabelecimento: "salao_eventos", usos: ["fala"], dimensoes: med(12, 9, 3.5), publico: { quantidade: 80 }, acustica: acustMedia, instalacao: { forma: "sem_preferencia", formato: "coluna" }, mobilidade: "movel" } },
  },
  {
    id: "10-orcamento-incompativel",
    titulo: "Orçamento incompatível (caso 1 com orçamento de R$ 1.000)",
    esperado: "Mensagem e custo mínimo, sem relaxar requisito.",
    entrada: { trilha1: { tipoEstabelecimento: "igreja", usos: ["fala"], dimensoes: med(12, 10, 3.5), publico: { quantidade: 80 }, acustica: acustMedia }, orcamento: 1000 },
  },
];
