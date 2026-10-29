# Ambiente muito reflexivo (igreja 20 x 12 x 7 m, superfícies duras, palma ecoa)

**Esperado (SPEC C10):** Classe de risco alto e aviso específico, sem aumentar a potência.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - Duas colunas (vertical array) na frente, uma de cada lado do palco
Vertical array preferido: a área de público tem 17 m de profundidade e a sala tem risco alto de reverberação.

Status: geometria validada; capacidade pendente (O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.); acústica alto.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Coluna 8 | chao | 0,5 | 2,5 | 1,9 | 17,4 | -6,7 |
| 2 | principal | Demo Coluna 8 | chao | 11,5 | 2,5 | 1,9 | -17,4 | -6,7 |
| 3 | front_fill | Front-fill compacto (perfil genérico) | chao | 3,0 | 2,8 | 0,3 | 0,0 | 27,9 |
| 4 | front_fill | Front-fill compacto (perfil genérico) | chao | 9,0 | 2,8 | 0,3 | 0,0 | 27,9 |

Cobertura: 96% coberto, 4% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 22° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 19 m
- Montagem permitida pelo fabricante: pedestal
- SPL contínuo publicado por distância que entregue 85 dB a 19 m

### Produtos do catálogo demo
- Demo Coluna 8: **parcial** Capacidade sonora pendente: O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.
- Demo Line 6: **parcial** Capacidade sonora pendente: O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.

Produto escolhido: Demo Coluna 8. Sub: nao_recomendado.

Alternativas: menor custo: Demo Ativa 10 (AR-1); equilíbrio: Demo Coluna 8 (AR-2); maior capacidade: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe alto (5 pontos)
Classe alto (5 pontos). O ambiente tende a ser reverberante. Mais potência não resolve isso: priorize caixas com cobertura controlada e mire as caixas no público, não nas paredes. Tratamento acústico pode ser necessário.

## PAG/NAG
PAG 21,3 dB, NAG 25,4 dB, margem -4,2 dB: risco alto.

## Investimento (faixas demo)
R$ 15000 a R$ 23000 (ref. 10/2026).

## Avisos
- O array não cobre as primeiras fileiras a partir da altura de montagem. Ele cobre a partir de 3 m da primeira fileira; front-fill adicionado.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Sala com risco alto de reverberação: avalie tratamento acústico com um especialista.
- Risco alto de microfonia: teste o sistema no local com um técnico antes do uso.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (25)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, faixaPrimeiraFileira, folgaTeto, foraMaxValidada, larguraPorFrontFill, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
