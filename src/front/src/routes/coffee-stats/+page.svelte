<script>
    // @ts-ignore
    let coffees = $state([]);
    let loadStatus = $state(null);
    let loadMessage = $state("");
    let selectedCoffee = $state(null);
    let offset = 0;
    let limit = 10;
    let total = 0;
    
    let searchFilters = $state({
        country: "",
        from_year: null, // Rango de años inicial
        to_year: null,   // Rango de años final
        coffee_type: "",
        production: null,
        export: null,
        domestic_consumption: null,
        gross_opening_stock: null
    });

    let newCoffee = $state({
        country: "",
        year: null,
        production: null,
        export: null,
        domestic_consumption: null,
        gross_opening_stock: null,
        coffee_type: ""
    });
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';

    let API = '/api/v2/coffee-stats';
     let resultStatusCode = $state(0);
    if(dev)
        API = 'http://localhost:3000'+API;

        // --- ESTADO DE NOTIFICACIONES (Svelte 5 Runes) ---
let notificationMessage = $state("");
let notificationType = $state("success"); // Puede ser "success" o "error"
let notificationTimeout = $state(null);

// Función para mostrar mensajes al usuario (desaparecen a los 5 segundos)
function showMessage(message, type = "success") {
    notificationMessage = message;
    notificationType = type;
    
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notificationMessage = "";
    }, 5000);
}

// Función centralizada para manejar errores de la API
async function handleApiError(err, defaultMessage) {
    console.error("Error en API:", err);
    
    // 1. PRIORIDAD MÁXIMA: El mensaje que entra por parámetro
    let userMessage = defaultMessage;

    // 2. Si NO hay mensaje por defecto, evaluamos el tipo de error HTTP
    if (!userMessage && err instanceof Response) {
        const status = err.status;
        
        if (status === 404) {
            userMessage = "No se encontró el recurso. Es posible que no exista o haya sido borrado previamente.";
        } else if (status === 409) {
            userMessage = "Hubo un conflicto: este registro ya existe en el sistema.";
        } else if (status === 400) {
            userMessage = "Los datos introducidos no son válidos. Por favor, revisa el formulario e inténtalo de nuevo.";
        } else if (status === 401 || status === 403) {
            userMessage = "No tienes permisos suficientes o tu sesión ha caducado. Vuelve a iniciar sesión.";
        } else if (status >= 500) {
            userMessage = "Ha ocurrido un problema interno en el servidor. Por favor, inténtalo de nuevo más tarde.";
        }
    }

    // 3. FALLBACK FINAL: Si no hay mensaje por defecto y tampoco es un error HTTP manejado 
    // (por ejemplo, si se cae el internet y el fetch falla antes de recibir respuesta)
    if (!userMessage) {
        userMessage = "Ocurrió un error inesperado de comunicación.";
    }

    // Mostramos el mensaje final en la UI
    showMessage(userMessage, "error");
}


async function getCoffees(newLimit = limit, newOffset = offset, currentFilters = searchFilters) {
        try {
            // Inicializamos el constructor de parámetros para la URL
            const params = new URLSearchParams();

            // Añadir paginación
            params.append('limit', newLimit);
            params.append('offset', newOffset);

            // Iterar sobre el objeto de filtros y añadir solo los que tengan valor
            for (const key in currentFilters) {
                const value = currentFilters[key];
                
                // Ignoramos cadenas vacías, nulos o indefinidos
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, value);
                }
            }

            // Realizar la petición dinámica a la API de cafés
            const res = await fetch(`${API}?${params.toString()}`);
            
            if (!res.ok) throw res; // Lanza el error al catch si hay fallo
            
            const data = await res.json();
            
            // Actualizar variables de estado globales
            coffees = data.data; 
            total = data.total;
            limit = data.limit;
            offset = data.offset;

        } catch (err) {
            handleApiError(err, "No se pudo cargar la lista filtrada de cafés.");
        }
    }

async function deleteAllCoffees() {
    try {
        const res = await fetch(API, { method: "DELETE" });
        if (!res.ok) throw res;

        showMessage("Todos los registros han sido borrados con éxito.");
        await getCoffees();
    } catch (err) {
        handleApiError(err, "Error al intentar borrar todos los registros.");
    }
}

