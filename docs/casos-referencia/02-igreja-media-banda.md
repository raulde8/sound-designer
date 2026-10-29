# Igreja 25 x 15 x 6 m, 350 pessoas, banda com bateria

**Esperado (SPEC C10):** AR-1 ou AR-2; sub sim; trilha 2 gera mesa digital; possível reforço; nível B depende dos dados; revisão profissional recomendada.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 95 dB + reserva 10 dB = 105 dB. Sub: sim. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - Duas caixas ativas na frente, uma de cada lado do palco
A arquitetura preferida não tem produto compatível no catálogo verificado. Caixas convencionais atende com produto do catálogo.

Status: geometria validada_aproximacao; capacidade validada (Nível mínimo calculado 105.6 dB >= requerido 105 dB.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Ativa 15 Pro | pedestal | 0,5 | 2,5 | 2,4 | 17,3 | -4,2 |
| 2 | principal | Demo Ativa 15 Pro | pedestal | 14,5 | 2,5 | 2,4 | -17,3 | -4,2 |
| 3 | reforco | Demo Ativa 15 Pro | pedestal | 0,5 | 20,8 | 2,4 | 58,7 | -12,1 |
| 4 | reforco | Demo Ativa 15 Pro | pedestal | 14,5 | 20,8 | 2,4 | -58,7 | -12,1 |
| 5 | sub | Demo Sub 18 | chao | 1,4 | 2,5 | 0,3 | 0,0 | 0,0 |
| 6 | sub | Demo Sub 18 | chao | 2,3 | 2,5 | 0,3 | 0,0 | 0,0 |
| 7 | sub | Demo Sub 18 | chao | 13,6 | 2,5 | 0,3 | 0,0 | 0,0 |
| 8 | sub | Demo Sub 18 | chao | 12,7 | 2,5 | 0,3 | 0,0 | 0,0 |

Cobertura: 90% coberto, 4% borda, 5% fora.
Atrasos de referência: RF-L 53,2 ms, RF-R 53,2 ms.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 133 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo demo
- Demo Ativa 15 Pro: **compativel** 
- Demo Ativa 12 Sem SPL: **parcial** Capacidade sonora pendente: O fabricante não publica SPL máximo.
- Demo Ativa 10: **incompativel** Nível mínimo calculado 94.6 dB abaixo do requerido 105 dB.
- Demo Ativa 12: **incompativel** Nível mínimo calculado 102.2 dB abaixo do requerido 105 dB.
- Demo Ativa 15: **incompativel** Nível mínimo calculado 104.3 dB abaixo do requerido 105 dB.
- Demo Ativa 10 Incompleta: **nao_avaliavel** Falta dado de geometria na ficha: coberturaV.

Produto escolhido: Demo Ativa 15 Pro. Sub: recomendado, 2 por lado (Demo Sub 18).

Alternativas: menor custo: Demo Ativa 12 Sem SPL (AR-1); equilíbrio: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe medio (3 pontos)
Risco médio de reverberação (3 pontos). Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.

## PAG/NAG
PAG 36,5 dB, NAG 27,6 dB, margem 8,8 dB: risco baixo.

## Investimento (faixas demo)
R$ 65000 a R$ 109000 (ref. 10/2026).

## Palco
15 canais (18 com reserva), mesa digital (Digital porque: 6 auxiliares necessários (mais de 4). Digital porque: 2 músicos com in-ear. Digital porque: 18 canais (mais de 16).). Escolhida: Demo Mesa D16.
- 3x Microfone de mão com fio para voz parada (Demo Mic Mão)
- 1x Microfone sem fio (de mão) para voz que anda ou pregador (Demo Sem Fio Mão)
- 1x Kit de microfones de bateria (4 peças) (Demo Kit Bateria)
- 1x Microfone dinâmico para instrumento (amplificador de guitarra, sopro, outros) (Demo Mic Mão)
- 4x Direct box (violão, baixo, teclado, bateria eletrônica) (Demo DI)
- 2x Transmissor de in-ear (Demo In-Ear)
- 2x Receptor de in-ear (1 por músico) (Demo In-Ear)
- 2x Monitor de chão (1 por mixagem) (Demo Ativa 10)
- 2x Cabo XLR 10 m (Cabo XLR balanceado (perfil genérico))
- 20x Cabo XLR 30 m (Cabo XLR balanceado (perfil genérico))
- 3x Pedestal de microfone (voz parada) (Demo Pedestal de Microfone)
- 4x Pedestal de caixa (Demo Pedestal de Caixa)
- 8x Régua/filtro de linha (1 por posição de equipamento ativo) (Régua/filtro de linha (perfil genérico))
- 1x Multicabo/snake com pelo menos 20 vias (Multicabo / snake (perfil genérico))
RF: 3 canais, nível simples.

## Avisos
- O comportamento dos graves depende da sala. Ajuste no local.
- A distância até a última fileira (23.6 m) passa de 20 m. Par de reforço adicionado.

## Quando chamar um profissional
- Há caixas de reforço/delay: o ajuste final de atraso e equalização precisa de medição no local.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (35)
afastamentoParedeLateral, ajusteRuido, alturaBasePedestal, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, canaisPorInstrumento, diPorInstrumento, distMaxPontual, envelope, faixaRfEvitar, folgaCabo, folgaTeto, foraMaxValidada, limiarCoordenacao, limiarEspecialista, limiarMulticabo, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, phantomBateriaAcustica, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, regraMesa, reservaCanais, reverberacao, subPorLadoPadrao, tamanhosMesaPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
