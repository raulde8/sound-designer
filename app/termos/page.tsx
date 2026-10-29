import { APP_NAME } from "@engine/version";

export const metadata = { title: "Termos e privacidade" };

export default function Termos() {
  return (
    <div className="container">
      <div className="card">
        <h1>Termos e privacidade</h1>
        <div className="aviso bad" data-testid="placeholder-juridico">
          Texto provisório. Os dados da empresa abaixo precisam ser preenchidos e o texto precisa de revisão por advogado antes do lançamento.
        </div>
        <h2>Quem opera o site</h2>
        <p>
          O {APP_NAME} é operado por <strong>[RAZAO_SOCIAL]</strong>, CNPJ <strong>[CNPJ]</strong>.
        </p>
        <h2>O que o site faz</h2>
        <p>
          O site faz um pré-dimensionamento de sonorização a partir das suas respostas. Os cálculos seguem regras técnicas explícitas e dados declarados pelos fabricantes. O
          resultado não substitui projeto, medição no local, projeto estrutural de fixação nem projeto elétrico.
        </p>
        <h2>Como recomendamos</h2>
        <p>Recomendamos por critérios técnicos. A ordem dos modelos usa compatibilidade, quantidade de caixas, margem de nível e faixa de investimento. Nenhuma marca recebe bônus de ordenação.</p>
        <h2>Privacidade</h2>
        <ul className="lista-simples">
          <li>Não pedimos nome, e-mail, telefone nem outro dado pessoal.</li>
          <li>Suas respostas ficam no seu navegador (rascunho local) e no link do resultado. O link só é compartilhado se você copiar e enviar.</li>
          <li>
            Registramos eventos anônimos de uso para melhorar o questionário: etapa iniciada, etapa concluída, tempo até o resultado, abandono, caso fora do escopo, uso da parte de
            palco, cliques em “Por quê?” e a resposta da pergunta “Este resultado foi útil?”. Esses eventos não contêm dados pessoais nem as medidas do seu local.
          </li>
          <li>O site não usa cookies de publicidade.</li>
        </ul>
      </div>
    </div>
  );
}
