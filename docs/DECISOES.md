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
