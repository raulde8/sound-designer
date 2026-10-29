# Igreja 12 x 10 x 3,5 m, 80 pessoas, fala

**Esperado (SPEC C10):** AR-1 com 2 caixas 10" ou 12"; sem sub; PAG/NAG calculado; suportado.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 75 dB + reserva 10 dB = 85 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - Duas caixas ativas na frente, uma de cada lado do palco
Caixas convencionais preferidas: a área de público tem 9 m de profundidade (limite de preferência do vertical array: 18 m).

Status: geometria validada; capacidade validada (Nível mínimo calculado 100.6 dB >= requerido 85 dB.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Ativa 10 | parede | 0,2 | 2,5 | 2,9 | 26,8 | -13,4 |
| 2 | principal | Demo Ativa 10 | parede | 9,8 | 2,5 | 2,9 | -26,8 | -13,4 |

Cobertura: 93% coberto, 6% borda, 2% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 108 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo demo
- Demo Ativa 10: **compativel** 
- Demo Ativa 12: **compativel** 
- Demo Ativa 15: **compativel** 
- Demo Ativa 15 Pro: **compativel** 
- Demo Ativa 12 Sem SPL: **parcial** Capacidade sonora pendente: O fabricante não publica SPL máximo.
- Demo Ativa 10 Incompleta: **nao_avaliavel** Falta dado de geometria na ficha: coberturaV.

Produto escolhido: Demo Ativa 10. Sub: nao_recomendado.

Alternativas: menor custo: Demo Ativa 10 (AR-1); maior capacidade: Demo Ativa 15 Pro (AR-1)

## Reverberação: classe medio (2 pontos)
Risco médio de reverberação (2 pontos). Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.

## PAG/NAG
PAG 25,5 dB, NAG 20,6 dB, margem 4,8 dB: risco baixo.

## Investimento (faixas demo)
R$ 3000 a R$ 5000 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (24)
afastamentoParedeLateral, ajusteRuido, alturaMaxParede, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pagNag, pesoMaxPorMontagem, posicaoMicrofone, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
