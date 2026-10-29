# SOUND DESIGNER (MVP)

Fonte de verdade: `docs/SPEC.md`. Decisões e contradições: `docs/DECISOES.md`.

## Comandos
- Instalar: `npm ci`
- Dev: `npm run dev` (catálogo de produção) | `npm run dev:demo` (catálogo demo)
- Testes: `npm test`
- Um teste: `npx vitest run engine/geometry/geometry.test.ts -t "malha"`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build` (valida o catálogo antes) | `npm run build:demo`
- E2E: `npm run e2e` (sobe o build demo)
- Catálogo: `npm run catalog:import -- <arquivo.csv>` | `npm run catalog:validate` | `npm run catalog:snapshot`
- Casos de referência: `npm run casos`

## Princípios (sem exceção)
1. Motor determinístico em `/engine`; nenhuma IA no fluxo principal.
2. Não inventar dados: catálogo de produção só com fichas do dono do produto.
3. Não inventar física: array só por tabela do fabricante; não somar fontes; sem atenuação fora do eixo; sem RT60/STI/mapa de graves/delay final.
4. Parâmetro `pendente_validacao` fica em `/engine/params` e aparece na UI.
5. Mesma entrada + mesmas versões = mesmo resultado (`engineVersion`, `catalogVersion`, `paramsVersion`).
6. Sem preço de produto; só faixa de investimento com data. `Offer` não aparece na UI.
7. Marca neutra: nunca "independente/imparcial/sem vínculo"; sem bônus de marca; nome só em `APP_NAME`.
