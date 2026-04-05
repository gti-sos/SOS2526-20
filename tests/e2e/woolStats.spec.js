import { test, expect } from '@playwright/test';

const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = `${URL_BASE}/wool-stats`;

test.describe.configure({ mode: 'serial' });


// ------------------------------------------------------
// 0. BORRAR DATOS
// ------------------------------------------------------
test("Borrar todos los registros de lana", async ({ page }) => {
    await page.goto(app);

    // Confirmación automática si aparece un diálogo
    page.on("dialog", dialog => dialog.accept());

    const deleteAllResponse = page.waitForResponse(res =>
        res.url().includes("/wool-stats") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    await page.getByRole("button", { name: "🗑️ Borrar Todo" }).click();
    await deleteAllResponse;

    // La tabla debe quedar vacía → no debe haber woolRow
    await expect(page.getByTestId("woolRow")).toHaveCount(0);
});



// ------------------------------------------------------
// 1. CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    const loadInitial = page.waitForResponse(res =>
        res.url().includes("/wool-stats/loadInitialData") &&
        res.request().method() === "GET" &&
        (res.status() === 200 || res.status() === 201)
    );

    await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
    await loadInitial;

    // Esperar a que Svelte renderice la tabla
    await page.waitForSelector('[data-testid="woolRow"]');

    const rows = await page.getByTestId("woolRow").count();
    expect(rows).toBeGreaterThan(0);
});



// ------------------------------------------------------
// 2. POST – AÑADIR UN REGISTRO
// ------------------------------------------------------
test("Añadir un registro de lana", async ({ page }) => {
    await page.goto(app);

    const postResponse = page.waitForResponse(res =>
        res.url().includes("/wool-stats") &&
        res.request().method() === "POST" &&
        res.status() === 201
    );

    await page.fill("#period", "2024");
    await page.fill("#reporterdesc", "España");
    await page.fill("#flowdesc", "Importación");
    await page.fill("#qtyunitabbr", "kg");
    await page.fill("#qty", "1500");
    await page.fill("#isqtyestimated", "no");
    await page.fill("#netwgt", "1400");
    await page.fill("#isnetwgtestimated", "no");
    await page.fill("#grosswgt", "1600");
    await page.fill("#isgrosswgtestimated", "no");
    await page.fill("#cifvalue", "20000");
    await page.fill("#fobvalue", "18000");
    await page.fill("#primaryvalue", "5000");

    await page.getByRole("button", { name: "Guardar Registro" }).click();
    await postResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});


// ------------------------------------------------------
// 3. GET – OBTENER UN REGISTRO
// ------------------------------------------------------
test("Obtener un registro específico", async ({ page }) => {
    await page.goto(app);

    const encodedCountry = encodeURIComponent("España");
    const encodedFlow = encodeURIComponent("Importación");

    const getResponse = page.waitForResponse(res =>
        res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    await page.fill("#getSinglePeriod", "2024");
    await page.fill("#getSingleReporterdesc", "España");
    await page.fill("#getSingleFlowdesc", "Importación");

    await page.getByRole("button", { name: "Buscar" }).click();
    await getResponse;

    await expect(page.locator(".card h4", { hasText: "Resultado" })).toBeVisible();
});


// ------------------------------------------------------
// 4. PUT – ACTUALIZAR UN REGISTRO
// ------------------------------------------------------
test("Actualizar un registro de lana", async ({ page }) => {
    await page.goto(app);

    const encodedCountry = encodeURIComponent("España");
    const encodedFlow = encodeURIComponent("Importación");

    const putResponse = page.waitForResponse(res =>
        res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
        res.request().method() === "PUT" &&
        res.status() === 200
    );

    await page.fill("#putPeriod", "2024");
    await page.fill("#putReporterdesc", "España");
    await page.fill("#putFlowdesc", "Importación");

    await page.fill("#putQtyunitAbbr", "kg");
    await page.fill("#putQty", "9999");
    await page.fill("#putIsqtyestimated", "sí");
    await page.fill("#putNetwgt", "8888");
    await page.fill("#putIsnetwgtestimated", "sí");
    await page.fill("#putGrosswgt", "7777");
    await page.fill("#putIsgrosswgtestimated", "sí");
    await page.fill("#putCifvalue", "22222");
    await page.fill("#putFobvalue", "11111");
    await page.fill("#putPrimaryvalue", "33333");

    // Botón correcto del formulario PUT
    await page.locator("#putForm button").click();

    await putResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});


// ------------------------------------------------------
// 5. DELETE – ELIMINAR UN REGISTRO
// ------------------------------------------------------
test("Eliminar un registro de lana", async ({ page }) => {
    await page.goto(app);

    const encodedCountry = encodeURIComponent("España");
    const encodedFlow = encodeURIComponent("Importación");

    const deleteResponse = page.waitForResponse(res =>
        res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    await page.fill("#delPeriod", "2024");
    await page.fill("#delReporterdesc", "España");
    await page.fill("#delFlowdesc", "Importación");

    await page.getByRole("button", { name: "Eliminar" }).click();
    await deleteResponse;

    await expect(page.locator(".success-banner")).toBeVisible();
});



// ------------------------------------------------------
// 6. LISTAR – COMPROBAR QUE HAY FILAS
// ------------------------------------------------------
test("Listar registros de lana", async ({ page }) => {
    await page.goto(app);

    await page.getByRole("button", { name: "🔄 Actualizar" }).click();

    await expect(page.getByTestId("woolRow").first()).toBeVisible();
});
