# Ambiente muito reflexivo (igreja 20 x 12 x 7 m, superfícies duras, palma ecoa)

**Esperado (SPEC C10):** Classe de risco alto e aviso específico, sem aumentar a potência.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - duas colunas de som na frente, uma de cada lado do palco
O público ocupa 17 m de profundidade e a sala tem bastante eco. Colunas levam o som mais longe e jogam menos som nas paredes.

Status: geometria validada; capacidade pendente (O fabricante não publica o volume por distância deste array.); acústica alto.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer LA1221DSP | chao | 0,5 | 2,5 | 1,4 | 17,4 | -11,2 |
| 2 | principal | Armer LA1221DSP | chao | 11,5 | 2,5 | 1,4 | -17,4 | -11,2 |

Cobertura: 99% coberto, 1% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 22° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 19 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou pedestal)
- SPL contínuo publicado por distância que entregue 85 dB a 19 m

### Produtos do catálogo producao
- Armer LA1221DSP: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.
- AZ Audio Neo Pro8: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.

Produto escolhido: Armer LA1221DSP. Sub: nao_recomendado.

Alternativas: menor custo: AZ Audio Z1 Compact Pro (AR-1); equilíbrio: Armer LA1221DSP (AR-2); maior capacidade: Armer EVX 15 (AR-1)

## Reverberação: classe alto (5 pontos)
Eco da sala: alto (5 de 5 pontos). A sala tende a ter muito eco. Aumentar o volume não resolve: prefira caixas que mandam o som para o público (como colunas), aponte as caixas para as pessoas e não para as paredes. Cortinas, tapetes ou painéis podem ser necessários.

## PAG/NAG
PAG 25,8 dB, NAG 25,4 dB, margem 0,4 dB: risco moderado.

## Investimento (faixas demo)
R$ 13111 a R$ 18730 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Sala com risco alto de reverberação: avalie tratamento acústico com um especialista.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (23)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
