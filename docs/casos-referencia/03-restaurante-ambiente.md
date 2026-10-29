# Restaurante 15 x 10 x 3 m, 100 pessoas, música ambiente

**Esperado (SPEC C10):** AR-1 com caixas pequenas em parede, ou aviso de que a arquitetura distribuída (fase 1.1) seria melhor; sem sub.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado
- (aviso) 100 pessoas em mesas precisam de cerca de 150 m², mais que a área de público (120 m²). Confira as medidas.

## Nível
Alvo 70 dB + reserva 6 dB = 76 dB. Sub: nao. Aviso de segurança auditiva: não.

## Recomendação: AR-1 - Duas caixas ativas na frente, uma de cada lado do palco
Caixas convencionais preferidas: a área de público tem 12 m de profundidade (limite de preferência do vertical array: 18 m).

Status: geometria validada; capacidade validada (Nível mínimo calculado 98.6 dB >= requerido 76 dB.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Ativa 10 | parede | 0,2 | 2,5 | 2,4 | 21,0 | -7,8 |
| 2 | principal | Demo Ativa 10 | parede | 9,8 | 2,5 | 2,4 | -21,0 | -7,8 |

Cobertura: 94% coberto, 4% borda, 2% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 100 dB (campo livre)
- Montagem permitida pelo fabricante: parede
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo demo
- Demo Ativa 10: **compativel** 
- Demo Ativa 12: **compativel** 
- Demo Ativa 12 Sem SPL: **parcial** Capacidade sonora pendente: O fabricante não publica SPL máximo.
- Demo Ativa 15: **incompativel** O fabricante não permite a montagem escolhida (parede).
- Demo Ativa 15 Pro: **incompativel** O fabricante não permite a montagem escolhida (parede).
- Demo Ativa 10 Incompleta: **nao_avaliavel** Falta dado de geometria na ficha: coberturaV.

Produto escolhido: Demo Ativa 10. Sub: nao_recomendado.

Alternativas: menor custo: Demo Ativa 10 (AR-1); maior capacidade: Demo Ativa 12 (AR-1)

## Reverberação: classe medio (2 pontos)
Classe média (2 pontos). Reverberação moderada. Mire as caixas no público e evite apontá-las para paredes lisas ou vidro.

## Investimento (faixas demo)
R$ 3000 a R$ 5000 (ref. 10/2026).

## Avisos

## Quando chamar um profissional
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (22)
afastamentoParedeLateral, ajusteRuido, alturaMaxParede, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pesoMaxPorMontagem, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
