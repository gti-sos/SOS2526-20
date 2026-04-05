import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
// Cambiamos la ruta base a la de los cafés
const app = `${URL_BASE}/coffee-stats`;

// ------------------------------------------------------
// BORRAR TODOS LOS DATOS
// ------------------------------------------------------
test('Borrar Todos los Recursos', async ({ page }) => {
    await page.goto(app);

    page.on('dialog', dialog => dialog.accept());

    // 1. Preparamos el espía para coffee-stats
    const deletePromise = page.waitForResponse(res =>
        res.url().endsWith("/coffee-stats") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    // 2. Disparamos la acción usando el ID del botón
    await page.locator("#btnDeleteAll").click(); 
    // Otra opción equivalente sería: await page.click("#btnDeleteAll");

    // 3. Esperamos la resolución de la API
    await deletePromise;

    // 4. Verificamos la UI usando el data-testid de tu HTML
    await expect(page.getByTestId('coffeeRow')).toHaveCount(0);
});

// ------------------------------------------------------
// CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    const loadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("api/v2/coffee-stats/loadInitialData")
    );

    // Ajustado al texto de tu botón
    await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
    const response = await loadPromise;

    const status = response.status();
    expect([200, 201, 409]).toContain(status);
});

// ------------------------------------------------------
// LISTAR CAFÉS
// ------------------------------------------------------
test('Listar Cafés', async ({page})=>{
    const getInitialDataPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/coffee-stats") &&
        !res.url().includes("loadInitialData") && 
        res.status() === 200
    );

    await page.goto(app);
    await getInitialDataPromise;

    // Buscamos las filas de la tabla usando tu data-testid
    const rowLocator = page.getByTestId('coffeeRow');
    await expect(rowLocator.first()).toBeVisible({ timeout: 5000 });
    
    const rows = await rowLocator.count();
    expect(rows).toBeGreaterThan(0);
});

