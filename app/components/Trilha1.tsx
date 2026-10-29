"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trilha1Schema } from "@engine/input/schema";
import { normalizarTrilha1 } from "@engine/input/normalize";
import { PARAMS_V1 } from "@engine/params";
import { Escolha, Multipla, Numero } from "./Campos";
import { Info } from "./Info";
import { IconeForma, IconeFormato } from "./Ilustracoes";
import { analytics } from "@/lib/analytics";
import { apagarRascunho, codificar, lerRascunho, salvarRascunho } from "@/lib/state";
import { estadoAtual } from "@/lib/rodar";

/** Respostas da trilha 1 enquanto o usuário preenche (números como texto). */
export interface RascunhoT1 {
  tipoEstabelecimento?: string;
  usos?: string[] | "nao_sei";
  formacaoBanda?: string;
  dimTipo?: "medidas" | "faixa";
  comprimento?: string;
  largura?: string;
  peDireito?: string;
  faixa?: string;
  formato?: string;
  paredePalco?: string;
  profPalco?: string;
  profPalcoNaoSei?: boolean;
  publico?: string;
  disposicao?: string;
  estruturas?: { mezanino: boolean; colunas: boolean; conectados: boolean } | "nao_sei";
  ambiente?: string;
  superficies?: string;
  palma?: string;
  conversa?: string;
  forma?: string;
  formatoCaixa?: string;
  mobilidade?: string;
}

const num = (s: string | undefined) => (s === undefined || s.trim() === "" ? undefined : Number(s.replace(",", ".")));

/** Converte o rascunho na entrada do motor. `completar` preenche o que ainda não foi respondido, só para validar o passo atual. */
export function paraEntrada(r: RascunhoT1, completar = false): Record<string, unknown> {
  const dims =
    r.dimTipo === "faixa"
      ? { tipo: "faixa", faixa: r.faixa ?? (completar ? "salao_medio" : undefined) }
      : {
          tipo: "medidas",
          comprimento: num(r.comprimento) ?? (completar ? 10 : undefined),
          largura: num(r.largura) ?? (completar ? 8 : undefined),
          peDireito: num(r.peDireito) ?? (completar ? 3 : undefined),
        };
  const t: Record<string, unknown> = {
    tipoEstabelecimento: r.tipoEstabelecimento ?? (completar ? "outro" : undefined),
    usos: r.usos ?? (completar ? ["fala"] : undefined),
    dimensoes: dims,
    formato: r.formato ?? "retangular",
    palco: { parede: r.paredePalco ?? "menor", profundidade: r.profPalcoNaoSei || num(r.profPalco) === undefined ? "nao_sei" : num(r.profPalco) },
    publico: { quantidade: num(r.publico) ?? (completar ? 1 : undefined), disposicao: r.disposicao ?? "sentado" },
    estruturas: r.estruturas ?? { mezanino: false, colunas: false, conectados: false },
    ambiente: r.ambiente ?? "fechado",
    acustica: { superficies: r.superficies ?? "nao_sei", palma: r.palma ?? "nao_sei", conversa: r.conversa ?? "nao_sei" },
    instalacao: { forma: r.forma ?? "sem_preferencia", formato: r.formatoCaixa ?? "sem_preferencia" },
    mobilidade: r.mobilidade ?? "fixa",
  };
  if (Array.isArray(r.usos) && r.usos.includes("banda")) t.formacaoBanda = r.formacaoBanda ?? "nao_sei";
  return t;
}

/** Volta da entrada do motor para o rascunho (para editar um resultado aberto por link). */
export function rascunhoDeEntrada(t: Record<string, unknown>): RascunhoT1 {
  const d = (t.dimensoes ?? {}) as Record<string, unknown>;
  const palco = (t.palco ?? {}) as Record<string, unknown>;
  const pub = (t.publico ?? {}) as Record<string, unknown>;
  const ac = (t.acustica ?? {}) as Record<string, unknown>;
  const ins = (t.instalacao ?? {}) as Record<string, unknown>;
  const s = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
  return {
    tipoEstabelecimento: s(t.tipoEstabelecimento),
    usos: (t.usos as string[] | "nao_sei" | undefined) ?? undefined,
    formacaoBanda: s(t.formacaoBanda),
    dimTipo: d.tipo === "faixa" ? "faixa" : "medidas",
    comprimento: s(d.comprimento),
    largura: s(d.largura),
    peDireito: s(d.peDireito),
    faixa: s(d.faixa),
    formato: s(t.formato),
    paredePalco: s(palco.parede),
    profPalco: palco.profundidade === "nao_sei" ? undefined : s(palco.profundidade),
    profPalcoNaoSei: palco.profundidade === "nao_sei",
    publico: s(pub.quantidade),
    disposicao: s(pub.disposicao),
    estruturas: (t.estruturas as RascunhoT1["estruturas"]) ?? undefined,
    ambiente: s(t.ambiente),
    superficies: s(ac.superficies),
    palma: s(ac.palma),
    conversa: s(ac.conversa),
    forma: s(ins.forma),
    formatoCaixa: s(ins.formato),
    mobilidade: s(t.mobilidade),
  };
}

