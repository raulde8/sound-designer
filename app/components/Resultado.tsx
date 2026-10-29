"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Conclusao } from "@engine/explain/types";
import type { ResultadoOk } from "@engine/result";
import type { Candidato } from "@engine/selection/compat";
import { Planta } from "./Planta";
import { PorQue } from "./PorQue";
import { analytics } from "@/lib/analytics";
import { catalogoAtual, modoCatalogo } from "@/lib/catalog";
import { codificar, type EstadoUrl } from "@/lib/state";
import { brl, fmt, MONTAGEM, PAPEL, pct, STATUS_ACUSTICA, STATUS_CAPACIDADE, STATUS_COMPAT, STATUS_GEOMETRIA } from "@/lib/format";

type Mudar = (patch: (e: Record<string, unknown>) => Record<string, unknown>) => void;

function badgeCompat(s: string) {
  return s === "compativel" ? "ok" : s === "parcial" ? "warn" : s === "incompativel" ? "bad" : "neutro";
}

function Secao({ n, titulo, children, id }: { n: number; titulo: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="card" id={id} aria-labelledby={`s${n}`}>
      <h2 className="titulo-secao" id={`s${n}`}>
        <span className="secao-num">{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Resultado({ r, estado, mudar, onEditar }: { r: ResultadoOk; estado: EstadoUrl; mudar: Mudar; onEditar: () => void }) {
  const rec = r.recomendacao;
  const conc = useMemo(() => new Map<string, Conclusao>(r.conclusoes.map((c) => [c.id, c])), [r.conclusoes]);
  const [pendentes, setPendentes] = useState<Record<string, { x: number; y: number }>>({});
  const [orc, setOrc] = useState<string>(estado.e.orcamento !== undefined ? String(estado.e.orcamento) : "");
  const [copiado, setCopiado] = useState(false);
  const [pesquisa, setPesquisa] = useState<string | null>(null);
  const desatualizado = Object.keys(pendentes).length > 0;
  const modo = modoCatalogo();
  const catVazio = modo === "producao" && catalogoAtual().produtos.length === 0;

  useEffect(() => {
    if (r.escopo.status !== "suportado") analytics().registrar({ tipo: "caso_fora_escopo", status: r.escopo.status });
    if (rec?.semProdutoAdequado) analytics().registrar({ tipo: "resultado_perfil_generico" });
  }, [r, rec]);

  const recalcular = () => {
    mudar((e) => ({ ...e, ajustes: { ...((e.ajustes as object) ?? {}), ...pendentes } }));
    setPendentes({});
  };

  const escolher = (c: Candidato) => mudar((e) => ({ ...e, escolhas: { ...((e.escolhas as object) ?? {}), principal: c.produtoId, arquitetura: rec!.arquitetura }, ajustes: {} }));

  const linkPalco = `/palco/?d=${codificar(estado)}`;
  const frase =
    rec &&
    `${rec.statusValidacao.geometria === "fora_do_modelo" ? "Recomendação geométrica parcial (partes do ambiente fora do modelo)." : "Recomendação geométrica disponível."} ${
      rec.statusValidacao.capacidade === "validada"
        ? "Capacidade sonora validada com dados do fabricante."
        : rec.statusValidacao.capacidade === "pendente"
          ? `Validação de capacidade sonora pendente: ${rec.produto ? rec.avaliacao.motivoCapacidade : "o resultado é um perfil genérico; a validação depende do produto."}`
          : `Capacidade sonora insuficiente: ${rec.avaliacao.motivoCapacidade}`
    }`;

  return (
    <div className="container" data-testid="resultado">
      <div className="nao-imprimir">
        {modo === "demo" ? <div className="aviso info">Modo demonstração: os produtos e as faixas de investimento são fictícios.</div> : null}
        {catVazio ? <div className="aviso info">O catálogo verificado ainda está vazio. O resultado mostra perfis genéricos (requisitos mínimos), sem modelos.</div> : null}
      </div>
      <div className="so-impressao">
        <h1>Relatório de pré-dimensionamento</h1>
      </div>
      {desatualizado ? (
        <div className="aviso bad faixa-desatualizado nao-imprimir" role="status" data-testid="desatualizado">
          <strong>Resultado desatualizado.</strong> Você moveu caixas na planta. A lista, a cobertura e os níveis abaixo ainda são da posição anterior.
          <div className="acoes">
            <button type="button" className="btn" onClick={recalcular} data-testid="recalcular">
              Recalcular
            </button>
            <button type="button" className="btn sec" onClick={() => setPendentes({})}>
              Desfazer
            </button>
          </div>
        </div>
      ) : null}

      {r.escopo.status !== "suportado" ? (
        <div className={`aviso${r.escopo.status === "encaminhar" ? " bad" : ""}`} data-testid="escopo">
          <strong>{r.escopo.status === "parcial" ? "Atendido parcialmente." : "Caso para um projetista."}</strong>{" "}
          {r.escopo.itens
            .filter((i) => i.nivel !== "aviso")
            .map((i) => i.texto)
            .join(" ")}
          {r.escopo.naoCalculado.length ? <div>Não calculado: {r.escopo.naoCalculado.join(" ")}</div> : null}
        </div>
      ) : null}
      {r.escopo.itens
        .filter((i) => i.nivel === "aviso")
        .map((i) => (
          <div className="aviso" key={i.codigo}>
            {i.texto}
          </div>
        ))}

      {!rec ? (
        <div className="card">
          <h2>Nenhuma arquitetura disponível</h2>
          {r.arquiteturas.map((a) => (
            <p key={a.id}>
              {a.nome}: {a.motivo}
            </p>
          ))}
          <Link className="btn" href="/questionario/">
            Rever respostas
          </Link>
        </div>
      ) : (
        <div className={desatualizado ? "" : ""}>
          <Secao n={1} titulo="Configuração recomendada">
            <p style={{ fontSize: "1.15rem", fontWeight: 600 }} data-testid="arquitetura">
              {rec.nomeSimples}
            </p>
            <div className="badges">
              <span className={`badge ${rec.statusValidacao.geometria === "validada" ? "ok" : rec.statusValidacao.geometria === "fora_do_modelo" ? "bad" : "warn"}`}>{STATUS_GEOMETRIA[rec.statusValidacao.geometria]}</span>
              <span className={`badge ${rec.statusValidacao.capacidade === "validada" ? "ok" : rec.statusValidacao.capacidade === "pendente" ? "warn" : "bad"}`} data-testid="status-capacidade">
                {STATUS_CAPACIDADE[rec.statusValidacao.capacidade]}
              </span>
              <span className={`badge ${rec.statusValidacao.acustica === "alto" ? "bad" : rec.statusValidacao.acustica === "medio" ? "warn" : "neutro"}`}>{STATUS_ACUSTICA[rec.statusValidacao.acustica]}</span>
            </div>
            <p>{frase}</p>
            <p className="ajuda">
              Nível necessário: {r.alvo.alvo} dB médio + {r.alvo.reserva} dB de reserva = {r.alvo.requerido} dB na área do público.
            </p>
            {r.alvo.avisoSegurancaAuditiva ? <div className="aviso bad">Nível acima de 95 dB: risco à audição em exposição longa. Controle volume e tempo de exposição.</div> : null}
            <PorQue conclusao={conc.get("arquitetura")} />
            <PorQue conclusao={conc.get("nivel-alvo")} />
            {r.alternativas.length > 0 ? (
              <div style={{ marginTop: 12 }}>
                <h3>Alternativas</h3>
                <div className="rolagem">
                  <table className="tabela">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Solução</th>
                        <th>Caixas</th>
                        <th>Margem de nível</th>
                        <th>Faixa / unidade</th>
                        <th className="nao-imprimir"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.alternativas.map((a) => {
                        const atual = a.produtoId === rec.produto?.produtoId && a.arquitetura === rec.arquitetura;
                        return (
                          <tr key={a.rotulo}>
                            <td>
                              <strong>{a.rotulo}</strong>
                            </td>
                            <td>
                              {a.nome} ({a.arquitetura === "AR-1" ? "caixas convencionais" : "vertical array"})
                            </td>
                            <td>{a.quantidadeCaixas}</td>
                            <td>{a.margemNivel !== undefined ? `+${fmt(a.margemNivel)} dB` : "pendente"}</td>
                            <td>{a.faixa ? `${brl(a.faixa.minimo)} a ${brl(a.faixa.maximo)}` : "-"}</td>
                            <td className="nao-imprimir">
                              {atual ? (
                                <span className="badge ok">atual</span>
                              ) : (
                                <button type="button" className="btn sec pequeno" onClick={() => mudar((e) => ({ ...e, escolhas: { ...((e.escolhas as object) ?? {}), arquitetura: a.arquitetura, principal: a.produtoId ?? "" }, ajustes: {} }))}>
                                  Usar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </Secao>

          <div className={desatualizado ? "desatualizado" : ""}>
            <Secao n={2} titulo="Quantidade e tipo de caixas">
              <div className="rolagem">
                <table className="tabela" data-testid="lista-equipamentos">
                  <thead>
                    <tr>
                      <th>Qtd.</th>
                      <th>Item</th>
                      <th>Função</th>
                      <th>Montagem</th>
                      <th>Nº na planta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.equipamentos.map((e) => (
                      <tr key={`${e.papel}-${e.ref}-${e.montagem}`}>
                        <td>{e.quantidade}</td>
                        <td>
                          {e.nome}
                          {e.tipo === "generico" ? <div className="ajuda">Perfil genérico - especificação mínima, não é um produto.</div> : null}
                        </td>
                        <td>{PAPEL[e.papel]}</td>
                        <td>{MONTAGEM[e.montagem]}</td>
                        <td>{e.numeros.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rec.sub.regra === "opcional" ? (
                <div className="aviso info nao-imprimir">
                  Subwoofer opcional para este uso.{" "}
                  <button type="button" className="btn sec pequeno" onClick={() => mudar((e) => ({ ...e, escolhas: { ...((e.escolhas as object) ?? {}), incluirSub: rec.sub.incluido ? "nao" : "sim" } }))}>
                    {rec.sub.incluido ? "Remover subwoofer" : "Incluir subwoofer"}
                  </button>
                </div>
              ) : null}
              {rec.sub.incluido ? <div className="aviso">O comportamento dos graves depende da sala. Ajuste no local.</div> : null}
              {rec.configuracao.atrasos.length > 0 ? (
                <div className="aviso">
                  Atraso de referência das caixas de reforço:{" "}
                  {rec.configuracao.atrasos.map((a) => `caixa ${rec.configuracao.caixas.find((c) => c.id === a.caixaId)?.numero}: ${fmt(a.ms)} ms`).join("; ")}. Referência inicial. O valor final é ajustado com medição no local.
                </div>
              ) : null}
              <PorQue conclusao={conc.get("caixas")} />
              <PorQue conclusao={conc.get("sub")} />
              {conc.get("reforco") ? <PorQue conclusao={conc.get("reforco")} /> : null}
            </Secao>
          </div>

          <Secao n={3} titulo="Planta">
            <p className="ajuda nao-imprimir">Arraste uma caixa (ou use as setas do teclado) para testar outra posição. O resultado fica desatualizado até você recalcular.</p>
            <Planta
              largura={r.caso.sala.largura}
              profundidade={r.caso.sala.profundidade}
              profundidadePalco={r.caso.profundidadePalco}
              configuracao={rec.configuracao}
              mapa={rec.mapa}
              pendentes={pendentes}
              onMover={(id, x, y) => setPendentes((p) => ({ ...p, [id]: { x, y } }))}
              microfone={r.pagNag?.microfone ?? null}
              mesa={r.palco ? { x: r.caso.sala.largura / 2, y: Math.max(r.caso.profundidadePalco, r.caso.sala.profundidade - 0.5) } : null}
            />
            <div className={desatualizado ? "desatualizado" : ""}>
              <p style={{ marginTop: 8 }}>
                Cobertura: {pct(rec.avaliacao.pct.coberto)} coberto, {pct(rec.avaliacao.pct.borda)} na borda, {pct(rec.avaliacao.pct.fora)} fora.
                {rec.avaliacao.nivel ? ` Nível direto calculado na área coberta: ${fmt(rec.avaliacao.nivel.min)} a ${fmt(rec.avaliacao.nivel.max)} dB.` : ""}
              </p>
              <div className="rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Função</th>
                      <th>Posição (x, y)</th>
                      <th>Altura</th>
                      <th>Direção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.configuracao.caixas.map((c) => (
                      <tr key={c.id}>
                        <td>{c.numero}</td>
                        <td>{PAPEL[c.papel]}</td>
                        <td>
                          {fmt(c.posicao.x, 2)} m, {fmt(c.posicao.y, 2)} m{c.movida ? " (movida)" : ""}
                        </td>
                        <td>{fmt(c.posicao.z, 2)} m</td>
                        <td>{c.papel === "sub" ? "-" : `${fmt(c.mira.yaw, 0)}° / ${fmt(c.mira.pitch, 0)}°`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rec.configuracao.caixas.map((c) => (
                <PorQue key={c.id} conclusao={conc.get(`caixa:${c.id}`)} />
              ))}
              <p className="ajuda">Posição medida a partir do canto do palco à esquerda de quem olha para o público. Direção: horizontal (0° = para o fundo) / vertical (negativo = para baixo).</p>
              <PorQue conclusao={conc.get("cobertura")} />
            </div>
          </Secao>

          <div className={desatualizado ? "desatualizado" : ""}>
            <Secao n={4} titulo="Características mínimas de cada caixa">
              <p>
                <strong>{rec.perfilGenerico.nome}</strong>
              </p>
              <ul className="lista-simples">
                {rec.perfilGenerico.requisitos.map((q, i) => (
                  <li key={i}>{q.texto}</li>
                ))}
              </ul>
              <p className="ajuda">{rec.perfilGenerico.rotulo}</p>
              <PorQue conclusao={conc.get("requisitos")} />
              <PorQue conclusao={conc.get("capacidade")} />
            </Secao>

            <Secao n={5} titulo="Modelos do catálogo">
              {rec.semProdutoAdequado ? (
                <div className="aviso" data-testid="sem-produto">
                  Nenhum modelo do nosso catálogo verificado atende a este requisito. Use o perfil genérico acima para procurar uma caixa.
                </div>
              ) : null}
              {rec.candidatos.length === 0 ? <p className="ajuda">O catálogo não tem produtos desta categoria.</p> : null}
              {rec.candidatos.map((c) => {
                const escolhido = c.produtoId === rec.produto?.produtoId;
                const util = c.status === "compativel" || c.status === "parcial";
                return (
                  <div key={c.produtoId} className={`produto${escolhido ? " escolhido" : ""}`} data-testid={`produto-${c.produtoId}`}>
                    <div className="cab">
                      <strong>{c.nome}</strong>
                      <span className={`badge ${badgeCompat(c.status)}`}>{STATUS_COMPAT[c.status]}</span>
                    </div>
                    <div className="ajuda">
                      {c.quantidadeCaixas > 0 ? `${c.quantidadeCaixas} caixa(s) na configuração recalculada. ` : ""}
                      {c.margemNivel !== undefined ? `Margem de nível: +${fmt(c.margemNivel)} dB. ` : ""}
                      {c.faixa ? `Faixa de referência: ${brl(c.faixa.minimo)} a ${brl(c.faixa.maximo)} por unidade.` : ""}
                    </div>
                    {c.motivos.length ? (
                      <ul className="lista-simples ajuda">
                        {c.motivos.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="acoes nao-imprimir" style={{ marginTop: 6 }}>
                      {escolhido ? <span className="badge ok">Recomendado</span> : util ? (
                        <button type="button" className="btn sec pequeno" onClick={() => escolher(c)}>
                          Usar este modelo
                        </button>
                      ) : null}
                      <PorQue conclusao={conc.get(`produto:${c.produtoId}`)} />
                    </div>
                  </div>
                );
              })}
              {rec.sub.regra !== "nao_recomendado" ? (
                <>
                  <h3 style={{ marginTop: 12 }}>Subwoofer</h3>
                  {rec.sub.escolhido ? (
                    <p>
                      {rec.sub.escolhido.nome} <span className={`badge ${badgeCompat(rec.sub.escolhido.status)}`}>{STATUS_COMPAT[rec.sub.escolhido.status]}</span> · {rec.sub.porLado} por lado
                      {rec.sub.escolhido.pareamentoFabricante ? " (pareamento publicado pelo fabricante)" : " (regra padrão)"}
                    </p>
                  ) : (
                    <p>{rec.sub.perfilGenerico?.nome}: nenhum subwoofer do catálogo verificado. {rec.sub.perfilGenerico?.rotulo}</p>
                  )}
                </>
              ) : null}
              <PorQue conclusao={conc.get("produtos")} />
              {r.investimento ? (
                <div style={{ marginTop: 12 }}>
                  <h3>Investimento estimado</h3>
                  {r.investimento.referencia ? (
                    <p data-testid="investimento">
                      Investimento estimado em equipamentos: {brl(r.investimento.minimo)} a {brl(r.investimento.maximo)} (referência de mercado em {r.investimento.referencia}, sem instalação).
                      {r.investimento.itensSemFaixa.length ? ` Sem faixa para: ${r.investimento.itensSemFaixa.join(", ")}.` : ""}
                    </p>
                  ) : (
                    <p className="ajuda">Sem faixa de investimento vigente no catálogo.</p>
                  )}
                  <form
                    className="nao-imprimir"
                    onSubmit={(ev) => {
                      ev.preventDefault();
                      const v = Number(orc.replace(/\./g, "").replace(",", "."));
                      mudar((e) => {
                        const { orcamento: _o, ...resto } = e;
                        void _o;
                        return orc.trim() === "" || !Number.isFinite(v) ? resto : { ...resto, orcamento: Math.max(0, v) };
                      });
                    }}
                    style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}
                  >
                    <div className="campo" style={{ marginBottom: 0, flex: "1 1 180px" }}>
                      <label htmlFor="orcamento">Seu orçamento (opcional, R$)</label>
                      <input id="orcamento" type="text" inputMode="numeric" value={orc} onChange={(e) => setOrc(e.target.value)} data-testid="orcamento" />
                    </div>
                    <button type="submit" className="btn sec" data-testid="comparar-orcamento">
                      Comparar
                    </button>
                  </form>
                  {r.orcamento ? (
                    <div className={`aviso${r.orcamento.situacao === "abaixo" ? " bad" : " info"}`} data-testid="mensagem-orcamento">
                      {r.orcamento.mensagem}
                    </div>
                  ) : null}
                  <p className="ajuda">O orçamento não altera os requisitos técnicos.</p>
                  <PorQue conclusao={conc.get("investimento")} />
                </div>
              ) : null}
            </Secao>

            <Secao n={6} titulo="Motivo da escolha">
              <p>{rec.motivoEscolha}</p>
              <p>{conc.get("caixas")?.texto}</p>
              {r.reverb ? <p>{conc.get("reverberacao")?.texto}</p> : <p>{conc.get("reverberacao")?.texto}</p>}
              {r.pagNag ? (
                <div className={`aviso${r.pagNag.risco === "alto" ? " bad" : r.pagNag.risco === "moderado" ? "" : " info"}`} data-testid="pagnag">
                  Risco de microfonia: <strong>{r.pagNag.risco}</strong> (PAG {fmt(r.pagNag.pag)} dB, NAG {fmt(r.pagNag.nag)} dB). Estimativa simplificada (lei do inverso do quadrado). Não substitui teste no local.
                </div>
              ) : null}
              <PorQue conclusao={conc.get("reverberacao")} />
              {r.pagNag ? <PorQue conclusao={conc.get("pagnag")} /> : null}
              <PorQue conclusao={conc.get("escopo")} />
            </Secao>
          </div>

          <Secao n={7} titulo="O que falta validar e quando chamar um profissional">
            <ul className="lista-simples" data-testid="profissional">
              {r.profissional.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            {r.avisos.length ? (
              <>
                <h3 style={{ marginTop: 12 }}>Avisos</h3>
                <ul className="lista-simples">
                  {r.avisos.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <details style={{ marginTop: 12 }}>
              <summary>Parâmetros pendentes de validação usados neste resultado ({r.parametrosPendentes.length})</summary>
              <ul className="lista-simples">
                {r.parametrosPendentes.map((p) => (
                  <li key={p.id}>
                    <span className="mono">{p.id}</span> <span className="badge warn">pendente de validação</span>
                  </li>
                ))}
              </ul>
            </details>
          </Secao>

          <Secao n={8} titulo="Palco e microfones" id="palco">
            {r.palco ? (
              <Palco r={r} conc={conc} />
            ) : (
              <div className="nao-imprimir">
                <p>Quer a lista de microfones, retorno, mesa e acessórios? São 5 perguntas rápidas.</p>
                <Link className="btn" href={linkPalco} data-testid="ir-trilha2">
                  Fazer a trilha Palco e microfones
                </Link>
              </div>
            )}
          </Secao>
        </div>
      )}

      <div className="card nao-imprimir">
        <div className="acoes">
          <button type="button" className="btn" onClick={() => window.print()} data-testid="imprimir">
            Imprimir / salvar PDF
          </button>
          <button
            type="button"
            className="btn sec"
            data-testid="copiar-link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopiado(true);
              } catch {
                window.prompt("Copie o link:", window.location.href);
              }
            }}
          >
            {copiado ? "Link copiado" : "Copiar link do resultado"}
          </button>
          <Link className="btn sec" href="/questionario/" data-testid="editar" onClick={onEditar}>
            Editar respostas
          </Link>
          {r.palco ? (
            <Link className="btn sec" href={linkPalco}>
              Refazer palco e microfones
            </Link>
          ) : null}
        </div>
        <div style={{ marginTop: 16 }}>
          <span className="rotulo">Este resultado foi útil?</span>
          {pesquisa ? (
            <p>Obrigado pela resposta.</p>
          ) : (
            <div className="acoes" style={{ marginTop: 4 }}>
              {(
                [
                  ["sim", "Sim"],
                  ["em_parte", "Em parte"],
                  ["nao", "Não"],
                ] as const
              ).map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  className="btn sec pequeno"
                  onClick={() => {
                    analytics().registrar({ tipo: "pesquisa_utilidade", resposta: k });
                    setPesquisa(k);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="ajuda mono" data-testid="versoes">
        Motor {r.versoes.engineVersion} · catálogo {r.versoes.catalogVersion} · parâmetros {r.versoes.paramsVersion} · referência {r.dataReferencia}
      </p>
    </div>
  );
}

function Palco({ r, conc }: { r: ResultadoOk; conc: Map<string, Conclusao> }) {
  const p = r.palco!;
  const linhas = (itens: typeof p.microfones) =>
    itens.map((i) => (
      <tr key={i.id}>
        <td>{i.quantidade}</td>
        <td>
          {i.descricao}
          <div className="ajuda">
            {i.nome}
            {i.tipo === "generico" ? " · perfil genérico" : ""}
            {i.detalhe ? ` · ${i.detalhe}` : ""}
            {i.estimado ? " · estimado" : ""}
          </div>
        </td>
      </tr>
    ));
  return (
    <div data-testid="palco-resultado">
      {p.estimados.length ? <div className="aviso">Respostas presumidas pelo tipo de local (você marcou “não sei”): {p.estimados.join(", ")}.</div> : null}
      <h3>Mesa de som</h3>
      <p data-testid="mesa-tipo">
        <strong>{p.mesa.tipo === "analogica" ? "Mesa analógica" : p.mesa.tipo === "digital" ? "Mesa digital" : "Analógica ou digital"}</strong> · {p.canaisComReserva} canais (com reserva) · tamanho {p.tamanhoMesa}
      </p>
      <ul className="lista-simples">
        {[...p.mesa.motivos, ...p.mesa.vantagens].map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      <p className="ajuda">Requisitos: {p.mesa.requisitos.map((q) => q.texto).join("; ")}.</p>
      {p.mesa.escolhida ? (
        <p>
          Modelo: {p.mesa.escolhida.nome} <span className={`badge ${badgeCompat(p.mesa.escolhida.status)}`}>{STATUS_COMPAT[p.mesa.escolhida.status]}</span>
        </p>
      ) : (
        <p className="ajuda">Nenhuma mesa do catálogo verificado atende. Use os requisitos acima.</p>
      )}
      <PorQue conclusao={conc.get("palco:entradas")} />
      <PorQue conclusao={conc.get("palco:mesa")} />
      {p.microfones.length + p.di.length > 0 ? (
        <>
          <h3 style={{ marginTop: 12 }}>Microfones e direct box</h3>
          <table className="tabela">
            <tbody>{linhas([...p.microfones, ...p.di])}</tbody>
          </table>
          <PorQue conclusao={conc.get("palco:microfones")} />
        </>
      ) : null}
      {p.retorno.length ? (
        <>
          <h3 style={{ marginTop: 12 }}>Retorno</h3>
          <table className="tabela">
            <tbody>{linhas(p.retorno)}</tbody>
          </table>
          <PorQue conclusao={conc.get("palco:retorno")} />
        </>
      ) : null}
      <h3 style={{ marginTop: 12 }}>Acessórios</h3>
      <table className="tabela">
        <tbody>{linhas(p.acessorios)}</tbody>
      </table>
      <PorQue conclusao={conc.get("palco:acessorios")} />
      {p.rf.canais > 0 ? (
        <>
          <h3 style={{ marginTop: 12 }}>Sem fio (RF) · {p.rf.canais} canal(is)</h3>
          <ul className="lista-simples" data-testid="rf">
            {p.rf.orientacoes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
          <PorQue conclusao={conc.get("palco:rf")} />
        </>
      ) : null}
    </div>
  );
}
