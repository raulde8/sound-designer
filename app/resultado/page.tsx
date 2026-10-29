"use client";

import { Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Resultado } from "@/components/Resultado";
import { rascunhoDeEntrada } from "@/components/Trilha1";
import { executar, recalcularComVersaoAtual } from "@/lib/rodar";
import { codificar, decodificar, salvarRascunho } from "@/lib/state";

function Conteudo() {
  const sp = useSearchParams();
  const router = useRouter();
  const d = sp.get("d");
  const estado = useMemo(() => decodificar(d), [d]);
  const exec = useMemo(() => (estado ? executar(estado) : null), [estado]);

  const mudar = useCallback(
    (patch: (e: Record<string, unknown>) => Record<string, unknown>) => {
      if (!estado) return;
      const novo = { ...estado, e: patch(estado.e) };
      router.replace(`/resultado/?d=${codificar(novo)}`, { scroll: false });
    },
    [estado, router],
  );

  if (!estado || !exec)
    return (
      <div className="container">
        <div className="card">
          <h1>Link inválido</h1>
          <p>Não foi possível ler as respostas deste link. Ele pode estar incompleto.</p>
          <Link className="btn" href="/questionario/">
            Começar o questionário
          </Link>
        </div>
      </div>
    );

  if (exec.tipo === "versao_indisponivel")
    return (
      <div className="container">
        <div className="card" data-testid="versao-indisponivel">
          <h1>Versão antiga</h1>
          {exec.motivos.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
          <p>O resultado original não pode ser reproduzido. Você pode recalcular com a versão atual (o resultado pode mudar).</p>
          <button type="button" className="btn" onClick={() => router.replace(`/resultado/?d=${codificar(recalcularComVersaoAtual(estado))}`)}>
            Recalcular com a versão atual
          </button>
        </div>
      </div>
    );

  const r = exec.resultado;
  if (!r.ok)
    return (
      <div className="container">
        <div className="card" data-testid="erros-entrada">
          <h1>Confira as respostas</h1>
          <ul className="lista-simples">
            {r.erros.map((e, i) => (
              <li key={i} className="msg-erro">
                {e.mensagem}
              </li>
            ))}
          </ul>
          <Link className="btn" href="/questionario/" onClick={() => salvarRascunho({ t1: rascunhoDeEntrada((estado.e.trilha1 ?? {}) as Record<string, unknown>), passo: 0 })}>
            Corrigir respostas
          </Link>
        </div>
      </div>
    );

  return <Resultado r={r} estado={estado} mudar={mudar} onEditar={() => salvarRascunho({ t1: rascunhoDeEntrada((estado.e.trilha1 ?? {}) as Record<string, unknown>), passo: 0 })} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="container">Calculando...</div>}>
      <Conteudo />
    </Suspense>
  );
}
