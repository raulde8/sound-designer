# SOUND DESIGNER (nome provisório)

Site gratuito de pré-dimensionamento de sonorização para igrejas, bares, restaurantes, auditórios e casas de eventos de pequeno e médio porte.
O usuário responde um questionário (~5 min) e recebe a arquitetura do PA, as caixas numa planta 2D, os requisitos técnicos, os modelos compatíveis do catálogo verificado e, opcionalmente, a lista de palco.

> ⚠️ **Antes do lançamento:** a página `/termos/` tem os placeholders **`[RAZAO_SOCIAL]`** e **`[CNPJ]`**. Eles precisam ser preenchidos e o texto precisa ser **revisado por advogado** (SPEC A, regra 3; PENDENTE_JURIDICO).
>
> ⚠️ Os parâmetros marcados como `pendente_validacao` em `engine/params/v1.ts` são hipóteses iniciais e precisam de revisão por um projetista de sistemas. Ver `docs/LIMITACOES.md`.

Especificação: [`docs/SPEC.md`](docs/SPEC.md) · Decisões: [`docs/DECISOES.md`](docs/DECISOES.md) · Limitações: [`docs/LIMITACOES.md`](docs/LIMITACOES.md) · Catálogo: [`docs/CATALOGO.md`](docs/CATALOGO.md) · Casos de referência: [`docs/casos-referencia/`](docs/casos-referencia/README.md)

## Estrutura
```
engine/    motor puro (sem React, sem I/O, sem relógio, sem aleatoriedade). Entrada -> Resultado.
  geometry/ acoustics/ architectures/ stage/ selection/ explain/ params/ input/
catalog/   schema Zod, ficha mínima, perfis genéricos, validador, templates CSV, dados (data/ = produção, demo/ = fictício), snapshots por hash
app/       Next.js (App Router): questionário, resultado, planta SVG, impressão
scripts/   importação/validação/snapshot do catálogo, casos de referência, servidor estático
e2e/       testes Playwright (390x844 e 1440x900)
docs/      SPEC, decisões, limitações, fontes, catálogo, casos de referência
```

## Rodar localmente
Requisitos: Node 22+.
```bash
npm ci                 # instala (o postinstall gera o registro de snapshots)
npm run dev:demo       # http://localhost:3000 com o catálogo fictício de demonstração
npm run dev            # catálogo de produção (vazio até o dono do produto fornecer as fichas)
```

## Verificação
```bash
npm test               # unitários + propriedades (Vitest + fast-check)
npm run typecheck
npm run lint
npm run build          # produção: valida o catálogo, gera snapshot, build estático em out/
npm run build:demo     # mesmo build com CATALOG_MODE=demo
npm run e2e            # Playwright (faz build:demo e sobe out/ na porta 3100)
npm run casos          # roda os 10 casos de referência e grava docs/casos-referencia/
```

## Catálogo
O catálogo de produção (`catalog/data/`) começa **vazio**. Só o dono do produto inclui fichas, com fonte e data em cada campo crítico.
```bash
npm run catalog:import -- produtos.csv configuracoes-array.csv --faixas faixas.csv
npm run catalog:validate          # falha se produto publicado tiver campo crítico sem fonte/data, ou se houver item demo
CATALOG_MODE=demo npm run catalog:validate
```
Passo a passo e ficha mínima: [`docs/CATALOGO.md`](docs/CATALOGO.md). Com o catálogo vazio, o build de produção funciona e avisa: “Catálogo de produção vazio. O site vai mostrar só perfis genéricos.”

Cada build gera `catalog/snapshots/<modo>-<hash>.json`. **Faça commit desses arquivos e não os apague**: os links antigos reproduzem o resultado com o catálogo do hash gravado no link.

## Deploy
O build é estático (`output: "export"`): a pasta `out/` pode ir para qualquer hospedagem de arquivos estáticos (Vercel, Netlify, Cloudflare Pages, S3 + CDN). Não há banco, servidor nem segredo.
- Vercel: comando de build `npm run build`, diretório de saída `out`.
- Outro host: `npm run build` e publique `out/`.
Nada foi publicado em produção por este trabalho.

## Integrações substituíveis
- `app/lib/analytics.ts`: interface `Analytics` com adaptador de console (eventos anônimos da SPEC C11).
- `app/lib/lead.ts`: interface `LeadSink` com implementação nula (captura de contato fora do MVP; exige revisão de LGPD).
- `engine/selection/policy.ts`: `BrandPolicy` só com a política `aberta` (sem bônus de marca).
- `engine/architectures/types.ts`: `ArchitectureGenerator` pronto para AR-4/AR-5 (fase 1.1).
