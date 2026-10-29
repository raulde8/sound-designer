"use client";

import { useRef, useState } from "react";
import type { Configuracao } from "@engine/architectures/types";
import type { MapaCobertura } from "@engine/result";
import { fmt } from "@/lib/format";

interface Props {
  largura: number;
  profundidade: number;
  profundidadePalco: number;
  configuracao: Configuracao;
  mapa: MapaCobertura;
  /** Posições movidas e ainda não recalculadas (id -> x, y). */
  pendentes: Record<string, { x: number; y: number }>;
  onMover?: (id: string, x: number, y: number) => void;
  microfone?: { x: number; y: number } | null;
  mesa?: { x: number; y: number } | null;
}

/**
 * Planta 2D vista de cima, palco no topo. A origem da SPEC (canto do palco à esquerda de quem
 * olha para o público) fica no canto superior direito do desenho: x cresce para a esquerda.
 * Desenhada a partir do MESMO objeto de configuração da lista de equipamentos.
 */
export function Planta({ largura: W, profundidade: D, profundidadePalco, configuracao, mapa, pendentes, onMover, microfone, mesa }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [arrasto, setArrasto] = useState<{ id: string; x: number; y: number } | null>(null);
  const pad = Math.max(1.2, Math.max(W, D) * 0.06);
  const f = Math.min(1.6, Math.max(0.5, Math.max(W, D) / 20));
  const sx = (x: number) => W - x;
  const vb = `${-pad} ${-pad} ${W + 2 * pad} ${D + 2 * pad}`;

  const paraModelo = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = pt.matrixTransform(m.inverse());
    return { x: Math.min(W, Math.max(0, W - p.x)), y: Math.min(D, Math.max(0, p.y)) };
  };

  // Células da cobertura agrupadas por linha (run-length) para um SVG leve.
  const runs: { x: number; y: number; w: number; e: string }[] = [];
  for (let iy = 0; iy < mapa.ny; iy++) {
    let ix = 0;
    while (ix < mapa.nx) {
      const e = mapa.celulas[iy * mapa.nx + ix]!;
      let j = ix;
      while (j + 1 < mapa.nx && mapa.celulas[iy * mapa.nx + j + 1] === e) j++;
      if (e !== " ") {
        const x0 = mapa.x0 + ix * mapa.passo;
        const x1 = Math.min(W, mapa.x0 + (j + 1) * mapa.passo);
        runs.push({ x: sx(x1), y: mapa.y0 + iy * mapa.passo, w: x1 - x0, e });
      }
      ix = j + 1;
    }
  }
  const altura = (y: number) => Math.min(mapa.passo, D - y);

  return (
    <div className="planta-wrap">
      <svg ref={svgRef} className="planta" viewBox={vb} role="img" aria-label="Planta do ambiente com as caixas numeradas" data-testid="planta">
        <defs>
          <pattern id="hBorda" width={0.4} height={0.4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="0.4" height="0.4" fill="#ffffff" />
            <line x1="0" y1="0" x2="0" y2="0.4" stroke="#7d8798" strokeWidth="0.08" />
          </pattern>
          <pattern id="hFora" width={0.5} height={0.5} patternUnits="userSpaceOnUse">
            <rect width="0.5" height="0.5" fill="#ffffff" />
            <path d="M0 0 L0.5 0.5 M0.5 0 L0 0.5" stroke="#b9bfca" strokeWidth="0.05" />
          </pattern>
        </defs>
        {/* Sala */}
        <rect x={0} y={0} width={W} height={D} fill="#ffffff" stroke="#1b2230" strokeWidth={0.08} />
        {/* Cobertura nominal: coberto / borda / fora */}
        {runs.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={altura(r.y)} fill={r.e === "c" ? "#d7e9e3" : r.e === "b" ? "url(#hBorda)" : "url(#hFora)"} data-zona={r.e} />
        ))}
        {/* Palco */}
        <rect x={0} y={0} width={W} height={profundidadePalco} fill="#eef0f4" stroke="#6b7489" strokeWidth={0.05} />
        <text x={W / 2} y={Math.max(f * 1.2, profundidadePalco / 2)} fontSize={f} textAnchor="middle" fill="#4a5468">
          PALCO
        </text>
        <text x={W / 2} y={D + pad * 0.7} fontSize={f * 0.85} textAnchor="middle" fill="#6b7489">
          fundo · {fmt(W)} m x {fmt(D)} m
        </text>
        {microfone ? (
          <g>
            <circle cx={sx(microfone.x)} cy={microfone.y} r={f * 0.25} fill="#1b2230" />
            <text x={sx(microfone.x) + f * 0.4} y={microfone.y + f * 0.3} fontSize={f * 0.7} fill="#1b2230">
              mic
            </text>
          </g>
        ) : null}
        {mesa ? (
          <g>
            <rect x={sx(mesa.x) - f * 0.6} y={mesa.y - f * 0.35} width={f * 1.2} height={f * 0.7} fill="#1b2230" />
            <text x={sx(mesa.x)} y={mesa.y - f * 0.6} fontSize={f * 0.7} textAnchor="middle" fill="#1b2230">
              mesa
            </text>
          </g>
        ) : null}
        {/* Caixas */}
        {configuracao.caixas.map((c) => {
          const pos = arrasto?.id === c.id ? arrasto : (pendentes[c.id] ?? c.posicao);
          const x = sx(pos.x);
          const y = pos.y;
          const yaw = (c.mira.yaw * Math.PI) / 180;
          const len = f * 2.2;
          const r = c.papel === "front_fill" ? f * 0.38 : c.papel === "sub" ? f * 0.38 : f * 0.5;
          const movivel = !!onMover;
          return (
            <g
              key={c.id}
              data-testid={`caixa-${c.numero}`}
              tabIndex={movivel ? 0 : -1}
              role={movivel ? "button" : undefined}
              aria-label={`Caixa ${c.numero}, ${c.papel}, altura ${fmt(c.posicao.z)} m${movivel ? ". Use as setas para mover." : ""}`}
              style={{ cursor: movivel ? "grab" : "default" }}
              onPointerDown={(e) => {
                if (!movivel) return;
                (e.target as Element).setPointerCapture?.(e.pointerId);
                const p = paraModelo(e.clientX, e.clientY);
                if (p) setArrasto({ id: c.id, ...p });
              }}
              onPointerMove={(e) => {
                if (arrasto?.id !== c.id) return;
                const p = paraModelo(e.clientX, e.clientY);
                if (p) setArrasto({ id: c.id, ...p });
              }}
              onPointerUp={() => {
                if (arrasto?.id === c.id) {
                  onMover?.(c.id, Math.round(arrasto.x * 100) / 100, Math.round(arrasto.y * 100) / 100);
                  setArrasto(null);
                }
              }}
              onKeyDown={(e) => {
                if (!movivel) return;
                const passo = 0.25;
                const atual = pendentes[c.id] ?? c.posicao;
                const d = { ArrowLeft: [passo, 0], ArrowRight: [-passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] }[e.key];
                if (!d) return;
                e.preventDefault();
                onMover?.(c.id, Math.min(W, Math.max(0, atual.x + d[0]!)), Math.min(D, Math.max(0, atual.y + d[1]!)));
              }}
            >
              {c.papel !== "sub" ? <line x1={x} y1={y} x2={x - Math.sin(yaw) * len} y2={y + Math.cos(yaw) * len} stroke="#0e6464" strokeWidth={f * 0.12} markerEnd="" /> : null}
              {c.papel !== "sub" ? <circle cx={x - Math.sin(yaw) * len} cy={y + Math.cos(yaw) * len} r={f * 0.15} fill="#0e6464" /> : null}
              {c.papel === "sub" ? (
                <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#1b2230" stroke="#fff" strokeWidth={f * 0.06} />
              ) : (
                <circle cx={x} cy={y} r={r} fill={c.papel === "reforco" ? "#ffffff" : "#0e6464"} stroke="#0e6464" strokeWidth={f * 0.1} />
              )}
              <text x={x} y={y + f * 0.18} fontSize={f * 0.55} textAnchor="middle" fill={c.papel === "reforco" ? "#0e6464" : "#ffffff"} fontWeight={700}>
                {c.numero}
              </text>
              {c.papel !== "sub" ? (
                <text x={x} y={y - r - f * 0.2} fontSize={f * 0.55} textAnchor="middle" fill="#1b2230">
                  {fmt(c.posicao.z)} m
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="legenda">
        <span>
          <svg width="18" height="14" aria-hidden="true">
            <rect width="18" height="14" fill="#d7e9e3" stroke="#999" />
          </svg>
          Coberto
        </span>
        <span>
          <svg width="18" height="14" aria-hidden="true">
            <defs>
              <pattern id="lgB" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="4" stroke="#7d8798" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="18" height="14" fill="url(#lgB)" stroke="#999" />
          </svg>
          Borda (até 10° fora)
        </span>
        <span>
          <svg width="18" height="14" aria-hidden="true">
            <path d="M0 0 L18 14 M18 0 L0 14" stroke="#b9bfca" />
            <rect width="18" height="14" fill="none" stroke="#999" />
          </svg>
          Fora da cobertura nominal
        </span>
        <span>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="6" fill="#0e6464" />
          </svg>
          Caixa (número, altura e direção)
        </span>
        <span>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" fill="#fff" stroke="#0e6464" strokeWidth="2" />
          </svg>
          Reforço / delay
        </span>
        <span>
          <svg width="14" height="14" aria-hidden="true">
            <rect x="1" y="1" width="12" height="12" fill="#1b2230" />
          </svg>
          Subwoofer
        </span>
      </div>
      <p className="ajuda" style={{ marginTop: 6 }}>
        Cobertura nominal declarada pelo fabricante. Aproximação geométrica, não é medição. A cobertura é avaliada a {fmt(mapa.passo, 2)} m de resolução, na altura do ouvinte.
      </p>
    </div>
  );
}
