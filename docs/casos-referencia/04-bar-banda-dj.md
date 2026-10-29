# Bar 18 x 12 x 4 m, 180 pessoas, banda e DJ

**Esperado (SPEC C10):** AR-1 ou AR-2 com sub; aviso de nível alto e segurança auditiva.

Versões: motor 0.1.0, catálogo 4a2c5541d3d59c3f, parâmetros params-v1-2026-10-29.

## Escopo: suportado

## Nível
Alvo 100 dB + reserva 10 dB = 110 dB. Sub: sim. Aviso de segurança auditiva: sim.

## Recomendação: AR-1 - duas caixas de som na frente, uma de cada lado do palco
O público ocupa 15 m de profundidade. Para essa distância, duas caixas comuns na frente resolvem bem (colunas passam a valer a pena acima de 18 m).

Status: geometria validada; capacidade pendente (O fabricante não publica SPL máximo.); acústica medio.

| Nº | Função | Fonte | Montagem | x | y | z | yaw | pitch |
|---|---|---|---|---|---|---|---|---|
| 1 | principal | Demo Ativa 12 Sem SPL | parede | 0,2 | 2,5 | 3,4 | 20,5 | -8,6 |
| 2 | principal | Demo Ativa 12 Sem SPL | parede | 11,8 | 2,5 | 3,4 | -20,5 | -8,6 |
| 3 | sub | Demo Sub 15 | chao | 1,1 | 2,5 | 0,3 | 0,0 | 0,0 |
| 4 | sub | Demo Sub 15 | chao | 10,9 | 2,5 | 0,3 | 0,0 | 0,0 |

Cobertura: 94% coberto, 5% borda, 1% fora.

### Requisitos (perfil genérico)
- SPL máximo contínuo a 1 m de pelo menos 136 dB (campo livre)
- Montagem: qualquer uma permitida pelo fabricante (o layout de referência usou parede)
- Peso de até 40 kg para parede
- Cobertura usada no layout: 90° x 60° (H x V)

### Produtos do catálogo demo
- Demo Ativa 12 Sem SPL: **parcial** Capacidade sonora pendente: O fabricante não publica SPL máximo.
- Demo Ativa 15: **parcial** Capacidade sonora estimada: Com o dado estimado, o volume mínimo calculado (107.6 dB) fica abaixo do necessário (110 dB). A estimativa é conservadora: confirme com a ficha do fabricante. Com os dados reais deste produto, o layout precisa de 4 caixas (o perfil genérico usou 2).
- Demo Ativa 15 Pro: **incompativel** Nível mínimo calculado 109.2 dB abaixo do requerido 110 dB.
- Demo Ativa 12: **incompativel** Nível mínimo calculado 103.2 dB abaixo do requerido 110 dB.
- Demo Ativa 10: **incompativel** Nível mínimo calculado 98.1 dB abaixo do requerido 110 dB.
- Demo Ativa 10 Incompleta: **incompativel** Nível mínimo calculado 97.1 dB abaixo do requerido 110 dB.

Produto escolhido: Demo Ativa 12 Sem SPL. Sub: recomendado, 1 por lado (Demo Sub 15).

Alternativas: menor custo: Demo Ativa 12 Sem SPL (AR-1); maior capacidade: Demo Ativa 15 (AR-1)

## Reverberação: classe medio (2 pontos)
Eco da sala: médio (2 de 5 pontos). A sala tem um pouco de eco. Aponte as caixas para o público e evite mirar em paredes lisas ou vidro.

## Investimento (faixas demo)
R$ 12000 a R$ 19400 (ref. 10/2026).

## Avisos
- Os 4 produto(s) do catálogo com SPL publicado não atingem o nível requerido nesta configuração. O produto recomendado não tem dado de nível suficiente: confirme a capacidade com o fabricante antes de comprar.
- O comportamento dos graves depende da sala. Ajuste no local.

## Quando chamar um profissional
- Nível acima de 95 dB: avalie limites de exposição e de ruído para a vizinhança com um profissional.
- A capacidade sonora não foi validada com dados do fabricante: confirme o SPL com o fabricante ou com medição antes de comprar.
- Este é um pré-dimensionamento. Os parâmetros marcados como 'pendente de validação' ainda não foram revisados por um projetista.

## Parâmetros pendentes usados (22)
afastamentoParedeLateral, ajusteRuido, alturaMaxParede, alturaOuvinteEmPe, alturaOuvinteSentado, areaPorPessoa, bordaCobertura, distMaxPontual, envelope, folgaTeto, foraMaxValidada, limiarSegurancaAuditiva, margemNivelMaxRanking, niveisPorUso, pesoMaxPorMontagem, profundidadePreferenciaArray, recuoPalco, reverberacao, subPorLadoPadrao, tetoAlvo, toleranciaNivel, uniformidadeMax
