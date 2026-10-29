"use client";

import type { ReactNode } from "react";

export interface OpcaoDef {
  valor: string;
  rotulo: string;
  sub?: string;
  icone?: ReactNode;
}

export function Escolha({
  opcoes,
  valor,
  onChange,
  naoSei,
  colunas = "duas",
  nome,
}: {
  opcoes: OpcaoDef[];
  valor: string | undefined;
  onChange: (v: string) => void;
  naoSei?: boolean;
  colunas?: "uma" | "duas" | "tres";
  nome: string;
}) {
  const todas = naoSei ? [...opcoes, { valor: "nao_sei", rotulo: "Não sei" }] : opcoes;
  return (
    <div className={`opcoes ${colunas}`} role="radiogroup" aria-label={nome}>
      {todas.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          className={`opcao${o.valor === "nao_sei" ? " nao-sei" : ""}`}
          onClick={() => onChange(o.valor)}
          data-testid={`${nome}-${o.valor}`}
        >
          {o.icone}
          <span>
            {o.rotulo}
            {o.sub ? <span className="sub">{o.sub}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Multipla({ opcoes, valores, onChange, nome }: { opcoes: OpcaoDef[]; valores: string[]; onChange: (v: string[]) => void; nome: string }) {
  return (
    <div className="opcoes duas" role="group" aria-label={nome}>
      {opcoes.map((o) => {
        const ativo = valores.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            className="opcao"
            data-testid={`${nome}-${o.valor}`}
            onClick={() => onChange(ativo ? valores.filter((v) => v !== o.valor) : [...valores, o.valor])}
          >
            <span aria-hidden="true">{ativo ? "☑" : "☐"}</span>
            <span>
              {o.rotulo}
              {o.sub ? <span className="sub">{o.sub}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Numero({
  id,
  rotulo,
  valor,
  onChange,
  erro,
  sufixo,
  passo = "any",
  min = 0,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  erro?: string | undefined;
  sufixo?: string;
  passo?: string;
  min?: number;
}) {
  return (
    <div className={`campo${erro ? " erro" : ""}`}>
      <label htmlFor={id}>
        {rotulo}
        {sufixo ? ` (${sufixo})` : ""}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={passo}
        min={min}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        data-testid={id}
      />
      {erro ? (
        <div id={`${id}-erro`} className="msg-erro" role="alert">
          {erro}
        </div>
      ) : null}
    </div>
  );
}

export function Contador({ id, rotulo, valor, onChange, max = 64 }: { id: string; rotulo: string; valor: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="campo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span className="rotulo" style={{ marginBottom: 0 }}>
        {rotulo}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <button type="button" className="btn sec pequeno" aria-label={`Menos ${rotulo}`} onClick={() => onChange(Math.max(0, valor - 1))} data-testid={`${id}-menos`}>
          −
        </button>
        <output aria-live="polite" style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }} data-testid={`${id}-valor`}>
          {valor}
        </output>
        <button type="button" className="btn sec pequeno" aria-label={`Mais ${rotulo}`} onClick={() => onChange(Math.min(max, valor + 1))} data-testid={`${id}-mais`}>
          +
        </button>
      </span>
    </div>
  );
}
