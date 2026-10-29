# Prompt para Claude Code - SOUND DESIGNER (MVP)

Cole o texto abaixo numa sessão nova do Claude Code, na raiz do repositório. Antes, copie o arquivo `SPEC.md` para `docs/SPEC.md` no repositório.

---

Você vai construir o MVP do SOUND DESIGNER (nome provisório): um site gratuito de pré-dimensionamento de sonorização para igrejas, bares, restaurantes, auditórios e casas de eventos de pequeno e médio porte. Um usuário leigo responde um questionário de cerca de 5 minutos e recebe: a arquitetura do sistema de PA, quantidade e posição das caixas numa planta 2D, requisitos técnicos, modelos compatíveis de um catálogo verificado e, opcionalmente, uma lista de palco (microfones, retorno, mesa, acessórios, orientação de RF).

A especificação completa está em `docs/SPEC.md`. Ela é a fonte de verdade. Leia o documento inteiro antes de escrever código. Se algo neste prompt contradizer a SPEC, siga a SPEC e registre a contradição em `docs/DECISOES.md`.

## Princípios que não têm exceção

1. **Motor determinístico.** Quantidades, especificações, níveis e resultados vêm de cálculo e regras explícitas em `/engine`. Nenhuma chamada a modelo de linguagem no fluxo principal.
2. **Não invente dados.** Não preencha o catálogo de produção com especificações buscadas na internet ou "típicas". O dono do produto fornece as fichas técnicas. Você cria o schema, o template de importação, o validador, os perfis genéricos e um catálogo de demonstração claramente fictício.
3. **Não invente física.** Não modele line array/vertical array com fórmula genérica. Use só a tabela de cobertura por configuração publicada pelo fabricante. Não some fontes correlacionadas. Não atribua atenuação fora do eixo sem dado. Não calcule RT60, STI, mapa de graves nem valores finais de delay.
4. **Parâmetros não validados ficam visíveis.** Todo parâmetro marcado `PENDENTE_VALIDACAO` na SPEC fica em `/engine/params` com o campo `status: "pendente_validacao"`, a origem e uma nota. A UI mostra quando um resultado depende de parâmetro pendente.
5. **Mesma entrada + mesmas versões = mesmo resultado.** Todo resultado carrega `engineVersion`, `catalogVersion` (hash) e `paramsVersion`.
6. **Sem preço de produto no MVP.** Mostre só a faixa de investimento por categoria, com data. A entidade `Offer` existe no schema, mas não aparece na UI.
7. **Marca neutra.** Nunca escreva no site que ele é "independente", "imparcial" ou "sem vínculo com marcas". O ranking não dá bônus a nenhuma marca. O nome do produto fica numa constante única (`APP_NAME`).

## Antes de modificar arquivos

1. Inspecione o repositório. Se já houver código, identifique a stack real, preserve o trabalho existente e adapte este plano a ela. Registre o que encontrou em `docs/DECISOES.md`.
2. Se o repositório estiver vazio: Next.js (App Router) + TypeScript estrito + Zod + Vitest + fast-check + Playwright. Confirme as versões estáveis atuais na documentação oficial antes de instalar. Não adicione banco de dados, autenticação nem serviços pagos.
3. Crie um `CLAUDE.md` curto, só com: comandos reais (instalar, dev, test, um teste isolado, typecheck, lint, build, e2e, validar catálogo), os 7 princípios acima resumidos em uma linha cada e a ponteira para `docs/SPEC.md`. Não copie a SPEC para o CLAUDE.md.

## Estrutura

Siga a seção C1 da SPEC: `/engine` (puro, sem React e sem I/O), `/catalog`, `/app`, `/docs`. O motor recebe o snapshot do catálogo e a versão dos parâmetros como entrada.

## Incrementos (faça um de cada vez; cada um termina com testes passando, typecheck limpo e um commit)

**Incremento 1 - Fundação do motor.** Tipos e schemas Zod de entrada (questionário das trilhas 1 e 2), modelo da sala, área de público, malha de avaliação, geometria 3D (distâncias, ângulos fora do eixo). Testes de matemática com valores calculados à mão e testes de propriedade.

**Incremento 2 - Catálogo.** Schema de `Product`, `SpecValue`, `Offer`, `FaixaInvestimento`, `GenericProfile` (SPEC C7). Template `catalog/template.csv` com uma coluna por campo da ficha mínima, incluindo fonte e data. Script de importação CSV -> JSON. Script `catalog:validate` que falha se um produto `publicado` tiver campo crítico sem fonte ou data, ou se houver item demo no modo produção. Perfis genéricos de todas as categorias do MVP. Catálogo demo em `catalog/demo/` com produtos fictícios ("Demo Ativa 12", "Demo Coluna 8"), carregado só com `CATALOG_MODE=demo`. Documente o processo de inclusão em `docs/CATALOGO.md`.

