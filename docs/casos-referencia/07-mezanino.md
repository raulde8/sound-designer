# Ambiente com mezanino (igreja 20 x 12 x 7 m)

**Esperado (SPEC C10):** "Atendido parcialmente", sem cobertura do mezanino.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: parcial
- (parcial) Mezanino/balcão fora do modelo: o sistema não calcula a cobertura do mezanino.

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - duas caixas de som na frente, uma de cada lado do palco
O público ocupa 17 m de profundidade. Para essa distância, duas caixas comuns na frente resolvem bem (colunas passam a valer a pena acima de 18 m).

Status: geometria fora_do_modelo; capacidade validada (Nível mínimo calculado 95.8 dB >= requerido 85 dB.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Ativa 10 | parede | 0,2 | 2,5 | 3,5 | 18,3 | -10,5 |
| 2 | principal | Demo Ativa 10 | parede | 11,8 | 2,5 | 3,5 | -18,3 | -10,5 |

Cobertura: 91% coberto, 5% borda, 4% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 112 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo demo
- Demo Ativa 10: **compativel** 
- Demo Ativa 12: **compativel** 
- Demo Ativa 15 Pro: **compativel** 
- Demo Ativa 10 Incompleta: **parcial** O fabricante não publica o ângulo de cobertura. Usamos 90° x 60° (valor de referência de caixas de duas vias, pendente de confirmação). Falta na ficha: respostaFrequencia.
- Demo Ativa 15: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (102.9 dB) atende ao necessário (85 dB). Confirme com a ficha do fabricante.
- Demo Ativa 12 Sem SPL: **parcial** Capacidade sonora pendente: O fabricante não publica SPL máximo.

Produto escolhido: Demo Ativa 10. Sub: nao_recomendado.

Alternativas: menor custo: Demo Ativa 10 (AR-1); maior capacidade: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe medio (3 pontos)
Eco da sala: médio (3 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## PAG/NAG
PAG 26,7 dB, NAG 25,4 dB, margem 1,3 dB: risco moderado.

## Investimento (faixas demo)
R$ 3000 a R$ 5000 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- Partes do ambiente ficaram fora do modelo (mezanino, ambientes conectados, formato irregular): uma visita técnica é recomendada.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (24)
afastamentoParedeLateral, ajusteRuido, alturaMaxParede, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
