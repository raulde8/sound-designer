# Processo de inclusão no catálogo

O catálogo é um arquivo versionado. Ele muda só por commit (não há painel administrativo).
**Quem fornece as fichas técnicas é o dono do produto.** Nenhum dado de produção é buscado na internet nem preenchido com valores "típicos".

## Arquivos
| Caminho | Conteúdo |
|---|---|
| `catalog/data/produtos.json` | Produtos de produção (começa vazio). |
| `catalog/data/faixas.json` | Faixas de investimento por categoria e porte (R$ por unidade). |
| `catalog/data/ofertas.json` | Ofertas (`Offer`). Existem no schema, mas não aparecem na UI do MVP. |
| `catalog/demo/*.json` | Catálogo fictício. Só carrega com `CATALOG_MODE=demo`. |
| `catalog/template.csv` | Template de produtos: uma coluna por campo da ficha mínima. |
| `catalog/template-formato.csv` | O mesmo cabeçalho, com o formato esperado de cada coluna. |
| `catalog/template-configuracoes-array.csv` | Tabela de cobertura por configuração (vertical array). |
| `catalog/template-faixas.csv` | Faixas de investimento. |
| `catalog/snapshots/` | Snapshots imutáveis por hash. Não apague: links antigos dependem deles. |

## Passo a passo
1. Copie `catalog/template.csv` para uma planilha. Preencha uma linha por produto.
2. Para cada campo, preencha também `<campo>_fonte` (URL ou nome do PDF da ficha), `<campo>_data` (AAAA-MM-DD) e `<campo>_status` (`medido`, `declarado_fabricante`, `referencia`, `estimado`, `desconhecido`).
3. Para `splMax`, preencha `splMax_condicao`: `continuo_campo_livre`, `pico_campo_livre`, `continuo_meio_espaco`, `pico_meio_espaco` ou `desconhecida`. Sem condição, a capacidade sonora fica "pendente".
4. Vertical array: na coluna `coberturaPorConfiguracao` escreva `tabela` e preencha `template-configuracoes-array.csv` com uma linha por configuração publicada pelo fabricante (módulos, splay, H, V, alcance, altura do centro, SPL por distância no formato `distância:SPL|distância:SPL`). O motor usa **só** esta tabela. Sem ela, a AR-2 usa o perfil genérico.
5. Deixe `status = rascunho` até a revisão. Mude para `publicado` só depois de conferir a ficha.
6. Exporte a planilha como CSV (UTF-8, separador vírgula) e importe:
   ```bash
   npm run catalog:import -- produtos.csv configuracoes-array.csv --faixas faixas.csv
   npm run catalog:validate
   ```
7. Faça commit dos JSON. O `npm run build` gera um novo snapshot com hash novo e mantém os antigos.

## Ficha mínima (SPEC C7)
| Categoria | Geometria (sem ela: não avaliável) | Nível (sem ele: parcial) | Outros (sem eles: parcial) |
|---|---|---|---|
| Caixa ativa | coberturaH, coberturaV, montagensPermitidas | splMax + condição | respostaFrequencia, peso |
| Vertical array | coberturaPorConfiguracao, montagensPermitidas | splMax (ou SPL por distância na tabela) | acessoriosObrigatorios |
| Subwoofer | - | splMax | respostaFrequencia (pareamento é opcional) |
| Mesa | - | - | tipoMesa, entradasMic, entradasTotais, auxMono, auxEstereo, phantom, controleRemoto |
| Sem fio / in-ear | - | - | faixaFrequencia, homologacaoAnatel, canaisSimultaneos, varreduraAutomatica |

## O que o validador verifica (`npm run catalog:validate`)
- **Erro** (quebra o build): produto `publicado` com campo crítico sem fonte ou sem data; item demo no modo produção; id duplicado; faixa com mínimo > máximo; tabela de SPL fora de ordem; oferta para produto inexistente; erro de schema.
- **Aviso**: campo da ficha mínima ausente; SPL sem condição de medição; referência a acessório inexistente; catálogo de produção vazio.

## Regras de neutralidade
- Todas as marcas usam a mesma ficha mínima, incluindo as do grupo.
- O ranking não tem bônus de marca (`BrandPolicy` = `aberta`).
- Faixa de investimento vencida (mais de 90 dias) não aparece.
