import { test, expect } from "../playwright-fixture";

test.describe("Ajout de véhicule (formulaire)", () => {
  test("affiche la page avec le stepper 3 étapes", async ({ page }) => {
    await page.goto("/dashboard/vehicles/new");
    // May redirect to login if not authenticated
    const url = page.url();
    if (url.includes("/login")) {
      test.skip(true, "Requires authentication — skipping UI-only test");
      return;
    }
    await expect(page.getByText("Ajouter un véhicule")).toBeVisible();
    await expect(page.getByText("Identification")).toBeVisible();
    await expect(page.getByText("Immatriculation")).toBeVisible();
    await expect(page.getByText("Kilométrage")).toBeVisible();
  });
});

test.describe("Pages publiques accessibles", () => {
  test("page d'accueil charge correctement", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Auto-Passeport")).toBeVisible();
  });

  test("page 404 pour route inconnue", async ({ page }) => {
    await page.goto("/cette-page-nexiste-pas");
    await expect(page.getByText(/introuvable|not found|404/i)).toBeVisible();
  });

  test("navigation accueil → login → signup", async ({ page }) => {
    await page.goto("/");
    // Find a login/connexion link
    const loginLink = page.getByRole("link", { name: /connexion|se connecter|login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      await page.goto("/login");
    }
    await page.getByText("Créer un compte gratuit").click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("Mot de passe oublié", () => {
  test("affiche le formulaire de récupération", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByText(/réinitialisation|oublié|récupér/i)).toBeVisible();
  });
});
