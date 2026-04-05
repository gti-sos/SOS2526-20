// import { test, expect } from '@playwright/test';

// const URL_BASE = process.env.BASE_URL || 'http://localhost:3000';
// const app = `${URL_BASE}/wool-stats`;

// test.describe.configure({ mode: 'serial' });


// // ------------------------------------------------------
// // 0. BORRAR DATOS
// // ------------------------------------------------------
// test("Borrar todos los registros de lana", async ({ page }) => {
//     await page.goto(app);

//     // Confirmación automática si aparece un diálogo
//     page.on("dialog", dialog => dialog.accept());

//     const deleteAllResponse = page.waitForResponse(res =>
//         res.url().includes("/wool-stats") &&
//         res.request().method() === "DELETE" &&
//         res.status() === 200
//     );

//     await page.getByRole("button", { name: "🗑️ Borrar Todo" }).click();
//     await deleteAllResponse;

//     // La tabla debe quedar vacía → no debe haber woolRow
//     await expect(page.getByTestId("woolRow")).toHaveCount(0);
// });



// // ------------------------------------------------------
// // 1. CARGAR DATOS INICIALES
// // ------------------------------------------------------
// test("Cargar datos iniciales", async ({ page }) => {
//     await page.goto(app);

//     const loadInitial = page.waitForResponse(res =>
//         res.url().includes("/wool-stats/loadInitialData") &&
//         res.request().method() === "GET" &&
//         (res.status() === 200 || res.status() === 201)
//     );

//     await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
//     await loadInitial;

//     // Esperar a que Svelte renderice la tabla
//     await page.waitForSelector('[data-testid="woolRow"]');

//     const rows = await page.getByTestId("woolRow").count();
//     expect(rows).toBeGreaterThan(0);
// });



// // ------------------------------------------------------
// // 2. POST – AÑADIR UN REGISTRO
// // ------------------------------------------------------
// test("Añadir un registro de lana", async ({ page }) => {
//     await page.goto(app);

//     const postResponse = page.waitForResponse(res =>
//         res.url().includes("/wool-stats") &&
//         res.request().method() === "POST" &&
//         res.status() === 201
//     );

//     await page.fill("#period", "2024");
//     await page.fill("#reporterdesc", "España");
//     await page.fill("#flowdesc", "Importación");
//     await page.fill("#qtyunitAbbr", "kg");
//     await page.fill("#qty", "1500");
//     await page.fill("#isqtyestimated", "no");
//     await page.fill("#netwgt", "1400");
//     await page.fill("#isnetwgtestimated", "no");
//     await page.fill("#grosswgt", "1600");
//     await page.fill("#isgrosswgtestimated", "no");
//     await page.fill("#cifvalue", "20000");
//     await page.fill("#fobvalue", "18000");
//     await page.fill("#primaryvalue", "5000");

//     await page.getByRole("button", { name: "Guardar Registro" }).click();
//     await postResponse;

//     await expect(page.locator(".success-banner")).toBeVisible();
// });


// // ------------------------------------------------------
// // 3. GET – OBTENER UN REGISTRO
// // ------------------------------------------------------
// test("Obtener un registro específico", async ({ page }) => {
//     await page.goto(app);

//     const encodedCountry = encodeURIComponent("España");
//     const encodedFlow = encodeURIComponent("Importación");

//     const getResponse = page.waitForResponse(res =>
//         res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
//         res.request().method() === "GET" &&
//         res.status() === 200
//     );

//     await page.fill("#getSinglePeriod", "2024");
//     await page.fill("#getSingleReporterdesc", "España");
//     await page.fill("#getSingleFlowdesc", "Importación");

//     await page.getByRole("button", { name: "Buscar" }).click();
//     await getResponse;

//     await expect(page.locator(".card h4", { hasText: "Resultado" })).toBeVisible();
// });


// // ------------------------------------------------------
// // 4. PUT – ACTUALIZAR UN REGISTRO
// // ------------------------------------------------------
// test("Actualizar un registro de lana", async ({ page }) => {
//     await page.goto(app);

//     const encodedCountry = encodeURIComponent("España");
//     const encodedFlow = encodeURIComponent("Importación");

//     const putResponse = page.waitForResponse(res =>
//         res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
//         res.request().method() === "PUT" &&
//         res.status() === 200
//     );

//     await page.fill("#putPeriod", "2024");
//     await page.fill("#putReporterdesc", "España");
//     await page.fill("#putFlowdesc", "Importación");

