import { test, expect } from '@playwright/test';

const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = `${URL_BASE}/coffee-stats`;

test.describe.configure({ mode: 'serial' });


// ------------------------------------------------------
// 0. BORRAR TODOS LOS REGISTROS
// ------------------------------------------------------
test("Borrar todos los registros de café", async ({ page }) => {
    await page.goto(BASE_URL);

    page.on("dialog", dialog => dialog.accept());

    const deleteAllResponse = page.waitForResponse(res =>
        res.url().includes("/coffee-stats") &&
        res.request().method() === "DELETE" &&
        res.status() >= 200 && res.status() < 300
    );

    await page.getByRole("button", { name: "🗑️ Borrar Todo" }).click();
    await deleteAllResponse;

    await expect(page.getByTestId("coffeeRow")).toHaveCount(0);
});


// ------------------------------------------------------
// 1. CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(BASE_URL);

    const loadInitial = page.waitForResponse(res =>
        res.url().includes("/coffee-stats/loadInitialData") &&
        res.request().method() === "GET" &&
        (res.status() === 200 || res.status() === 201)
    );

    await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
    await loadInitial;

    await page.waitForSelector('[data-testid="coffeeRow"]');

    const rows = await page.getByTestId("coffeeRow").count();
    expect(rows).toBeGreaterThan(0);
});


// ------------------------------------------------------
// 2. POST – AÑADIR UN REGISTRO
// ------------------------------------------------------
test("Añadir un registro de café", async ({ page }) => {
    await page.goto(BASE_URL);

    const postResponse = page.waitForResponse(res =>
        res.url().includes("/coffee-stats") &&
        res.request().method() === "POST" &&
        res.status() === 201
    );

    await page.fill("#country", "Colombia");
    await page.fill("#year", "2024");
    await page.fill("#type", "Arábica");
    await page.fill("#prod", "5000");
    await page.fill("#exp", "3000");
    await page.fill("#cons", "1500");
    await page.fill("#stock", "800");

    await page.getByRole("button", { name: "Guardar Registro" }).click();
    await postResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});


// ------------------------------------------------------
// 3. GET – OBTENER UN REGISTRO
// ------------------------------------------------------
test("Obtener un registro específico de café", async ({ page }) => {
    await page.goto(BASE_URL);

    const encodedCountry = encodeURIComponent("Colombia");
    const encodedType = encodeURIComponent("Arábica");

    const getResponse = page.waitForResponse(res =>
        res.url().includes(`/coffee-stats/${encodedCountry}/${encodedType}/2024`) &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    await page.fill("#getSingleCountry", "Colombia");
    await page.fill("#getSingleCoffee_type", "Arábica");
    await page.fill("#getSingleYear", "2024");

    await page.getByRole("button", { name: "Buscar" }).click();
    await getResponse;

    await expect(page.locator(".card h4", { hasText: "Resultado" })).toBeVisible();
});


// ------------------------------------------------------
// 4. PUT – ACTUALIZAR UN REGISTRO
// ------------------------------------------------------
test("Actualizar un registro de café", async ({ page }) => {
    await page.goto(BASE_URL);

    const encodedCountry = encodeURIComponent("Colombia");
    const encodedType = encodeURIComponent("Arábica");

    const putResponse = page.waitForResponse(res =>
        res.url().includes(`/coffee-stats/${encodedCountry}/${encodedType}/2024`) &&
        res.request().method() === "PUT" &&
        res.status() === 200
    );

    await page.fill("#putCountry", "Colombia");
    await page.fill("#putCoffeeType", "Arábica");
    await page.fill("#putYear", "2024");

    await page.fill("#putProduction", "9999");
    await page.fill("#putExport", "4444");
    await page.fill("#putDomesticConsumption", "2222");
    await page.fill("#putGrossOpeningStock", "1111");

    await page.locator("#putForm button").click();
    await putResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});


// ------------------------------------------------------
// 5. DELETE – ELIMINAR UN REGISTRO
// ------------------------------------------------------
test("Eliminar un registro de café", async ({ page }) => {
    await page.goto(BASE_URL);

    const encodedCountry = encodeURIComponent("Colombia");
    const encodedType = encodeURIComponent("Arábica");

    const deleteResponse = page.waitForResponse(res =>
        res.url().includes(`/coffee-stats/${encodedCountry}/${encodedType}/2024`) &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    await page.fill("#delCountry", "Colombia");
    await page.fill("#delCoffee_type", "Arábica");
    await page.fill("#delYear", "2024");

    await page.getByRole("button", { name: "Eliminar" }).click();
    await deleteResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});


// ------------------------------------------------------
// 6. LISTAR – COMPROBAR QUE HAY FILAS
// ------------------------------------------------------
test("Listar registros de café", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole("button", { name: "🔄 Actualizar" }).click();

    await expect(page.getByTestId("coffeeRow").first()).toBeVisible();
});
