import { test, expect } from "../playwright-fixture";

test.describe("Inscription (Signup)", () => {
  test("affiche la page d'inscription avec les 3 rôles", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Qui êtes-vous");
    // 3 role cards visible
    await expect(page.getByText("Propriétaire")).toBeVisible();
    await expect(page.getByText("Garage")).toBeVisible();
    await expect(page.getByText("Vendeur")).toBeVisible();
  });

  test("passe à l'étape 2 après sélection du rôle", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Continuer").click();
    await expect(page.locator("h1")).toContainText("Vos informations");
    await expect(page.getByLabel("Nom complet")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("valide les champs obligatoires avant soumission", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Continuer").click();
    // Submit empty form
    await page.getByText("Créer mon compte").click();
    // Validation errors should appear
    await expect(page.getByText("Nom trop court")).toBeVisible();
    await expect(page.getByText("Email invalide")).toBeVisible();
  });

  test("valide la force du mot de passe", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Continuer").click();
    await page.getByLabel("Nom complet").fill("Jean Test");
    await page.getByLabel("Email").fill("jean@test.com");
    // Weak password
    await page.getByLabel("Mot de passe", { exact: true }).fill("abc");
    await page.getByText("Créer mon compte").click();
    await expect(page.getByText("8 caractères minimum")).toBeVisible();
  });

  test("vérifie la confirmation de mot de passe", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Continuer").click();
    await page.getByLabel("Nom complet").fill("Jean Test");
    await page.getByLabel("Email").fill("jean@test.com");
    await page.getByLabel("Mot de passe", { exact: true }).fill("MonPass1234");
    await page.getByLabel("Confirmer le mot de passe").fill("Different123");
    await page.getByText("Créer mon compte").click();
    await expect(page.getByText("Les mots de passe ne correspondent pas")).toBeVisible();
  });

  test("le bouton retour ramène à l'étape 1", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Continuer").click();
    await page.getByText("Retour").click();
    await expect(page.locator("h1")).toContainText("Qui êtes-vous");
  });

  test("le lien vers login fonctionne", async ({ page }) => {
    await page.goto("/signup");
    await page.getByText("Se connecter").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
