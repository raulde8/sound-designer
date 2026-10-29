import Link from "next/link";
import { APP_NAME } from "@engine/version";
import { ArtePalco } from "./components/Logo";
import { Imagem } from "./components/Imagens";

export default function Inicio() {
  return (
    <div className="container">
      <section className="hero">
        <div>
          <span className="selo">Projeto de som gratuito</span>
          <h1>O som certo para a sua igreja ou evento, em 5 minutos</h1>
          <p>
            Responda perguntas simples sobre o seu espaço. O {APP_NAME} mostra quantas caixas usar, onde colocar cada uma, a altura, para onde apontar e quais modelos atendem.
          </p>
          <div className="acoes">
            <Link className="btn grande" href="/questionario/" data-testid="comecar">
              Começar agora
            </Link>
          </div>
          <p style={{ marginTop: 12, fontSize: "0.88rem" }}>Sem cadastro. Não pedimos nome, e-mail nem telefone.</p>
        </div>
        <div className="hero-arte">
          <ArtePalco />
        </div>
      </section>

      <section className="card">
        <h2>Como funciona</h2>
        <div className="passos-home" style={{ marginTop: 12 }}>
          <div className="passo-home">
            <span className="secao-num">1</span>
            <div>
              <strong>Conte sobre o espaço</strong>
              <p className="ajuda">Tamanho, quantas pessoas, para que o som é usado. Se não souber, marque “não sei”.</p>
            </div>
          </div>
          <div className="passo-home">
            <span className="secao-num">2</span>
            <div>
              <strong>Veja o projeto</strong>
              <p className="ajuda">Planta com as caixas numeradas, altura, direção e uma visão em 3D do palco.</p>
            </div>
          </div>
          <div className="passo-home">
            <span className="secao-num">3</span>
            <div>
              <strong>Monte o palco</strong>
              <p className="ajuda">Opcional: microfones, retorno, mesa de som, cabos e o checklist do dia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>O que você recebe</h2>
        <div className="itens duas" style={{ marginTop: 10 }}>
          {(
            [
              ["caixa", "Caixas e posição", "Quantas caixas, onde, em que altura e para onde apontar."],
              ["sub", "Graves", "Se precisa de subwoofer e quantos."],
              ["micSemFio", "Microfones", "Com fio, sem fio, headset, kit de bateria."],
              ["mesa", "Mesa de som", "Analógica ou digital, e quantos canais."],
              ["monitor", "Retorno", "Caixa de retorno ou fone para os músicos."],
              ["cabo", "Cabos e acessórios", "Comprimento de cada cabo, medido na planta."],
            ] as const
          ).map(([img, t, d]) => (
            <div className="item" key={t}>
              <Imagem tipo={img} tamanho={48} />
              <span className="t">
                <span className="n">{t}</span>
                <span className="ajuda" style={{ display: "block" }}>
                  {d}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="ajuda" style={{ marginTop: 12 }}>
          Cada resultado tem um <span className="info-i" style={{ color: "var(--accent-2)" }}>i</span> para você ver de onde vem a informação e por quê.
        </p>
      </section>
    </div>
  );
}
