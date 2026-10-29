# Bar 18 x 12 x 4 m, 180 pessoas, banda e DJ

**Esperado (SPEC C10):** AR-1 ou AR-2 com sub; aviso de nível alto e segurança auditiva.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 100 dB + reserva 10 dB = 110 dB. Sub: sim. Aviso de segurança auditiva: sim.

## Recomendação: AR-1 - duas caixas de som na frente, uma de cada lado do palco
O público ocupa 15 m de profundidade. Para essa distância, duas caixas comuns na frente resolvem bem (colunas passam a valer a pena acima de 18 m).

Status: geometria validada; capacidade estimada (Com o dado estimado, o volume mínimo calculado (99.2 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer EVX 15 | pedestal | 0,5 | 2,5 | 2,3 | 19,5 | -3,1 |
| 2 | principal | Armer EVX 15 | pedestal | 11,5 | 2,5 | 2,3 | -19,5 | -3,1 |
| 3 | reforco | Armer EVX 15 | pedestal | 0,5 | 5,0 | 2,3 | 22,9 | -3,6 |
| 4 | reforco | Armer EVX 15 | pedestal | 11,5 | 5,0 | 2,3 | -22,9 | -3,6 |
| 5 | sub | Armer EVX18SUB | chao | 1,4 | 2,5 | 0,3 | 0,0 | 0,0 |
| 6 | sub | Armer EVX18SUB | chao | 10,6 | 2,5 | 0,3 | 0,0 | 0,0 |

Cobertura: 94% coberto, 4% borda, 2% fora.
Atrasos de referência: RF-L 7,3 ms, RF-R 7,3 ms.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 136 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo producao
- Armer EVX 15: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (99.2 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação). Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).
- Armer EVX 10: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (97.2 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação). Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).
- AZ Audio Z1 Compact Pro: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (86.2 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação). Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).
- Armer EVX8GO: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (86.2 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante. O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação). Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).
- Armer EVX215: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.
- Armer EVX 12: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.

Produto escolhido: Armer EVX 15. Sub: recomendado, 1 por lado (Armer EVX18SUB).

Alternativas: menor custo: AZ Audio Z1 Compact Pro (AR-1); equilíbrio: Armer EVX 15 (AR-1)

## Reverberação: classe medio (2 pontos)
Eco da sala: médio (2 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## Investimento (faixas demo)
R$ 27453.02 a R$ 39504.28 (ref. 10/2026).

## Avisos
- Pela estimativa (feita com dados incompletos do fabricante), nenhum modelo do catálogo alcança com folga o volume pedido para este uso. Considere mais caixas, um sistema maior, ou confirme a ficha completa com o fabricante e um profissional.
- O comportamento dos graves depende da sala. Ajuste no local.
- O fabricante não informa se o volume máximo (128 dB) é contínuo ou de pico. Por segurança, tratamos como pico: contínuo estimado = 128 - 6 dB.
- O nível na última fileira fica abaixo do alvo. Par de reforço adicionado.

## Quando chamar um profissional
- Nível acima de 95 dB: avalie limites de exposição e de ruído para a vizinhança com um profissional.
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Há caixas de reforço/delay: o ajuste final de atraso e equalização precisa de medição no local.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (23)
afastamentoParedeLateral, ajusteRuido, alturaBasePedestal, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pesoMaxPorMontagem, picoParaContinuo, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