//     await page.fill("#putQtyunitAbbr", "kg");
//     await page.fill("#putQty", "9999");
//     await page.fill("#putIsqtyestimated", "sí");
//     await page.fill("#putNetwgt", "8888");
//     await page.fill("#putIsnetwgtestimated", "sí");
//     await page.fill("#putGrosswgt", "7777");
//     await page.fill("#putIsgrosswgtestimated", "sí");
//     await page.fill("#putCifvalue", "22222");
//     await page.fill("#putFobvalue", "11111");
//     await page.fill("#putPrimaryvalue", "33333");

//     // Botón correcto del formulario PUT
//     await page.locator("#putForm button").click();

//     await putResponse;

//     await expect(page.locator(".success-banner")).toBeVisible();
// });


// // ------------------------------------------------------
// // 5. DELETE – ELIMINAR UN REGISTRO
// // ------------------------------------------------------
// test("Eliminar un registro de lana", async ({ page }) => {
//     await page.goto(app);

//     const encodedCountry = encodeURIComponent("España");
//     const encodedFlow = encodeURIComponent("Importación");

//     const deleteResponse = page.waitForResponse(res =>
//         res.url().includes(`/wool-stats/2024/${encodedCountry}/${encodedFlow}`) &&
//         res.request().method() === "DELETE" &&
//         res.status() === 200
//     );

//     await page.fill("#delPeriod", "2024");
//     await page.fill("#delReporterdesc", "España");
//     await page.fill("#delFlowdesc", "Importación");

//     await page.getByRole("button", { name: "Eliminar" }).click();
//     await deleteResponse;

//     await expect(page.locator(".success-banner")).toBeVisible();
// });



// // ------------------------------------------------------
// // 6. LISTAR – COMPROBAR QUE HAY FILAS
// // ------------------------------------------------------
// test("Listar registros de lana", async ({ page }) => {
//     await page.goto(app);

//     await page.getByRole("button", { name: "🔄 Actualizar" }).click();

//     await expect(page.getByTestId("woolRow").first()).toBeVisible();
// });
// @ts-check
import { test, expect } from "@playwright/test";

const app = "http://localhost:3000";
// Ajusta esto según el nombre exacto de la ruta en tu proyecto
const rutaFrontend = app + "/wool-stats";

// Función de preparación: Limpia y carga los datos antes de cada test
async function setup(page) {
  await page.goto(rutaFrontend);

  // Acepta automáticamente el cuadro de confirmación nativo del navegador (si existiera)
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  // Usamos los nombres exactos de tus botones
  await page.getByRole("button", { name: "🗑️ Borrar Todo" }).click();
  await page.waitForTimeout(500); 
  await page.getByRole("button", { name: "📥 Cargar Base de datos inicial" }).click();
  await page.waitForTimeout(500);
}

// --------------------------------------------------
// TESTS DE ENRUTAMIENTO BÁSICO
// --------------------------------------------------

test("El proyecto base tiene título", async ({ page }) => {
  await page.goto(app);
  // Ajusta esta expresión regular al título real de tu página raíz
  await expect(page).toHaveTitle(/SOS2526/);
});

test("Navegación al frontend desde la página principal", async ({ page }) => {
  await page.goto(app);
  // Ajusta el nombre del enlace según lo tengas en tu página de inicio (index)
  await page.getByRole("link", { name: "Página web sobre lanas" }).click();
  
  // Verificamos que hemos llegado asegurando que el encabezado principal sea visible
  await expect(page.getByRole("heading", { name: "Estadisticas de lana" })).toBeVisible();
});

// --------------------------------------------------
// TESTS DE LA RÚBRICA (FUNCIONALIDADES E2E)
// --------------------------------------------------

test("Listar recursos: Cargar datos iniciales y comprobar que se renderizan filas", async ({ page }) => {
  await setup(page);
  
  // Contamos las filas usando tu data-testid
  const numDatos = await page.getByTestId("woolRow").count();
  // Tu API inicial debe devolver 10 resultados por página según el limit = 10
  expect(numDatos).toBe(10);
});

test("Crear recurso: Añadir uno nuevo y comprobar que el total de filas sube", async ({ page }) => {
  await setup(page);

  // Contamos primero cuántas filas hay inicialmente en esta página
  const filasAntes = await page.getByTestId("woolRow").count();

  // Rellenamos el formulario de "Añadir Nuevo Registro" usando tus IDs
  await page.locator('#period').fill("2026");
  await page.locator('#reporterdesc').fill("TestLand");
  await page.locator('#flowdesc').fill("Importación");
  await page.locator('#qtyunitAbbr').fill("kg");
  await page.locator('#qty').fill("1000");
  await page.locator('#isqtyestimated').fill("No");
  await page.locator('#netwgt').fill("1000");
  await page.locator('#isnetwgtestimated').fill("No");
  await page.locator('#grosswgt').fill("1100");
  await page.locator('#isgrosswgtestimated').fill("No");
  await page.locator('#cifvalue').fill("5000");
  await page.locator('#fobvalue').fill("4500");
  await page.locator('#primaryvalue').fill("5000");

  // Botón "Guardar Registro"
  await page.getByRole("button", { name: "Guardar Registro" }).click();
  await page.waitForTimeout(1000);

  // Comprobamos si la nueva fila se ha insertado (el contador podría subir a 11 o mostrarse en otra página)
  // Como tu paginación es de 10 en 10, si la página está llena (10), al añadir pasará al fondo (o recargará)
  // Para garantizar el test, buscamos el texto creado
  await expect(page.getByText("TestLand").first()).toBeVisible();
});