const PASSO_DO_CAMPO: [RegExp, number][] = [
  [/^tipoEstabelecimento/, 0],
  [/^(usos|formacaoBanda)/, 1],
  [/^dimensoes/, 2],
  [/^formato/, 3],
  [/^palco/, 4],
  [/^publico/, 5],
  [/^estruturas/, 6],
  [/^ambiente/, 7],
  [/^acustica/, 8],
  [/^(instalacao|mobilidade)/, 9],
];

/** Erros por campo, vindos do schema e da normalização do próprio motor (fonte única de validação). */
export function errosDe(r: RascunhoT1, completar: boolean): { campo: string; mensagem: string; passo: number }[] {
  const p = Trilha1Schema.safeParse(paraEntrada(r, completar));
  const lista = p.success
    ? (() => {
        const n = normalizarTrilha1(p.data, PARAMS_V1);
        return n.ok ? [] : n.erros;
      })()
    : p.error.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message }));
  return lista.map((e) => ({ ...e, passo: PASSO_DO_CAMPO.find(([re]) => re.test(e.campo))?.[1] ?? 0 }));
}

const PASSOS = ["Local", "Uso", "Medidas", "Formato", "Palco", "Público", "Estruturas", "Ambiente", "Acústica", "Instalação"];

/** Por que cada pergunta existe e o que ela muda (SPEC B2). */
const POR_QUE: string[] = [
  "O tipo de local sugere os usos e a ocupação mais comuns. Se você responder “não sei” depois, usamos o mais comum para este tipo de local.",
  "Fala, música de fundo e banda pedem volumes bem diferentes. O uso também decide se precisa de subwoofer (grave forte).",
  "As medidas definem a distância até a última fileira, quantas caixas são necessárias e a altura delas. Se não souber, escolha um tamanho parecido: o resultado fica marcado como estimado.",
  "O sistema calcula salas retangulares. Em L ou irregular, ele calcula a parte principal e avisa o que ficou de fora.",
  "As caixas ficam junto do palco. A profundidade do palco define onde começa o público e onde ficam os microfones.",
  "A quantidade de pessoas e se ficam sentadas ou em pé mudam a altura dos ouvidos e a área ocupada.",
  "Mezanino, colunas grandes e salas ligadas ficam fora do cálculo simples. Saber disso evita uma recomendação errada.",
  "Em ambiente aberto não há eco de paredes, e a avaliação de eco não vale.",
  "Paredes duras e eco forte deixam a voz confusa. Barulho de fundo pede mais volume. Responda do jeito que você percebe o local.",
  "A forma de instalar limita a altura das caixas e os modelos possíveis. Se não tiver preferência, o sistema escolhe.",
];

