import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = `${URL_BASE}/spice-stats`;

// ------------------------------------------------------
// BORRAR TODOS LOS DATOS
// ------------------------------------------------------
test('Borrar Todos los Recursos', async ({ page }) => {
    await page.goto(app);

    page.on('dialog', dialog => dialog.accept());

    // 1. Preparamos el espía
    const deletePromise = page.waitForResponse(res =>
        res.url().endsWith("/spice-stats") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    // 2. Disparamos la acción
    await page.getByRole("button", { name: "Borrar todos los datos" }).click();

    // 3. Esperamos la resolución de la API
    await deletePromise;

    // 4. Verificamos la UI (Playwright reintenta automáticamente)
    await expect(page.getByTestId('spiceRow')).toHaveCount(0);
});

// ------------------------------------------------------
// CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    // 1. Preparamos el espía
    const loadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("api/v2/spice-stats/loadInitialData")
    );

    // 2. Disparamos la acción
    await page.getByRole("button", { name: "Cargar Datos" }).click();

    // 3. Esperamos la resolución
    const response = await loadPromise;

    // 4. Aseguramos que la respuesta fue correcta
    expect(response.ok()).toBeTruthy();
});

// ------------------------------------------------------
// LISTAR PICANTES
// ------------------------------------------------------
test('Listar Picantes', async ({page})=>{
    await page.goto(app);

    // Nota: Aquí no hay patrón de promesa porque la carga inicial 
    // ocurre al navegar (goto), no por un clic. 
    // Playwright auto-espera a que el elemento exista.
    await expect(page.getByTestId('spiceRow').first()).toBeVisible();
    
    const rows = await page.getByTestId('spiceRow').count();
    expect(rows).toBeGreaterThan(0);
});

// ------------------------------------------------------
// POST: AÑADIR UN PICANTE
// ------------------------------------------------------
test("Añadir un picante", async ({ page }) => {
    await page.goto(app);

    await page.fill("#domain_code", "1111");
    await page.fill("#domain", "aaaaa");
    await page.fill("#area_code", "1111");
    await page.fill("#area", "aaaa");
    await page.fill("#element_code", "1111");
    await page.fill("#item_code", "1111");
    await page.fill("#item", "aaaa");
    await page.fill("#year", "1111");
    await page.fill("#unit", "1111");
    await page.fill("#import", "1111");
    await page.fill("#export", "1111");
    await page.fill("#production", "1111");
    await page.fill("#consumption", "1111");

    // 1. Preparamos el espía
    const postPromise = page.waitForResponse(res =>
        res.url().includes("/spice-stats") &&
        res.request().method() === "POST" &&
        res.status() === 201
    );

    // 2. Disparamos la acción
    await page.click("#postButton");

    // 3. Esperamos la resolución
    await postPromise;
});

// ------------------------------------------------------
// GET INDIVIDUAL
// ------------------------------------------------------
test("Obtener un picante concreto", async ({ page }) => {
    await page.goto(app);

    await page.fill("#getArea", "aaaa");
    await page.fill("#getItem", "aaaa");
    await page.fill("#getYear", "1111");

    // 1. Preparamos el espía
    const getPromise = page.waitForResponse(res =>
        res.url().includes("/spice-stats/aaaa/aaaa/1111") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // 2. Disparamos la acción
    await page.click("#getButton");

    // 3. Esperamos la resolución
    await getPromise;

    // 4. Verificamos la UI
    await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible();
});




// ------------------------------------------------------
// BUSCADOR DE ESTADÍSTICAS
// ------------------------------------------------------
test("Buscar estadísticas con filtros", async ({ page }) => {
    await page.goto(app);

    await page.fill("#filterArea", "aaaa");
    await page.fill("#filterItem", "aaaa");
    await page.fill("#filterFromYear", "1000");
    await page.fill("#filterToYear", "2020");
    await page.fill("#filterProd", "1111");
    await page.fill("#filterImp", "1111");
    await page.fill("#filterExp", "1111");
    await page.fill("#filterCons", "1111");

    // 1. Preparamos el espía
    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/spice-stats?") &&
        res.url().includes("area=aaaa") &&
        res.url().includes("item=aaaa") &&
        res.url().includes("from=1000") &&
        res.url().includes("to=2020") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // 2. Disparamos la acción
    await page.click('button:has-text("Buscar")');

    // 3. Esperamos la resolución
    await searchPromise;

    // 4. Verificamos la UI
    await expect(page.locator(".card")).toBeVisible();
});

// ------------------------------------------------------
// PUT: EDITAR UN PICANTE CONCRETO
// ------------------------------------------------------
test("Editar el picante con valor 'aaaa'", async ({ page }) => {
    // 1. Aceptamos las alertas nativas (el "Datos guardados correctamente")
    page.on('dialog', dialog => dialog.accept());

    await page.goto(app);

    // 2. NUEVO: Usamos el buscador para encontrar "aaaa" y vencer a la paginación
    await page.fill("#filterArea", "aaaa");

    // Preparamos el espía para la búsqueda
    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/spice-stats?") &&
        res.url().includes("area=aaaa") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // Hacemos clic en buscar y esperamos a que el backend devuelva el registro filtrado
    await page.click('button:has-text("Buscar")');
    await searchPromise;

    // 3. Ahora SÍ estamos 100% seguros de que "aaaa" está visible en la tabla
    await expect(page.getByText('aaaa').first()).toBeVisible({ timeout: 5000 });

    // 4. Filtramos la fila y buscamos el enlace de edición
    const row = page.locator('tr').filter({ hasText: 'aaaa' }).first();
    const editLink = row.locator("a");

    await expect(editLink).toBeVisible();
    await editLink.click();

    // 5. Verificamos la URL y que la vista de edición ha cargado
    await expect(page).toHaveURL(/.*aaaa.*1111.*/); 
    await expect(page.locator("h1, h2, .card").first()).toBeVisible();

    // 6. Modificamos el valor
    await page.fill('#production', '9999');

    // 7. Preparamos el espía para interceptar el guardado (PUT)
    const putPromise = page.waitForResponse(res =>
        res.request().method() === "PUT" &&
        res.url().includes("/spice-stats/") &&
        res.status() === 200
    );

    // 8. Guardamos los cambios
    await page.click('#btnGuardarEdicion');
    await putPromise;

    // 9. Comprobamos que redirige a la tabla principal
    await expect(page.locator('table')).toBeVisible();
    expect(page.url()).toContain(app);
});

// ------------------------------------------------------
// DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un picante concreto", async ({ page }) => {
    await page.goto(app);

    await page.fill("#delArea", "aaaa");
    await page.fill("#delItem", "aaaa");
    await page.fill("#delYear", "1111");

    // 1. Preparamos el espía
    const deletePromise = page.waitForResponse(res =>
        res.request().method() === "DELETE" &&
        res.url().endsWith("/aaaa/aaaa/1111")
    );

    // 2. Disparamos la acción
    await page.click("#delButton");

    // 3. Esperamos la resolución
    await deletePromise;
});