async function loadInitialData() {
    try {
        const res = await fetch(API + '/loadInitialData');
        if (!res.ok) throw res;

        const data = await res.json();
        showMessage(data.message || "Datos iniciales cargados correctamente.");
        await getCoffees();
    } catch (err) {
        handleApiError(err, "No se pudieron cargar los datos iniciales del servidor.");
    }
}

async function postCoffee(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCoffee)
        });

        if (!res.ok) throw res; // Captura 400, 409, 500...

        showMessage("Café añadido exitosamente.");
        await getCoffees(); // Refresca la tabla
        
        // RESETEO DEL FORMULARIO
        newCoffee = {
            country: "", year: null, production: null, export: null,
            domestic_consumption: null, gross_opening_stock: null, coffee_type: ""
        };
    } catch (err) {
        handleApiError(err, "Ocurrió un error al intentar guardar el nuevo café.");
    }
}

async function deleteCoffee(country, coffee_type, year) {
    try {
        const res = await fetch(`${API}/${country}/${coffee_type}/${year}`, {
            method: "DELETE"
        });
        
        if (!res.ok) throw res;

        showMessage(`Registro de ${country} borrado con éxito.`);
        await getCoffees();
    } catch (err) {
        handleApiError(err, `Error al intentar borrar el registro de ${country}.`);
    }
}

