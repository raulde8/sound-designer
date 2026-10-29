# Casos de referência (SPEC C10)

Catálogo producao cb2deb34ea05d0eb, parâmetros params-v1-2026-10-29, data de referência 2026-10-29. Gerado por `npm run casos`.

| Caso | Esperado (SPEC) | Obtido |
|---|---|---|
| [Igreja 12 x 10 x 3,5 m, 80 pessoas, fala](01-igreja-pequena-fala.md) | AR-1 com 2 caixas 10" ou 12"; sem sub; PAG/NAG calculado; suportado. | AR-1; 2x Armer EVX 10; geometria validada; capacidade estimada; escopo suportado |
| [Igreja 25 x 15 x 6 m, 350 pessoas, banda com bateria](02-igreja-media-banda.md) | AR-1 ou AR-2; sub sim; trilha 2 gera mesa digital; possível reforço; nível B depende dos dados; revisão profissional recomendada. | AR-2; 2x Armer LA1221DSP, 2x Armer EVX18SUB; geometria validada; capacidade pendente; escopo suportado |
| [Restaurante 15 x 10 x 3 m, 100 pessoas, música ambiente](03-restaurante-ambiente.md) | AR-1 com caixas pequenas em parede, ou aviso de que a arquitetura distribuída (fase 1.1) seria melhor; sem sub. | AR-1; 2x Caixa ativa 10" (perfil genérico); geometria validada_aproximacao; capacidade pendente; escopo suportado |
| [Bar 18 x 12 x 4 m, 180 pessoas, banda e DJ](04-bar-banda-dj.md) | AR-1 ou AR-2 com sub; aviso de nível alto e segurança auditiva. | AR-1; 2x Armer EVX 15, 2x Armer EVX 15, 2x Armer EVX18SUB; geometria validada; capacidade estimada; escopo suportado |
| [Auditório 30 x 18 x 7 m, 450 pessoas, palestras](05-auditorio-palestras.md) | AR-2 preferido; distância no limite; reforço provável; revisão profissional recomendada. | AR-2; 2x Armer LA1221DSP; geometria validada; capacidade pendente; escopo suportado |
| [Ambiente muito reflexivo (igreja 20 x 12 x 7 m, superfícies duras, palma ecoa)](06-ambiente-reflexivo.md) | Classe de risco alto e aviso específico, sem aumentar a potência. | AR-2; 2x Armer LA1221DSP; geometria validada; capacidade pendente; escopo suportado |
| [Ambiente com mezanino (igreja 20 x 12 x 7 m)](07-mezanino.md) | "Atendido parcialmente", sem cobertura do mezanino. | AR-1; 2x Armer EVX 10; geometria fora_do_modelo; capacidade estimada; escopo parcial |
| [Catálogo sem produto adequado (vertical array na parede)](08-sem-produto-adequado.md) | Perfil genérico exibido. | AR-2; 2x Line array compacto (perfil genérico), 2x Front-fill compacto (perfil genérico); geometria validada_aproximacao; capacidade pendente; escopo suportado |
| [Dados insuficientes (coluna portátil sem SPL publicado para a configuração)](09-dados-insuficientes.md) | Status "pendente" correto nos produtos. | AR-2; 2x Armer LA1221DSP; geometria validada; capacidade pendente; escopo suportado |
| [Orçamento incompatível (caso 1 com orçamento de R$ 1.000)](10-orcamento-incompativel.md) | Mensagem e custo mínimo, sem relaxar requisito. | AR-1; 2x Armer EVX 10; geometria validada; capacidade estimada; escopo suportado |