// ------------------------------------------------------
// POST: AÑADIR UN CAFÉ
// ------------------------------------------------------
test("Añadir un café", async ({ page }) => {
    await page.goto(app);
    await page.waitForLoadState('networkidle'); 

    // Ajustado a los IDs exactos de tus inputs
    await page.fill("#country", "ColombiaTest");
    await page.fill("#year", "2024");
    await page.fill("#type", "Arabica");
    await page.fill("#prod", "1500");
    await page.fill("#exp", "1200");
    await page.fill("#cons", "300");
    await page.fill("#stock", "50");

    const postPromise = page.waitForResponse(res =>
        res.url().includes("/coffee-stats") &&
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
test("Obtener un café concreto", async ({ page }) => {
    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/coffee-stats") &&
        !res.url().includes("loadInitialData")
    );
    await page.goto(app);
    await initialLoadPromise;

    // Ajustado a los IDs del formulario de recuperar dato
    await page.fill("#getSingleCountry", "ColombiaTest");
    await page.fill("#getSingleCoffee_type", "Arabica");
    await page.fill("#getSingleYear", "2024");

    const getPromise = page.waitForResponse(res =>
        res.url().includes("/ColombiaTest/Arabica/2024") &&
        res.request().method() === "GET"
    );

    // Usamos el data-testid que pusiste en el botón de buscar
    await page.getByTestId("btnGetSingle").click();

    const response = await getPromise;
    const status = response.status();
    
    if (!response.ok() && status !== 304) {
        const errorText = await response.text();
        console.error(`Fallo en GET Individual - Status: ${status}, Body: ${errorText}`);
    }

    expect(response.ok() || status === 304).toBeTruthy();

    await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible({ timeout: 5000 });
});

// ------------------------------------------------------
// BUSCADOR DE ESTADÍSTICAS
// ------------------------------------------------------
test("Buscar estadísticas con filtros", async ({ page }) => {
    await page.goto(app);

    // Ajustado a los IDs de tus filtros de búsqueda
    await page.fill("#filterCountry", "ColombiaTest");
    await page.fill("#filterType", "Arabica");
    await page.fill("#filterFromYear", "2020");
    await page.fill("#filterToYear", "2025");
    await page.fill("#filterProd", "1500");

    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/coffee-stats?") &&
        res.url().includes("country=ColombiaTest") &&
        res.url().includes("coffee_type=Arabica") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // Usamos el test id de tu botón de filtro
    await page.getByTestId("btnSearchFilters").click();

    await searchPromise;

    await expect(page.locator(".card").first()).toBeVisible();
});

// ------------------------------------------------------
// PUT: EDITAR UN CAFÉ CONCRETO
// ------------------------------------------------------
test("Editar el café con valor 'ColombiaTest'", async ({ page }) => {
    // Como tu Svelte hace un alert("Datos actualizados correctamente."), 
    // necesitamos decirle a Playwright que lo acepte automáticamente
    page.on('dialog', dialog => dialog.accept());

    const initialLoadPromise = page.waitForResponse(res =>
        res.request().method() === "GET" &&
        res.url().includes("/api/v2/coffee-stats") &&
        !res.url().includes("loadInitialData")
    );

    await page.goto(app);
    await initialLoadPromise;

    // Filtramos para aislar el registro que vamos a editar en la tabla principal
    await page.fill("#filterCountry", "ColombiaTest");
    const searchPromise = page.waitForResponse(res =>
        res.url().includes("/coffee-stats?") &&
        res.url().includes("country=ColombiaTest") &&
        res.request().method() === "GET"
    );
    await page.getByTestId("btnSearchFilters").click(); // O click en tu botón de buscar
    await searchPromise;

    await expect(page.getByText('ColombiaTest').first()).toBeVisible({ timeout: 5000 });

    // Preparamos el espía para cuando la página de edición pida los datos
    const getEditDataPromise = page.waitForResponse(res =>
        res.url().includes("/ColombiaTest/Arabica/2024") &&
        res.request().method() === "GET"
    );

    // Hacemos clic en el enlace de edición de la fila
    const row = page.locator('tr').filter({ hasText: 'ColombiaTest' }).first();
    const editLink = row.locator("a").first();
    await editLink.click();

    // Esperamos a que los datos se carguen en el formulario
    await getEditDataPromise;

    // --- AQUÍ EMPIEZAN LOS CAMBIOS EXACTOS PARA TU SVELTE ---

    // El #each de tu svelte le asigna la clave del objeto como ID. 
    // Asumimos que la clave se llama "production".
    await expect(page.locator('#production')).toBeVisible({ timeout: 5000 });
    
    // Modificamos el valor
    await page.fill('#production', '9999');

    // Preparamos el espía para la petición PUT
    const putPromise = page.waitForResponse(res =>
        res.request().method() === "PUT" &&
        res.url().includes("/ColombiaTest/Arabica/2024") // Actualizado a la URL completa del fetch
    );
    
    // Hacemos clic exactamente en el botón que definiste
    await page.getByRole("button", { name: "💾 Guardar Cambios" }).click();
    
    // Validamos que el servidor devuelva OK
    const putResponse = await putPromise;
    expect(putResponse.ok()).toBeTruthy();

    // Validamos que el goto('/coffee-stats') haya funcionado y estemos de vuelta
    await expect(page).toHaveURL(/\/coffee-stats$/);
});

// ------------------------------------------------------
// DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un café concreto", async ({ page }) => {
    await page.goto(app);

    // Usando los IDs del bloque "Borrar un Dato"
    await page.fill("#delCountry", "ColombiaTest");
    await page.fill("#delCoffee_type", "Arabica");
    await page.fill("#delYear", "2024");

    const deletePromise = page.waitForResponse(res =>
        res.request().method() === "DELETE" &&
        res.url().endsWith("/ColombiaTest/Arabica/2024")
    );

    await page.click("#delButton");

    await deletePromise;
});