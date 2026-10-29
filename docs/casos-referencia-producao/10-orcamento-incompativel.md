# Orçamento incompatível (caso 1 com orçamento de R$ 1.000)

**Esperado (SPEC C10):** Mensagem e custo mínimo, sem relaxar requisito.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - duas caixas de som na frente, uma de cada lado do palco
O público ocupa 9 m de profundidade. Para essa distância, duas caixas comuns na frente resolvem bem (colunas passam a valer a pena acima de 18 m).

Status: geometria validada; capacidade estimada (Com o dado estimado, o volume mínimo calculado (99.8 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer EVX 10 | pedestal | 0,5 | 2,5 | 2,3 | 25,3 | -8,7 |
| 2 | principal | Armer EVX 10 | pedestal | 9,5 | 2,5 | 2,3 | -25,3 | -8,7 |

Cobertura: 94% coberto, 4% borda, 1% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 108 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo producao
- Armer EVX 10: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (99.8 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação).
- Armer EVX 15: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (101.8 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação).
- AZ Audio Z1 Compact Pro: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (88.8 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação).
- Armer EVX8GO: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (88.8 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação).
- Armer EVX215: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.
- Armer EVX 12: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.

Produto escolhido: Armer EVX 10. Sub: nao_recomendado.

Alternativas: menor custo: AZ Audio Z1 Compact Pro (AR-1); equilíbrio: Armer EVX 10 (AR-1); maior capacidade: Armer EVX 15 (AR-1)

## Reverberação: classe medio (2 pontos)
Eco da sala: médio (2 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## PAG/NAG
PAG 24,7 dB, NAG 20,6 dB, margem 4,1 dB: risco baixo.

## Investimento (faixas demo)
R$ 4999.88 a R$ 9185.04 (ref. 10/2026).

## Orçamento
O orçamento informado (R$ 1.000) fica abaixo do mínimo estimado para a solução que atende aos requisitos (R$ 5.000). O sistema não reduz os requisitos para caber no orçamento.

## Avisos
- O fabricante não informa se o volume máximo (126 dB) é contínuo ou de pico. Por segurança, tratamos como pico: contínuo estimado = 126 - 6 dB.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (25)
afastamentoParedeLateral, ajusteRuido, alturaBasePedestal, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, picoParaContinuo, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
