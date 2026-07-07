import { test, expect } from "@playwright/test";
import { createSessionToken, createUser } from "../utils/api";

test.describe("Fluxo de Criação de Coleção", () => {
  let userName: string;
  let userEmail: string;
  let userToken: string;

  test.beforeAll(async () => {
    [userName, userEmail] = createUser();
    userToken = await createSessionToken(userEmail);
  });

  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "sid",
        value: userToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
      },
    ]);
  });

  test("deve criar uma coleção pública", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: userName }).click();
    await page.getByRole("link", { name: "Minha conta" }).click();

    await expect(page).toHaveURL("/profile");

    await page.getByRole("link", { name: "Coleções" }).click();

    await expect(page).toHaveURL("/profile/collections");

    await page.getByRole("button", { name: "Nova coleção" }).click();

    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

    await page.getByLabel("Nome da coleção").fill("Trilhas favoritas");

    await page
      .getByText("Quem poderá ver essa coleção?")
      .getByRole("button")
      .click();

    await expect(page.getByText("Todos")).toBeVisible();
    await expect(page.getByText("Meus amigos")).toBeVisible();

    await page.getByText("Todos").click();

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Coleção criada com sucesso!")).toBeVisible();
  });

  test("deve impedir de criar uma coleção com nome repetido", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: userName }).click();
    await page.getByRole("link", { name: "Minha conta" }).click();

    await expect(page).toHaveURL("/profile");

    await page.getByRole("link", { name: "Coleções" }).click();

    await expect(page).toHaveURL("/profile/collections");

    await page.getByRole("button", { name: "Nova coleção" }).click();

    await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

    // Todos os usuários tem por padrão uma coleção com nome "Salvas"
    await page.getByLabel("Nome da coleção").fill("Salvas");

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText("Já existe uma coleção com esse nome."),
    ).toBeVisible();
  });
});
