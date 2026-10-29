"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Conclusao } from "@engine/explain/types";
import type { ResultadoOk } from "@engine/result";
import type { Candidato } from "@engine/selection/compat";
import { Planta } from "./Planta";
import { InfoConclusao, Info, Termo } from "./Info";
import { Imagem, imagemPara } from "./Imagens";
import { BoasPraticas, Checklists } from "./BoasPraticas";
import { analytics } from "@/lib/analytics";
import { catalogoAtual, modoCatalogo } from "@/lib/catalog";
import { codificar, type EstadoUrl } from "@/lib/state";
import { brl, fmt, MONTAGEM, PAPEL, pct } from "@/lib/format";

const Vista3D = dynamic(() => import("./Vista3D").then((m) => m.Vista3D), { ssr: false, loading: () => <p className="ajuda">Carregando 3D...</p> });

type Mudar = (patch: (e: Record<string, unknown>) => Record<string, unknown>) => void;

/** Rótulo do status do modelo em linguagem simples. */
export function statusModelo(c: { status: string; margemNivel?: number }): { texto: string; classe: string } {
  if (c.status === "compativel") return { texto: "Atende", classe: "ok" };
  if (c.status === "parcial") return c.margemNivel !== undefined && c.margemNivel < 0 ? { texto: "Pode faltar volume", classe: "warn" } : { texto: "Atende, com dados a confirmar", classe: "warn" };
  if (c.status === "incompativel") return { texto: "Não atende", classe: "bad" };
  return { texto: "Sem dados suficientes", classe: "neutro" };
}

const CAPACIDADE: Record<string, { texto: string; classe: string }> = {
  validada: { texto: "Volume confirmado pelos dados do fabricante", classe: "ok" },
  estimada: { texto: "Volume estimado (ficha do fabricante incompleta)", classe: "warn" },
  pendente: { texto: "Volume a confirmar", classe: "warn" },
  insuficiente: { texto: "Volume insuficiente", classe: "bad" },
};
const GEOMETRIA: Record<string, { texto: string; classe: string }> = {
  validada: { texto: "Posição das caixas calculada", classe: "ok" },
  validada_aproximacao: { texto: "Posição calculada, com aproximação", classe: "warn" },
  fora_do_modelo: { texto: "Parte do espaço fora do cálculo", classe: "bad" },
};
const ECO: Record<string, { texto: string; classe: string }> = {
  baixo: { texto: "Pouco eco na sala", classe: "ok" },
  medio: { texto: "Eco médio na sala", classe: "warn" },
  alto: { texto: "Muito eco na sala", classe: "bad" },
  nao_aplicavel: { texto: "Ambiente aberto: eco não avaliado", classe: "neutro" },
};

/** Comparação do volume com situações do dia a dia (aproximada). */
function comoSoa(db: number): string {
  if (db <= 72) return "como música de fundo";
  if (db <= 80) return "como uma conversa bem alta";
  if (db <= 88) return "como um louvor animado";
  if (db <= 96) return "como uma banda ao vivo";
  return "como um show";
}

