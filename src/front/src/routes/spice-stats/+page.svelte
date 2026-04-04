<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';

    let API = '/api/v2/spice-stats';
    let resultStatusCode = $state(0);
    let loadStatus = $state(null);
    let loadMessage = $state("");
    let offset = 0;
    let limit = 10;
    let total = 0;

    if (dev)
        API = 'http://localhost:3000' + API;

    // --- ESTADO DE NOTIFICACIONES ---
    let notificationMessage = $state("");
    let notificationType = $state("success");
    let notificationTimeout = $state(null);

    function showMessage(message, type = "success") {
        notificationMessage = message;
        notificationType = type;

        if (notificationTimeout) clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            notificationMessage = "";
        }, 5000);
    }

    // --- MANEJO CENTRALIZADO DE ERRORES ---
    async function handleApiError(err, defaultMessage) {
        console.error("Error en API:", err);
        let userMessage = defaultMessage;

        if (err instanceof Response) {
            const status = err.status;

            let backendMessage = "";
            try {
                const data = await err.json();
                backendMessage = data.message || data.error || "";
            } catch (e) {}

            if (status === 404) {
                userMessage = backendMessage || "No se encontró el recurso solicitado.";
            } else if (status === 409) {
                userMessage = backendMessage || "Este registro ya existe en el sistema.";
            } else if (status === 400) {
                userMessage = backendMessage || "Los datos introducidos no son válidos.";
            } else if (status >= 500) {
                userMessage = "Error interno del servidor. Inténtalo más tarde.";
            } else {
                userMessage = backendMessage || defaultMessage;
            }
        }

        showMessage(userMessage, "error");
    }

    

    async function getSpices(newLimit = limit, newOffset = offset) {
        try {
            const res = await fetch(`${API}?limit=${newLimit}&offset=${newOffset}`);
            if (!res.ok) throw res;

            const data = await res.json();

            spices = data.data;
            total = data.total;

            // Actualizamos los valores globales
            limit = data.limit;
            offset = data.offset;

        } catch (err) {
            handleApiError(err, "No se pudo cargar la lista de picantes.");
        }
    }


    async function deleteAll() {
        try {
            const res = await fetch(API, { method: "DELETE" });
            if (!res.ok) throw res;

            showMessage("Todos los registros han sido eliminados.");
            getSpices();
        } catch (err) {
            handleApiError(err, "Error al intentar borrar todos los registros.");
        }
    }

    async function loadInitialData() {
        try {
            const res = await fetch(API + '/loadInitialData');
            if (!res.ok) throw res;

            const data = await res.json();
            loadStatus = res.status;
            loadMessage = data.message || "Datos iniciales cargados correctamente.";

            showMessage(loadMessage);
            getSpices();
        } catch (err) {
            loadStatus = 500;
            loadMessage = "No se pudieron cargar los datos iniciales.";
            handleApiError(err, loadMessage);
        }
    }

    async function deleteSpice(area, item, year) {
        try {
            const res = await fetch(`${API}/${area}/${item}/${year}`, {
                method: "DELETE"
            });

            if (!res.ok) throw res;

            showMessage(`Registro de ${item} en ${area} eliminado.`);
            getSpices();
        } catch (err) {
            handleApiError(err, `Error al intentar borrar el registro de ${item}.`);
        }
    }

    let selectedSpice = $state(null);

    async function getSpice(area, item, year) {
        try {
            const res = await fetch(`${API}/${area}/${item}/${year}`);
            if (!res.ok) throw res;

            const data = await res.json();
            selectedSpice = data;
        } catch (err) {
            selectedSpice = null;
            handleApiError(err, `No se pudo obtener el registro de ${item} (${year}).`);
        }
    }

    async function postSpice(domain_code, domain, area_code, area, element_code, item_code, item, year, unit, imp, exp, production, consumption) {
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain_code, domain, area_code, area, element_code,
                    item_code, item, year, unit, import: imp, export: exp,
                    production, consumption
                })
            });

            if (!res.ok) throw res;

            showMessage("Picante añadido correctamente.");
            getSpices();
        } catch (err) {
            handleApiError(err, "No se pudo añadir el nuevo picante.");
        }
    }

    async function putSpice(area, item, year, updatedSpice) {
        try {
            const res = await fetch(`${API}/${area}/${item}/${year}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSpice)
            });

            if (!res.ok) throw res;

            const data = await res.json();
            showMessage("Datos actualizados correctamente.");
            getSpices();

            return data;
        } catch (err) {
            handleApiError(err, `No se pudieron actualizar los datos de ${item}.`);
        }
    }

    // --- HANDLERS DE FORMULARIO ---

    async function handleDeleteSpice() {
        const area = document.getElementById("delArea").value;
        const item = document.getElementById("delItem").value;
        const year = document.getElementById("delYear").value;
        deleteSpice(area, item, year);
    }

    async function handleGetSpice() {
        const area = document.getElementById("getArea").value;
        const item = document.getElementById("getItem").value;
        const year = document.getElementById("getYear").value;
        getSpice(area, item, year);
    }

    async function handlePostSpice() {
        const domain_code   = Number(document.getElementById("domain_code").value);
        const domain        = document.getElementById("domain").value.trim();
        const area_code     = Number(document.getElementById("area_code").value);
        const area          = document.getElementById("area").value.trim().toLowerCase();
        const element_code  = Number(document.getElementById("element_code").value);
        const item_code     = Number(document.getElementById("item_code").value);
        const item          = document.getElementById("item").value.trim().toLowerCase();
        const year          = Number(document.getElementById("year").value);
        const unit          = Number(document.getElementById("unit").value);
        const imp           = Number(document.getElementById("import").value);
        const exp           = Number(document.getElementById("export").value);
        const production    = Number(document.getElementById("production").value);
        const consumption   = Number(document.getElementById("consumption").value);

        postSpice(
            domain_code, domain, area_code, area, element_code,
            item_code, item, year, unit, imp, exp, production, consumption
        );
    }

    async function handlePutSpice() {
        const area = document.getElementById("putArea").value;
        const item = document.getElementById("putItem").value;
        const year = parseInt(document.getElementById("putYear").value);

        const updatedSpice = {
            domain_code: document.getElementById("put_domain_code").value,
            domain: document.getElementById("put_domain").value,
            area_code: document.getElementById("put_area_code").value,
            area: area,
            element_code: document.getElementById("put_element_code").value,
            item_code: document.getElementById("put_item_code").value,
            item: item,
            year: year,
            unit: document.getElementById("put_unit").value,
            import: document.getElementById("put_import").value,
            export: document.getElementById("put_export").value,
            production: document.getElementById("put_production").value,
            consumption: document.getElementById("put_consumption").value
        };

        const result = await putSpice(area, item, year, updatedSpice);
        console.log("PUT result:", result);
    }

    function handlePrimPag() {
        offset = 0;
        getSpices(limit, offset);
    }

    function handleMasPag() {
        if (offset + limit < total) {
            offset += limit;
            getSpices(limit, offset);
        }
    }

    function handleMenosPag() {
        if (offset - limit >= 0) {
            offset -= limit;
            getSpices(limit, offset);
        }
    }

    function handleUlPag() {
        offset = Math.floor((total - 1) / limit) * limit;
        getSpices(limit, offset);
    }





    onMount(() => {
        getSpices();
    });
</script>



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->


<svelte:head>
    <title>Picantes</title>
</svelte:head>

<div class="container">
    <h2>Picantes</h2>

    <button onclick={handlePrimPag} id="btnPrimeraPag">Primera Página</button>
    <button onclick={handleMenosPag} id="btnRetroceder">Retroceder Página</button>
    <button onclick={handleMasPag} id="btnAdelantar">Avanzar página</button>
    <button onclick={handleUlPag} id="btnUltimaPag">Última Página</button>
    <table>
        <thead>
            <tr>
                <th>Área</th>
                <th>Item</th>
                <th>Año</th>
                <th>Importaciones</th>
                <th>Exportaciones</th>
                <th>Producción</th>
                <th>Consumo</th>
            </tr>
        </thead>

        <tbody>
            {#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
                <tr data-testid="spiceRow">
                    <td>{spice.area}</td>
                    <td>{spice.item}</td>
                    <td>{spice.year}</td>
                    <td>{spice.import}</td>
                    <td>{spice.export}</td>
                    <td>{spice.production}</td>
                    <td>{spice.consumption}</td>
                    <td>
                        <a 
                            href="/spice-stats/{encodeURIComponent(spice.area)}/{encodeURIComponent(spice.item)}/{spice.year}" 
                            style="text-decoration: none; background: #e67e22; color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.9em;"
                        >
                            ✏️ Editar
                        </a>
                    </td>
                </tr>
                
            {:else}
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: #888;">
                        No hay datos disponibles. Haz clic en "Cargar Datos".
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>



    <button onclick={() => getSpices(limit, offset)} id="btnRefresh">Refrescar</button>
    <button onclick={deleteAll} id="btnDelAll">Borrar todos los datos</button>
    <button onclick={loadInitialData} id="btnLoadAll">Cargar Datos</button>

    <div class="formularios">
        <div class="get1">
            <form class="form-horizontal" id="getForm" onsubmit={e => {e.preventDefault(); handleGetSpice();}}>
                <h4>Conseguir un picante</h4>
                <div class="labelInput">
                    <label for="getArea">Área:</label>
                    <input type="text" id="getArea" name="getArea" required>
                </div>
                <div class="labelInput">
                    <label for="getItem">Item:</label>
                    <input type="text" id="getItem" name="getItem" required>
                </div>
                <div class="labelInput">
                    <label for="getYear">Año:</label>
                    <input type="number" id="getYear" name="getYear" required>
                </div>
                <button type="submit" id="getButton" value="submit">Obtener</button>
            </form>
            {#if selectedSpice}
                <div class="card">
                    <h4>Resultado</h4>

                    {#each Object.entries(selectedSpice) as [key, value]}
                        <div class="row">
                            <span class="key">{key}:</span>
                            <span class="value">{value}</span>
                        </div>
                    {/each}
                </div>
            {/if}


        </div>



        <div class="divDelForm">
            <form class="form-horizontal" id="delForm" onsubmit={e => {e.preventDefault(); handleDeleteSpice();}}>
                <h4>Borrar un picante</h4>
                <div class="labelInput">
                    <label for="delArea">Área:</label>
                    <input type="text" id="delArea" name="delArea" required>
                </div>
                <div class="labelInput">
                    <label for="delItem">Item:</label>
                    <input type="text" id="delItem" name="delItem" required>
                </div>
                <div class="labelInput">
                    <label for="delYear">Año:</label>
                    <input type="datetime" id="delYear" name="delYear" required>
                </div>
                <button type="submit" id="delButton" value="submit">Eliminar</button>
            </form>
        </div>



        <div class="divPostForm">
            <form class="form-horizontal-2" id="postForm" onsubmit={e => { e.preventDefault(); handlePostSpice(); }}>
                <h4>Añadir un picante</h4>

                <div class="labelInput">
                    <label for="domain_code">Domain Code:</label>
                    <input type="number" id="domain_code" name="domain_code" required>
                </div>

                <div class="labelInput">
                    <label for="domain">Domain:</label>
                    <input type="text" id="domain" name="domain" required>
                </div>

                <div class="labelInput">
                    <label for="area_code">Area Code:</label>
                    <input type="number" id="area_code" name="area_code" required>
                </div>

                <div class="labelInput">
                    <label for="area">Area:</label>
                    <input type="text" id="area" name="area" required>
                </div>

                <div class="labelInput">
                    <label for="element_code">Element Code:</label>
                    <input type="number" id="element_code" name="element_code" required>
                </div>

                <div class="labelInput">
                    <label for="item_code">Item Code:</label>
                    <input type="number" id="item_code" name="item_code" required>
                </div>

                <div class="labelInput">
                    <label for="item">Item:</label>
                    <input type="text" id="item" name="item" required>
                </div>

                <div class="labelInput">
                    <label for="year">Año:</label>
                    <input type="number" id="year" name="year" required>
                </div>

                <div class="labelInput">
                    <label for="unit">Unidad:</label>
                    <input type="number" id="unit" name="unit" required>
                </div>

                <div class="labelInput">
                    <label for="import">Importación:</label>
                    <input type="number" id="import" name="import" required>
                </div>

                <div class="labelInput">
                    <label for="export">Exportación:</label>
                    <input type="number" id="export" name="export" required>
                </div>

                <div class="labelInput">
                    <label for="production">Producción:</label>
                    <input type="number" id="production" name="production" required>
                </div>

                <div class="labelInput">
                    <label for="consumption">Consumo:</label>
                    <input type="number" id="consumption" name="consumption" required>
                </div>

                <button type="submit" id="postButton">Añadir</button>
            </form>
        </div>



        <div class="divPutForm">
            <form class="form-horizontal-2" id="putForm" onsubmit={e => { e.preventDefault(); handlePutSpice(); }}>
                <h4>Actualizar un picante</h4>
                <div class="labelInput">
                    <label for="putArea">Área (clave):</label>
                    <input type="text" id="putArea" name="putArea" required>
                </div>

                <div class="labelInput">
                    <label for="putItem">Item (clave):</label>
                    <input type="text" id="putItem" name="putItem" required>
                </div>

                <div class="labelInput">
                    <label for="putYear">Año (clave):</label>
                    <input type="number" id="putYear" name="putYear" required>
                </div>

                <div class="labelInput">
                    <label for="put_domain_code">Domain Code:</label>
                    <input type="number" id="put_domain_code" name="domain_code" required>
                </div>

                <div class="labelInput">
                    <label for="put_domain">Domain:</label>
                    <input type="text" id="put_domain" name="domain" required>
                </div>

                <div class="labelInput">
                    <label for="put_area_code">Area Code:</label>
                    <input type="number" id="put_area_code" name="area_code" required>
                </div>

                <div class="labelInput">
                    <label for="put_element_code">Element Code:</label>
                    <input type="number" id="put_element_code" name="element_code" required>
                </div>

                <div class="labelInput">
                    <label for="put_item_code">Item Code:</label>
                    <input type="number" id="put_item_code" name="item_code" required>
                </div>

                <div class="labelInput">
                    <label for="put_unit">Unidad:</label>
                    <input type="number" id="put_unit" name="unit" required>
                </div>

                <div class="labelInput">
                    <label for="put_import">Importación:</label>
                    <input type="number" id="put_import" name="import" required>
                </div>

                <div class="labelInput">
                    <label for="put_export">Exportación:</label>
                    <input type="number" id="put_export" name="export" required>
                </div>

                <div class="labelInput">
                    <label for="put_production">Producción:</label>
                    <input type="number" id="put_production" name="production" required>
                </div>

                <div class="labelInput">
                    <label for="put_consumption">Consumo:</label>
                    <input type="number" id="put_consumption" name="consumption" required>
                </div>

                <button type="submit" id="putButton">Actualizar</button>
            </form>
        </div>
    </div>

    {#if notificationMessage}
        <div 
            class="notification {notificationType === 'error' ? 'error-banner' : 'success-banner'}"
            role="alert"
        >
            <p>{notificationMessage}</p>
            <button onclick={() => notificationMessage = ''}>✖</button>
        </div>
    {/if}
</div>



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->



<style>
    /* Paleta de colores:
   Rojo picante: #c0392b
   Naranja especia: #e67e22
   Arena cálida: #f5e6c8
   Marrón oscuro: #5a3e2b
   Verde hoja: #27ae60
*/

/* ---------------------- */
/* ESTILO GENERAL */
/* ---------------------- */

.body {
    font-family: "Segoe UI", sans-serif;
    background: #f5e6c8;
    margin: 0;
    padding: 20px;
    color: #5a3e2b;
}



h2 {
    text-align: center;
    color: #c0392b;
    font-size: 2rem;
    margin-bottom: 20px;
    text-shadow: 1px 1px 0 #fff;
}

/* ---------------------- */
/* TABLA */
/* ---------------------- */

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    background: #fff8ef;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}

thead {
    background: #c0392b;
    color: white;
}

th, td {
    padding: 12px 15px;
    text-align: left;
}

tbody tr:nth-child(even) {
    background: #fcefdc;
}

tbody tr:hover {
    background: #f9d9b3;
    cursor: pointer;
}

/* ---------------------- */
/* BOTONES */
/* ---------------------- */

button {
    background: #e67e22;
    border: none;
    padding: 10px 18px;
    margin: 5px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background: #c0392b;
    transform: scale(1.05);
}

#btnDelAll {
    background: #c0392b;
}

#btnDelAll:hover {
    background: #922b21;
}

/* ---------------------- */
/* CONTENEDOR DE FORMULARIOS */
/* ---------------------- */

.formularios {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
}


/* ---------------------- */
/* FORMULARIOS GENERALES */
/* ---------------------- */

.labelInput {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

.labelInput label {
    font-weight: bold;
    margin-bottom: 4px;
    color: #5a3e2b; /* marrón oscuro */
}

.labelInput input {
    padding: 8px;
    border: 2px solid #e6c9a8;
    border-radius: 6px;
    background: #fff;
    transition: 0.2s;
}

.labelInput input:focus {
    border-color: #e67e22; /* naranja especia */
    outline: none;
    box-shadow: 0 0 5px rgba(230,126,34,0.5);
}

/* ---------------------- */
/* TARJETA DE RESULTADO */
/* ---------------------- */

.card {
    margin-top: 15px;
    padding: 15px;
    background: #fff;
    border-left: 6px solid #27ae60; /* verde hoja */
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}

.card h4 {
    margin-top: 0;
    color: #27ae60; /* verde hoja */
}

.key {
    font-weight: bold;
    color: #5a3e2b; /* marrón oscuro */
}

.value {
    color: #c0392b; /* rojo picante */
    font-weight: bold;
}

/* ---------------------- */
/* FORMULARIO HORIZONTAL (GET / DELETE) */
/* ---------------------- */

.form-horizontal {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    background: #fff8ef;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    border-left: 6px solid #e67e22; /* naranja especia */
    width: fit-content;
}

.form-horizontal label {
    font-weight: bold;
    margin-bottom: 4px;
    color: #5a3e2b; /* marrón oscuro */
}

.form-horizontal input {
    padding: 8px;
    border: 2px solid #e6c9a8;
    border-radius: 6px;
    background: #fff;
    width: 160px;
    transition: 0.2s;
}

.form-horizontal input:focus {
    border-color: #e67e22; /* naranja especia */
    outline: none;
    box-shadow: 0 0 5px rgba(230,126,34,0.5);
}

.form-horizontal button {
    background: #c0392b; /* rojo picante */
    height: 42px;
}

.form-horizontal button:hover {
    background: #922b21;
}

/* ---------------------- */
/* FORMULARIO HORIZONTAL 2 (GET / DELETE) CON GRID */
/* ---------------------- */

.form-horizontal-2 {
    display: grid;
    grid-template-columns: repeat(3, auto); 
    grid-auto-rows: auto;
    gap: 20px 25px;
    background: #fff8ef;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    border-left: 6px solid #e67e22; 
    width: fit-content;
}

.form-horizontal-2 label {
    font-weight: bold;
    margin-bottom: 4px;
    color: #5a3e2b; /* marrón oscuro */
}

.form-horizontal-2 input {
    padding: 8px;
    border: 2px solid #e6c9a8;
    border-radius: 6px;
    background: #fff;
    width: 160px;
    transition: 0.2s;
}

.form-horizontal-2 input:focus {
    border-color: #e67e22; /* naranja especia */
    outline: none;
    box-shadow: 0 0 5px rgba(230,126,34,0.5);
}

.form-horizontal-2 button {
    background: #c0392b; /* rojo picante */
    height: 42px;
    grid-column: 1 / -1; /* botón ocupa toda la fila */
    justify-self: start;
}

.form-horizontal-2 button:hover {
    background: #922b21;
}


/* ---------------------- */
/* FORMULARIOS GRANDES (POST / PUT) */
/* ---------------------- */

.form-grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px 25px;
    margin-top: 15px;
}

.form-grid-2 button {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 10px;
}


</style>