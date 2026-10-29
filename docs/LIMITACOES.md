# Limitações, parâmetros pendentes e verificação

## 1. O que foi verificado de fato (com evidência)
| Item | Como | Evidência |
|---|---|---|
| Matemática: distâncias, ângulos fora do eixo, 20log, interpolação, cabos, PAG/NAG | Vitest com valores calculados à mão no próprio teste | `engine/**/*.test.ts` |
| Propriedades: quantidades inteiras, caixas dentro da sala e abaixo do pé-direito, montagem permitida, lista == planta, orçamento não reduz requisito, não avaliável nunca compatível, determinismo, marca não muda a ordem | fast-check | `engine/selection/selection.test.ts`, `engine/architectures/architectures.test.ts` |
| Validador do catálogo (campo crítico sem fonte/data, item demo em produção) | Vitest | `catalog/catalog.test.ts` |
| 10 casos de referência no catálogo demo | `npm run casos` + `engine/casos.test.ts` | `docs/casos-referencia/` |
| Jornada completa em 390x844 e 1440x900, edição, impressão (PDF), link compartilhado, planta desatualizada até recalcular | Playwright | `e2e/jornada.spec.ts` |
| Conferência visual da planta e do resultado em celular e desktop | Capturas de tela no navegador (Chromium) | feita durante o incremento 9 |

## 2. O que só foi implementado (não validado)
- **Nenhum resultado foi validado por especialista nem em campo.** Não houve comparação com EASE Focus, medição de instalações reais nem teste de usabilidade (SPEC C10 E).
- Exemplo numérico da Biamp: não reproduzido (fonte bloqueada). Fixture pendente em `engine/acoustics/fixtures/biamp-pag-nag.json`.
- Texto da Anatel sobre a faixa 698-806 MHz: não confirmado.
- Catálogo de produção: vazio. Os comportamentos com produtos reais só foram exercitados com o catálogo demo fictício.

## 3. Não implementado (fora do MVP ou adiado)
- AR-4 (teto) e AR-5 (parede distribuída): só a interface `ArchitectureGenerator`.
- RT60, STI, mapa de graves, valores finais de delay/EQ, coordenação de RF, dimensionamento estrutural e elétrico (SPEC B6).
- Ambientes em L/irregulares: só o retângulo principal é calculado ("atendido parcialmente").
- Obstáculos (colunas), mezanino, ambientes conectados: só aviso.
- Reforço/delay só na AR-1. Na AR-2, se nenhuma configuração da tabela alcança o fundo, o produto fica incompatível.
- Posição da mesa na planta: a trilha 2 usa o padrão (fundo, centro); a UI ainda não deixa escolher outra posição (o schema já aceita `posicaoMesa`).
- `Offer` existe no schema e não aparece na UI (decisão da SPEC).
- Checkout, CRM, login, painel, captura de contato, IA, 3D: fora do escopo.

## 4. Limitações do modelo que o revisor precisa conhecer
- **Sem soma de fontes e sem atenuação fora do eixo** (SPEC). Consequência: o critério de uniformidade de 6 dB quase nunca é atendido por fontes frontais em salas com mais de ~4 m de profundidade. O sistema mostra a variação como aviso, não como reprovação.
- **Usos com banda/DJ pedem 105 a 110 dB** na área (alvo + reserva). Sem somar fontes, poucas caixas pontuais atingem isso a mais de 10 m. Por isso produtos com SPL publicado costumam ficar "incompatíveis" e um produto **sem** dado de nível pode ficar à frente ("parcial", porque ausência de dado não reprova). O resultado mostra um aviso explícito nesse caso.
- **Vertical array sem extrapolação:** pontos mais perto que o primeiro ponto publicado da tabela de SPL ficam sem nível. Por isso a capacidade da AR-2 tende a ficar "pendente".
- A primeira fileira fica logo depois do palco. Arrays montados alto não cobrem essa faixa: o motor cobre a partir de `alcanceFrontFill` e adiciona front-fill (extensão da regra da SPEC, ver DECISOES).
- Front-fill e reforço usam perfil genérico / o mesmo produto da principal; o nível do front-fill não é avaliado.
- Classe de reverberação, presets por estabelecimento e regras de palco são hipóteses de produto.

## 5. Parâmetros pendentes de validação
Todos em `engine/params/v1.ts`, com `status: "pendente_validacao"`, origem e nota. A UI mostra o selo "pendente" em cada "Por quê?" que depende deles e lista os usados em cada resultado.

alturaOuvinteSentado, alturaOuvinteEmPe, envelope, limitesEntrada, faixasTamanho, profundidadePalcoPadrao, areaPorPessoa, presetsEstabelecimento, presetsPalco, alturaBasePedestal, alturaMaxParede, folgaTeto, meiaAlturaCaixaPadrao, afastamentoParedeLateral, recuoPalco, alcanceFrontFill, coberturaReferenciaArray, vMaxArrayGenerico, posicaoMicrofone, distMaxPontual, coberturaReferenciaPontual, coberturaReferenciaFrontFill, larguraPorFrontFill, faixaPrimeiraFileira, tamanhoPorSplRequerido, alturaCentroColunaPadrao, alturaCentroArrayPadrao, profundidadePreferenciaArray, subPorLadoPadrao, bordaCobertura, picoParaContinuo, foraMaxValidada, uniformidadeMax, toleranciaNivel, niveisPorUso, ajusteRuido, tetoAlvo, limiarSegurancaAuditiva, reverberacao, pagNag, canaisPorInstrumento, diPorInstrumento, reservaCanais, tamanhosMesaPadrao, regraMesa, limiarCoordenacao, limiarEspecialista, faixaRfEvitar, folgaCabo, limiarMulticabo, phantomBateriaAcustica, margemNivelMaxRanking, pesoMaxPorMontagem.

Parâmetros de referência (não pendentes): passoMalha, maxPontosMalha, velocidadeSom, comprimentosCabo, validadeFaixaDias.

## 6. Jurídico
`/termos/` tem `[RAZAO_SOCIAL]` e `[CNPJ]` visíveis. Revisão por advogado obrigatória antes do lançamento.
