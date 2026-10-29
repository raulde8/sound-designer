# Auditório 30 x 18 x 7 m, 450 pessoas, palestras

**Esperado (SPEC C10):** AR-2 preferido; distância no limite; reforço provável; revisão profissional recomendada.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 80 dB + reserva 15 dB = 95 dB. Sub: opcional. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - Duas colunas (vertical array) na frente, uma de cada lado do palco
Vertical array preferido: a área de público tem 27 m de profundidade.

Status: geometria validada; capacidade pendente (O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Line 6 | pedestal | 0,5 | 2,5 | 3,0 | 17,2 | -15,4 |
| 2 | principal | Demo Line 6 | pedestal | 17,5 | 2,5 | 3,0 | -17,2 | -15,4 |
| 3 | front_fill | Front-fill compacto (perfil genérico) | chao | 3,0 | 2,8 | 0,3 | 0,0 | 27,9 |
| 4 | front_fill | Front-fill compacto (perfil genérico) | chao | 9,0 | 2,8 | 0,3 | 0,0 | 27,9 |
| 5 | front_fill | Front-fill compacto (perfil genérico) | chao | 15,0 | 2,8 | 0,3 | 0,0 | 27,9 |

Cobertura: 96% coberto, 2% borda, 1% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 24° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 29 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou pedestal)
- SPL contínuo publicado por distância que entregue 95 dB a 29 m

### Produtos do catálogo demo
- Demo Line 6: **parcial** Capacidade sonora pendente: O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.
- Demo Coluna 8: **incompativel** Nenhuma configuração publicada pelo fabricante cobre da primeira à última fileira com o alcance necessário.

Produto escolhido: Demo Line 6. Sub: opcional.

Alternativas: menor custo: Demo Ativa 10 (AR-1); equilíbrio: Demo Line 6 (AR-2); maior capacidade: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe medio (3 pontos)
Risco médio de reverberação (3 pontos). Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.

## PAG/NAG
PAG 12,8 dB, NAG 29,3 dB, margem -16,5 dB: risco alto.

## Investimento (faixas demo)
R$ 34500 a R$ 57500 (ref. 10/2026).

## Avisos
- O array não cobre as primeiras fileiras a partir da altura de montagem. Ele cobre a partir de 3 m da primeira fileira; front-fill adicionado.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Risco alto de microfonia: teste o sistema no local com um técnico antes do uso.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (26)
afastamentoParedeLateral, ajusteRuido, alturaBasePedestal, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, faixaPrimeiraFileira, folgaTeto, foraMaxValidada, larguraPorFrontFill, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
