import { test, expect } from "@playwright/test";
import { createUser } from "../utils/api";

test.describe("Fluxo de Login", () => {
  let userName: string;
  let userEmail: string;

  test.beforeAll(async () => {
    [userName, userEmail] = createUser();
  });

  test("deve logar com sucesso usando credenciais válidas", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill(userEmail);
    await page.getByPlaceholder("Senha").fill("123456");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("button", { name: userName })).toBeVisible();
  });

  test("deve impedir usuário com credenciais inválidas", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("email_errado@example.com");
    await page.getByPlaceholder("Senha").fill("senha_incorreta");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("/login");

    await expect(page.getByText("Incorrect e-mail or password")).toBeVisible();
  });
});