export function Trilha1() {
  const router = useRouter();
  const [r, setR] = useState<RascunhoT1>({});
  const [passo, setPasso] = useState(0);
  const [mostrarErros, setMostrarErros] = useState(false);
  const inicio = useRef<number>(0);
  const inicioPasso = useRef<number>(0);
  const concluido = useRef(false);

  useEffect(() => {
    const d = lerRascunho() as { t1?: RascunhoT1; passo?: number; inicio?: number } | null;
    // Restaurar o rascunho é sincronizar com um sistema externo (localStorage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (d?.t1) setR(d.t1);
    if (typeof d?.passo === "number") setPasso(Math.min(Math.max(0, d.passo), PASSOS.length - 1));
    inicio.current = typeof d?.inicio === "number" ? d.inicio : Date.now();
  }, []);

  useEffect(() => {
    inicioPasso.current = Date.now();
    analytics().registrar({ tipo: "etapa_iniciada", trilha: 1, etapa: PASSOS[passo]! });
    const sair = () => {
      if (!concluido.current) analytics().registrar({ tipo: "abandono", trilha: 1, etapa: PASSOS[passo]! });
    };
    window.addEventListener("pagehide", sair);
    return () => window.removeEventListener("pagehide", sair);
  }, [passo]);

  const set = (patch: Partial<RascunhoT1>) => {
    setR((atual) => {
      const novo = { ...atual, ...patch };
      salvarRascunho({ t1: novo, passo, inicio: inicio.current });
      return novo;
    });
  };

  const erros = useMemo(() => errosDe(r, true), [r]);
  const errosPasso = erros.filter((e) => e.passo === passo);
  const erroCampo = (campo: string) => (mostrarErros ? errosPasso.find((e) => e.campo === campo)?.mensagem : undefined);

  const obrigatorioOk = (() => {
    if (passo === 0) return !!r.tipoEstabelecimento;
    if (passo === 1) return r.usos === "nao_sei" || (Array.isArray(r.usos) && r.usos.length > 0);
    if (passo === 2) return r.dimTipo === "faixa" ? !!r.faixa : num(r.comprimento) !== undefined && num(r.largura) !== undefined && num(r.peDireito) !== undefined;
    if (passo === 5) return num(r.publico) !== undefined;
    return true;
  })();

  const avancar = () => {
    if (!obrigatorioOk || errosPasso.length > 0) {
      setMostrarErros(true);
      return;
    }
    setMostrarErros(false);
    analytics().registrar({ tipo: "etapa_concluida", trilha: 1, etapa: PASSOS[passo]!, segundos: Math.round((Date.now() - inicioPasso.current) / 1000) });
    if (passo < PASSOS.length - 1) {
      const p = passo + 1;
      setPasso(p);
      salvarRascunho({ t1: r, passo: p, inicio: inicio.current });
      window.scrollTo(0, 0);
      return;
    }
    const finais = errosDe(r, false);
    if (finais.length > 0) {
      setPasso(finais[0]!.passo);
      setMostrarErros(true);
      return;
    }
    concluido.current = true;
    analytics().registrar({ tipo: "tempo_ate_resultado", segundos: Math.round((Date.now() - inicio.current) / 1000) });
    const estado = estadoAtual({ trilha1: paraEntrada(r) });
    salvarRascunho({ t1: r, passo, inicio: inicio.current, ultimoResultado: codificar(estado) });
    router.push(`/resultado/?d=${codificar(estado)}`);
  };

  const voltar = () => {
    setMostrarErros(false);
    setPasso((p) => Math.max(0, p - 1));
  };

  return (
    <div className="container">
      <div className="card">
        <div className="ajuda">
          Passo {passo + 1} de {PASSOS.length} · {PASSOS[passo]}
        </div>
        <div className="progresso" aria-hidden="true">
          <div style={{ width: `${((passo + 1) / PASSOS.length) * 100}%` }} />
        </div>
        <div className="nao-imprimir" style={{ float: "right" }}>
          <Info titulo="Por que perguntamos" rotulo="por que perguntamos" testId={`porque-pergunta-${passo}`}>
            <span className="p">{POR_QUE[passo]}</span>
          </Info>
        </div>
        <Passo passo={passo} r={r} set={set} erroCampo={erroCampo} />
        {mostrarErros && !obrigatorioOk ? (
          <div className="msg-erro" role="alert">
            Responda esta pergunta para continuar.
          </div>
        ) : null}
        {mostrarErros && errosPasso.length > 0 && passo !== 2 && passo !== 4 && passo !== 5 ? (
          <div className="msg-erro" role="alert">
            {errosPasso.map((e) => e.mensagem).join(" ")}
          </div>
        ) : null}
        <div className="acoes fim">
          <button type="button" className="btn sec" onClick={voltar} disabled={passo === 0}>
            Voltar
          </button>
          <button type="button" className="btn" onClick={avancar} data-testid="avancar">
            {passo === PASSOS.length - 1 ? "Ver resultado" : "Continuar"}
          </button>
        </div>
      </div>
      <p className="ajuda nao-imprimir">
        Suas respostas ficam salvas só neste navegador.{" "}
        <button
          type="button"
          className="btn link"
          onClick={() => {
            apagarRascunho();
            setR({});
            setPasso(0);
          }}
        >
          Começar de novo
        </button>
      </p>
    </div>
  );
}

