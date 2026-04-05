import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });


const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = `${URL_BASE}/spice-stats`;



// ------------------------------------------------------
// BORRAR TODOS LOS DATOS
// ------------------------------------------------------
test('Borrar Todos los Recursos', async ({page})=>{
    await page.goto(app);


    page.on('dialog', dialog => dialog.accept());
    const annihilateData= page.waitForResponse(res=>res.url().includes("spice-stats")
     && res.request().method() === "DELETE" && res.status() === 200);

    await page.getByRole("button",{name: "Borrar todos los datos"}).click();
    await annihilateData;

    await expect(page.getByTestId('spiceRow')).toHaveCount(0);
})




// ------------------------------------------------------
// CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    const loadInitial = page.waitForResponse(res =>
        res.url().includes("/spice-stats/loadInitialData") &&
        ["GET", "OPTIONS"].includes(res.request().method()) &&
        res.status() < 400
    );

    await page.getByRole("button", { name: "Cargar Datos" }).click();
    await loadInitial;
});



// ------------------------------------------------------
// LISTAR PICANTES
// ------------------------------------------------------
test('Listar Picantes', async ({page})=>{
    await page.goto(app);

    //Espera a que carguen las columnas
    await expect(page.getByTestId('spiceRow').first()).toBeVisible();
    
    const rows2=await page.getByTestId('spiceRow').count();
    expect(rows2).toBeGreaterThan(0);

});


// ------------------------------------------------------
// POST: AÑADIR UN PICANTE
// ------------------------------------------------------
test("Añadir un picante", async ({ page }) => {
    await page.goto(app);

    const postResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats") &&
        res.request().method() === "POST" &&
        res.status() === 201
    );

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

    await page.click("#postButton");
    await postResponse;
});


// ------------------------------------------------------
// GET INDIVIDUAL
// ------------------------------------------------------
test("Obtener un picante concreto", async ({ page }) => {
    await page.goto(app);

    const getResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/aaaa/aaaa/1111") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    await page.fill("#getArea", "aaaa");
    await page.fill("#getItem", "aaaa");
    await page.fill("#getYear", "1111");

    await page.click("#getButton");
    await getResponse;

    // Comprobar que aparece la tarjeta del resultado
    await expect(page.getByRole("heading", { name: "Resultado" })).toBeVisible();
});




// ------------------------------------------------------
// BUSCADOR DE ESTADÍSTICAS
// ------------------------------------------------------
test("Buscar estadísticas con filtros", async ({ page }) => {
    await page.goto(app);

    // Esperamos la petición GET con los filtros aplicados
    const searchResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats?") &&     // Ruta base
        res.url().includes("area=India") &&        // Parámetros esperados
        res.url().includes("item=Pepper") &&
        res.url().includes("from=2010") &&
        res.url().includes("to=2020") &&
        res.request().method() === "GET" &&
        res.status() === 200
    );

    // Rellenamos los filtros
    await page.fill("#filterArea", "aaaa");
    await page.fill("#filterItem", "aaaa");
    await page.fill("#filterFromYear", "1000");
    await page.fill("#filterToYear", "2020");
    await page.fill("#filterProd", "1111");
    await page.fill("#filterImp", "1111");
    await page.fill("#filterExp", "1111");
    await page.fill("#filterCons", "1111");

    // Ejecutamos la búsqueda
    await page.click('button:has-text("Buscar")');

    // Esperamos la respuesta
    await searchResponse;

    // Verificamos que aparece la tarjeta de resultados
    await expect(page.locator(".card")).toBeVisible();
});



// ------------------------------------------------------
// EDITAR PICANTE
// ------------------------------------------------------
test("Navegar a la página de edición desde el enlace Editar", async ({ page }) => {
    await page.goto(app);

    // Localizamos el enlace de editar
    const editLink = page.locator('a:has-text("Editar")');

    await expect(editLink).toBeVisible();

    // Obtenemos el href real generado por Svelte
    const href = await editLink.getAttribute("href");

    // Preparamos la espera de navegación
    const navigation = page.waitForNavigation({
        url: url => url.includes(href)
    });

    // Hacemos clic en el enlace
    await editLink.click();

    // Esperamos la navegación
    await navigation;

    // Verificamos que la página de edición se ha cargado
    // (ajusta el selector según tu página real)
    await expect(page.locator("h1, h2, .card")).toBeVisible();
});



// ------------------------------------------------------
// DELETE INDIVIDUAL
// ------------------------------------------------------
test("Eliminar un picante concreto", async ({ page }) => {
    await page.goto(app);

    const deleteResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/aaaa/aaaa/1111") &&
        res.request().method() === "DELETE" &&
        res.status() === 200
    );

    await page.fill("#delArea", "aaaa");
    await page.fill("#delItem", "aaaa");
    await page.fill("#delYear", "1111");

    await page.click("#delButton");
    await deleteResponse;
});
