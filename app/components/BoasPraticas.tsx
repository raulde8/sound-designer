import { Info } from "./Info";

interface Pratica {
  titulo: string;
  texto: string;
  porque: string;
}

const PA: Pratica[] = [
  {
    titulo: "Caixas sempre à frente dos microfones",
    texto: "Quem fala ou canta fica atrás da linha das caixas principais. Nunca aponte uma caixa para o microfone.",
    porque: "Se o som da caixa entra de novo no microfone, ele volta para a caixa e vira o apito (microfonia). Manter as caixas à frente é a forma mais simples de evitar isso.",
  },
  {
    titulo: "Agudo acima da cabeça do público",
    texto: "A parte de cima da caixa (o agudo) deve ficar acima da cabeça de quem está em pé ou sentado, com a caixa levemente inclinada para baixo.",
    porque: "O agudo é o que dá clareza à voz e é bloqueado pelas pessoas da frente. Alto e inclinado, ele chega também ao fundo.",
  },
  {
    titulo: "Mire nas pessoas, não nas paredes",
    texto: "Vire as caixas para o centro do público. Evite mirar em paredes de vidro, azulejo ou alvenaria lisa.",
    porque: "Paredes duras devolvem o som e aumentam o eco. Som que vai para a parede não chega claro a ninguém.",
  },
  {
    titulo: "Subwoofer no chão",
    texto: "O subwoofer fica no chão, junto ou embaixo das caixas principais.",
    porque: "O chão reforça o grave. Juntos das principais, o grave e o resto do som chegam ao mesmo tempo.",
  },
];

const PALCO: Pratica[] = [
  {
    titulo: "Retorno atrás do microfone",
    texto: "A caixa de retorno fica no chão, de frente para o músico, na parte de trás do microfone (onde ele quase não capta).",
    porque: "Microfones de voz captam pela frente e quase nada por trás. Retorno atrás do microfone diminui o risco de apito.",
  },
  {
    titulo: "Microfone perto da boca",
    texto: "Microfone de mão a 2 a 5 dedos da boca. Headset no canto da boca, sem encostar.",
    porque: "Quanto mais perto, menos volume a mesa precisa dar, e menos risco de microfonia e de captar barulho da sala.",
  },
  {
    titulo: "Sem fio com carga e visada",
    texto: "Carregue as baterias antes de cada uso e deixe a antena do receptor à vista do palco, sem obstáculos.",
    porque: "Bateria fraca e antena escondida causam cortes no som. Celulares em modo avião perto do palco também ajudam.",
  },
  {
    titulo: "Cabos presos e fora da passagem",
    texto: "Prenda os cabos no chão com fita e não cruze cabo de áudio junto com cabo de energia (se cruzar, cruze em “X”).",
    porque: "Evita tropeços e evita o zumbido que o cabo de energia pode induzir no cabo de áudio.",
  },
];

export function BoasPraticas({ temPalco }: { temPalco: boolean }) {
  const lista = (ps: Pratica[]) => (
    <div className="praticas">
      {ps.map((p, i) => (
        <div className="pratica" key={p.titulo}>
          <span className="ico">{i + 1}</span>
          <div>
            <strong>{p.titulo}</strong>{" "}
            <Info titulo={p.titulo}>
              <span className="h">Por que</span>
              <span className="p">{p.porque}</span>
              <span className="h">De onde vem</span>
              <span className="p">Boas práticas de sonorização ao vivo e de sonoplastia de igreja.</span>
            </Info>
            <div className="ajuda">{p.texto}</div>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div data-testid="boas-praticas">
      <h3>Para as caixas</h3>
      {lista(PA)}
      {temPalco ? (
        <>
          <h3 style={{ marginTop: 16 }}>Para o palco e os microfones</h3>
          {lista(PALCO)}
        </>
      ) : null}
    </div>
  );
}

/** Checklists do dia (baseados nas fichas e checklists do material de treinamento do dono do produto). */
export function Checklists() {
  return (
    <div className="checklist" data-testid="checklists">
      <div className="pratica" style={{ display: "block" }}>
        <strong>Ordem de ligar</strong>{" "}
        <Info titulo="Por que existe uma ordem">
          <span className="p">Ligar as caixas por último e desligar primeiro evita o “estalo” forte que pode queimar alto-falantes e assustar quem está na sala.</span>
          <span className="h">De onde vem</span>
          <span className="p">Checklist “Ordem de ligar e desligar” (Fichas e Checklists, Mapas Visuais de Som ao Vivo).</span>
        </Info>
        <ol>
          <li>Volume geral e volume das caixas no mínimo</li>
          <li>Fontes: sem fio, teclado, notebook</li>
          <li>Mesa de som</li>
          <li>Processador (se houver)</li>
          <li>Caixas ativas, por último</li>
        </ol>
        <p className="ajuda" style={{ marginTop: 6 }}>
          Para desligar, faça ao contrário: caixas primeiro.
        </p>
      </div>
      <div className="pratica" style={{ display: "block" }}>
        <strong>Ao chegar</strong>
        <ul>
          <li>Tomadas, régua e extensões conferidas</li>
          <li>Baterias carregadas em todos os sem fio</li>
          <li>Celular e notebook em modo avião</li>
          <li>Todos os microfones e retornos testados</li>
          <li>Cabos presos e fora da passagem</li>
          <li>Nenhum copo ou garrafa perto da mesa</li>
        </ul>
      </div>
      <div className="pratica" style={{ display: "block" }}>
        <strong>Passagem de som, nesta ordem</strong>
        <ol>
          <li>Teste cada canal, um por um</li>
          <li>Ajuste o ganho (o volume de entrada) de cada canal</li>
          <li>Filtros e equalização</li>
          <li>Retornos dos músicos</li>
          <li>Tudo junto: música e fala</li>
        </ol>
      </div>
      <div className="pratica" style={{ display: "block" }}>
        <strong>Durante o culto ou evento</strong>
        <ul>
          <li>Fique na mesa, de onde dá para ouvir o que o público ouve</li>
          <li>Se apitar, abaixe primeiro o microfone que está aberto mais alto</li>
          <li>Silencie (mute) os microfones que não estão em uso</li>
          <li>Volume alto por muito tempo cansa e pode prejudicar a audição</li>
        </ul>
      </div>
    </div>
  );
}
