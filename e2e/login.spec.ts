import { test, expect } from "../playwright-fixture";

test.describe("Connexion (Login)", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Bienvenue");
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByText("Se connecter →")).toBeVisible();
  });

  test("valide les champs obligatoires", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Se connecter →").click();
    await expect(page.getByText("Email invalide")).toBeVisible();
  });

  test("affiche une erreur pour des identifiants incorrects", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Adresse email").fill("fake@invalid.com");
    await page.getByLabel("Mot de passe").fill("wrongpassword123");
    await page.getByText("Se connecter →").click();
    await expect(page.getByText(/incorrect|erreur/i)).toBeVisible({ timeout: 10000 });
  });

  test("le lien Oublié redirige vers forgot-password", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Oublié ?").click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("le lien Créer un compte redirige vers signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Créer un compte gratuit").click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("rate limiting bloque après trop de tentatives", async ({ page }) => {
    await page.goto("/login");
    // Attempt 6 rapid logins
    for (let i = 0; i < 6; i++) {
      await page.getByLabel("Adresse email").fill("spam@test.com");
      await page.getByLabel("Mot de passe").fill("wrong" + i);
      await page.getByText("Se connecter →").click();
      // Wait for error or rate limit message
      await page.waitForTimeout(500);
    }
    await expect(page.getByText(/Trop de tentatives/i)).toBeVisible({ timeout: 5000 });
  });
});
