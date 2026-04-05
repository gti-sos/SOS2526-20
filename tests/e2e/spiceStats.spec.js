import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });


const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = `${URL_BASE}/spice-stats`;



// ------------------------------------------------------
// 1. BORRAR TODOS LOS DATOS
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
// 2. CARGAR DATOS INICIALES
// ------------------------------------------------------
test("Cargar datos iniciales", async ({ page }) => {
    await page.goto(app);

    const loadInitial = page.waitForResponse(res =>
        res.url().includes("/spice-stats/loadInitialData") &&
        res.request().method() === "GET" &&
        res.status() === 201
    );
    
    await page.getByRole("button",{name:"Cargar Datos"}).click();
    await loadInitial
});


// ------------------------------------------------------
// 3. LISTAR PICANTES
// ------------------------------------------------------
test('Listar Picantes', async ({page})=>{
    await page.goto(app);

    //Espera a que carguen las columnas
    await expect(page.getByTestId('spiceRow').first()).toBeVisible();
    
    const rows2=await page.getByTestId('spiceRow').count();
    expect(rows2).toBeGreaterThan(0);

});


// ------------------------------------------------------
// 4. POST: AÑADIR UN PICANTE
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
// 5. GET INDIVIDUAL
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

    await expect(page.locator(".card")).toBeVisible();
});


// ------------------------------------------------------
// 6. PUT: ACTUALIZAR PICANTE
// ------------------------------------------------------
test("Actualizar un picante", async ({ page }) => {
    await page.goto(app);

    const putResponse = page.waitForResponse(res =>
        res.url().includes("/spice-stats/aaaa/aaaa/1111") &&
        res.request().method() === "PUT" &&
        res.status() === 200
    );

    await page.fill("#putArea", "aaaa");
    await page.fill("#putItem", "aaaa");
    await page.fill("#putYear", "1111");

    await page.fill("#put_domain_code", "9999");
    await page.fill("#put_domain", "zzzz");
    await page.fill("#put_area_code", "9999");
    await page.fill("#put_element_code", "9999");
    await page.fill("#put_item_code", "9999");
    await page.fill("#put_unit", "9999");
    await page.fill("#put_import", "9999");
    await page.fill("#put_export", "9999");
    await page.fill("#put_production", "9999");
    await page.fill("#put_consumption", "9999");

    await page.click("#putButton");
    await putResponse;
});


// ------------------------------------------------------
// 7. DELETE INDIVIDUAL
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
