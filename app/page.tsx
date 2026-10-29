import Link from "next/link";
import { APP_NAME } from "@engine/version";

export default function Inicio() {
  return (
    <div className="container">
      <div className="card">
        <h1>Descubra o sistema de som certo para o seu espaço</h1>
        <p>
          Responda cerca de 10 perguntas simples (uns 5 minutos) sobre o seu local. O {APP_NAME} mostra a configuração de caixas, onde posicionar cada uma numa planta, as
          características mínimas e os modelos do catálogo verificado que atendem.
        </p>
        <p className="ajuda">Para igrejas, bares, restaurantes, auditórios, salões e casas de eventos de pequeno e médio porte.</p>
        <div className="acoes">
          <Link className="btn" href="/questionario/" data-testid="comecar">
            Começar
          </Link>
        </div>
      </div>
      <div className="card">
        <h2>Como funciona</h2>
        <ul className="lista-simples">
          <li>As contas seguem regras técnicas explícitas. Cada resultado tem um botão “Por quê?”.</li>
          <li>O resultado mostra o que foi validado e o que ainda depende de dado do fabricante ou de um profissional.</li>
          <li>Depois, se quiser, uma segunda parte opcional monta a lista de palco: microfones, retorno, mesa e acessórios.</li>
          <li>Não pedimos nome, e-mail nem telefone.</li>
        </ul>
      </div>
    </div>
  );
}