function Secao({ n, titulo, sub, children, id, info }: { n: number; titulo: string; sub?: string; children: React.ReactNode; id?: string; info?: React.ReactNode }) {
  return (
    <section className="card" id={id} aria-labelledby={`s${n}`}>
      <h2 className="titulo-secao" id={`s${n}`}>
        <span className="secao-num">{n}</span>
        {titulo}
        {info}
      </h2>
      {sub ? <p className="sub-secao">{sub}</p> : null}
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
  const [ver3d, setVer3d] = useState(false);
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
  const mesaPos = r.palco ? { x: r.caso.sala.largura / 2, y: Math.max(r.caso.profundidadePalco, r.caso.sala.profundidade - 0.5) } : null;

  const principais = rec?.equipamentos.filter((e) => e.papel === "principal") ?? [];
  const totalCaixas = rec ? rec.configuracao.caixas.filter((c) => c.papel !== "sub").length : 0;
  const subs = rec ? rec.configuracao.caixas.filter((c) => c.papel === "sub").length : 0;
  const manchete = rec
    ? `${principais.map((e) => `${e.quantidade} × ${e.nome}`).join(" + ")}${totalCaixas > principais.reduce((s, e) => s + e.quantidade, 0) ? ` + ${totalCaixas - principais.reduce((s, e) => s + e.quantidade, 0)} caixa(s) de apoio` : ""}${subs ? ` + ${subs} subwoofer(s)` : ""}`
    : "";

  return (
    <div className="container" data-testid="resultado">
      <div className="nao-imprimir">
        {modo === "demo" ? <div className="aviso info">Modo demonstração: os produtos e os preços são fictícios.</div> : null}
        {catVazio ? <div className="aviso info">O catálogo ainda está vazio. O resultado mostra só o que a caixa precisa ter, sem modelos.</div> : null}
      </div>
      <div className="so-impressao">
        <h1>Projeto de som - resumo</h1>
      </div>
      {desatualizado ? (
        <div className="aviso bad faixa-desatualizado nao-imprimir" role="status" data-testid="desatualizado">
          <strong>Resultado desatualizado.</strong> Você mudou a posição de caixas na planta. A lista e as contas abaixo ainda são da posição anterior.
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
          <strong>{r.escopo.status === "parcial" ? "Atendido em parte." : "Este caso precisa de um projetista de som."}</strong>{" "}
          {r.escopo.itens
            .filter((i) => i.nivel !== "aviso")
            .map((i) => i.texto)
            .join(" ")}
          {r.escopo.naoCalculado.length ? <div>Não foi calculado: {r.escopo.naoCalculado.join(" ")}</div> : null} <InfoConclusao conclusao={conc.get("escopo")} />
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
          <h2>Nenhuma opção combina com as respostas</h2>
          {r.arquiteturas.map((a) => (
            <p key={a.id}>{a.motivo}</p>
          ))}
          <Link className="btn" href="/questionario/" onClick={onEditar}>
            Rever respostas
          </Link>
        </div>
      ) : (
        <>
          {/* ---------- Resumo ---------- */}
          <section className="card" aria-label="Resumo">
            <div className="resumo">
              <div>
                <span className="badge recomendado">Recomendado para o seu espaço</span>
                <p className="destaque" style={{ marginTop: 10 }} data-testid="arquitetura">
                  {rec.nomeSimples.charAt(0).toUpperCase() + rec.nomeSimples.slice(1)}
                </p>
                <p data-testid="manchete">{manchete}</p>
                <div className="badges">
                  <span className={`badge ${GEOMETRIA[rec.statusValidacao.geometria]!.classe}`}>{GEOMETRIA[rec.statusValidacao.geometria]!.texto}</span>
                  <span className={`badge ${CAPACIDADE[rec.statusValidacao.capacidade]!.classe}`} data-testid="status-capacidade">
                    {CAPACIDADE[rec.statusValidacao.capacidade]!.texto}
                  </span>
                  <span className={`badge ${ECO[rec.statusValidacao.acustica]!.classe}`}>{ECO[rec.statusValidacao.acustica]!.texto}</span>
                </div>
                <p className="ajuda">
                  {rec.motivoEscolha} <InfoConclusao conclusao={conc.get("arquitetura")} />
                </p>
              </div>
              <div className="numeros">
                <div className="numero">
                  <div className="v">{totalCaixas}</div>
                  <div className="r">
                    caixa(s) de som{subs ? ` + ${subs} subwoofer(s)` : ""} <Termo id="pa">{""}</Termo>
                  </div>
                </div>
                <div className="numero">
                  <div className="v">{r.alvo.requerido} dB</div>
                  <div className="r">
                    volume necessário, {comoSoa(r.alvo.alvo)} <InfoConclusao conclusao={conc.get("nivel-alvo")} />
                  </div>
                </div>
                <div className="numero">
                  <div className="v">{pct(rec.avaliacao.pct.coberto + rec.avaliacao.pct.borda)}</div>
                  <div className="r">
                    do público recebe o som direto <InfoConclusao conclusao={conc.get("cobertura")} />
                  </div>
                </div>
                <div className="numero">
                  <div className="v" style={{ fontSize: "1.05rem" }}>
                    {r.investimento?.referencia ? `${brl(r.investimento.minimo)} a ${brl(r.investimento.maximo)}` : "—"}
                  </div>
                  <div className="r">
                    investimento estimado <InfoConclusao conclusao={conc.get("investimento")} />
                  </div>
                </div>
              </div>
            </div>
            {r.alvo.avisoSegurancaAuditiva ? <div className="aviso bad">Volume acima de 95 dB: ficar muito tempo exposto pode prejudicar a audição. Controle o volume e o tempo.</div> : null}
          </section>

          {/* ---------- 1. Sistema ---------- */}
          <Secao n={1} titulo="O sistema recomendado" info={<InfoConclusao conclusao={conc.get("arquitetura")} />}>
            <p>{conc.get("arquitetura")?.texto}</p>
            <p className="ajuda">{conc.get("capacidade")?.texto}</p>
            {r.alternativas.length > 0 ? (
              <div style={{ marginTop: 12 }}>
                <h3>
                  Outras opções <Info titulo="Como as opções são escolhidas">Mostramos até 3 opções diferentes: a de menor investimento, a mais equilibrada (a recomendada) e a com mais folga de volume.</Info>
                </h3>
                <div className="rolagem">
                  <table className="tabela">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Opção</th>
                        <th>Caixas</th>
                        <th>Folga de volume</th>
                        <th>Referência de preço / un.</th>
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
                              {a.nome} ({a.arquitetura === "AR-1" ? "caixas comuns" : "colunas"})
                            </td>
                            <td>{a.quantidadeCaixas}</td>
                            <td>{a.margemNivel !== undefined ? `${a.margemNivel >= 0 ? "+" : ""}${fmt(a.margemNivel)} dB` : "a confirmar"}</td>
                            <td>{a.faixa ? `${brl(a.faixa.minimo)} a ${brl(a.faixa.maximo)}` : "-"}</td>
                            <td className="nao-imprimir">
                              {atual ? (
                                <span className="badge ok">atual</span>
                              ) : (
                                <button type="button" className="btn sec pequeno" onClick={() => mudar((e) => ({ ...e, escolhas: { ...((e.escolhas as object) ?? {}), arquitetura: a.arquitetura, principal: a.produtoId ?? "" }, ajustes: {} }))}>
                                  Ver esta
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

          {/* ---------- 2. Equipamentos ---------- */}
          <div className={desatualizado ? "desatualizado" : ""}>
            <Secao n={2} titulo="O que você vai precisar" sub="Lista das caixas. O número é o mesmo da planta." info={<InfoConclusao conclusao={conc.get("caixas")} />}>
              <div className="itens duas" data-testid="lista-equipamentos">
                {rec.equipamentos.map((e) => (
                  <div className="item" key={`${e.papel}-${e.ref}-${e.montagem}`} data-testid="item-equipamento" data-quantidade={e.quantidade}>
                    <Imagem tipo={imagemPara({ papel: e.papel, ref: e.ref })} tamanho={52} />
                    <span className="q">{e.quantidade}×</span>
                    <span className="t">
                      <span className="n">{e.nome}</span>
                      <span className="ajuda" style={{ display: "block" }}>
                        {PAPEL[e.papel]} · {MONTAGEM[e.montagem]} · nº {e.numeros.join(", ")}
                        {e.papel === "front_fill" ? (
                          <>
                            {" "}
                            <Termo id="frontFill">{""}</Termo>
                          </>
                        ) : null}
                        {e.papel === "reforco" ? (
                          <>
                            {" "}
                            <Termo id="delay">{""}</Termo>
                          </>
                        ) : null}
                        {e.papel === "sub" ? (
                          <>
                            {" "}
                            <Termo id="subwoofer">{""}</Termo>
                          </>
                        ) : null}
                      </span>
                      {e.tipo === "generico" ? <span className="ajuda" style={{ display: "block" }}>Descrição sem marca: o que procurar numa caixa.</span> : null}
                    </span>
                  </div>
                ))}
              </div>
              {rec.sub.regra === "opcional" ? (
                <div className="aviso info nao-imprimir">
                  Subwoofer é opcional para este uso.{" "}
                  <button type="button" className="btn sec pequeno" onClick={() => mudar((e) => ({ ...e, escolhas: { ...((e.escolhas as object) ?? {}), incluirSub: rec.sub.incluido ? "nao" : "sim" } }))}>
                    {rec.sub.incluido ? "Tirar subwoofer" : "Incluir subwoofer"}
                  </button>
                </div>
              ) : null}
              {rec.sub.incluido ? (
                <p className="ajuda">
                  {conc.get("sub")?.texto} <InfoConclusao conclusao={conc.get("sub")} />
                </p>
              ) : null}
              {rec.configuracao.atrasos.length > 0 ? (
                <div className="aviso">
                  {conc.get("reforco")?.texto} <InfoConclusao conclusao={conc.get("reforco")} />
                </div>
              ) : null}
            </Secao>
          </div>

          {/* ---------- 3. Planta ---------- */}
          <Secao n={3} titulo="Onde colocar cada caixa" sub="Vista de cima. O palco está no alto do desenho." info={<InfoConclusao conclusao={conc.get("cobertura")} />}>
            <p className="ajuda nao-imprimir">Quer testar outra posição? Arraste uma caixa (ou use as setas do teclado). O resultado fica desatualizado até você recalcular.</p>
            <Planta
              largura={r.caso.sala.largura}
              profundidade={r.caso.sala.profundidade}
              profundidadePalco={r.caso.profundidadePalco}
              configuracao={rec.configuracao}
              mapa={rec.mapa}
              pendentes={pendentes}
              onMover={(id, x, y) => setPendentes((p) => ({ ...p, [id]: { x, y } }))}
              microfone={r.pagNag?.microfone ?? null}
              mesa={mesaPos}
            />
            <div className={desatualizado ? "desatualizado" : ""}>
              <p style={{ marginTop: 10 }}>{conc.get("cobertura")?.texto}</p>
              <div className="rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>O que é</th>
                      <th>Posição (m)</th>
                      <th>Altura</th>
                      <th>Aponta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.configuracao.caixas.map((c) => (
                      <tr key={c.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {c.numero} <InfoConclusao conclusao={conc.get(`caixa:${c.id}`)} />
                        </td>
                        <td>{PAPEL[c.papel]}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {fmt(c.posicao.x, 1)} / {fmt(c.posicao.y, 1)}
                          {c.movida ? " (movida)" : ""}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{c.papel === "sub" ? "chão" : `${fmt(c.posicao.z, 1)} m`}</td>
                        <td>{c.papel === "sub" ? "-" : `${fmt(Math.abs(c.mira.yaw), 0)}° ao centro, ${fmt(Math.abs(c.mira.pitch), 0)}° p/ baixo`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="ajuda">Posição = distância da parede lateral / distância da parede do fundo do palco, a partir do canto do palco à esquerda de quem olha para o público. Altura = do chão até o centro da caixa.</p>
            </div>
          </Secao>

          <div className={desatualizado ? "desatualizado" : ""}>
            {/* ---------- 4. Requisitos ---------- */}
            <Secao n={4} titulo="O que a caixa precisa ter" sub="Use esta lista para conferir qualquer caixa." info={<InfoConclusao conclusao={conc.get("requisitos")} />}>
              <ul className="lista-simples">
                {rec.perfilGenerico.requisitos.map((q, i) => (
                  <li key={i}>
                    {q.texto}
                    {q.campo === "splContinuo1m" ? <Termo id="volumeMaximo">{""}</Termo> : null}
                    {q.campo === "coberturaH" || q.campo === "coberturaV" ? <Termo id="cobertura">{""}</Termo> : null}
                  </li>
                ))}
              </ul>
              <p className="ajuda">
                {conc.get("capacidade")?.texto} <InfoConclusao conclusao={conc.get("capacidade")} />
              </p>
            </Secao>

            {/* ---------- 5. Modelos ---------- */}
            <Secao n={5} titulo="Modelos que atendem" sub="Do catálogo verificado, em ordem técnica." info={<InfoConclusao conclusao={conc.get("produtos")} />}>
              {rec.semProdutoAdequado ? (
                <div className="aviso" data-testid="sem-produto">
                  Nenhum modelo do nosso catálogo verificado atende a este requisito. Use a lista “O que a caixa precisa ter” para procurar.
                </div>
              ) : null}
              {rec.candidatos.length === 0 ? <p className="ajuda">O catálogo não tem produtos deste tipo.</p> : null}
              {rec.candidatos.map((c) => {
                const escolhido = c.produtoId === rec.produto?.produtoId;
                const util = c.status === "compativel" || c.status === "parcial";
                const st = statusModelo(c);
                return (
                  <div key={c.produtoId} className={`produto${escolhido ? " escolhido" : ""}`} data-testid={`produto-${c.produtoId}`}>
                    <Imagem tipo={imagemPara({ categoria: c.categoria, id: c.produtoId })} tamanho={56} />
                    <div className="corpo">
                      <div className="cab">
                        <strong>{c.nome}</strong>
                        <span>
                          {escolhido ? <span className="badge recomendado">Recomendado</span> : null} <span className={`badge ${st.classe}`}>{st.texto}</span>
                        </span>
                      </div>
                      <div className="ajuda">
                        {c.quantidadeCaixas > 0 ? `${c.quantidadeCaixas} caixa(s) para o seu espaço. ` : ""}
                        {c.margemNivel !== undefined ? `Folga de volume: ${c.margemNivel >= 0 ? "+" : ""}${fmt(c.margemNivel)} dB. ` : ""}
                        {c.faixa ? `Referência de preço: ${brl(c.faixa.minimo)} a ${brl(c.faixa.maximo)} por unidade.` : ""}
                      </div>
                      <div className="acoes nao-imprimir" style={{ marginTop: 6 }}>
                        {!escolhido && util ? (
                          <button type="button" className="btn sec pequeno" onClick={() => escolher(c)}>
                            Usar este modelo
                          </button>
                        ) : null}
                        <InfoConclusao conclusao={conc.get(`produto:${c.produtoId}`)} rotulo="detalhes" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {rec.sub.regra !== "nao_recomendado" ? (
                <div className="produto">
                  <Imagem tipo="sub" tamanho={56} />
                  <div className="corpo">
                    <div className="cab">
                      <strong>Subwoofer: {rec.sub.escolhido ? rec.sub.escolhido.nome : rec.sub.perfilGenerico?.nome}</strong>
                      {rec.sub.escolhido ? <span className={`badge ${statusModelo(rec.sub.escolhido).classe}`}>{statusModelo(rec.sub.escolhido).texto}</span> : null}
                    </div>
                    <div className="ajuda">
                      {rec.sub.porLado} por lado
                      {rec.sub.escolhido?.pareamentoFabricante ? " (combinação indicada pelo fabricante)" : " (regra padrão)"}
                      {rec.sub.escolhido?.faixa ? ` · referência ${brl(rec.sub.escolhido.faixa.minimo)} a ${brl(rec.sub.escolhido.faixa.maximo)}` : ""}
                    </div>
                  </div>
                </div>
              ) : null}
              {r.investimento ? (
                <div style={{ marginTop: 14 }}>
                  <h3>
                    Investimento estimado <InfoConclusao conclusao={conc.get("investimento")} />
                  </h3>
                  {r.investimento.referencia ? (
                    <p data-testid="investimento">
                      Equipamentos: {brl(r.investimento.minimo)} a {brl(r.investimento.maximo)} (referência de preço de {r.investimento.referencia}, sem instalação).
                      {r.investimento.itensSemFaixa.length ? ` Sem referência para: ${r.investimento.itensSemFaixa.join(", ")}.` : ""}
                    </p>
                  ) : (
                    <p className="ajuda">Sem referência de preço válida.</p>
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
                      <label htmlFor="orcamento">Quanto vocês podem investir? (opcional, R$)</label>
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
                  <p className="ajuda">O orçamento não muda o que o seu espaço precisa: ele só é comparado com a faixa.</p>
                </div>
              ) : null}
            </Secao>

            {/* ---------- 6. Por quê ---------- */}
            <Secao n={6} titulo="Por que escolhemos assim">
              <p>
                {rec.motivoEscolha} <InfoConclusao conclusao={conc.get("arquitetura")} />
              </p>
              <p>
                {conc.get("reverberacao")?.texto} <InfoConclusao conclusao={conc.get("reverberacao")} />
              </p>
              {r.pagNag ? (
                <div className={`aviso${r.pagNag.risco === "alto" ? " bad" : r.pagNag.risco === "moderado" ? "" : " info"}`} data-testid="pagnag">
                  <Termo id="microfonia">Risco de microfonia (apito)</Termo>: <strong>{r.pagNag.risco}</strong>.{" "}
                  {r.pagNag.risco === "alto"
                    ? "Mantenha quem fala bem atrás da linha das caixas, use o microfone perto da boca e evite abrir muitos microfones ao mesmo tempo."
                    : r.pagNag.risco === "moderado"
                      ? "Cuidado com o volume do microfone e com a posição de quem fala."
                      : "Com a posição sugerida, o risco é baixo."}{" "}
                  É uma estimativa pelas distâncias; teste sempre no local. <InfoConclusao conclusao={conc.get("pagnag")} />
                </div>
              ) : null}
            </Secao>
          </div>

          {/* ---------- 7. Cuidados ---------- */}
          <Secao n={7} titulo="Cuidados e quando chamar um técnico">
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
            <h3 style={{ marginTop: 16 }}>Boas práticas</h3>
            <BoasPraticas temPalco={!!r.palco} />
            <details style={{ marginTop: 14 }}>
              <summary>
                Valores de referência usados nesta conta ({r.parametrosPendentes.length}) <Termo id="parametroPendente">{""}</Termo>
              </summary>
              <ul className="lista-simples">
                {r.parametrosPendentes.map((p) => (
                  <li key={p.id}>
                    <span className="mono">{p.id}</span> <span className="badge warn">a revisar por especialista</span>
                  </li>
                ))}
              </ul>
            </details>
          </Secao>

          {/* ---------- 8. Palco ---------- */}
          <Secao n={8} titulo="Palco e microfones" id="palco">
            {r.palco ? (
              <Palco r={r} conc={conc} />
            ) : (
              <div className="nao-imprimir">
                <p>Quer a lista de microfones, retorno, mesa de som e cabos? São 5 perguntas rápidas.</p>
                <Link className="btn" href={linkPalco} data-testid="ir-trilha2">
                  Montar a lista do palco
                </Link>
              </div>
            )}
          </Secao>

          {/* ---------- 9. Checklist ---------- */}
          <Secao n={9} titulo="Checklist do dia" sub="Para o culto ou evento correr bem.">
            <Checklists />
          </Secao>

          {/* ---------- 10. 3D ---------- */}
          <section className="card nao-imprimir" aria-label="Visualização 3D">
            <h2 className="titulo-secao">
              <span className="secao-num">3D</span>Ver o palco em 3D
            </h2>
            {ver3d ? (
              <Vista3D
                largura={r.caso.sala.largura}
                profundidade={r.caso.sala.profundidade}
                peDireito={r.caso.sala.peDireito}
                profundidadePalco={r.caso.profundidadePalco}
                caixas={rec.configuracao.caixas}
                publico={r.caso.publico}
                microfone={r.pagNag?.microfone ?? null}
                mesa={mesaPos}
              />
            ) : (
              <>
                <p className="ajuda">Uma visão simples da sala com o palco, as caixas e o público, para entender onde cada coisa fica.</p>
                <button type="button" className="btn" onClick={() => setVer3d(true)} data-testid="abrir-3d">
                  Gerar visualização 3D
                </button>
              </>
            )}
          </section>
        </>
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
  const lista = (itens: typeof p.microfones) => (
    <div className="itens duas">
      {itens.map((i) => (
        <div className="item" key={i.id}>
          <Imagem tipo={imagemPara({ ref: i.id })} tamanho={44} />
          <span className="q">{i.quantidade}×</span>
          <span className="t">
            <span className="n">{i.descricao}</span>
            <span className="ajuda" style={{ display: "block" }}>
              {i.tipo === "produto" ? i.nome : `${i.nome.replace(" (perfil genérico)", "")} (sem marca)`}
              {i.detalhe ? ` · ${i.detalhe}` : ""}
              {i.estimado ? " · presumido" : ""}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
  const tipoMesa = p.mesa.tipo === "analogica" ? "Mesa analógica" : p.mesa.tipo === "digital" ? "Mesa digital" : "Mesa analógica ou digital";
  return (
    <div data-testid="palco-resultado">
      {p.estimados.length ? <div className="aviso">Algumas respostas foram “não sei”; usamos o mais comum para o seu tipo de local: {p.estimados.join(", ")}.</div> : null}
      <div className="item" style={{ marginBottom: 12 }}>
        <Imagem tipo="mesa" tamanho={56} />
        <span className="t">
          <span className="n" data-testid="mesa-tipo">
            {tipoMesa} · pelo menos {p.canaisComReserva} canais
          </span>{" "}
          <Termo id={p.mesa.tipo === "analogica" ? "mesaAnalogica" : "mesaDigital"}>{""}</Termo>
          <span className="ajuda" style={{ display: "block" }}>
            {[...p.mesa.motivos, ...p.mesa.vantagens].join(" ")}
          </span>
          <span className="ajuda" style={{ display: "block" }}>
            {p.mesa.escolhida ? `Modelo: ${p.mesa.escolhida.nome}` : "Ainda não temos mesas no catálogo: use os requisitos ao lado para escolher."}{" "}
            <InfoConclusao conclusao={conc.get("palco:mesa")} rotulo="requisitos" />
          </span>
        </span>
      </div>
      <p className="ajuda">
        {conc.get("palco:entradas")?.texto} <InfoConclusao conclusao={conc.get("palco:entradas")} />
      </p>
      {p.microfones.length + p.di.length > 0 ? (
        <>
          <h3 style={{ marginTop: 12 }}>
            Microfones <InfoConclusao conclusao={conc.get("palco:microfones")} />
          </h3>
          {lista([...p.microfones, ...p.di])}
        </>
      ) : null}
      {p.retorno.length ? (
        <>
          <h3 style={{ marginTop: 12 }}>
            Retorno para os músicos <InfoConclusao conclusao={conc.get("palco:retorno")} />
          </h3>
          {lista(p.retorno)}
        </>
      ) : null}
      <h3 style={{ marginTop: 12 }}>
        Cabos e acessórios <InfoConclusao conclusao={conc.get("palco:acessorios")} />
      </h3>
      {lista(p.acessorios)}
      {p.rf.canais > 0 ? (
        <>
          <h3 style={{ marginTop: 12 }}>
            Aparelhos sem fio <InfoConclusao conclusao={conc.get("palco:rf")} />
          </h3>
          <ul className="lista-simples" data-testid="rf">
            {p.rf.orientacoes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </>
      ) : null}
      {p.inputList.length ? (
        <>
          <h3 style={{ marginTop: 16 }}>
            Lista de canais da mesa <Termo id="inputList">{""}</Termo>
          </h3>
          <div className="rolagem">
            <table className="tabela" data-testid="input-list">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>O que entra</th>
                  <th>Como capta</th>
                  <th>Suporte</th>
                  <th>+48 V</th>
                </tr>
              </thead>
              <tbody>
                {p.inputList.map((l) => (
                  <tr key={l.canal}>
                    <td>{l.canal}</td>
                    <td>{l.fonte}</td>
                    <td>{l.captacao}</td>
                    <td>{l.pedestal}</td>
                    <td>{l.phantom ? "Sim" : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ajuda">Imprima e cole perto da mesa: ajuda a montar e a achar problemas rápido.</p>
        </>
      ) : null}
    </div>
  );
}
