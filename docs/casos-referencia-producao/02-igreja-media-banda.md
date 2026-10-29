# Igreja 25 x 15 x 6 m, 350 pessoas, banda com bateria

**Esperado (SPEC C10):** AR-1 ou AR-2; sub sim; trilha 2 gera mesa digital; possível reforço; nível B depende dos dados; revisão profissional recomendada.

Versões: motor 0.1.0, catálogo cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 95 dB + reserva 10 dB = 105 dB. Sub: sim. Aviso de segurança auditiva: não.

## Recomendação: AR-2 - duas colunas de som na frente, uma de cada lado do palco
O público ocupa 22 m de profundidade. Colunas levam o som mais longe e jogam menos som nas paredes.

Status: geometria validada; capacidade pendente (O fabricante não publica o volume por distância deste array.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Armer LA1221DSP | chao | 0,5 | 2,5 | 1,4 | 17,3 | -11,1 |
| 2 | principal | Armer LA1221DSP | chao | 14,5 | 2,5 | 1,4 | -17,3 | -11,1 |
| 3 | sub | Armer EVX18SUB | chao | 1,4 | 2,5 | 0,3 | 0,0 | 0,0 |
| 4 | sub | Armer EVX18SUB | chao | 13,6 | 2,5 | 0,3 | 0,0 | 0,0 |

Cobertura: 98% coberto, 2% borda, 0% fora.

### Requisitos (perfil genérico)
- Cobertura vertical publicada de pelo menos 23° numa configuração da tabela
- Cobertura horizontal de referência: 100°
- Alcance nominal de pelo menos 24 m
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou pedestal)
- SPL contínuo publicado por distância que entregue 105 dB a 24 m

### Produtos do catálogo producao
- Armer LA1221DSP: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.
- AZ Audio Neo Pro8: **parcial** Capacidade sonora pendente: O fabricante não publica o volume por distância deste array. O fabricante não publica a tabela de cobertura por configuração. Usamos a cobertura de referência de colunas e não calculamos o volume por distância.

Produto escolhido: Armer LA1221DSP. Sub: recomendado, 1 por lado (Armer EVX18SUB).

Alternativas: menor custo: AZ Audio Z1 Compact Pro (AR-1); equilíbrio: Armer LA1221DSP (AR-2); maior capacidade: Armer EVX 15 (AR-1)

## Reverberação: classe medio (3 pontos)
Eco da sala: médio (3 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## PAG/NAG
PAG 21,9 dB, NAG 27,6 dB, margem -5,8 dB: risco alto.

## Investimento (faixas demo)
R$ 25910.9 a R$ 37301.28 (ref. 10/2026).

## Palco
15 canais (18 com reserva), mesa digital (Digital porque: 6 auxiliares necessários (mais de 4). Digital porque: 2 músicos com in-ear. Digital porque: 18 canais (mais de 16).). Escolhida: perfil genérico.
- 3x Microfone de mão com fio para voz parada (AZ Audio ZM58 BETA)
- 1x Sistema de microfone sem fio (de mão) para quem anda pelo palco ou prega (Armer AX802M G2 (2 bastões))
- 1x Kit de microfones de bateria (pelo menos 4 peças) (AZ Audio Kit ZM57 (5 microfones))
- 1x Microfone dinâmico para instrumento (amplificador de guitarra, sopro, outros) (AZ Audio ZM58 BETA)
- 4x Direct box (violão, baixo, teclado, bateria eletrônica) (Direct box (perfil genérico))
- 2x Transmissor de fone de retorno (in-ear) (Sistema de in-ear (perfil genérico))
- 2x Receptor de fone de retorno (1 por músico; o fone é à parte) (Armer AX800IEM (receptor bodypack))
- 2x Monitor de chão (1 por mixagem) (Armer NEW15)
- 18x Cabo XLR 30 m (Cabo XLR balanceado (perfil genérico))
- 3x Pedestal de microfone (voz parada) (Pedestal de microfone (perfil genérico))
- 4x Régua/filtro de linha (1 por posição de equipamento ativo) (Régua/filtro de linha (perfil genérico))
- 1x Multicabo/snake com pelo menos 18 vias (Multicabo / snake (perfil genérico))
RF: 3 canais, nível simples.

## Avisos
- O comportamento dos graves depende da sala. Ajuste no local.

## Quando chamar um profissional
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Risco alto de microfonia: teste o sistema no local com um técnico antes do uso.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (34)
afastamentoParedeLateral, ajusteRuido, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, canaisPorInstrumento, diPorInstrumento, distMaxPontual, envelope, faixaRfEvitar, folgaCabo, folgaTeto, foraMaxValidada, limiarCoordenacao, limiarEspecialista, limiarMulticabo, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, phantomBateriaAcustica, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, regraMesa, reservaCanais, reverberacao, subPorLadoPadrao, tamanhosMesaPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
