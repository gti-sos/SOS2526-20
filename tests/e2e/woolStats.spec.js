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

    // Ajustado a los IDs exactos de tus inputs en el formulario de añadir
    await page.fill("#period", "2026");
    await page.fill("#reporterdesc", "EspañaTest");
    await page.fill("#flowdesc", "Import");
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

    // Espía del endpoint POST
    const postPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats") &&
        res.request().method() === "POST"
    );

    // Buscamos el botón de submit de tu formulario
    await page.getByRole("button", { name: "Guardar Registro" }).click();

    const response = await postPromise;
    const status = response.status();

    if (status !== 201 && status !== 200) {
        const errorText = await response.text();
        console.error(`Fallo en POST - Status devuelto: ${status}, Body: ${errorText}`);
    }

    expect([200, 201, 409]).toContain(status); 
});

// ------------------------------------------------------
// GET INDIVIDUAL
// ------------------------------------------------------
test("Obtener un registro de lana concreto", async ({ page }) => {
    // 1. Cargamos la página
    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/wool-stats") &&
        !res.url().includes("loadInitialData")
    );
    await page.goto(app);
    await initialLoadPromise;

    // 2. Rellenamos los datos del formulario "Recuperar un dato específico"
    await page.fill("#getSinglePeriod", "2026");
    await page.fill("#getSingleReporterdesc", "EspañaTest");
    await page.fill("#getSingleFlowdesc", "import");

    // 3. Preparamos el espía decodificando la URL para evitar el problema de la "ñ"
    const getPromise = page.waitForResponse(res => {
        const decodedUrl = decodeURIComponent(res.url());
        return decodedUrl.includes("/2026/EspañaTest/import") && res.request().method() === "GET";
    });

    // 4. Hacemos clic en el botón
    await page.locator("#btnGetSingle").click();

    // 5. Esperamos la respuesta y validamos
    const response = await getPromise;
    const status = response.status();
    
    if (!response.ok() && status !== 304) {
        const errorText = await response.text();
        console.error(`Fallo en GET Individual - Status: ${status}, Body: ${errorText}`);
    }

    expect(response.ok() || status === 304).toBeTruthy();

    // Validamos que el <h4>Resultado</h4> haya aparecido en pantalla
    await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible({ timeout: 5000 });
});

// ------------------------------------------------------
// BUSCADOR DE ESTADÍSTICAS (FILTROS)
// ------------------------------------------------------
test("Buscar estadísticas con filtros", async ({ page }) => {
    await page.goto(app);

    // Ajustado a los IDs de tus filtros de búsqueda en la UI
    await page.fill("#filterReporterdesc", "EspañaTest");
    await page.fill("#filterFlowdesc", "Import");
    await page.fill("#filterFromPeriod", "2025");
    await page.fill("#filterToPeriod", "2027");
    await page.fill("#filterQty", "1500");

    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats?") &&
        res.url().includes("reporterdesc=EspañaTest") &&
        res.url().includes("flowdesc=Import") && 
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // Usamos el test id del botón de filtros
    await page.getByTestId("btnSearchFilters").click();

    await searchPromise;

    await expect(page.locator(".card").first()).toBeVisible();
});

// ------------------------------------------------------
// PUT: EDITAR UN REGISTRO CONCRETO
// ------------------------------------------------------
test("Editar el registro de 'EspañaTest'", async ({ page }) => {
    // 1. Interceptamos el alert() que genera tu Svelte al guardar correctamente
    page.on('dialog', dialog => dialog.accept());

    // 2. Cargamos la página principal
    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/wool-stats") &&
        !res.url().includes("loadInitialData")
    );
    await page.goto(app);
    await initialLoadPromise;

    // 3. Filtramos para aislar el registro que vamos a editar en la tabla
    await page.fill("#filterReporterdesc", "EspañaTest");
    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/wool-stats?") &&
        res.url().includes("reporterdesc=EspañaTest") &&
        res.request().method() === "GET"
    );
    await page.getByTestId("btnSearchFilters").click(); 
    await searchPromise;

    // Comprobamos que el registro buscado es visible
    await expect(page.getByText('EspañaTest').first()).toBeVisible({ timeout: 5000 });

    // 4. Preparamos el espía para cuando la página de edición pida los datos en onMount
    // Al usar encodeURIComponent en Svelte, la "ñ" de EspañaTest se convierte en "%C3%B1"
    const getEditDataPromise = page.waitForResponse(res =>
        res.url().includes("/2026/Espa%C3%B1aTest/import") &&
        res.request().method() === "GET"
    );

    // 5. Hacemos clic en el enlace de edición de la fila correspondiente
    const row = page.locator('tr').filter({ hasText: 'EspañaTest' }).first();
    const editLink = row.locator("a").first();
    await editLink.click();

    // 6. Esperamos a que el onMount cargue los datos (isLoading pasará a false)
    await getEditDataPromise;

    // 7. Tu Svelte usa id={key} para los inputs. Comprobamos que #qty esté visible
    await expect(page.locator('#qty')).toBeVisible({ timeout: 5000 });
    
    // 8. Modificamos el valor de la cantidad
    await page.fill('#qty', '9999');

    // 9. Preparamos el espía para la petición PUT de handleUpdate
    const putPromise = page.waitForResponse(res =>
        res.request().method() === "PUT" &&
        res.url().includes("/2026/Espa%C3%B1aTest/import") 
    );
    
    // 10. Hacemos clic en el botón de submit con el texto exacto que pusiste
    await page.getByRole("button", { name: "💾 Guardar Cambios" }).click();
    
    // 11. Validamos que el servidor haya devuelto 200 OK
    const putResponse = await putPromise;
    expect(putResponse.ok()).toBeTruthy();

    // 12. Validamos que el goto('/wool-stats') se haya ejecutado correctamente
    await expect(page).toHaveURL(/\/wool-stats$/);
});

// ------------------------------------------------------
// DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un registro concreto", async ({ page }) => {
    await page.goto(app);

    // 1. Rellenamos el formulario de borrado
    await page.fill("#delPeriod", "2026");
    await page.fill("#delReporterdesc", "EspañaTest");
    await page.fill("#delFlowdesc", "import");

    // 2. Preparamos el espía con la URL decodificada para manejar la "ñ"
    const deletePromise = page.waitForResponse(res => {
        const decodedUrl = decodeURIComponent(res.url());
        return res.request().method() === "DELETE" && decodedUrl.includes("/2026/EspañaTest/import");
    });

    // 3. Clic al botón de eliminar
    await page.locator("#btnDel").click();

    // 4. Esperamos a que la petición termine con éxito
    const response = await deletePromise;
    expect(response.ok()).toBeTruthy();
});