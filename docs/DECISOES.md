# Decisões de implementação

Registro das decisões tomadas durante a implementação e das contradições encontradas.
Formato: data | decisão | motivo.

## Estado inicial do repositório
- 29/10/2026 | O diretório de trabalho estava vazio e sem git. Foi criado um repositório novo com a stack padrão do prompt. | Não havia código a preservar.

## Stack e versões (verificadas no registro npm em 29/10/2026)
- Next.js 16.4.3, React 19.3.1, Zod 4.6.7, Vitest 5.0.5, fast-check 4.10.2, lz-string 1.5.0.
- **TypeScript 6.0.3, não 7.0.2.** O TypeScript 7 (versão nativa) é o `latest`, mas o `typescript-eslint` 8.72 exige `typescript <6.1`. Escolhi a versão estável mais recente que o lint suporta.
- **ESLint 9.39.5, não 10.** O `eslint-plugin-react` (dependência do `eslint-config-next`) declara suporte só até o ESLint 9.
- **@playwright/test 1.63.0**, igual ao Playwright pré-instalado no ambiente, para usar o Chromium já instalado.
- Monorepo em um pacote só (pastas `/engine`, `/catalog`, `/app`, `/docs`). A separação do motor é garantida por regra de lint (`no-restricted-imports`, `no-restricted-globals`, `Math.random`, `Date.now`).

## Contradições e lacunas da SPEC
- **Exemplo PAG/NAG da Biamp.** A SPEC e o prompt pedem para reproduzir "PAG 4 dB e NAG 9 dB; depois PAG 15 dB com Ds = 0,4 m". O site da Biamp está bloqueado na rede deste ambiente e não consegui confirmar as entradas (D0, D1, D2, D3, Ds). Não inventei as distâncias. Usei como teste o exemplo publicado pela Rane (nota "Introduction to Speech Reinforcement with Conferencing", reproduzida pela ProSoundWeb): D0 = 20 ft, D1 = 10 ft, D2 = 6 ft, Ds = 2 ft, D3 = 4 ft, NOM = 1 -> PAG ≈ 18,4 dB (com FSM de 6 dB), NAG = 14 dB. O teste da Biamp ficou como fixture pendente (`engine/acoustics/fixtures/biamp-pag-nag.json`): basta preencher as distâncias para o teste rodar.
- **Biamp chama de D4 a distância falante-microfone.** A SPEC chama de Ds. Mantive Ds.
- **"Tolerância" do nível (C4 AR-1)** não tem valor na SPEC. Criei `toleranciaNivel = 3 dB` como pendente.
- **Critério de reforço.** A SPEC C4 diz "abaixo do alvo menos a tolerância"; C5 diz "nível mínimo >= alvo + reserva" e o reforço entra "na posição em que o nível cai abaixo do alvo". Implementei: capacidade = `min >= alvo + reserva`; gatilho do reforço = `min < alvo + reserva - tolerância`; posição do reforço = primeira profundidade em que o nível cai abaixo de `alvo + reserva`.
- **Formação "acústica"** não tem linha na tabela de níveis. Usei a linha "voz e violão" (85 dB, sub opcional).
- **Limites de entrada** (B5 diz "área > limite do envelope" sem valor): rejeito sala acima de 3.000 m², dimensão acima de 100 m e pé-direito acima de 30 m. Área de público acima de 600 m² fica "parcial", não erro.
- **Uniformidade** (C5) é tratada como aviso, não como reprovação do produto, porque a SPEC C7 só reprova quando "algum dado presente viola um requisito" e a uniformidade depende da posição, não só do produto.
- **Front-fill na AR-2** (não previsto na SPEC): quando nenhuma configuração da tabela cobre a partir da primeira fileira, o motor tenta cobrir a partir de `alcanceFrontFill` (3 m) e adiciona front-fill. Sem isso, nenhum array montado acima do público passaria.
- **Front-fill da AR-1:** gatilho só pela cobertura **horizontal** nominal nas laterais da primeira fileira, como na SPEC. O front-fill usa perfil genérico e seu nível não entra no critério de capacidade.
- **Reforço/delay** usa o mesmo modelo da caixa principal; só na AR-1.
- **Interpolação da tabela de SPL** do array: linear em log10(distância) entre os pontos publicados; fora do intervalo publicado não há nível.
- **Status "validada" da geometria:** produto real, sala medida e no máximo 5% da área fora da cobertura nominal (`foraMaxValidada`, pendente). Senão, "validada com aproximação".
- **Ruído "não sei"** usa a opção do meio (+5 dB), coerente com "classe média" da SPEC B2 item 10.
- **Sub opcional** não entra na configuração por padrão; o usuário inclui com um botão.
- **Phantom power:** exigido quando há bateria acústica (overheads condensadores) — hipótese.
- **Cabos XLR:** além de "1 por microfone com fio + 1 por caixa ativa" (SPEC), contam-se 1 por DI e 1 por monitor (o monitor é caixa ativa).
- **Planta:** vista de cima com o palco no topo; a origem da SPEC (canto do palco à esquerda de quem olha para o público) fica no canto superior direito do desenho.
- **Build estático** (`output: "export"`): o motor roda no navegador; nada depende de servidor. O registro de snapshots inclui só o modo do build, então o bundle de produção não contém dados demo.
- **Data de referência** (validade das faixas) é lida pela UI e gravada no link; o motor não lê o relógio.
- **Mudança de versão do motor:** links antigos com outra `engineVersion` não podem rodar o motor antigo (não fica embarcado). O relatório informa e oferece recálculo. Catálogos e parâmetros antigos ficam embarcados por hash/versão.
