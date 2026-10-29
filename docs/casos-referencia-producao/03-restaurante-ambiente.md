# Restaurante 15 x 10 x 3 m, 100 pessoas, música ambiente

**Esperado (SPEC C10):** AR-1 com caixas pequenas em parede, ou aviso de que a arquitetura distribuída (fase 1.1) seria melhor; sem sub.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado
- (aviso) 100 pessoas em mesas precisam de cerca de 150 m², mais que a área de público (120 m²). Confira as medidas.

## Nível
Alvo 70 dB + reserva 6 dB = 76 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - duas caixas de som na frente, uma de cada lado do palco
O público ocupa 12 m de profundidade. Para essa distância, duas caixas comuns na frente resolvem bem (colunas passam a valer a pena acima de 18 m).

Status: geometria validada_aproximacao; capacidade pendente (Perfil genérico: o nível é um requisito mínimo, não uma avaliação de produto.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Caixa ativa 10" (perfil genérico) | parede | 0,2 | 2,5 | 2,4 | 21,0 | -7,5 |
| 2 | principal | Caixa ativa 10" (perfil genérico) | parede | 9,8 | 2,5 | 2,4 | -21,0 | -7,5 |

Cobertura: 93% coberto, 5% borda, 2% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 100 dB (campo livre)
- Montagem permitida pelo fabricante: parede
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo producao
- Armer EVX 15: **incompativel** O fabricante não permite a montagem escolhida (parede).
- Armer EVX 10: **incompativel** O fabricante não permite a montagem escolhida (parede).
- AZ Audio Z1 Compact Pro: **incompativel** O fabricante não permite a montagem escolhida (parede).
- Armer EVX8GO: **incompativel** O fabricante não permite a montagem escolhida (parede).
- Armer EVX215: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.
- Armer EVX 12: **nao_avaliavel** Falta dado de geometria na ficha: montagensPermitidas.

Produto escolhido: nenhum (perfil genérico). Sub: nao_recomendado.

## Reverberação: classe medio (2 pontos)
Eco da sala: médio (2 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## Investimento (faixas demo)
R$ 4999.88 a R$ 9185.04 (ref. 10/2026).

## Avisos
- Para música ambiente, um sistema distribuído (caixas de teto ou de parede espalhadas pelo salão) costuma dar som mais uniforme e em volume mais baixo. Essa arquitetura entra na próxima fase do sistema; consulte um profissional.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (24)
afastamentoParedeLateral, ajusteRuido, alturaMaxParede, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, coberturaReferenciaPontual, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pesoMaxPorMontagem, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tamanhoPorSplRequerido, tetoAlvo, toleranciaNivel, uniformidadeMax
