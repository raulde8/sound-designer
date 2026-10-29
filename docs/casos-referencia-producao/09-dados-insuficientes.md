# Dados insuficientes (coluna portátil sem SPL publicado para a configuração)

**Esperado (SPEC C10):** Status "pendente" correto nos produtos.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - duas colunas de som na frente, uma de cada lado do palco
É a única opção que combina com as preferências de instalação informadas.

Status: geometria validada; capacidade pendente (O fabricante não publica o volume por distância deste array.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer LA1221DSP | chao | 0,5 | 2,5 | 1,4 | 22,8 | -11,5 |
| 2 | principal | Armer LA1221DSP | chao | 8,5 | 2,5 | 1,4 | -22,8 | -11,5 |

Cobertura: 100% coberto, 0% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 30° numa configuração da tabela
- Cobertura horizontal de referência: 120°
- Alcance nominal de pelo menos 11 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou chao)
- SPL contínuo publicado por distância que entregue 85 dB a 11 m

### Produtos do catálogo producao
- Armer LA1221DSP: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.
- AZ Audio Neo Pro8: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.

Produto escolhido: Armer LA1221DSP. Sub: nao_recomendado.

Alternativas: menor custo: AZ Audio Neo Pro8 (AR-2); equilíbrio: Armer LA1221DSP (AR-2)

## Reverberação: classe medio (2 pontos)
Eco da sala: médio (2 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## PAG/NAG
PAG 23,5 dB, NAG 20,4 dB, margem 3,0 dB: risco baixo.

## Investimento (faixas demo)
R$ 13111 a R$ 18730 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (23)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
