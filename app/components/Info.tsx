"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Conclusao } from "@engine/explain/types";
import { GLOSSARIO } from "@/lib/glossario";
import { analytics } from "@/lib/analytics";

/** Botão "ⓘ" que abre uma caixa de texto com a explicação. Fecha com Esc ou clique fora. */
export function Info({ titulo, children, testId, rotulo }: { titulo: string; children: ReactNode; testId?: string; rotulo?: string }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("touchstart", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("touchstart", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);
  return (
    <span className="info" ref={ref}>
      <button
        type="button"
        className="info-btn"
        aria-label={`Mais informações: ${titulo}`}
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
        data-testid={testId}
      >
        {rotulo ? <span className="info-rotulo">{rotulo}</span> : null}
        <span className="info-i" aria-hidden="true">
          i
        </span>
      </button>
      {aberto ? (
        <span className="info-pop" role="dialog" id={id} aria-label={titulo} data-testid={testId ? `${testId}-painel` : undefined}>
          <span className="info-pop-cab">
            <strong>{titulo}</strong>
            <button type="button" className="info-fechar" aria-label="Fechar" onClick={() => setAberto(false)}>
              ×
            </button>
          </span>
          <span className="info-pop-corpo">{children}</span>
        </span>
      ) : null}
    </span>
  );
}

/** Termo técnico com explicação em linguagem simples. */
export function Termo({ id, children }: { id: keyof typeof GLOSSARIO; children?: ReactNode }) {
  const t = GLOSSARIO[id];
  if (!t) return <>{children}</>;
  return (
    <span className="termo">
      {children ?? t.termo}
      <Info titulo={t.termo}>
        <span className="p">{t.simples}</span>
        {t.mais ? <span className="p ajuda">{t.mais}</span> : null}
      </Info>
    </span>
  );
}

const STATUS: Record<string, string> = { pendente_validacao: "a revisar por especialista", validado: "revisado", referencia: "valor de referência" };

function valor(v: unknown): string {
  if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return String(v);
  const s = JSON.stringify(v);
  return s.length > 120 ? s.slice(0, 117) + "..." : s;
}

/** ⓘ de uma conclusão do motor: o que é, de onde vem, por quê, limites e valores usados. */
export function InfoConclusao({ conclusao, rotulo }: { conclusao: Conclusao | undefined; rotulo?: string }) {
  if (!conclusao) return null;
  const pend = conclusao.parametros.filter((p) => p.status === "pendente_validacao");
  return (
    <span onClickCapture={() => analytics().registrar({ tipo: "clique_porque", item: conclusao.id.split(":")[0]! })}>
      <Info titulo={conclusao.titulo} testId={`porque-${conclusao.id}`} {...(rotulo ? { rotulo } : {})}>
        <span className="p">{conclusao.texto}</span>
        {conclusao.entradas.length ? (
          <>
            <span className="h">De onde vem</span>
            <span className="lista">
              {conclusao.entradas.map((e, i) => (
                <span key={i} className="li">
                  {e}
                </span>
              ))}
            </span>
          </>
        ) : null}
        {conclusao.regra ? (
          <>
            <span className="h">Regra usada</span>
            <span className="p">{conclusao.regra}</span>
          </>
        ) : null}
        {conclusao.hipoteses.length ? (
          <>
            <span className="h">Por que assim</span>
            <span className="lista">
              {conclusao.hipoteses.map((e, i) => (
                <span key={i} className="li">
                  {e}
                </span>
              ))}
            </span>
          </>
        ) : null}
        {conclusao.limitacoes.length ? (
          <>
            <span className="h">Limites desta conta</span>
            <span className="lista">
              {conclusao.limitacoes.map((e, i) => (
                <span key={i} className="li">
                  {e}
                </span>
              ))}
            </span>
          </>
        ) : null}
        {conclusao.parametros.length ? (
          <>
            <span className="h">Valores usados</span>
            <span className="lista">
              {conclusao.parametros.map((p) => (
                <span key={p.id} className="li">
                  <span className="mono">{p.id}</span> = {valor(p.valor)} <span className={`badge ${p.status === "pendente_validacao" ? "warn" : "neutro"}`}>{STATUS[p.status] ?? p.status}</span>
                </span>
              ))}
            </span>
            {pend.length ? <span className="p ajuda">Valores marcados “a revisar por especialista” são referências iniciais que ainda vão ser revisadas por um projetista de som.</span> : null}
          </>
        ) : null}
      </Info>
    </span>
  );
}
