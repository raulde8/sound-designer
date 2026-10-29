"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Escolha, Contador } from "./Campos";
import { analytics } from "@/lib/analytics";
import { codificar, type EstadoUrl } from "@/lib/state";
import { estadoAtual } from "@/lib/rodar";

type Inst = "violao" | "guitarra" | "baixo" | "teclado" | "bateria_acustica" | "bateria_eletronica" | "sopro" | "outros";

export interface RascunhoT2 {
  vozesNaoSei?: boolean;
  paradas: number;
  moveis: number;
  tipoSemFio: "mao" | "headset" | "lapela";
  pregador: boolean;
  instNaoSei?: boolean;
  inst: Record<Inst, number>;
  kitBateria: "basico" | "completo";
  fontesNaoSei?: boolean;
  fontes: { playback: boolean; celular: boolean; dj: boolean; video: boolean };
  retornoNaoSei?: boolean;
  mixagens: number;
  preferencia: "in_ear" | "monitor" | "misto";
  opNaoSei?: boolean;
  operador?: "voluntario" | "ocasional" | "fixo";
  controleRemoto: boolean;
}

export const RASCUNHO_T2_VAZIO: RascunhoT2 = {
  paradas: 1,
  moveis: 0,
  tipoSemFio: "mao",
  pregador: false,
  inst: { violao: 0, guitarra: 0, baixo: 0, teclado: 0, bateria_acustica: 0, bateria_eletronica: 0, sopro: 0, outros: 0 },
  kitBateria: "basico",
  fontes: { playback: false, celular: false, dj: false, video: false },
  mixagens: 0,
  preferencia: "monitor",
  controleRemoto: false,
};

export function t2ParaEntrada(r: RascunhoT2): Record<string, unknown> {
  return {
    vozes: r.vozesNaoSei ? "nao_sei" : { paradas: r.paradas, moveis: r.moveis, tipoSemFio: r.tipoSemFio, pregador: r.pregador },
    instrumentos: r.instNaoSei ? "nao_sei" : { ...r.inst, kitBateria: r.kitBateria },
    outrasFontes: r.fontesNaoSei ? "nao_sei" : r.fontes,
    retorno: r.retornoNaoSei ? "nao_sei" : { mixagens: r.mixagens, preferencia: r.preferencia },
    operacao: r.opNaoSei || !r.operador ? "nao_sei" : { operador: r.operador, controleRemoto: r.controleRemoto },
  };
}

const PASSOS = ["Vozes", "Instrumentos", "Outras fontes", "Retorno", "Operação"];
const ROT: Record<Inst, string> = {
  violao: "Violão",
  guitarra: "Guitarra",
  baixo: "Baixo",
  teclado: "Teclado",
  bateria_acustica: "Bateria acústica",
  bateria_eletronica: "Bateria eletrônica",
  sopro: "Sopro",
  outros: "Outros",
};

function NaoSei({ ativo, onClick, id }: { ativo: boolean; onClick: () => void; id: string }) {
  return (
    <button type="button" className="opcao nao-sei" aria-pressed={ativo} onClick={onClick} data-testid={id} style={{ marginTop: 12 }}>
      Não sei (usar o comum para este tipo de local)
    </button>
  );
}

