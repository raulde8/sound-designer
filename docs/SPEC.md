# SOUND DESIGNER - Especificação do MVP

Versão: 1.0 - 29/10/2026
Status: especificação aprovada para implementação. Parâmetros marcados com `PENDENTE_VALIDACAO` são hipóteses iniciais. Um projetista de sistemas precisa revisar esses valores antes do lançamento público.

Legenda de confiança usada neste documento:
- [Pesquisado] - fato com fonte na seção 9.
- [Hipótese] - decisão de produto ou parâmetro inicial que ainda não foi validado.
- [Decisão] - escolha de negócio do dono do produto.

---

## A. Resumo executivo

### Produto
Consultoria gratuita, em aproximadamente 5 minutos, para pré-dimensionamento de sonorização em igrejas, bares, restaurantes, auditórios, salões e casas de eventos de pequeno e médio porte. O usuário leigo informa o ambiente e o uso. O sistema devolve:
1. A arquitetura do sistema de PA (caixas ativas 10/12/15" ou vertical array), com quantidade, posição, altura e direção numa planta 2D.
2. Os requisitos técnicos de cada caixa e os modelos do catálogo verificado que atendem a esses requisitos.
3. Um módulo opcional de palco: microfones, retorno (in-ear e monitor de chão), mesa de som analógica ou digital, acessórios e orientação de RF.
4. O nível de validação de cada conclusão e o que precisa de um profissional.

### O que mudou em relação ao briefing original
- [Decisão] Prioridade do MVP: sistemas de PA com caixas ativas 10/12/15" e vertical array (referência: Armer LA1221). O sistema distribuído de teto passa para a fase 1.1.
- [Decisão] Catálogo inicial fechado e curado pelo dono do produto: JBL, Yamaha, Electro-Voice, DBR e Armer. O catálogo é fornecido e validado pelo dono do produto, não buscado na internet.
- [Decisão] Quando nenhum produto do catálogo atende, o sistema mostra uma "caixa genérica": um perfil de requisitos, sem marca e sem preço.
- [Decisão] O escopo inclui microfones, acessórios, in-ear, orientação de RF e recomendação de mesa de som, num módulo separado e opcional.
- Line array/vertical array entra no MVP, mas com uma regra rígida: a cobertura e o nível vêm de dados tabelados do fabricante por configuração. O sistema não calcula o comportamento do array por fórmula genérica.
- Reverberação: o MVP usa apenas uma classe qualitativa. Não calcula RT60 nem STI.
- Sem banco de dados no MVP. O catálogo é um arquivo versionado. O estado do usuário fica na URL.

### Principais concessões
- O vertical array tem validação geométrica (nível A) sempre que existe tabela de cobertura. A validação de nível sonoro (nível B) só existe quando o fabricante publica SPL por distância ou por configuração. Se não publica, o resultado mostra "capacidade sonora pendente".
- A recomendação de subwoofer é por regra, sem mapa de graves.
- O cálculo de microfonia (PAG/NAG) é um sinal de risco, não uma garantia.
- A orientação de RF é informativa. O MVP não faz coordenação de frequências.

### Identidade e neutralidade
[Decisão] Marca neutra, com tom de "técnico de áudio de confiança", sem vínculo visível com nenhuma empresa e com pouca informação institucional.
[Decisão] Objetivo comercial futuro: vender produtos do grupo (fase 2).

Regras obrigatórias (protegem a credibilidade e reduzem risco jurídico):
1. O site NUNCA afirma ser "independente", "imparcial", "sem vínculo com marcas" ou equivalente. Ele pode dizer "recomendamos por critérios técnicos" porque isso é verdade (regra 2).
2. O ranking usa apenas critérios técnicos. Nenhuma marca recebe bônus de ordenação no MVP. A mesma ficha mínima vale para todas as marcas, incluindo as do grupo.
3. Uma página "Termos e privacidade" identifica a pessoa jurídica que opera o site (razão social e CNPJ), sem destaque. PENDENTE_JURIDICO: revisão por advogado antes do lançamento, principalmente quando o site passar a direcionar para compra (fase 2).
4. Quando a fase 2 ativar prioridade comercial para produtos do grupo, o site passa a sinalizar isso na própria recomendação ("produto parceiro").

---

## B. Especificação do MVP

### B1. Jornada

Duas trilhas, com uma decisão no início:
- Trilha 1 "Sistema de som" (obrigatória, meta de 5 minutos, 8 a 10 telas).
- Trilha 2 "Palco e microfones" (opcional, meta de 2 a 3 minutos, 4 a 5 telas). É oferecida no fim da trilha 1 e também no resultado.

O resultado da trilha 1 aparece antes da trilha 2. O usuário não precisa completar a trilha 2 para ver o resultado.

### B2. Perguntas - Trilha 1

Formato de cada linha: pergunta | por que existe | o que muda | obrigatória? | default | se "não sei".

1. **Tipo de estabelecimento** (igreja, bar, restaurante, auditório, salão/eventos, outro) | define defaults de uso e ocupação | presets de nível-alvo e de uso | sim | - | não se aplica.
2. **Uso principal** (multi-seleção: fala/pregação, música ambiente, música em primeiro plano, banda ao vivo, DJ, vídeo) | define o nível-alvo e a necessidade de subwoofer | nível-alvo, sub, arquitetura | sim | preset do tipo de estabelecimento | usa o preset.
3. **Se banda:** formação (voz e violão, acústica, banda com bateria, varia) | a bateria acústica eleva o nível necessário e a necessidade de sub | nível-alvo, sub | condicional | "varia" usa o pior caso entre as opções | usa "varia".
4. **Dimensões:** comprimento, largura, pé-direito (m) | geometria | tudo | sim | - | o sistema oferece faixas de tamanho ("como uma sala de aula", "como uma quadra") com valores médios e marca o dado como estimado.
5. **Formato** (retangular, retangular com recorte, L, irregular) | define se o modelo cobre o ambiente | escopo | sim | retangular | trata como retangular e mostra aviso. L e irregular resultam em "atendido parcialmente".
6. **Palco/frente:** em qual parede fica o palco ou a frente, e a profundidade aproximada do palco | origem das caixas e área sem público | layout | sim | parede menor, profundidade de 3 m | usa o default.
7. **Público:** quantidade habitual e se fica sentado, em pé ou em mesas | altura do ouvinte e área ocupada | malha, nível | sim | sentado | usa sentado.
8. **Mezanino, colunas grandes ou ambientes conectados?** | itens fora do modelo | escopo e avisos | sim | não | "não sei" mostra um aviso.
9. **Ambiente** (fechado, semiaberto, aberto) | o modelo de reverberação qualitativo só vale para ambientes fechados | avisos, nível | sim | fechado | fechado.
10. **Acústica em linguagem simples** (uma tela com 3 perguntas):
    - "As paredes e o teto são principalmente lisos e duros (alvenaria, vidro, azulejo) ou têm cortinas, madeira, forro ou estofados?"
    - "Quando o ambiente está vazio, uma palma ecoa?"
    - "Com o local funcionando, é fácil conversar em tom normal?"
    | classe de reverberação e classe de ruído | avisos, nível-alvo | sim | classe média | classe média, com aviso.
11. **Instalação e aparência** (duas perguntas separadas):
    - Forma de instalação: pedestal/tripé, parede, suspensa, apoiada no chão, sem preferência.
    - Formato preferido: caixas convencionais, coluna/vertical array, sem preferência.
    | restringe as arquiteturas candidatas e a altura | layout | não | sem preferência | sem preferência.
12. **Instalação fixa ou móvel** | portabilidade e montagem | arquitetura, acessórios | não | fixa | fixa.

O orçamento NÃO é perguntado na trilha 1. Ele aparece no resultado como filtro opcional e não altera os requisitos físicos.

### B3. Perguntas - Trilha 2 (Palco e microfones)

1. **Vozes:** quantas pessoas falam ou cantam ao mesmo tempo, e se precisam andar (com fio ou sem fio).
2. **Instrumentos:** checklist (violão, guitarra, baixo, teclado, bateria acústica, bateria eletrônica, sopro, outros) com quantidade.
3. **Outras fontes:** computador/playback, celular, DJ (controladora), vídeo.
4. **Retorno:** quantos músicos precisam ouvir uma mixagem própria, e se preferem in-ear ou caixa de retorno no chão.
5. **Operação:** quem opera o som (voluntário leigo, técnico ocasional, técnico fixo) e se querem controlar pelo celular/tablet.

Cada pergunta aceita "não sei". Nesse caso o sistema usa o preset do tipo de estabelecimento e marca o item como estimado.

### B4. Saídas - Resultado

O resultado responde, nesta ordem:
1. Configuração recomendada (nome da arquitetura em linguagem simples).
2. Quantidade e tipo de caixas, com subwoofer quando aplicável.
3. Planta 2D com posição, altura sugerida, direção e cobertura nominal.
4. Características mínimas de cada caixa (requisitos).
5. Produtos do catálogo que atendem, com status de compatibilidade.
6. Motivo da escolha (entradas, regra aplicada, hipóteses).
7. O que falta validar e quando chamar um profissional.
8. (Se a trilha 2 foi feita) Lista de palco: microfones, retorno, mesa, acessórios, orientação de RF.

Status de validação exibido por nível:
- Geometria: validada / validada com aproximação / fora do modelo.
- Capacidade sonora: validada com dados do fabricante / pendente (dados insuficientes) / insuficiente.
- Acústica da sala: classe qualitativa (baixo, médio, alto risco).

Exemplo de frase correta: "Recomendação geométrica disponível. Validação de capacidade sonora pendente: o fabricante não publica SPL para esta configuração."

Alternativas: no máximo 3 (menor custo, equilíbrio, maior capacidade), e só quando existem soluções distintas de verdade.

### B5. Estados de erro e casos fora do escopo

- Entrada fora dos limites (dimensão negativa, pé-direito < 2,2 m, área > limite do envelope): mensagem específica e campo destacado.
- Ambiente fora do modelo (L, irregular, mezanino, aberto com público > limite): resultado "atendido parcialmente", com o que foi calculado e o que não foi.
- Nenhum produto do catálogo atende: mostra a caixa genérica com os requisitos e a frase "Nenhum modelo do nosso catálogo verificado atende a este requisito".
- Catálogo indisponível: o sistema usa o catálogo embarcado no build.
- Envelope do MVP [Hipótese - PENDENTE_VALIDACAO]:
  - Suportado: ambiente fechado retangular, área de público até 600 m², distância palco-última fileira até 30 m, pé-direito de 2,5 a 10 m.
  - Parcial: L, irregular, semiaberto, recorte, distância 30-45 m.
  - Encaminhar para projetista: mezanino, balcão, aberto acima de 45 m de profundidade, público acima de 1.000 pessoas, sistemas com várias zonas independentes.

### B6. Fora do escopo do MVP (sempre)
Dimensionamento estrutural de suspensão, certificação de ancoragem, projeto elétrico, garantia de limite de ruído, sistemas de evacuação/alarme por voz, garantia de segurança auditiva, valores finais de delay e EQ, coordenação de frequências de RF, mapa de graves, RT60 e STI numéricos, checkout, CRM, atendimento por IA.

### B7. Critérios de aceitação do produto
- Os 10 casos de referência (seção C8) produzem resultados que o revisor técnico considera defensáveis ou corretamente encaminhados.
- Nenhum resultado mostra um produto como "compatível" sem os campos da ficha mínima preenchidos e com fonte.
- A lista de equipamentos e a planta vêm do mesmo objeto de configuração (teste automatizado).
- Mover uma caixa na planta marca o resultado como desatualizado até o recálculo.
- A jornada completa funciona em celular (360 px) e desktop.
- O fluxo principal funciona sem chamada a modelo de linguagem e sem rede após o carregamento.

---

## C. Especificação técnica

### C1. Arquitetura

Monorepo TypeScript. Separação obrigatória:

```
/engine        motor puro (sem React, sem I/O). Entrada -> Resultado. Determinístico.
  /geometry    sala, áreas de público, malha, coordenadas
  /acoustics   nível direto, cobertura, classe de reverberação, PAG/NAG
  /architectures  geradores de arquiteturas candidatas (pontual, vertical array, sub)
  /stage       módulo de palco: entradas, mesa, retorno, RF, acessórios
  /selection   filtro de catálogo, ranking, revalidação
  /explain     montagem das justificativas e avisos (texto vem de templates, não de IA)
  /params      parâmetros versionados (níveis-alvo, limites, regras) com status de validação
/catalog       schema, dados verificados, perfis genéricos, script de validação
/app           Next.js: questionário, resultado, planta SVG, impressão
/docs          SPEC.md, FONTES.md, CATALOGO.md, decisões
```

Regras:
- O motor recebe `catalogSnapshot` e `paramsVersion` como entrada. Ele não lê arquivos nem rede.
- Toda saída do motor carrega `engineVersion`, `catalogVersion` (hash), `paramsVersion`.
- Mesma entrada + mesmas versões = mesmo resultado (teste de snapshot).

Stack (o implementador confirma as versões atuais antes de instalar): Next.js com App Router e TypeScript estrito; Zod para os schemas de entrada, catálogo e parâmetros; planta em SVG gerada por React (sem biblioteca de canvas); Vitest para testes unitários; fast-check para testes de propriedade; Playwright para testes end-to-end em viewport de celular e de desktop. Hospedagem: build estático ou serverless sem banco (ex.: Vercel). Nenhum serviço pago é obrigatório.

### C2. Persistência
- Sem banco no MVP.
- Estado do questionário: codificado e comprimido na URL (compartilhamento por ação explícita) + rascunho no localStorage com try/catch.
- Relatório: a URL inclui as versões do motor, do catálogo e dos parâmetros. O build mantém os catálogos anteriores por hash, para que um link antigo reproduza o resultado original. Se a versão antiga não existir mais, o relatório informa isso e oferece o recálculo com a versão atual.
- Captura de contato: fora do MVP. Deixar uma interface `LeadSink` vazia, com implementação nula.
- Analytics: eventos anônimos (etapa iniciada, etapa concluída, tempo até resultado, abandono, caso fora do escopo, uso da trilha 2), sem dados pessoais. Implementar uma interface `Analytics` com um adaptador de console por padrão.

### C3. Modelo do ambiente
- Unidades: metros, graus, dB. Conversões só na UI.
- Origem: canto da sala na parede do palco, à esquerda de quem olha para o público. Eixo x = largura, eixo y = profundidade (do palco para o fundo), eixo z = altura.
- Sala: retângulo `largura x profundidade x peDireito`.
- Zona de palco: faixa `y in [0, profundidadePalco]`, sem público.
- Área de público: retângulo restante, menos as exclusões.
- Altura do ouvinte [Hipótese - PENDENTE_VALIDACAO]: sentado 1,2 m, em pé 1,7 m. Biamp usa as mesmas categorias (sentado/em pé/personalizado).
- Malha de avaliação: passo de 0,5 m (ajustável), no plano da altura do ouvinte, apenas na área de público. Limite de 20.000 pontos; acima disso, o passo aumenta automaticamente.

### C4. Arquiteturas candidatas do MVP

**AR-1 Frontal com fontes pontuais (caixas ativas 10/12/15").**
- 2 caixas (L/R) nas laterais do palco. Altura padrão: pedestal 1,8-2,2 m até a base, ou parede/suspensa até 3,5 m, limitada por peDireito - 0,3 m.
- Direção: horizontal mirando o centro da última fileira; inclinação vertical mirando 2/3 da profundidade da área de público.
- Se a cobertura nominal horizontal não alcançar as laterais da primeira fileira -> adicionar front-fill (sinalizado).
- Se o nível direto na última fileira ficar abaixo do alvo menos a tolerância, ou se a distância passar de `distMaxPontual` [Hipótese - PENDENTE_VALIDACAO, inicial 20 m] -> gerar a variante com reforço/delay e calcular de novo.

**AR-2 Frontal com vertical array (coluna ou line array compacto).**
- 1 por lado. Para coluna portátil, base no chão. Para array compacto, voado ou em pedestal conforme o catálogo.
- Cobertura: SOMENTE da tabela do fabricante, `coberturaPorConfiguracao[{modulos, anguloSplay?, H, V, alcanceNominal_m?, spl_por_distancia?}]`.
- O motor escolhe a menor configuração da tabela cuja cobertura vertical nominal cubra da primeira à última fileira, a partir da altura de montagem.
- Nível: se existir `spl_por_distancia` publicado, interpolar entre pontos publicados (sem extrapolar). Sem esse dado -> capacidade sonora "pendente".
- PROIBIDO: modelar o array com uma fórmula genérica de atenuação (ex.: 10log para campo próximo) ou somar módulos por soma energética.
- Arquitetura não disponível quando o usuário marcar "suspensa" e a instalação for fixa: o sistema mostra o aviso de que a suspensão exige projeto estrutural, e não dimensiona a fixação.

**AR-3 Subwoofer (complemento das AR-1 e AR-2).**
- Regra: recomendado quando o uso inclui banda com bateria, DJ ou música em primeiro plano. Opcional para voz e violão e para vídeo. Não recomendado para fala e música ambiente.
- Quantidade inicial: a recomendação de pareamento publicada pelo fabricante para a caixa escolhida. Na falta dela, 1 por lado [Hipótese - PENDENTE_VALIDACAO].
- Posição: no chão, sob ou ao lado das caixas principais. A planta mostra a posição sem mapa de cobertura.
- Aviso fixo: "O comportamento dos graves depende da sala. Ajuste no local."

Fase 1.1 (não implementar no MVP, mas preparar a interface `ArchitectureGenerator`): AR-4 distribuída de teto (método no estilo da calculadora Biamp) e AR-5 distribuída de parede.

### C5. Cálculos e regras

**Cobertura geométrica (nível A).**
Para cada caixa e cada ponto da malha: calcular os ângulos horizontal e vertical fora do eixo, a partir da posição e da direção da caixa. O ponto está "na cobertura nominal" se |ângulo H| <= H/2 e |ângulo V| <= V/2, com H e V da ficha do fabricante (normalmente a -6 dB). O ponto está "na borda" se estiver até 10° fora [Hipótese]. Caso contrário, está "fora".
Rótulo obrigatório na UI: "Cobertura nominal declarada pelo fabricante. Aproximação geométrica, não é medição."
O sistema NÃO atribui atenuação em dB fora do eixo.

**Nível direto (nível B) - apenas fontes pontuais, ou arrays com tabela publicada.**
`L(d) = SPLmaxContinuo_1m - 20*log10(d)`, com d em metros, apenas para pontos dentro da cobertura nominal.
Condições para usar:
- `SPLmaxContinuo` com condição de medição conhecida e compatível (campo livre). Valor de meio espaço ("plano ao terra") só é usado para caixa apoiada no chão, e com aviso. Valor de pico nunca é usado como contínuo.
- Se só existir SPL de pico, o sistema estima o contínuo como pico - 6 dB [Hipótese - PENDENTE_VALIDACAO] e marca a estimativa.
- Se não existir condição de medição: capacidade sonora "pendente".
Combinação de fontes: cada ponto recebe o nível da fonte mais forte que o cobre. O sistema NÃO soma fontes, porque elas reproduzem sinais correlacionados. Isso é conservador e está documentado.
Critério de capacidade: nível mínimo na área coberta >= `nivelAlvo + reservaDinamica` (ver parâmetros).
Critério de uniformidade: (máximo - mínimo) na área coberta <= `uniformidadeMax` [Hipótese - PENDENTE_VALIDACAO, inicial 6 dB].

**Parâmetros por uso** [Hipótese - todos PENDENTE_VALIDACAO; o revisor técnico define os valores finais]:

| Uso | Nível-alvo médio contínuo (dB SPL, ouvinte) | Reserva dinâmica (dB) | Sub |
|---|---|---|---|
| Fala/pregação | 75 | 10 | não |
| Música ambiente | 70 | 6 | não |
| Música em primeiro plano | 85 | 10 | sim |
| Voz e violão | 85 | 10 | opcional |
| Banda com bateria | 95 | 10 | sim |
| DJ | 98 | 10 | sim |
| Vídeo | 80 | 15 | opcional |

Uso misto: vale o maior nível-alvo entre os usos selecionados.
Ajuste por ruído (pergunta "é fácil conversar?"): fácil +0 dB, difícil +5 dB, muito difícil +10 dB, com teto de 100 dB e aviso de segurança auditiva quando o alvo passar de 95 dB [Hipótese].

**Reforço/delay.**
Quando a última fileira não atinge o alvo: gerar a variante com 1 par de reforço na posição `y` em que o nível da frente cai abaixo do alvo. O sistema mostra o atraso de referência `t = distância_extra / 343 m/s` com o rótulo "Referência inicial. O valor final é ajustado com medição no local." Nunca mostrar como ajuste final.

**Classe de reverberação (nível C qualitativo).**
Pontuação a partir das 3 perguntas acústicas, mais o volume (V = L x P x H):
- superfícies duras +2, mistas +1, absorventes 0;
- palma ecoa: sim +2, um pouco +1, não 0;
- volume > 1.500 m³ +1.
Classe: 0-1 baixo risco, 2-3 médio, 4-5 alto [Hipótese - PENDENTE_VALIDACAO].
Saída: aviso específico. Exemplo para alto risco: "O ambiente tende a ser reverberante. Mais potência não resolve isso: priorize caixas com cobertura controlada e mire as caixas no público, não nas paredes. Tratamento acústico pode ser necessário."
O sistema NÃO mostra RT60 nem STI. Motivo: Sabine e Eyring assumem campo difuso, e essa hipótese falha em muitas salas reais (ver fontes).

**Risco de microfonia (PAG/NAG).** Aplica-se quando a trilha 2 informa microfones, ou quando o uso inclui fala.
- `PAG = 20log(D0*D1/(D2*Ds)) - 10log(NOM) - 6`; `NAG = 20log(D0/D3)` (Biamp, Shure).
- D0: falante -> ouvinte mais distante (da planta). D1: microfone -> caixa mais próxima (da planta; o microfone fica na frente do palco). D2: ouvinte mais distante -> caixa mais próxima dele. D3: falante -> ouvinte mais próximo. Ds: falante -> microfone, default 0,15 m para microfone de mão, 0,3 m para gooseneck [Hipótese]. NOM: número de microfones abertos ao mesmo tempo; com automixer, NOM = 1.
- Saída por faixa de margem (PAG - NAG): >= 3 dB "risco baixo", 0 a 3 dB "risco moderado", < 0 dB "risco alto" [Hipótese]. Sempre com o texto: "Estimativa simplificada (lei do inverso do quadrado). Não substitui teste no local."
- O modelo assume componentes omnidirecionais, portanto é o pior caso.

### C6. Módulo de palco (trilha 2) - regras determinísticas

**Contagem de entradas.**
- Voz: 1 canal mono por voz.
- Instrumentos [Hipótese - PENDENTE_VALIDACAO, tabela editável em /engine/params]: violão 1 (DI); guitarra 1; baixo 1 (DI); teclado 2 (estéreo, 2 DIs ou entradas de linha); bateria eletrônica 2; bateria acústica 4 (kit básico: bumbo, caixa, 2 overheads) com opção de 7 (completo); sopro 1 por instrumento.
- Fontes de linha: playback/computador 2; celular 2 (com interface ou entrada estéreo); controladora de DJ 2.
- Total de canais = soma + 20% de reserva, arredondado para o próximo tamanho de mesa disponível no catálogo.

**Mixagens de retorno (auxiliares).**
- 1 aux por mixagem pedida. In-ear estéreo conta 2 aux, ou 1 aux estéreo se o catálogo da mesa declarar aux estéreo.

**Recomendação de mesa de som** [Hipótese - PENDENTE_VALIDACAO]:
- Digital quando QUALQUER condição for verdadeira: aux necessários > 4; 2 ou mais in-ears; canais > 16; controle por celular/tablet pedido; uso misto com troca frequente de configuração (cultos com várias formações).
- Analógica quando TODAS forem verdadeiras: canais <= 12; aux <= 2; operador voluntário leigo; sem controle remoto. Nesse caso, explicar a vantagem: controles físicos visíveis, curva de aprendizado curta.
- Faixa intermediária: mostrar as duas opções com prós e contras.
- A mesa selecionada precisa atender: entradas de microfone >= canais de microfone; total de entradas >= total de canais; aux >= mixagens; phantom power quando houver microfone condensador.

**Microfones.**
- Voz parada: microfone de mão dinâmico com fio por padrão. Voz que anda, ou pregador: sem fio (de mão ou headset/lapela, se o usuário escolher).
- Bateria acústica: kit de microfones de bateria do catálogo, ou itens avulsos.
- Instrumentos com saída de linha: DI, não microfone.

**Retorno.**
- In-ear: 1 receptor por músico. Transmissores conforme o número de mixagens distintas e o número de canais por transmissor declarado no catálogo.
- Monitor de chão: 1 por mixagem; as caixas ativas de 10/12" do catálogo com modo monitor declarado são elegíveis.

**RF - orientação, não coordenação.**
- Total de canais sem fio = microfones sem fio + transmissores de in-ear.
- Sempre: usar apenas equipamento homologado pela Anatel; evitar a faixa de 698-806 MHz, destinada à telefonia móvel (4G/5G) [Pesquisado - texto exato do Ato vigente a confirmar pelo revisor, ver fontes]; preferir sistemas da mesma família/fabricante com varredura automática de frequência; manter linha de visada entre transmissor e antena; afastar as antenas dos transmissores de in-ear das antenas dos receptores de microfone.
- Mais de `limiarCoordenacao` canais [Hipótese - PENDENTE_VALIDACAO, inicial 4]: recomendar distribuidor de antenas e coordenação de frequências com ferramenta do fabricante ou por um técnico.
- Mais de `limiarEspecialista` canais [Hipótese, inicial 12]: encaminhar para um especialista em RF.
- O texto informa que o espectro varia por cidade e que o MVP não verifica as frequências locais.

**Acessórios (lista gerada, quantidades por regra).**
- Cabos XLR: 1 por microfone com fio + 1 por caixa ativa. Comprimento = distância na planta entre a mesa e o ponto (se informado; default: mesa no fundo, centro) + 20% de folga, arredondado para comprimentos comerciais (5, 10, 15, 20, 30 m).
- Pedestais: 1 por microfone de voz parada; 1 por caixa em pedestal; suporte de parede por caixa de parede (do catálogo de acessórios compatíveis, quando houver).
- Direct box (DI): conforme a contagem de entradas.
- Alimentação: 1 régua/filtro por posição de equipamento ativo [Hipótese]. O sistema não dimensiona a instalação elétrica.
- Multicabo/snake: sugerido quando houver mais de 8 cabos no mesmo trajeto palco-mesa [Hipótese].

### C7. Catálogo

**Entidades.**
- `Product`: id, marca, modelo, categoria, subcategoria, status (`rascunho | revisado | publicado | descontinuado`), especificações, montagens permitidas, acessórios compatíveis (ids), dimensões, peso, datasheetUrl, verificadoEm, verificadoPor.
- `SpecValue<T>`: { valor, unidade, condicaoMedicao?, fonte (URL ou arquivo), dataVerificacao, status: `medido | declarado_fabricante | referencia | estimado | desconhecido` }. Todo campo crítico usa `SpecValue`.
- `Offer` (entidade separada, criada no schema mas NÃO exibida no MVP): produtoId, vendedor, preçoAVista, preçoParcelado, itensNaoIncluidos, disponibilidade (`pronta_entrega | sob_encomenda | indisponivel | nao_verificado`), dataVerificacao, validade (30 dias).
- `FaixaInvestimento` [Decisão: o MVP não mostra preço de produto]: por categoria e porte (ex.: "caixa ativa 12 - entrada / intermediária / profissional"), valor mínimo e máximo em R$, fonte, data de verificação e validade de 90 dias. Mantida manualmente pelo dono do catálogo. Faixa vencida não aparece. A UI mostra "Investimento estimado em equipamentos: R$ X a R$ Y (referência de mercado em mês/ano, sem instalação)".
- `GenericProfile`: perfil de requisitos para cada categoria (ex.: `GEN-ATIVA-12`). Contém só os requisitos mínimos calculados para o caso. Nunca tem marca, preço nem foto. Rótulo: "Perfil genérico - especificação mínima, não é um produto."

**Categorias do MVP:** caixa ativa 10/12/15"; vertical array (coluna e line array compacto); subwoofer ativo; mesa analógica; mesa digital; microfone com fio; sistema de microfone sem fio; sistema de in-ear (transmissor, receptor); monitor de chão; DI; acessórios (pedestal, suporte, cabos).

**Ficha mínima por categoria (sem ela, o produto fica "não avaliável").**
- Caixa ativa pontual: cobertura H e V; SPL máximo com condição de medição (contínuo ou pico, campo livre ou meio espaço); resposta de frequência (-10 dB ou -3 dB, com qual); montagens permitidas; peso.
- Vertical array: tabela de cobertura por configuração; montagens permitidas; SPL máximo com condição; acessórios de montagem obrigatórios.
- Subwoofer: SPL máximo com condição; resposta de frequência; pareamento recomendado pelo fabricante (se houver).
- Mesa: entradas de microfone, entradas totais, aux (mono/estéreo), phantom, controle remoto (sim/não), tipo (analógica/digital).
- Microfone sem fio / in-ear: faixa de frequência, homologação Anatel (número), canais simultâneos por faixa declarados pelo fabricante, varredura automática (sim/não).

**Status de compatibilidade de um produto contra um requisito.**
- `compativel` - todos os campos da ficha mínima presentes e dentro do requisito.
- `parcial` - campos de geometria atendem, mas falta dado de nível (ou outro campo não crítico).
- `incompativel` - algum dado presente viola um requisito.
- `nao_avaliavel` - falta campo crítico de geometria.
Ausência de dado nunca reprova nem aprova um produto.

**Fluxo de dados [Decisão].** O dono do produto fornece as fichas técnicas (JBL, Yamaha, Electro-Voice, DBR, Armer). Entrada por planilha/CSV no formato do template `catalog/template.csv`, convertida por script para JSON validado por Zod. O implementador NÃO busca especificações na internet para preencher o catálogo de produção. Um script `catalog:validate` falha o build se um produto `publicado` tiver campo crítico sem fonte ou sem data.

**Dados de demonstração.** Ficam em `catalog/demo/`, com produtos fictícios ("Demo Ativa 12"), carregados só quando `CATALOG_MODE=demo`. O build de produção falha se encontrar um item demo.

### C8. Seleção, ranking e revalidação
1. O motor gera as arquiteturas candidatas com perfis genéricos.
2. Para cada posição do layout, filtra o catálogo pelo requisito (categoria, montagem, cobertura, SPL, peso máximo para a montagem escolhida).
3. Para cada candidato real, roda de novo o layout com os dados reais (cobertura e SPL do produto). Se a cobertura real for diferente do perfil, o layout é recalculado (direção, altura, quantidade). Se o recálculo exigir mais caixas, isso aparece na explicação.
4. Ranking: (a) status (compativel > parcial); (b) menor quantidade de caixas; (c) maior margem de nível acima do alvo, limitada a +6 dB (acima disso não soma pontos, para não premiar exagero); (d) faixa de investimento da categoria do produto (menor primeiro). Sem bônus por marca.
5. Se não houver nenhum `compativel` nem `parcial`: mostrar o perfil genérico.
6. O orçamento, quando informado no resultado, só é comparado com a faixa de investimento total da solução. Ele nunca reduz um requisito. Quando o orçamento fica abaixo do mínimo da faixa, a mensagem diz isso e mostra a faixa mínima da solução válida.
7. Preparar a interface `BrandPolicy` (`aberta | preferencial | restrita`) com a implementação `aberta` apenas. A fase 2 implementa as outras duas.

### C9. Explicabilidade
Cada conclusão carrega `{ entradas: string[], regra: id, parametros: {id, valor, status}[], hipoteses: string[], limitacoes: string[] }`. A UI mostra um botão "Por quê?" em cada item. Os textos vêm de templates em /engine/explain. A IA não gera texto no MVP.

### C10. Plano de testes

**A. Matemática (Vitest + valores calculados à mão e documentados no teste).**
Área, volume, distâncias 3D, ângulos fora do eixo, 20log, PAG/NAG (reproduzir o exemplo numérico publicado pela Biamp: PAG 4 dB, NAG 9 dB; e o segundo exemplo: PAG 15 dB), conversão de condição de medição, arredondamento de cabos.

**B. Propriedades (fast-check).**
- Quantidades sempre inteiras e >= 0.
- Nenhuma caixa fora da sala nem acima do pé-direito.
- Montagem sempre dentro das montagens permitidas do produto.
- Lista de equipamentos == itens da planta.
- Orçamento menor nunca reduz o requisito.
- Produto com `nao_avaliavel` nunca aparece como `compativel`.
- Mesmo input + mesmas versões = saída idêntica.

**C. Casos de referência** (comportamento esperado, sem respostas fixas no código):
1. Igreja 12x10x3,5 m, 80 pessoas, fala: AR-1 com 2 caixas 10" ou 12"; sem sub; PAG/NAG calculado; suportado.
2. Igreja 25x15x6 m, 350 pessoas, banda com bateria: AR-1 ou AR-2; sub sim; trilha 2 gera mesa digital; possível reforço; nível B depende dos dados; revisão profissional recomendada.
3. Restaurante 15x10x3 m, 100 pessoas, música ambiente: AR-1 com caixas pequenas em parede, ou aviso de que a arquitetura distribuída (fase 1.1) seria melhor; sem sub.
4. Bar 18x12x4 m, 180 pessoas, banda e DJ: AR-1 ou AR-2 com sub; aviso de nível alto e segurança auditiva.
5. Auditório 30x18x7 m, 450 pessoas, palestras: AR-2 preferido; distância no limite; reforço provável; revisão profissional recomendada.
6. Ambiente muito reflexivo: classe de risco alto e aviso específico, sem aumentar a potência.
7. Ambiente com mezanino: "atendido parcialmente", sem cobertura do mezanino.
8. Catálogo sem produto adequado: perfil genérico exibido.
9. Dados insuficientes: status "pendente" correto nos produtos.
10. Orçamento incompatível: mensagem e custo mínimo, sem relaxar requisito.

**D. End-to-end (Playwright).** Jornada completa em 390x844 e 1440x900; edição de respostas; impressão; link compartilhado reproduz o resultado.

**E. Validação externa (fora do código, antes do lançamento público).**
- Revisão dos parâmetros `PENDENTE_VALIDACAO` por um projetista de sistemas de sonorização.
- Comparação, nos cenários compatíveis, com EASE Focus 3 (gratuito para usuário final) usando caixas que têm GLL publicado.
- 5 instalações reais medidas depois da instalação.
- Teste de usabilidade com 8 a 10 leigos (meta: 80% concluem a trilha 1 em até 7 minutos e explicam a recomendação com as próprias palavras).
O produto não declara validação em campo até esses testes acontecerem.

### C11. Métricas
Conclusão da trilha 1 (meta inicial 60%), tempo mediano até o resultado (meta <= 5 min, a testar), abandono por etapa, uso da trilha 2, % de casos parciais ou encaminhados, % de resultados com perfil genérico (indicador de lacuna de catálogo), clique em "Por quê?", pesquisa de 1 pergunta sobre utilidade no fim.

### C12. Segurança e privacidade
Validação Zod de toda entrada (inclusive da URL); limite de pontos da malha; sem rotas administrativas no MVP (o catálogo muda por commit); sem dados pessoais coletados; links externos com `rel="noopener noreferrer"`; segredos apenas em variáveis de ambiente; página de privacidade simples descrevendo os eventos anônimos. Antes de ativar a captura de contato (fase 2), fazer revisão de LGPD.

---

## D. Roadmap

**MVP (fase 1).** Trilha 1 com AR-1, AR-2 e AR-3; trilha 2 completa; catálogo das 5 marcas fornecido pelo dono do produto; perfis genéricos; planta 2D; relatório imprimível; links reprodutíveis; analytics anônimo.

**Fase 1.1.** AR-4 distribuída de teto e AR-5 de parede (restaurantes, lojas, salas de reunião), com catálogo de caixas de teto e amplificadores 70V/100V.

**Fase 2.** Fluxo comercial para produtos do grupo (política de marca preferencial, com sinalização "produto parceiro" e revisão jurídica); política restrita; exibição de ofertas com preço e data; captura de contato com LGPD; painel de manutenção do catálogo e das ofertas.

**Fases intermediárias.** Ambientes em L e com recortes; zonas; uso de dados de diretividade mais ricos quando o fabricante permitir; mapa de graves simplificado só com método validado.

**Fase final.** Visualização 3D. A evolução visual não aumenta a precisão acústica. O uso de GLL depende de acordo com a AFMG.

---

## Questões em aberto (não bloqueiam a implementação)
1. "DBR": este documento assume a marca DBR (ex.: DBR DXT15). Se for a série DBR da Yamaha ou a dB Technologies, só muda o catálogo.
2. Armer LA1221: o tipo (coluna portátil ou line array compacto) e a ficha técnica com cobertura por configuração serão fornecidos. Até lá, a AR-2 usa o perfil genérico.
3. Nome final da marca neutra e domínio (o código usa o nome provisório SOUND DESIGNER numa constante única).
4. Revisão técnica [Decisão]: responsável interno pela curadoria do catálogo + projetista externo pago por revisão dos parâmetros `PENDENTE_VALIDACAO`.
5. Segmento de lançamento: igrejas pequenas e médias, bares e casas de eventos (default; o MVP atende todos os tipos do questionário).

---

## 9. Fontes (consultadas em 29/10/2026)

| Fonte | Sustenta |
|---|---|
| Biamp - Ceiling loudspeaker calculator: https://support.biamp.com/Design_Tools/Ceiling_loudspeaker_calculator | Entradas de sistemas distribuídos (fase 1.1), altura sentado/em pé, estado salvo na URL |
| Biamp - Calculating PAG and NAG: https://support.biamp.com/General/Audio/Calculating_PAG_and_NAG | Fórmulas PAG/NAG, FSM de 6 dB, exemplo numérico de teste, limitações |
| Shure - Calculadora PAG/NAG: https://www.shure.com/pt-BR/suporte/ferramentas/pag-nag-calculator | Automixer trava NOM em 1; modelo omnidirecional = pior caso |
| Harman - EASE Focus 3 Alternatives: https://help.harmanpro.com/general-jbl-inquiries/ease-focus-3-alternatives | GLL/CLF são formatos da AFMG, sem alternativa compatível de terceiros |
| AFMG - EASE Focus 3 license fees: https://www.afmg.eu/sites/default/files/2022-02/EASE-Focus-3_Prices_February%2010%2C%202022%20-%20v4.1.pdf | EASE Focus gratuito ao usuário; fabricantes licenciam as caixas |
| JBL - Venue Synthesis: https://jblpro.com/en-US/products/venue-synthesis | Ferramentas de fabricante são presas à marca |
| IEC 60268-16:2020 (escopo): https://www.sis.se/en/produkter/telecommunications-audio-and-video-engineering/audio-video-and-audiovisual-engineering/general/iec-60268-162020/ | Edição vigente; não fornece critérios de certificação. Apenas referência, sem alegação de conformidade |
| MetricGate - Sabine & Eyring: https://metricgate.com/docs/reverberation-time-rt60-sabine-eyring/ | Limites do campo difuso; motivo para não calcular RT60 no MVP |
| Acta Acustica 2023: https://acta-acustica.edpsciences.org/10.1051/aacus/2023025 | Mesma justificativa |
| Ato Anatel 14.448/2017 (cópia de terceiros): https://forum.thethingsnetwork.org/forum/uploads/default/original/2X/e/e75d7b1471333df4ddc7f8d4eff114e5a126b59c.pdf | Alteração da faixa restrita de microfones sem fio para 614-698 MHz. PENDENTE: confirmar o texto vigente no portal da Anatel |
| Teletime - 700 MHz (02/2026): https://teletime.com.br/05/02/2026/anatel-700-mhz/ | Faixa de 700 MHz em uso/licitação para telefonia móvel |
| DSPPA LA1421A: https://dsppacs.com/products/ultra-compact-2-way-active-line-array-speaker.html | Exemplo de line array cuja cobertura vertical depende do número de módulos (justifica a tabela por configuração) |
| Oneal OPB-5060D (Casas Bahia): https://www.casasbahia.com.br/caixa-de-som-acustica-ativa-dupla-15-quot-oneal-opb-5060d-bluetooth/p/1571238968 | Exemplo de SPL declarado com condição de medição (campo livre vs plano ao terra) |
| JBL Control 26CT: https://jblpro.com/products/control-26ct | Exemplo de ficha mínima completa (fase 1.1) |
| Claude Code best practices: https://code.claude.com/docs/en/best-practices | CLAUDE.md curto, checagens executáveis, regras sem exceção como hooks |