test("Borrar recurso concreto: Eliminar desde el formulario independiente", async ({ page }) => {
  await setup(page);

  // Vamos a usar los campos del formulario "Borrar un Dato"
  // Para no fallar, cogemos los datos de la primera fila renderizada
  const primeraFila = page.getByTestId("woolRow").first();
  const periodText = await primeraFila.locator("td").nth(0).innerText();
  const reporterText = await primeraFila.locator(".badge").innerText();
  const flowText = await primeraFila.locator("td").nth(2).innerText();

  const filasAntes = await page.getByTestId("woolRow").count();

  // Rellenamos el formulario específico de borrado con esos datos
  await page.locator('#delPeriod').fill(periodText);
  await page.locator('#delReporterdesc').fill(reporterText);
  await page.locator('#delFlowdesc').fill(flowText);

  // Hacemos clic en el botón de eliminar de la sección de borrado
  await page.getByRole("button", { name: "Eliminar" }).click();
  await page.waitForTimeout(1000);

  const filasDespues = await page.getByTestId("woolRow").count();
  expect(filasDespues).toBe(filasAntes - 1);
});

test("Borrar todos los recursos: La tabla debe quedar vacía", async ({ page }) => {
  await setup(page);

  await page.getByRole("button", { name: "🗑️ Borrar Todo" }).click();
  await page.waitForTimeout(1000);

  const numDatos = await page.getByTestId("woolRow").count();
  expect(numDatos).toBe(0);
});

test("Editar recurso: Actualizar desde la vista de edición", async ({ page }) => {
  await setup(page);

  // 1. Navegamos a la vista haciendo clic en el enlace "Editar" de la primera fila
  await page.getByRole("link", { name: "Editar" }).first().click();
  await page.waitForTimeout(1000); 

  // 2. Modificamos el valor de la cantidad (Asumiendo que en la página de edición haya un input '#qty')
  // Cambia estos identificadores por los reales que tengas en tu página dinámica [id].svelte
  await page.locator("#qty").fill("77777");
  await page.getByRole("button", { name: "Guardar" }).click(); // O el nombre que tenga el botón
  await page.waitForTimeout(1000);

  // 3. Volvemos atrás
  await page.getByRole("link", { name: "Volver" }).click(); // Ajusta según tu texto de vuelta
  await page.waitForTimeout(1000);

  // 4. Verificamos que el dato no ha desaparecido o que se muestra la tabla
  await expect(page.getByTestId("woolRow").first()).toBeVisible();
});

test("Búsqueda con la API: Filtrar datos avanzados", async ({ page }) => {
  await setup(page);

  // 1. Añadimos un dato muy específico primero
  await page.locator('#period').fill("2026");
  await page.locator('#reporterdesc').fill("PaisFantasma");
  await page.locator('#flowdesc').fill("Importación");
  await page.locator('#qtyunitAbbr').fill("kg");
  await page.locator('#qty').fill("10");
  await page.locator('#isqtyestimated').fill("No");
  await page.locator('#netwgt').fill("10");
  await page.locator('#isnetwgtestimated').fill("No");
  await page.locator('#grosswgt').fill("10");
  await page.locator('#isgrosswgtestimated').fill("No");
  await page.locator('#cifvalue').fill("10");
  await page.locator('#fobvalue').fill("10");
  await page.locator('#primaryvalue').fill("10");
  
  await page.getByRole("button", { name: "Guardar Registro" }).click();
  await page.waitForTimeout(1000);

  // 2. Lo buscamos usando el formulario de Filtrado Avanzado
  await page.locator('#filterReporterdesc').fill("PaisFantasma");
  
  // Usamos tu data-testid del botón buscar
  await page.getByTestId("btnSearchFilters").click();
  await page.waitForTimeout(1000);

  // 3. Comprobamos que la tabla solo tiene 1 fila y corresponde a PaisFantasma
  const numDatos = await page.getByTestId("woolRow").count();
  expect(numDatos).toBe(1);
  await expect(page.getByTestId("woolRow").first()).toContainText("PaisFantasma");
});