function Passo({ passo, r, set, erroCampo }: { passo: number; r: RascunhoT1; set: (p: Partial<RascunhoT1>) => void; erroCampo: (c: string) => string | undefined }) {
  switch (passo) {
    case 0:
      return (
        <>
          <h1>Que tipo de local é?</h1>
          <p className="ajuda">Define os usos e a ocupação mais comuns.</p>
          <Escolha
            nome="tipo"
            valor={r.tipoEstabelecimento}
            onChange={(v) => set({ tipoEstabelecimento: v })}
            opcoes={[
              { valor: "igreja", rotulo: "Igreja" },
              { valor: "bar", rotulo: "Bar" },
              { valor: "restaurante", rotulo: "Restaurante" },
              { valor: "auditorio", rotulo: "Auditório" },
              { valor: "salao_eventos", rotulo: "Salão / casa de eventos" },
              { valor: "outro", rotulo: "Outro" },
            ]}
          />
        </>
      );
    case 1: {
      const usos = Array.isArray(r.usos) ? r.usos : [];
      return (
        <>
          <h1>Para que o som vai ser usado?</h1>
          <p className="ajuda">Escolha um ou mais. Define o nível de som necessário e se precisa de subwoofer.</p>
          <Multipla
            nome="uso"
            valores={usos}
            onChange={(v) => set({ usos: v })}
            opcoes={[
              { valor: "fala", rotulo: "Fala / pregação" },
              { valor: "musica_ambiente", rotulo: "Música ambiente" },
              { valor: "musica_primeiro_plano", rotulo: "Música em primeiro plano" },
              { valor: "banda", rotulo: "Banda ao vivo" },
              { valor: "dj", rotulo: "DJ" },
              { valor: "video", rotulo: "Vídeo" },
            ]}
          />
          <div className="acoes">
            <button type="button" className="opcao nao-sei" aria-pressed={r.usos === "nao_sei"} onClick={() => set({ usos: "nao_sei" })} data-testid="uso-nao_sei">
              Não sei (usar o comum para este tipo de local)
            </button>
          </div>
          {usos.includes("banda") ? (
            <div style={{ marginTop: 16 }}>
              <h2>Qual a formação da banda?</h2>
              <Escolha
                nome="formacao"
                valor={r.formacaoBanda}
                onChange={(v) => set({ formacaoBanda: v })}
                naoSei
                opcoes={[
                  { valor: "voz_violao", rotulo: "Voz e violão" },
                  { valor: "acustica", rotulo: "Banda acústica (sem bateria)" },
                  { valor: "banda_bateria", rotulo: "Banda com bateria" },
                  { valor: "varia", rotulo: "Varia", sub: "Usa o caso mais exigente" },
                ]}
              />
            </div>
          ) : null}
        </>
      );
    }
    case 2:
      return (
        <>
          <h1>Quais as medidas do ambiente?</h1>
          <p className="ajuda">Em metros. Pé-direito é a altura do chão ao teto.</p>
          {r.dimTipo !== "faixa" ? (
            <>
              <div className="grade-3">
                <Numero id="comprimento" rotulo="Comprimento" sufixo="m" valor={r.comprimento ?? ""} onChange={(v) => set({ comprimento: v, dimTipo: "medidas" })} erro={erroCampo("dimensoes.comprimento") ?? erroCampo("dimensoes")} />
                <Numero id="largura" rotulo="Largura" sufixo="m" valor={r.largura ?? ""} onChange={(v) => set({ largura: v, dimTipo: "medidas" })} erro={erroCampo("dimensoes.largura")} />
                <Numero id="peDireito" rotulo="Pé-direito" sufixo="m" valor={r.peDireito ?? ""} onChange={(v) => set({ peDireito: v, dimTipo: "medidas" })} erro={erroCampo("dimensoes.peDireito")} />
              </div>
              <button type="button" className="opcao nao-sei" onClick={() => set({ dimTipo: "faixa" })} data-testid="dim-nao_sei">
                Não sei as medidas
              </button>
            </>
          ) : (
            <>
              <p>Escolha o tamanho mais parecido. O resultado fica marcado como estimado.</p>
              <Escolha
                nome="faixa"
                valor={r.faixa}
                onChange={(v) => set({ faixa: v })}
                opcoes={Object.entries(PARAMS_V1.faixasTamanho.valor).map(([k, f]) => ({
                  valor: k,
                  rotulo: { sala_aula: "Como uma sala de aula", salao_medio: "Como um salão médio", salao_grande: "Como um salão grande", quadra: "Como uma quadra" }[k] ?? k,
                  sub: `cerca de ${f.comprimento} x ${f.largura} m, ${f.peDireito} m de altura`,
                }))}
              />
              <button type="button" className="btn link" onClick={() => set({ dimTipo: "medidas" })}>
                Prefiro informar as medidas
              </button>
            </>
          )}
        </>
      );
    case 3:
      return (
        <>
          <h1>Qual o formato do ambiente?</h1>
          <p className="ajuda">O sistema calcula salas retangulares. Outros formatos ficam “atendidos parcialmente”.</p>
          <Escolha
            nome="formato"
            valor={r.formato}
            onChange={(v) => set({ formato: v })}
            naoSei
            opcoes={[
              { valor: "retangular", rotulo: "Retangular", icone: <IconeFormato tipo="retangular" /> },
              { valor: "recorte", rotulo: "Retangular com recorte", icone: <IconeFormato tipo="recorte" /> },
              { valor: "L", rotulo: "Em L", icone: <IconeFormato tipo="L" /> },
              { valor: "irregular", rotulo: "Irregular", icone: <IconeFormato tipo="irregular" /> },
            ]}
          />
        </>
      );
    case 4:
      return (
        <>
          <h1>Onde fica o palco (ou a frente)?</h1>
          <Escolha
            nome="parede"
            valor={r.paredePalco}
            onChange={(v) => set({ paredePalco: v })}
            naoSei
            opcoes={[
              { valor: "menor", rotulo: "Na parede menor", sub: "O público fica no sentido do comprimento" },
              { valor: "maior", rotulo: "Na parede maior", sub: "O público fica no sentido da largura" },
            ]}
          />
          <div style={{ marginTop: 16 }}>
            {!r.profPalcoNaoSei ? (
              <Numero id="profPalco" rotulo="Profundidade aproximada do palco" sufixo="m" valor={r.profPalco ?? ""} onChange={(v) => set({ profPalco: v })} erro={erroCampo("palco.profundidade")} />
            ) : (
              <p>Profundidade do palco: padrão de {PARAMS_V1.profundidadePalcoPadrao.valor} m.</p>
            )}
            <button type="button" className="opcao nao-sei" aria-pressed={!!r.profPalcoNaoSei} onClick={() => set({ profPalcoNaoSei: !r.profPalcoNaoSei })} data-testid="palco-nao_sei">
              Não sei a profundidade
            </button>
          </div>
        </>
      );
    case 5:
      return (
        <>
          <h1>Como é o público?</h1>
          <Numero id="publico" rotulo="Quantidade habitual de pessoas" valor={r.publico ?? ""} onChange={(v) => set({ publico: v })} passo="1" erro={erroCampo("publico.quantidade")} />
          <span className="rotulo">As pessoas ficam:</span>
          <Escolha
            nome="disposicao"
            valor={r.disposicao}
            onChange={(v) => set({ disposicao: v })}
            naoSei
            colunas="tres"
            opcoes={[
              { valor: "sentado", rotulo: "Sentadas" },
              { valor: "em_pe", rotulo: "Em pé" },
              { valor: "mesas", rotulo: "Em mesas" },
            ]}
          />
        </>
      );
    case 6: {
      const e = r.estruturas === "nao_sei" || !r.estruturas ? { mezanino: false, colunas: false, conectados: false } : r.estruturas;
      const marcados = Object.entries(e)
        .filter(([, v]) => v)
        .map(([k]) => k);
      return (
        <>
          <h1>O ambiente tem algum destes?</h1>
          <p className="ajuda">Itens fora do modelo do sistema. Marque os que existem.</p>
          <Multipla
            nome="estrutura"
            valores={r.estruturas === "nao_sei" ? [] : marcados}
            onChange={(v) => set({ estruturas: { mezanino: v.includes("mezanino"), colunas: v.includes("colunas"), conectados: v.includes("conectados") } })}
            opcoes={[
              { valor: "mezanino", rotulo: "Mezanino ou balcão" },
              { valor: "colunas", rotulo: "Colunas grandes" },
              { valor: "conectados", rotulo: "Ambientes conectados", sub: "Outra sala que também precisa de som" },
            ]}
          />
          <div className="acoes">
            <button type="button" className="opcao" aria-pressed={r.estruturas !== "nao_sei" && marcados.length === 0 && r.estruturas !== undefined} onClick={() => set({ estruturas: { mezanino: false, colunas: false, conectados: false } })}>
              Nenhum
            </button>
            <button type="button" className="opcao nao-sei" aria-pressed={r.estruturas === "nao_sei"} onClick={() => set({ estruturas: "nao_sei" })}>
              Não sei
            </button>
          </div>
        </>
      );
    }
    case 7:
      return (
        <>
          <h1>O ambiente é:</h1>
          <Escolha
            nome="ambiente"
            valor={r.ambiente}
            onChange={(v) => set({ ambiente: v })}
            naoSei
            colunas="tres"
            opcoes={[
              { valor: "fechado", rotulo: "Fechado" },
              { valor: "semiaberto", rotulo: "Semiaberto", sub: "Uma ou mais laterais abertas" },
              { valor: "aberto", rotulo: "Aberto", sub: "Ao ar livre" },
            ]}
          />
        </>
      );
    case 8:
      return (
        <>
          <h1>Como é a acústica?</h1>
          <h2>As paredes e o teto são principalmente:</h2>
          <Escolha
            nome="superficies"
            valor={r.superficies}
            onChange={(v) => set({ superficies: v })}
            naoSei
            opcoes={[
              { valor: "duras", rotulo: "Lisos e duros", sub: "Alvenaria, vidro, azulejo" },
              { valor: "mistas", rotulo: "Mistos" },
              { valor: "absorventes", rotulo: "Com cortinas, madeira, forro ou estofados" },
            ]}
          />
          <h2 style={{ marginTop: 16 }}>Com o ambiente vazio, uma palma ecoa?</h2>
          <Escolha
            nome="palma"
            valor={r.palma}
            onChange={(v) => set({ palma: v })}
            naoSei
            opcoes={[
              { valor: "sim", rotulo: "Sim" },
              { valor: "um_pouco", rotulo: "Um pouco" },
              { valor: "nao", rotulo: "Não" },
            ]}
          />
          <h2 style={{ marginTop: 16 }}>Com o local funcionando, é fácil conversar em tom normal?</h2>
          <Escolha
            nome="conversa"
            valor={r.conversa}
            onChange={(v) => set({ conversa: v })}
            naoSei
            opcoes={[
              { valor: "facil", rotulo: "Fácil" },
              { valor: "dificil", rotulo: "Difícil" },
              { valor: "muito_dificil", rotulo: "Muito difícil" },
            ]}
          />
        </>
      );
    case 9:
      return (
        <>
          <h1>Instalação e aparência</h1>
          <p className="ajuda">Opcional. Restringe as opções.</p>
          <h2>Como as caixas vão ficar?</h2>
          <Escolha
            nome="forma"
            valor={r.forma ?? "sem_preferencia"}
            onChange={(v) => set({ forma: v })}
            opcoes={[
              { valor: "pedestal", rotulo: "Pedestal / tripé", icone: <IconeForma tipo="pedestal" /> },
              { valor: "parede", rotulo: "Na parede", icone: <IconeForma tipo="parede" /> },
              { valor: "suspensa", rotulo: "Suspensa", icone: <IconeForma tipo="suspensa" /> },
              { valor: "chao", rotulo: "Apoiada no chão", icone: <IconeForma tipo="chao" /> },
              { valor: "sem_preferencia", rotulo: "Sem preferência", icone: <IconeForma tipo="" /> },
            ]}
          />
          <h2 style={{ marginTop: 16 }}>Formato preferido</h2>
          <Escolha
            nome="formatoCaixa"
            valor={r.formatoCaixa ?? "sem_preferencia"}
            onChange={(v) => set({ formatoCaixa: v })}
            colunas="tres"
            opcoes={[
              { valor: "convencional", rotulo: "Caixas convencionais", icone: <IconeForma tipo="convencional" /> },
              { valor: "coluna", rotulo: "Coluna / vertical array", icone: <IconeForma tipo="coluna" /> },
              { valor: "sem_preferencia", rotulo: "Sem preferência", icone: <IconeForma tipo="" /> },
            ]}
          />
          <h2 style={{ marginTop: 16 }}>A instalação é:</h2>
          <Escolha
            nome="mobilidade"
            valor={r.mobilidade ?? "fixa"}
            onChange={(v) => set({ mobilidade: v })}
            opcoes={[
              { valor: "fixa", rotulo: "Fixa" },
              { valor: "movel", rotulo: "Móvel", sub: "Monta e desmonta" },
            ]}
          />
        </>
      );
    default:
      return null;
  }
}
