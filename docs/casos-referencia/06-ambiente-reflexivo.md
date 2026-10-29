# Ambiente muito reflexivo (igreja 20 x 12 x 7 m, superfícies duras, palma ecoa)

**Esperado (SPEC C10):** Classe de risco alto e aviso específico, sem aumentar a potência.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - duas colunas de som na frente, uma de cada lado do palco
O público ocupa 17 m de profundidade e a sala tem bastante eco. Colunas levam o som mais longe e jogam menos som nas paredes.

Status: geometria validada; capacidade pendente (O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.); acústica alto.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Line 6 | pedestal | 0,5 | 2,5 | 3,0 | 17,4 | -16,4 |
| 2 | principal | Demo Line 6 | pedestal | 11,5 | 2,5 | 3,0 | -17,4 | -16,4 |
| 3 | front_fill | Front-fill compacto (perfil genérico) | chao | 3,0 | 2,8 | 0,3 | 0,0 | 27,9 |
| 4 | front_fill | Front-fill compacto (perfil genérico) | chao | 9,0 | 2,8 | 0,3 | 0,0 | 27,9 |

Cobertura: 94% coberto, 4% borda, 2% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 22° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 19 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou pedestal)
- SPL contínuo publicado por distância que entregue 85 dB a 19 m

### Produtos do catálogo demo
- Demo Line 6: **parcial** Capacidade sonora pendente: O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.
- Demo Coluna 8: **parcial** Capacidade sonora pendente: O fabricante não publica SPL para toda a distância necessária. O motor não extrapola.

Produto escolhido: Demo Line 6. Sub: nao_recomendado.

Alternativas: menor custo: Demo Ativa 10 (AR-1); equilíbrio: Demo Line 6 (AR-2); maior capacidade: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe alto (5 pontos)
Eco da sala: alto (5 de 5 pontos). A sala tende a ter muito eco. Aumentar o volume não resolve: prefira caixas que mandam o som para o público (como colunas), aponte as caixas para as pessoas e não para as paredes. Cortinas, tapetes ou painéis podem ser necessários.

## PAG/NAG
PAG 21,3 dB, NAG 25,4 dB, margem -4,2 dB: risco alto.

## Investimento (faixas demo)
R$ 33000 a R$ 55000 (ref. 10/2026).

## Avisos
- O array não cobre as primeiras fileiras a partir da altura de montagem. Ele cobre a partir de 3 m da primeira fileira; front-fill adicionado.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Sala com risco alto de reverberação: avalie tratamento acústico com um especialista.
- Risco alto de microfonia: teste o sistema no local com um técnico antes do uso.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (26)
afastamentoParedeLateral, ajusteRuido, alturaBasePedestal, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, faixaPrimeiraFileira, folgaTeto, foraMaxValidada, larguraPorFrontFill, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
