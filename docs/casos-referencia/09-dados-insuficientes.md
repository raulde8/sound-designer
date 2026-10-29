# Dados insuficientes (coluna portátil sem SPL publicado para a configuração)

**Esperado (SPEC C10):** Status "pendente" correto nos produtos.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - Duas colunas (vertical array) na frente, uma de cada lado do palco
Única arquitetura disponível para as respostas dadas.

Status: geometria validada; capacidade pendente (O fabricante não publica SPL por distância para esta configuração.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Coluna 8 | chao | 0,5 | 2,5 | 1,5 | 22,8 | -16,3 |
| 2 | principal | Demo Coluna 8 | chao | 8,5 | 2,5 | 1,5 | -22,8 | -16,3 |

Cobertura: 100% coberto, 0% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 30° numa configuração da tabela
- Cobertura horizontal de referência: 120°
- Alcance nominal de pelo menos 11 m
- Montagem permitida pelo fabricante: chao
- SPL contínuo publicado por distância que entregue 85 dB a 11 m

### Produtos do catálogo demo
- Demo Coluna 8: **parcial** Capacidade sonora pendente: O fabricante não publica SPL por distância para esta configuração.
- Demo Line 6: **parcial** Capacidade sonora pendente: O fabricante não publica SPL por distância para esta configuração. Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).

Produto escolhido: Demo Coluna 8. Sub: nao_recomendado.

## Reverberação: classe medio (2 pontos)
Classe média (2 pontos). Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.

## PAG/NAG
PAG 23,5 dB, NAG 20,4 dB, margem 3,0 dB: risco baixo.

## Investimento (faixas demo)
R$ 12000 a R$ 18000 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (23)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
