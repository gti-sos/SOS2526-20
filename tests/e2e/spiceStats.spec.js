import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const BASE_URL = "http://localhost:3000/picantes";
const API = "http://localhost:3000/spice-stats";


// ------------------------------------------------------
// 1. BORRAR TODOS LOS DATOS
// ------------------------------------------------------
test('Borrar todos los picantes', async ({ page }) => {
    await page.goto(BASE_URL);

    // Asegura que la página cargó y el botón existe
    await expect(page.getByRole("button", { name: "Borrar todos los datos" })).toBeVisible();

    // Espera a la petición DELETE
    const deleteAll = page.waitForResponse(res =>
        res.url().includes("/api/v2/spice-stats") &&
        res.request().method() === "DELETE" &&
        [200, 201, 204].includes(res.status())
    );

    // Clic en el botón
    await page.getByRole("button", { name: "Borrar todos los datos" }).click();

    // Espera la respuesta DELETE
    await deleteAll;

    // La tabla debe quedar vacía (solo queda la fila del mensaje)
    const rows = await page.locator("tbody tr").count();
    expect(rows).toBe(1);
});




// ------------------------------------------------------
// 2. CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(BASE_URL);

    const loadInitial = page.waitForResponse(res =>
        res.url().includes("/spice-stats/loadInitialData") &&
        res.request().method() === "GET" &&
        res.status() === 201
    );

    await page.click("#btnLoadAll");
    await loadInitial;

    const rows = await page.locator("tbody tr").count();
    expect(rows).toBeGreaterThan(1);
});


// ------------------------------------------------------
// 3. LISTAR PICANTES
// ------------------------------------------------------
test("Listar picantes", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator("tbody tr").first()).toBeVisible();

    const rows = await page.locator("tbody tr").count();
    expect(rows).toBeGreaterThan(1);
});


// ------------------------------------------------------
// 4. POST: AÑADIR UN PICANTE
// ------------------------------------------------------
test("Añadir un picante", async ({ page }) => {
    await page.goto(BASE_URL);

    const postResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats") &&
        res.request().method() === "POST" &&
        res.status() === 201
    );

    await page.fill("#domain_code", "100");
    await page.fill("#domain", "TEST");
    await page.fill("#area_code", "999");
    await page.fill("#area", "WAWA");
    await page.fill("#element_code", "123");
    await page.fill("#item_code", "456");
    await page.fill("#item", "CHILI");
    await page.fill("#year", "3000");
    await page.fill("#unit", "1");
    await page.fill("#import", "10");
    await page.fill("#export", "20");
    await page.fill("#production", "30");
    await page.fill("#consumption", "40");

    await page.click("#postButton");
    await postResponse;
});


// ------------------------------------------------------
// 5. GET INDIVIDUAL
// ------------------------------------------------------
test("Obtener un picante concreto", async ({ page }) => {
    await page.goto(BASE_URL);

    const getResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/WAWA/CHILI/3000") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    await page.fill("#getArea", "WAWA");
    await page.fill("#getItem", "CHILI");
    await page.fill("#getYear", "3000");

    await page.click("#getButton");
    await getResponse;

    await expect(page.locator(".card")).toBeVisible();
});


// ------------------------------------------------------
// 6. PUT: ACTUALIZAR PICANTE
// ------------------------------------------------------
test("Actualizar un picante", async ({ page }) => {
    await page.goto(BASE_URL);

    const putResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/WAWA/CHILI/3000") &&
        res.request().method() === "PUT" &&
        res.status() === 200
    );

    await page.fill("#putArea", "WAWA");
    await page.fill("#putItem", "CHILI");
    await page.fill("#putYear", "3000");

    await page.fill("#put_domain_code", "200");
    await page.fill("#put_domain", "UPDATED");
    await page.fill("#put_area_code", "888");
    await page.fill("#put_element_code", "777");
    await page.fill("#put_item_code", "666");
    await page.fill("#put_unit", "2");
    await page.fill("#put_import", "11");
    await page.fill("#put_export", "22");
    await page.fill("#put_production", "33");
    await page.fill("#put_consumption", "44");

    await page.click("#putButton");
    await putResponse;
});


// ------------------------------------------------------
// 7. DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un picante concreto", async ({ page }) => {
    await page.goto(BASE_URL);

    const deleteResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/WAWA/CHILI/3000") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    await page.fill("#delArea", "WAWA");
    await page.fill("#delItem", "CHILI");
    await page.fill("#delYear", "3000");

    await page.click("#delButton");
    await deleteResponse;
});
