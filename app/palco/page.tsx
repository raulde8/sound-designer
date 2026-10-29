"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trilha2 } from "@/components/Trilha2";
import { decodificar } from "@/lib/state";

function Conteudo() {
  const sp = useSearchParams();
  const d = sp.get("d");
  const estado = useMemo(() => decodificar(d), [d]);
  if (!estado)
    return (
      <div className="container">
        <div className="card">
          <p>Faça primeiro a parte “Sistema de som”.</p>
          <Link className="btn" href="/questionario/">
            Começar
          </Link>
        </div>
      </div>
    );
  return <Trilha2 estado={estado} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="container">Carregando...</div>}>
      <Conteudo />
    </Suspense>
  );
}