export function Trilha2({ estado }: { estado: EstadoUrl }) {
  const router = useRouter();
  const [r, setR] = useState<RascunhoT2>(RASCUNHO_T2_VAZIO);
  const [passo, setPasso] = useState(0);
  const inicioPasso = useRef(0);

  useEffect(() => {
    inicioPasso.current = Date.now();
    analytics().registrar({ tipo: "etapa_iniciada", trilha: 2, etapa: PASSOS[passo]! });
  }, [passo]);

  const set = (p: Partial<RascunhoT2>) => setR((a) => ({ ...a, ...p }));

  const avancar = () => {
    analytics().registrar({ tipo: "etapa_concluida", trilha: 2, etapa: PASSOS[passo]!, segundos: Math.round((Date.now() - inicioPasso.current) / 1000) });
    if (passo < PASSOS.length - 1) {
      setPasso(passo + 1);
      window.scrollTo(0, 0);
      return;
    }
    analytics().registrar({ tipo: "uso_trilha2" });
    const novo = estadoAtual({ ...estado.e, trilha2: t2ParaEntrada(r) }, estado.d);
    router.push(`/resultado/?d=${codificar(novo)}#palco`);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="ajuda">
          Palco e microfones · passo {passo + 1} de {PASSOS.length} · {PASSOS[passo]}
        </div>
        <div className="progresso" aria-hidden="true">
          <div style={{ width: `${((passo + 1) / PASSOS.length) * 100}%` }} />
        </div>
        {passo === 0 ? (
          <>
            <h1>Quantas pessoas falam ou cantam ao mesmo tempo?</h1>
            <div className={r.vozesNaoSei ? "desatualizado" : ""}>
              <Contador id="paradas" rotulo="Paradas (no pedestal)" valor={r.paradas} onChange={(v) => set({ paradas: v })} />
              <Contador id="moveis" rotulo="Que andam pelo palco" valor={r.moveis} onChange={(v) => set({ moveis: v })} />
              <Escolha
                nome="pregador"
                valor={r.pregador ? "sim" : "nao"}
                onChange={(v) => set({ pregador: v === "sim" })}
                opcoes={[
                  { valor: "nao", rotulo: "Sem pregador/apresentador" },
                  { valor: "sim", rotulo: "Tem pregador/apresentador", sub: "Usa microfone sem fio" },
                ]}
              />
              {r.moveis > 0 || r.pregador ? (
                <>
                  <span className="rotulo" style={{ marginTop: 12 }}>
                    Microfone sem fio:
                  </span>
                  <Escolha
                    nome="semfio"
                    valor={r.tipoSemFio}
                    onChange={(v) => set({ tipoSemFio: v as RascunhoT2["tipoSemFio"] })}
                    colunas="tres"
                    opcoes={[
                      { valor: "mao", rotulo: "De mão" },
                      { valor: "headset", rotulo: "Headset" },
                      { valor: "lapela", rotulo: "Lapela" },
                    ]}
                  />
                </>
              ) : null}
            </div>
            <NaoSei id="vozes-nao_sei" ativo={!!r.vozesNaoSei} onClick={() => set({ vozesNaoSei: !r.vozesNaoSei })} />
          </>
        ) : null}
        {passo === 1 ? (
          <>
            <h1>Quais instrumentos?</h1>
            <div className={r.instNaoSei ? "desatualizado" : ""}>
              {(Object.keys(ROT) as Inst[]).map((k) => (
                <Contador key={k} id={`inst-${k}`} rotulo={ROT[k]} valor={r.inst[k]} onChange={(v) => set({ inst: { ...r.inst, [k]: v } })} />
              ))}
              {r.inst.bateria_acustica > 0 ? (
                <Escolha
                  nome="kit"
                  valor={r.kitBateria}
                  onChange={(v) => set({ kitBateria: v as RascunhoT2["kitBateria"] })}
                  opcoes={[
                    { valor: "basico", rotulo: "Kit básico", sub: "Bumbo, caixa e 2 overheads" },
                    { valor: "completo", rotulo: "Kit completo", sub: "7 microfones" },
                  ]}
                />
              ) : null}
            </div>
            <NaoSei id="inst-nao_sei" ativo={!!r.instNaoSei} onClick={() => set({ instNaoSei: !r.instNaoSei })} />
          </>
        ) : null}
        {passo === 2 ? (
          <>
            <h1>Outras fontes de som</h1>
            <div className={`opcoes duas${r.fontesNaoSei ? " desatualizado" : ""}`}>
              {(
                [
                  ["playback", "Computador / playback"],
                  ["celular", "Celular"],
                  ["dj", "Controladora de DJ"],
                  ["video", "Vídeo"],
                ] as const
              ).map(([k, rot]) => (
                <button key={k} type="button" className="opcao" aria-pressed={r.fontes[k]} onClick={() => set({ fontes: { ...r.fontes, [k]: !r.fontes[k] } })} data-testid={`fonte-${k}`}>
                  <span aria-hidden="true">{r.fontes[k] ? "☑" : "☐"}</span>
                  {rot}
                </button>
              ))}
            </div>
            <NaoSei id="fontes-nao_sei" ativo={!!r.fontesNaoSei} onClick={() => set({ fontesNaoSei: !r.fontesNaoSei })} />
          </>
        ) : null}
        {passo === 3 ? (
          <>
            <h1>Retorno para os músicos</h1>
            <div className={r.retornoNaoSei ? "desatualizado" : ""}>
              <Contador id="mixagens" rotulo="Músicos com mixagem própria" valor={r.mixagens} onChange={(v) => set({ mixagens: v })} />
              <Escolha
                nome="retorno"
                valor={r.preferencia}
                onChange={(v) => set({ preferencia: v as RascunhoT2["preferencia"] })}
                colunas="tres"
                opcoes={[
                  { valor: "monitor", rotulo: "Caixa de retorno no chão" },
                  { valor: "in_ear", rotulo: "In-ear (fone)" },
                  { valor: "misto", rotulo: "Os dois" },
                ]}
              />
            </div>
            <NaoSei id="retorno-nao_sei" ativo={!!r.retornoNaoSei} onClick={() => set({ retornoNaoSei: !r.retornoNaoSei })} />
          </>
        ) : null}
        {passo === 4 ? (
          <>
            <h1>Quem opera o som?</h1>
            <div className={r.opNaoSei ? "desatualizado" : ""}>
              <Escolha
                nome="operador"
                valor={r.operador}
                onChange={(v) => set({ operador: v as RascunhoT2["operador"] })}
                colunas="tres"
                opcoes={[
                  { valor: "voluntario", rotulo: "Voluntário leigo" },
                  { valor: "ocasional", rotulo: "Técnico ocasional" },
                  { valor: "fixo", rotulo: "Técnico fixo" },
                ]}
              />
              <span className="rotulo" style={{ marginTop: 12 }}>
                Querem controlar pelo celular ou tablet?
              </span>
              <Escolha
                nome="remoto"
                valor={r.controleRemoto ? "sim" : "nao"}
                onChange={(v) => set({ controleRemoto: v === "sim" })}
                opcoes={[
                  { valor: "nao", rotulo: "Não" },
                  { valor: "sim", rotulo: "Sim" },
                ]}
              />
            </div>
            <NaoSei id="op-nao_sei" ativo={!!r.opNaoSei} onClick={() => set({ opNaoSei: !r.opNaoSei })} />
          </>
        ) : null}
        <div className="acoes fim">
          <button type="button" className="btn sec" onClick={() => (passo === 0 ? router.back() : setPasso(passo - 1))}>
            Voltar
          </button>
          <button type="button" className="btn" onClick={avancar} data-testid="avancar2">
            {passo === PASSOS.length - 1 ? "Ver lista de palco" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