async function getSingleCoffee(country, coffee_type, year) {
    try {
        const res = await fetch(`${API}/${country}/${coffee_type}/${year}`, { 
            method: "GET" 
        });
        
        if (!res.ok) throw res;
        
        const data = await res.json();
        selectedCoffee = data;
    } catch (err) {
        selectedCoffee = null;
        handleApiError(err, `No se pudo obtener la información específica de ${country} para el año ${year}.`);
    }
}

        async function putCoffee(country, coffeeType, year, updatedCoffee) {
    try {
        const res = await fetch(`${API}/${country}/${coffeeType}/${year}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCoffee)
        });

        if (!res.ok) throw res;

        const data = await res.json();
        showMessage("Datos del café actualizados correctamente.");
        await getCoffees(); // Refresca tabla 
        
        return data;
    } catch (err) {
        handleApiError(err, `No se pudieron actualizar los datos de ${country}.`);
    }
}

    async function handleDeleteCoffee() {
        const country = document.getElementById("delCountry").value;
        const coffee_type = document.getElementById("delCoffee_type").value;
        const year = document.getElementById("delYear").value;
        deleteCoffee(country, coffee_type, year);
    }

        async function handleGetSingleCoffee() {
        const country = document.getElementById("getSingleCountry").value;
        const coffee_type = document.getElementById("getSingleCoffee_type").value;
        const year = document.getElementById("getSingleYear").value;
        getSingleCoffee(country, coffee_type, year);
    }
    onMount(() => {
        getCoffees();
    });

 async function handlePutCoffee() {
    // 1. Obtener las claves del formulario
    const country = document.getElementById("putCountry").value;
    const coffeeType = document.getElementById("putCoffeeType").value;
    const year = parseInt(document.getElementById("putYear").value);

    // 2. Construir el objeto con los datos actualizados
    const updatedCoffee = {
        country: country,
        year: year,
        production: parseFloat(document.getElementById("putProduction").value),
        export: parseFloat(document.getElementById("putExport").value),
        domestic_consumption: parseFloat(document.getElementById("putDomesticConsumption").value),
        gross_opening_stock: parseFloat(document.getElementById("putGrossOpeningStock").value),
        coffee_type: coffeeType
    };

    // 3. Enviar la petición PUT utilizando la función que definimos antes
    const result = await putCoffee(country, coffeeType, year, updatedCoffee);
    console.log("PUT result:", result);
}
function handlePrimPag() {
        offset = 0;
        getCoffees(limit, offset);
    }

    function handleMasPag() {
        if (offset + limit < total) {
            offset += limit;
            getCoffees(limit, offset);
        }
    }

    function handleMenosPag() {
        if (offset - limit >= 0) {
            offset -= limit;
            getCoffees(limit, offset);
        }
    }

    function handleUlPag() {
        offset = Math.floor((total - 1) / limit) * limit;
        getCoffees(limit, offset);
    }

        // Función para abrir el formulario con los datos de la fila seleccionada
    function startEdit(coffee) {
        // Usamos { ...coffee } para hacer una copia. 
        // Así, si modificamos un número y luego le damos a "Cancelar", la tabla no se queda cambiada.
        selectedCoffee = { ...coffee };
    }

    // Función para cerrar el formulario
    function cancelEdit() {
        selectedCoffee = null;
    }

    // Función que se ejecuta al darle al botón de Guardar
    async function submitEdit(event) {
        event.preventDefault(); // Evitamos que la página se recargue
        
        // Llamamos a TU función putCoffee original
        await putCoffee(
            selectedCoffee.country, 
            selectedCoffee.coffee_type, 
            selectedCoffee.year, 
            selectedCoffee
        );
        
        // Cerramos el formulario después de guardar
        selectedCoffee = null; 
    }
          
          function handleSearch() {
        offset = 0; // Al buscar, siempre queremos empezar desde la primera página
        getCoffees(limit, offset, searchFilters);
    }

    function clearSearch() {
        // Reseteamos todos los filtros
        searchFilters = {
            country: "", from_year: null, to_year: null, coffee_type: "",
            production: null, export: null, domestic_consumption: null, gross_opening_stock: null
        };
        offset = 0;
        getCoffees(); // Volvems a cargar sin filtros
    }
</script>

<div class="container">
    <header>
        <h1>☕ Coffee Statistics</h1>
        <p class="subtitle">Inventario y producción global</p>
    </header>

    <main>

    {#if notificationMessage}
    <div 
        class="notification {notificationType === 'error' ? 'error-banner' : 'success-banner'}"
        role="alert"
    >
        <p>{notificationMessage}</p>
        <button onclick={() => notificationMessage = ''}>✖</button>
    </div>
    {/if}
        <section class="card">
            <h3>+ Añadir Nuevo Registro</h3>
            <form onsubmit={postCoffee} class="grid-form">
                
                <div class="field">
                    <label for="country">País</label>
                    <input id="country" type="text" bind:value={newCoffee.country} placeholder="Ej. Colombia" required />
                </div>

                <div class="field">
                    <label for="year">Año</label>
                    <input id="year" type="number" bind:value={newCoffee.year} required />
                </div>

                <div class="field">
                    <label for="type">Tipo de Café</label>
                    <input id="type" type="text" bind:value={newCoffee.coffee_type} required />
                </div>

                <div class="field">
                    <label for="prod">Producción</label>
                    <input id="prod" type="number" step="any" bind:value={newCoffee.production} required />
                </div>

                <div class="field">
                    <label for="exp">Exportación</label>
                    <input id="exp" type="number" step="any" bind:value={newCoffee.export} required />
                </div>

                <div class="field">
                    <label for="cons">Consumo</label>
                    <input id="cons" type="number" step="any" bind:value={newCoffee.domestic_consumption} required />
                </div>

                <div class="field">
                    <label for="stock">Stock Inicial</label>
                    <input id="stock" type="number" step="any" bind:value={newCoffee.gross_opening_stock} required />
                </div>

                <div class="field full-width">
                    <button type="submit" class="btn-primary">Guardar Registro</button>
                </div>
            </form>
        </section>

        <section class="card">
            <h3>Borrar un Dato</h3>
                <form class="grid-form" id="delForm" onsubmit={e => {e.preventDefault(); handleDeleteCoffee();}}>
                    <div class="field">
                        <label for="delCountry">País:</label>
                        <input type="text" id="delCountry" name="delCountry" required>
                    </div>
                    <div class="field">
                        <label for="delCoffee_type">Tipo de Café:</label>
                        <input type="text" id="delCoffee_type" name="delCoffee_type" required>
                    </div>
                    <div class="field">
                        <label for="delYear">Año:</label>
                        <input type="number" id="delYear" name="delYear" required>
                    </div>
                    <button type="submit" id="delButton" value="submit" class="btn-danger">Eliminar</button>
                </form>
        </section>
                <section class="card">
            <h3>Recuperar un dato específico</h3>
                <form class="grid-form" id="getSingleForm" onsubmit={e => {e.preventDefault(); handleGetSingleCoffee();}}>
                    <div class="field">
                        <label for="getSingleCountry">País:</label>
                        <input type="text" id="getSingleCountry" name="getSingleCountry" required>
                    </div>
                    <div class="field">
                        <label for="getSingleCoffee_type">Tipo de Café:</label>
                        <input type="text" id="getSingleCoffee_type" name="getSingleCoffee_type" required>
                    </div>
                    <div class="field">
                        <label for="getSingleYear">Año:</label>
                        <input type="number" id="getSingleYear" name="getSingleYear" required>
                    </div>
                    <button type="submit" id="delButton" value="submit" class="btn-secondary">Buscar</button>
                </form>
                {#if selectedCoffee}
                    <div class="card">
                        <h4>Resultado</h4>

                        {#each Object.entries(selectedCoffee) as [key, value]}
                            <div class="row">
                                <span class="key">{key}:</span>
                                <span class="value">{value}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
        </section>
        <section class="card">
                <form class="grid-form" id="putForm" onsubmit={e => { e.preventDefault(); handlePutCoffee(); }}>
                    <h3>Actualizar un café</h3>
                    
                    <div class="field">
                        <label for="putCountry">Country (clave):</label>
                        <input type="text" id="putCountry" name="country" required>
                    </div>

                    <div class="field">
                        <label for="putCoffeeType">Coffee Type (clave):</label>
                        <input type="text" id="putCoffeeType" name="coffee_type" required>
                    </div>

                    <div class="field">
                        <label for="putYear">Year (clave):</label>
                        <input type="number" id="putYear" name="year" required>
                    </div>

                    <div class="field">
                        <label for="putProduction">Production:</label>
                        <input type="number" id="putProduction" name="production" required>
                    </div>

                    <div class="field">
                        <label for="putExport">Export:</label>
                        <input type="number" id="putExport" name="export" required>
                    </div>

                    <div class="field">
                        <label for="putDomesticConsumption">Domestic Consumption:</label>
                        <input type="number" id="putDomesticConsumption" name="domestic_consumption" required>
                    </div>

                    <div class="field">
                        <label for="putGrossOpeningStock">Gross Opening Stock:</label>
                        <input type="number" id="putGrossOpeningStock" name="gross_opening_stock" required>
                    </div>

                    <div class="field full-width">
                    <button type="submit" class="btn-primary">Actualizar</button>
                    </div>
                </form>
            
        </section>
        <section class="card">
            <h3>Buscador de Estadísticas de Café</h3>
            <div class="filter-section">
                <div class="grid-form">
                    
                    <div class="field">
                        <label for="filterCountry">País</label>
                        <input id="filterCountry" type="text" bind:value={searchFilters.country} placeholder="Ej: Colombia">
                    </div>
                    
                    <div class="field">
                        <label for="filterType">Tipo de Café</label>
                        <input id="filterType" type="text" bind:value={searchFilters.coffee_type} placeholder="Ej: Robustas">
                    </div>

                    <div class="field">
                        <label for="filterFromYear">Desde (Año)</label>
                        <input id="filterFromYear" type="number" bind:value={searchFilters.from_year} placeholder="Ej: 1990">
                    </div>
                    
                    <div class="field">
                        <label for="filterToYear">Hasta (Año)</label>
                        <input id="filterToYear" type="number" bind:value={searchFilters.to_year} placeholder="Ej: 1991">
                    </div>

                    <div class="field">
                        <label for="filterProd">Producción</label>
                        <input id="filterProd" type="number" step="any" bind:value={searchFilters.production}>
                    </div>
                    
                    <div class="field">
                        <label for="filterExp">Exportación</label>
                        <input id="filterExp" type="number" step="any" bind:value={searchFilters.export}>
                    </div>

                    <div class="field">
                        <label for="filterCons">Consumo Doméstico</label>
                        <input id="filterCons" type="number" step="any" bind:value={searchFilters.domestic_consumption}>
                    </div>
                    
                    <div class="field">
                        <label for="filterStock">Stock Inicial</label>
                        <input id="filterStock" type="number" step="any" bind:value={searchFilters.gross_opening_stock}>
                    </div>
                </div>

                <div class="actions" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick={handleSearch}>🔍 Buscar</button>
                    <button class="btn-secondary" onclick={clearSearch}>Sweep Filtros</button>
                </div>
            </div>
        </section>

        <section class="card">
            <div class="table-header">
                <h3>Listado de Datos</h3>
                <div class="actions">
                    <button onclick={getCoffees} class="btn-secondary">🔄 Actualizar</button>
                    <button onclick={loadInitialData} class="btn-secondary">📥 Cargar Base de datos inicial</button>
                    <button onclick={deleteAllCoffees} class="btn-danger">🗑️ Borrar Todo</button>
                    
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>País</th>
                            <th>Tipo</th>
                            <th>Año</th>
                            <th>Producción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each coffees as coffee (`${coffee.country}-${coffee.coffee_type}-${coffee.year}`)}
                            <tr data-testid="coffeeRow">
                                <td><strong>{coffee.country}</strong></td>
                                <td><span class="badge">{coffee.coffee_type}</span></td>
                                <td>{coffee.year}</td>
                                <td>{coffee.production || 0}</td>
                                <td>
                                    <a 
                                        href="/coffee-stats/{encodeURIComponent(coffee.country)}/{encodeURIComponent(coffee.coffee_type)}/{coffee.year}" 
                                        class="btn-secondary"
                                    >
                                        ✏️ Editar
                                    </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                    <button onclick={handlePrimPag} id="btnPrimeraPag">Primera Página</button>
                    <button onclick={handleMenosPag} id="btnRetroceder">Retroceder Página</button>
                    <button onclick={handleMasPag} id="btnAdelantar">Avanzar página</button>
                    <button onclick={handleUlPag} id="btnUltimaPag">Última Página</button>
            </div>
        </section>
    </main>
</div>

<style>
    :global(body) {
        background-color: #f8f5f2;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #3e2723;
        margin: 0;
        padding: 20px;
    }

    .container {
        max-width: 1000px;
        margin: 0 auto;
    }

    header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 { color: #5d4037; margin-bottom: 0.5rem; }
    .subtitle { color: #8d6e63; margin-top: 0; }

    .card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        margin-bottom: 2rem;
    }

    /* Formulario en Grid */
    .grid-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.2rem;
    }

    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .full-width { grid-column: 1 / -1; }

    label { font-size: 0.85rem; font-weight: bold; color: #6d4c41; }

    input {
        padding: 0.6rem;
        border: 1px solid #d7ccc8;
        border-radius: 6px;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #a1887f;
        box-shadow: 0 0 0 3px rgba(161, 136, 127, 0.2);
    }

    /* Botones */
    button {
        cursor: pointer;
        border: none;
        border-radius: 6px;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        transition: all 0.2s;
    }

    .btn-primary { background: #6d4c41; color: white; width: 100%; }
    .btn-primary:hover { background: #5d4037; }

    .btn-secondary { background: #efebe9; color: #5d4037; }
    .btn-secondary:hover { background: #d7ccc8; }

    .btn-danger { background: #ffebee; color: #c62828; }
    .btn-danger:hover { background: #ffcdd2; }

    /* Tabla */
    .table-header {
        display: flex;
        justify-content: space-between;
        align-coffee_types: center;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .table-container { overflow-x: auto; }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    th {
        background: #fdfaf9;
        padding: 1rem;
        border-bottom: 2px solid #efebe9;
        font-size: 0.9rem;
        text-transform: uppercase;
        color: #8d6e63;
    }

    td { padding: 1rem; border-bottom: 1px solid #efebe9; }

    tr:hover { background-color: #fdfaf9; }

    .badge {
        background: #edeff2;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #455a64;
    }


    /* Estilos básicos de ejemplo para las notificaciones */
    .notification {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .success-banner {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .error-banner {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .notification button {
        background: none;
        border: none;
        cursor: pointer;
        font-weight: bold;
    }
</style>