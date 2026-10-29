"use client";

import { useState } from "react";
import type { Conclusao } from "@engine/explain/types";
import { analytics } from "@/lib/analytics";

const STATUS: Record<string, string> = { pendente_validacao: "pendente de validação", validado: "validado", referencia: "referência" };

function valor(v: unknown): string {
  if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return String(v);
  const s = JSON.stringify(v);
  return s.length > 140 ? s.slice(0, 137) + "..." : s;
}

/** Botão "Por quê?" (SPEC C9): mostra entradas, regra, parâmetros (com status), hipóteses e limitações. */
export function PorQue({ conclusao }: { conclusao: Conclusao | undefined }) {
  const [aberto, setAberto] = useState(false);
  if (!conclusao) return null;
  const pend = conclusao.parametros.some((p) => p.status === "pendente_validacao");
  return (
    <div className="nao-imprimir-porque">
      <button
        type="button"
        className="btn link"
        aria-expanded={aberto}
        onClick={() => {
          if (!aberto) analytics().registrar({ tipo: "clique_porque", item: conclusao.id.split(":")[0]! });
          setAberto(!aberto);
        }}
        data-testid={`porque-${conclusao.id}`}
      >
        Por quê? <span className="ajuda">({conclusao.titulo})</span>
        {pend ? <span className="badge warn" title="Este resultado usa parâmetro pendente de validação">pendente</span> : null}
      </button>
      {aberto ? (
        <div className="porque" data-testid={`porque-painel-${conclusao.id}`}>
          <p>{conclusao.texto}</p>
          {conclusao.entradas.length ? (
            <>
              <h4>Entradas</h4>
              <ul>
                {conclusao.entradas.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          ) : null}
          {conclusao.regra ? (
            <>
              <h4>Regra aplicada</h4>
              <p>{conclusao.regra}</p>
            </>
          ) : null}
          {conclusao.parametros.length ? (
            <>
              <h4>Parâmetros</h4>
              <ul>
                {conclusao.parametros.map((p) => (
                  <li key={p.id}>
                    <span className="mono">{p.id}</span> = {valor(p.valor)}{" "}
                    <span className={`badge ${p.status === "pendente_validacao" ? "warn" : "neutro"}`}>{STATUS[p.status] ?? p.status}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {conclusao.hipoteses.length ? (
            <>
              <h4>Hipóteses</h4>
              <ul>
                {conclusao.hipoteses.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          ) : null}
          {conclusao.limitacoes.length ? (
            <>
              <h4>Limitações</h4>
              <ul>
                {conclusao.limitacoes.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
