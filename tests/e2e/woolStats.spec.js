import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
// Cambiamos la ruta base a la de las lanas
const app = `${URL_BASE}/wool-stats`;

// ------------------------------------------------------
// BORRAR TODOS LOS DATOS
// ------------------------------------------------------
test('Borrar Todos los Recursos', async ({ page }) => {
    await page.goto(app);

    // Como Svelte 5 usa tu propio manejador de notificaciones, no hay "dialog" nativo de alert, 
    // pero mantenemos el listener por si acaso.
    page.on('dialog', dialog => dialog.accept());

    // 1. Preparamos el espía para wool-stats
    const deletePromise = page.waitForResponse(res =>
        res.url().endsWith("/wool-stats") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    // 2. Disparamos la acción usando el ID del botón de borrado masivo
    await page.locator("#btnDeleteAll").click(); 

    // 3. Esperamos la resolución de la API
    await deletePromise;

    // 4. Verificamos la UI usando el data-testid de la fila de lanas
    await expect(page.getByTestId('woolRow')).toHaveCount(0);
});

// ------------------------------------------------------
// CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    // Espía de la ruta de carga inicial
    const loadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("api/v2/wool-stats/loadInitialData")
    );

    // Ajustado al texto exacto de tu botón
    await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
    const response = await loadPromise;

    const status = response.status();
    expect([200, 201, 409]).toContain(status);
});

// ------------------------------------------------------
// LISTAR LANAS
// ------------------------------------------------------
test('Listar Lanas', async ({page})=>{
    const getInitialDataPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/wool-stats") &&
        !res.url().includes("loadInitialData") && 
        res.status() === 200
    );

    await page.goto(app);
    await getInitialDataPromise;

    // Buscamos las filas de la tabla usando tu data-testid específico
    const rowLocator = page.getByTestId('woolRow');
    await expect(rowLocator.first()).toBeVisible({ timeout: 5000 });
    
    const rows = await rowLocator.count();
    expect(rows).toBeGreaterThan(0);
});

// ------------------------------------------------------
// POST: AÑADIR UN REGISTRO DE LANA
// ------------------------------------------------------
test("Añadir un registro de lana", async ({ page }) => {
    await page.goto(app);
    await page.waitForLoadState('networkidle'); 

    await page.fill("#period", "2026");
    // Usamos "EspanaTest" sin 'ñ' para evitar problemas en las URLs
    await page.fill("#reporterdesc", "EspanaTest");
    await page.fill("#flowdesc", "import");
    await page.fill("#qtyunitAbbr", "kg");
    await page.fill("#qty", "1500");
    await page.fill("#isqtyestimated", "No");
    await page.fill("#netwgt", "1450");
    await page.fill("#isnetwgtestimated", "No");
    await page.fill("#grosswgt", "1500");
    await page.fill("#isgrosswgtestimated", "No");
    await page.fill("#cifvalue", "5000");
    await page.fill("#fobvalue", "4800");
    await page.fill("#primaryvalue", "5000");

    const postPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats") &&
        res.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Guardar Registro" }).click();

    const response = await postPromise;
    const status = response.status();

    expect([200, 201, 409]).toContain(status); 
});

// ------------------------------------------------------
// GET INDIVIDUAL
// ------------------------------------------------------
test("Obtener un registro de lana concreto", async ({ page }) => {
    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/wool-stats") &&
        !res.url().includes("loadInitialData")
    );
    await page.goto(app);
    await initialLoadPromise;

    await page.fill("#getSinglePeriod", "2026");
    await page.fill("#getSingleReporterdesc", "EspanaTest");
    await page.fill("#getSingleFlowdesc", "import");

    // Al no haber 'ñ', la intercepción vuelve a ser limpia y directa
    const getPromise = page.waitForResponse(res =>
        res.url().includes("/2026/EspanaTest/import") &&
        res.request().method() === "GET"
    );

    await page.locator("#btnGetSingle").click();

    const response = await getPromise;
    const status = response.status();

    expect(response.ok() || status === 304).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible({ timeout: 5000 });
});

// ------------------------------------------------------
// BUSCADOR DE ESTADÍSTICAS (FILTROS)
// ------------------------------------------------------
test("Buscar estadísticas con filtros", async ({ page }) => {
    await page.goto(app);

    await page.fill("#filterReporterdesc", "EspanaTest");
    await page.fill("#filterFlowdesc", "import");
    await page.fill("#filterFromPeriod", "2025");
    await page.fill("#filterToPeriod", "2027");
    await page.fill("#filterQty", "1500");

    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats?") &&
        res.url().includes("reporterdesc=EspanaTest") &&
        res.url().includes("flowdesc=import") && 
        res.request().method() === "GET"
    );

    await page.getByTestId("btnSearchFilters").click();
    await searchPromise;

    await expect(page.locator(".card").first()).toBeVisible();
});

// ------------------------------------------------------
// PUT: EDITAR UN REGISTRO CONCRETO
// ------------------------------------------------------
test("Editar el registro de 'EspanaTest'", async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());

    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/wool-stats") &&
        !res.url().includes("loadInitialData")
    );

    await page.goto(app);
    await initialLoadPromise;

    await page.fill("#filterReporterdesc", "EspanaTest");
    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats?") &&
        res.url().includes("reporterdesc=EspanaTest") &&
        res.request().method() === "GET"
    );
    await page.getByTestId("btnSearchFilters").click(); 
    await searchPromise;

    await expect(page.getByText('EspanaTest').first()).toBeVisible({ timeout: 5000 });

    const getEditDataPromise = page.waitForResponse(res =>
        res.url().includes("/2026/EspanaTest/import") &&
        res.request().method() === "GET"
    );

    const row = page.locator('tr').filter({ hasText: 'EspanaTest' }).first();
    const editLink = row.locator("a").first();
    await editLink.click();

    await getEditDataPromise;
    await expect(page.locator('#qty')).toBeVisible({ timeout: 5000 });
    
    await page.fill('#qty', '9999');

    const putPromise = page.waitForResponse(res =>
        res.request().method() === "PUT" &&
        res.url().includes("/2026/EspanaTest/import") 
    );
    
    await page.getByRole("button", { name: "💾 Guardar Cambios" }).click();
    
    const putResponse = await putPromise;
    expect(putResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/wool-stats$/);
});

// ------------------------------------------------------
// DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un registro concreto", async ({ page }) => {
    await page.goto(app);

    await page.fill("#delPeriod", "2026");
    await page.fill("#delReporterdesc", "EspanaTest");
    await page.fill("#delFlowdesc", "import");

    const deletePromise = page.waitForResponse(res =>
        res.request().method() === "DELETE" &&
        res.url().includes("/2026/EspanaTest/import")
    );

    await page.locator("#btnDel").click();

    await deletePromise;
});