**Incremento 3 - Arquiteturas de PA.** AR-1 (fontes pontuais 10/12/15"), AR-2 (vertical array com tabela por configuração), AR-3 (subwoofer por regra), variante com reforço/delay, cobertura geométrica nominal, nível direto apenas quando a condição de medição permitir, classe de reverberação qualitativa, PAG/NAG. Use o exemplo numérico publicado pela Biamp como teste (PAG 4 dB e NAG 9 dB; depois PAG 15 dB com Ds = 0,4 m). Prepare a interface `ArchitectureGenerator` para a fase 1.1 (teto/parede) sem implementá-la.

**Incremento 4 - Seleção e revalidação.** Filtro por requisito, status de compatibilidade (`compativel | parcial | incompativel | nao_avaliavel`), recálculo do layout com os dados reais de cada candidato, ranking da SPEC C8, perfil genérico quando nada atende, comparação de orçamento só contra a faixa de investimento. Interface `BrandPolicy` com a implementação `aberta` apenas.

**Incremento 5 - Módulo de palco.** Contagem de entradas, mixagens, regra de mesa analógica/digital, microfones, in-ear, monitores, acessórios com comprimento de cabo pela planta, orientação de RF com limiares (SPEC C6). As tabelas de regras ficam em `/engine/params`.

**Incremento 6 - Explicações.** Cada conclusão carrega entradas, regra, parâmetros (com status), hipóteses e limitações. Textos em português, a partir de templates. Sem IA.

**Incremento 7 - Interface.** Questionário mobile-first com as trilhas 1 e 2 (SPEC B2 e B3), "não sei" em todas as perguntas que a SPEC permite, ilustrações simples para as opções de instalação e formato. Resultado na ordem da SPEC B4. Planta 2D em SVG gerada do mesmo objeto de configuração da lista de equipamentos: sala, palco, área de público, caixas numeradas com direção e altura, cobertura nominal como zonas "coberto / borda / fora" (sem heatmap colorido), legenda dos limites. Arrastar uma caixa marca o resultado como desatualizado até o recálculo. Botão "Por quê?" em cada item.

**Incremento 8 - Estado, relatório e analytics.** Estado na URL (comprimido e validado por Zod) + rascunho em localStorage com try/catch. Versões no link; manter catálogos anteriores por hash. Impressão/PDF pelo navegador com CSS de impressão. Interface `Analytics` com adaptador de console e os eventos da SPEC C11, sem dados pessoais. Interface `LeadSink` com implementação nula. Página "Termos e privacidade" com placeholder visível `[RAZAO_SOCIAL]` e `[CNPJ]` e um aviso no README de que esses campos precisam ser preenchidos e revisados por advogado antes do lançamento.

**Incremento 9 - Verificação final.** Rode testes unitários, de propriedade, typecheck, lint, build e Playwright (390x844 e 1440x900). Rode os 10 casos de referência da SPEC C10 no modo demo e salve a saída de cada um em `docs/casos-referencia/`. Abra a interface no navegador em celular e desktop e confira visualmente a planta e o resultado.

## Definição de pronto

- Todos os comandos de verificação passam, e você mostra o comando executado e a saída.
- A jornada completa funciona em celular e desktop, do questionário ao relatório impresso.
- Os 10 casos de referência produzem resultados coerentes com a SPEC C10, e os desvios estão documentados.
- Nenhum produto de produção foi criado por você. O catálogo de produção está vazio ou contém só o que o dono forneceu, e o build de produção roda com aviso claro quando o catálogo está vazio.
- `docs/LIMITACOES.md` lista o que não foi implementado, os parâmetros pendentes de validação e o que foi verificado de fato (separado do que só foi implementado).
- O README explica como rodar localmente, como importar o catálogo e como fazer deploy.

## O que você não deve fazer

- Não publicar em produção, não contratar serviços, não criar contas e não executar ações destrutivas sem autorização explícita.
- Não implementar checkout, CRM, login, painel administrativo, captura de contato, IA generativa, 3D ou sistemas distribuídos de teto.
- Não declarar que o motor foi validado por especialista ou em campo.
- Não fingir integrações: quando algo não estiver disponível, crie a interface substituível e registre a limitação.

Quando terminar cada incremento, informe em poucas linhas: o que foi feito, a evidência de verificação e o que falta.
