import { test, expect, type Page } from "@playwright/test";

async function trilha1(page: Page, o: { peDireito?: string; publico?: string } = {}) {
  await page.goto("/questionario/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("tipo-igreja").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("uso-fala").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("comprimento").fill("12");
  await page.getByTestId("largura").fill("10");
  await page.getByTestId("peDireito").fill(o.peDireito ?? "3.5");
  await page.getByTestId("avancar").click();
  if (o.peDireito && Number(o.peDireito) < 2.2) return;
  await page.getByTestId("formato-retangular").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("avancar").click(); // palco: padrão
  await page.getByTestId("publico").fill(o.publico ?? "80");
  await page.getByTestId("avancar").click();
  for (let i = 0; i < 4; i++) await page.getByTestId("avancar").click();
  await expect(page.getByTestId("resultado")).toBeVisible();
}

test("jornada completa: trilha 1, resultado, trilha 2, impressão", async ({ page }) => {
  await trilha1(page);
  await expect(page.getByTestId("arquitetura")).toContainText("Duas caixas ativas");
  await expect(page.getByTestId("lista-equipamentos")).toContainText("Demo Ativa");
  await expect(page.getByTestId("planta")).toBeVisible();
  await expect(page.getByTestId("versoes")).toContainText("parâmetros params-v1");
  // Lista de equipamentos e planta vêm do mesmo objeto: mesmo número de caixas.
  const linhas = await page.getByTestId("lista-equipamentos").locator("tbody tr td:first-child").allInnerTexts();
  const total = linhas.reduce((s, x) => s + Number(x), 0);
  await expect(page.locator('[data-testid^="caixa-"]')).toHaveCount(total);
  // "Por quê?" abre a explicação com parâmetros
  await page.getByTestId("porque-arquitetura").click();
  await expect(page.getByTestId("porque-painel-arquitetura")).toContainText("Regra aplicada");
  // Trilha 2
  await page.getByTestId("ir-trilha2").click();
  await page.getByTestId("moveis-mais").click();
  await page.getByTestId("avancar2").click();
  await page.getByTestId("inst-violao-mais").click();
  await page.getByTestId("avancar2").click();
  await page.getByTestId("fonte-playback").click();
  await page.getByTestId("avancar2").click();
  await page.getByTestId("mixagens-mais").click();
  await page.getByTestId("avancar2").click();
  await page.getByTestId("operador-voluntario").click();
  await page.getByTestId("avancar2").click();
  await expect(page.getByTestId("palco-resultado")).toBeVisible();
  await expect(page.getByTestId("mesa-tipo")).toContainText("Mesa analógica");
  await expect(page.getByTestId("rf")).toContainText("Anatel");
  // Impressão: botões somem, relatório gera PDF
  await page.emulateMedia({ media: "print" });
  await expect(page.getByTestId("imprimir")).toBeHidden();
  const pdf = await page.pdf({ format: "A4" });
  expect(pdf.byteLength).toBeGreaterThan(10_000);
});

test("link compartilhado reproduz o resultado", async ({ page, browser }) => {
  await trilha1(page);
  const url = page.url();
  const lista = (await page.getByTestId("lista-equipamentos").textContent()) ?? "";
  const versoes = (await page.getByTestId("versoes").textContent()) ?? "";
  const outro = await browser.newContext();
  const p2 = await outro.newPage();
  await p2.goto(url);
  await expect(p2.getByTestId("lista-equipamentos")).toHaveText(lista);
  await expect(p2.getByTestId("versoes")).toHaveText(versoes);
  await outro.close();
});

test("editar respostas recalcula", async ({ page }) => {
  await trilha1(page);
  await page.getByTestId("editar").click();
  await expect(page.getByTestId("tipo-igreja")).toHaveAttribute("aria-checked", "true");
  for (let i = 0; i < 5; i++) await page.getByTestId("avancar").click();
  await page.getByTestId("publico").fill("110");
  for (let i = 0; i < 5; i++) await page.getByTestId("avancar").click();
  await expect(page.getByTestId("resultado")).toBeVisible();
});

test("mover caixa marca o resultado como desatualizado até recalcular", async ({ page }) => {
  await trilha1(page);
  await expect(page.getByTestId("desatualizado")).toHaveCount(0);
  const cx = page.getByTestId("caixa-1");
  await cx.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("desatualizado")).toBeVisible();
  await page.getByTestId("recalcular").click();
  await expect(page.getByTestId("desatualizado")).toHaveCount(0);
  await expect(page.getByText("(movida)")).toBeVisible();
});

test("pé-direito abaixo de 2,2 m mostra erro no campo", async ({ page }) => {
  await trilha1(page, { peDireito: "2.0" });
  await expect(page.locator("#peDireito-erro")).toContainText("Pé-direito abaixo de 2,2 m");
  await expect(page.getByTestId("peDireito")).toHaveAttribute("aria-invalid", "true");
});

test("orçamento abaixo da faixa mostra mensagem sem mudar requisitos", async ({ page }) => {
  await trilha1(page);
  const lista = (await page.getByTestId("lista-equipamentos").textContent()) ?? "";
  await page.getByTestId("orcamento").fill("500");
  await page.getByTestId("comparar-orcamento").click();
  await expect(page.getByTestId("mensagem-orcamento")).toContainText("não reduz os requisitos");
  await expect(page.getByTestId("lista-equipamentos")).toHaveText(lista);
});

test("medidas 'não sei' usam faixa de tamanho e marcam estimado", async ({ page }) => {
  await page.goto("/questionario/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId("tipo-bar").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("uso-nao_sei").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("dim-nao_sei").click();
  await page.getByTestId("faixa-salao_medio").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("avancar").click();
  await page.getByTestId("publico").fill("100");
  for (let i = 0; i < 5; i++) await page.getByTestId("avancar").click();
  await expect(page.getByTestId("resultado")).toContainText("estimadas");
});

test("termos têm placeholders visíveis e nenhuma alegação de independência", async ({ page }) => {
  await page.goto("/termos/");
  await expect(page.getByTestId("placeholder-juridico")).toBeVisible();
  await expect(page.locator("body")).toContainText("[RAZAO_SOCIAL]");
  await expect(page.locator("body")).toContainText("[CNPJ]");
  const t = (await page.locator("body").innerText()).toLowerCase();
  for (const p of ["independente", "imparcial", "sem vínculo"]) expect(t).not.toContain(p);
});
