# Fontes

As fontes da especificação estão na seção 9 de `docs/SPEC.md`. Este arquivo registra o que foi usado na implementação.

| Fonte | Uso no código | Verificada nesta implementação? |
|---|---|---|
| Biamp - Calculating PAG and NAG | Fórmulas PAG/NAG (`engine/acoustics/pagnag.ts`) | **Não.** O site estava bloqueado na rede do ambiente. O exemplo numérico ficou como fixture pendente (`engine/acoustics/fixtures/biamp-pag-nag.json`). |
| Rane, "Introduction to Speech Reinforcement with Conferencing" (reproduzida pela ProSoundWeb) | Exemplo numérico de teste: D0 = 20, D1 = 10, D2 = 6, Ds = 2, D3 = 4 ft -> PAG ≈ 18,4 dB (FSM 6 dB), NAG ≈ 14 dB | Parcialmente: números obtidos de resumo de busca; a conta foi refeita à mão no teste. Conferir no PDF original: https://www.ranecommercial.com/legacy/pdf/ranenotes/Introduction_to_Speech_Reinforcement_with_Conferencing.pdf |
| Shure - Calculadora PAG/NAG | NOM = 1 com automixer; modelo omnidirecional = pior caso | Não (só o texto da SPEC). |
| Ato Anatel 14.448/2017 e notícia sobre 700 MHz | Faixa a evitar 698-806 MHz (`faixaRfEvitar`) | Não. Texto do Ato vigente a confirmar pelo revisor. |
| Demais fontes da SPEC (EASE Focus, IEC 60268-16, Sabine/Eyring) | Justificam o que **não** foi implementado (GLL, STI, RT60) | Não aplicável. |

Nenhuma especificação de produto foi buscada na internet. O catálogo demo é fictício e marcado como tal.
