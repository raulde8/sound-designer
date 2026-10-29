# Auditório 30 x 18 x 7 m, 450 pessoas, palestras

**Esperado (SPEC C10):** AR-2 preferido; distância no limite; reforço provável; revisão profissional recomendada.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 80 dB + reserva 15 dB = 95 dB. Sub: opcional. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - duas colunas de som na frente, uma de cada lado do palco
O público ocupa 27 m de profundidade. Colunas levam o som mais longe e jogam menos som nas paredes.

Status: geometria validada; capacidade pendente (O fabricante não publica o volume por distância deste array.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer LA1221DSP | chao | 0,5 | 2,5 | 1,4 | 17,2 | -11,1 |
| 2 | principal | Armer LA1221DSP | chao | 17,5 | 2,5 | 1,4 | -17,2 | -11,1 |

Cobertura: 98% coberto, 2% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 24° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 29 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou pedestal)
- SPL contínuo publicado por distância que entregue 95 dB a 29 m

### Produtos do catálogo producao
- Armer LA1221DSP: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.
- AZ Audio Neo Pro8: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.

Produto escolhido: Armer LA1221DSP. Sub: opcional.

Alternativas: menor custo: AZ Audio Z1 Compact Pro (AR-1); equilíbrio: Armer LA1221DSP (AR-2); maior capacidade: Armer EVX 15 (AR-1)

## Reverberação: classe medio (3 pontos)
Eco da sala: médio (3 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## PAG/NAG
PAG 29,5 dB, NAG 29,3 dB, margem 0,2 dB: risco moderado.

## Investimento (faixas demo)
R$ 13111 a R$ 18730 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (23)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
