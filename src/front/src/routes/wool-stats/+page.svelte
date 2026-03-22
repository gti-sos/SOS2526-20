<!-- <script>
    // @ts-ignore
    let wools = $state([]);
    import { dev } from '$app/environment';

    let API = '/api/v1/wool-stats';
     let resultStatusCode = $state(0);
    if(dev)
        API = 'http://localhost:3000'+API;

    async function getWools(){
        try{
            const res = await fetch(API);
            const data = await res.json();
            wools = data.data;
        } catch(err){
            return err;
        }
    }


    async function deleteWools(){

    //console.log("DELETE "+name);

    const res = await fetch(API,{
      method : "DELETE"
    });
    resultStatusCode = await res.status;
    
    if(resultStatusCode == 200)
      getWools();

  }
</script>

<h2>Wools</h2>

{#each wools as wool (`${wool.period}-${wool.reporterdesc}-${wool.flowdesc}`)}
    <tr>
        <td>{wool.period}</td>
        <td>{wool.reporterdesc}</td>
        <td>{wool.flowdesc}</td>
    </tr>
{/each}


<button onclick={getWools}>Refresh</button>
<button onclick={deleteWools}>Borrar</button> -->

<script>
    // @ts-ignore
    let wools = $state([]);
    let loadStatus = $state(null);
    let loadMessage = $state("");
    let selectedWool = $state(null);

    let newWool = $state({
        period: null,
        reporterdesc: "",
        flowdesc: "",
        qtyunitAbbr: "",
        qty: null,
        isqtyestimated: "",
        netwgt: null,
        isnetwgtestimated: "",
        grosswgt: null,
        isgrosswgtestimated: "",
        cifvalue: null,
        fobvalue: null,
        primaryvalue: null

    });
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';

    let API = '/api/v1/wool-stats';
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


async function getWools() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw res; // Lanza el error al catch si hay fallo
        const data = await res.json();
        wools = data.data; // Asumo que wools es un $state()

    } catch (err) {
        handleApiError(err, "No se pudo cargar la lista de lanas.");
    }
}

async function deleteAllWools() {
    try {
        const res = await fetch(API, { method: "DELETE" });
        if (!res.ok) throw res;

        showMessage("Todos los registros han sido borrados con éxito.");
        await getWools();
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
        await getWools();
    } catch (err) {
        handleApiError(err, "No se pudieron cargar los datos iniciales del servidor.");
    }
}

async function postWool(event) {
    event.preventDefault(); // Evita que la página se recargue
    
    try {
        const res = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newWool)
        });

        if (!res.ok) throw res; // Captura 400, 409, 500...

        showMessage("Lana añadida exitosamente.");
        await getWools(); // Refresca la tabla
        
        // RESETEO DEL FORMULARIO
        newWool = {
            period: null, reporterdesc: "", flowdesc: "", qtyunitAbbr: "", qty: null, isqtyestimated: "",netwgt: null,
            isnetwgtestimated: "", grosswgt: null, isgrosswgtestimated: "",cifvalue: null,fobvalue: null,primaryvalue: null 
        };
    } catch (err) {
        handleApiError(err, "Ocurrió un error al intentar guardar la nueva lana.");
    }
}

async function deleteCoffee(period, reporterdesc, flowdesc) {
    try {
        const res = await fetch(`${API}/${period}/${reporterdesc}/${flowdesc}`, {
            method: "DELETE"
        });
        
        if (!res.ok) throw res;

        showMessage(`Registro de ${reporterdesc} borrado con éxito.`);
        await getWools();
    } catch (err) {
        handleApiError(err, `Error al intentar borrar el registro de ${reporterdesc}.`);
    }
}

async function getSingleCoffee(period, reporterdesc, flowdesc) {
    try {
        const res = await fetch(`${API}/${period}/${reporterdesc}/${flowdesc}`, { 
            method: "GET" 
        });
        
        if (!res.ok) throw res;
        
        const data = await res.json();
        selectedWool = data;
    } catch (err) {
        selectedWool = null;
        handleApiError(err, `No se pudo obtener la información específica de ${reporterdesc} para el año ${flowdesc}.`);
    }
}

        async function putCoffee(period, reporterdesc, flowdesc, updatedWool) {
    try {
        const res = await fetch(`${API}/${period}/${reporterdesc}/${flowdesc}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedWool)
        });

        if (!res.ok) throw res;

        const data = await res.json();
        showMessage("Datos de la lana actualizados correctamente.");
        await getWools(); // Refresca tabla 
        
        return data;
    } catch (err) {
        handleApiError(err, `No se pudieron actualizar los datos de ${reporterdesc}.`);
    }
}

    async function handleDeleteCoffee() {
        const period = document.getElementById("delPeriod").value;
        const reporterdesc = document.getElementById("delReporterdesc").value;
        const flowdesc = document.getElementById("delFlowdesc").value;
        deleteCoffee(period, reporterdesc, flowdesc);
    }

        async function handleGetSingleCoffee() {
        const period = document.getElementById("getSinglePeriod").value;
        const reporterdesc = document.getElementById("getSingleReporterdesc").value;
        const flowdesc = document.getElementById("getSingleFlowdesc").value;
        getSingleCoffee(period, reporterdesc, flowdesc);
    }
    onMount(() => {
        getWools();
    });

 async function handlePutCoffee() {
    // 1. Obtener las claves del formulario
    const period = parseInt(document.getElementById("putPeriod").value);
    const reporterdesc = document.getElementById("putReporterdesc").value;
    const flowdesc = document.getElementById("putFlowdesc").value;

    // 2. Construir el objeto con los datos actualizados
    const updatedWool = {
        period: period,
        reporterdesc: reporterdesc,
        flowdesc: flowdesc,
        qtyunitAbbr: document.getElementById("putQtyunitAbbr").value,
        qty: parseInt(document.getElementById("putQty").value),
        isqtyestimated: document.getElementById("putIsqtyestimated").value,
        netwgt: parseInt(document.getElementById("putNetwgt").value),
        isnetwgtestimated: document.getElementById("putIsnetwgtestimated").value,
        grosswgt: parseInt(document.getElementById("putGrosswgt").value),
        isgrosswgtestimated: document.getElementById("putIsgrosswgtestimated").value,
        cifvalue: parseInt(document.getElementById("putCifvalue").value),
        fobvalue: parseInt(document.getElementById("putFobvalue").value),
        primaryvalue: number.parseInt(document.getElementById("putPrimaryvalue").value)
    };

    // 3. Enviar la petición PUT utilizando la función que definimos antes
    const result = await putCoffee(period, reporterdesc, flowdesc, updatedWool);
    console.log("PUT result:", result);
}

            
</script>

<div class="container">
    <header>
        <h1>Wool Statistics</h1>
        <p class="subtitle">Gestión de inventario y producción global</p>
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
            <form onsubmit={postWool} class="grid-form">
                
                <div class="field">
                    <label for="period">Año</label>
                    <input id="period" type="number" bind:value={newWool.period} placeholder="Ej. 2014" required />
                </div>

                <div class="field">
                    <label for="reporterdesc">Pais</label>
                    <input id="reporterdesc" type="text" bind:value={newWool.reporterdesc} placeholder="Ej. España" required />
                </div>

                <div class="field">
                    <label for="flowdesc">Importación/Exportación</label>
                    <input id="flowdesc" type="text" bind:value={newWool.flowdesc} placeholder="Ej. Importación" required />
                </div>

                <div class="field">
                    <label for="qtyunitAbbr">Unidad de Medida</label>
                    <input id="qtyunitAbbr" type="text" step="any" bind:value={newWool.qtyunitAbbr} required />
                </div>

                <div class="field">
                    <label for="qty">Cantidad</label>
                    <input id="qty" type="number" step="any" bind:value={newWool.qty} required />
                </div>

                <div class="field">
                    <label for="isqtyestimated">¿Está la cantidad estimada?</label>
                    <input id="isqtyestimated" type="text" step="any" bind:value={newWool.isqtyestimated} required />
                </div>

                <div class="field">
                    <label for="netwgt">Cantidad exacta</label>
                    <input id="netwgt" type="number" step="any" bind:value={newWool.netwgt} required />
                </div>

                <div class="field">
                     <label for="isnetwgtestimated">¿Está la cantidad exacta estimada?</label>
                     <input id="isnetwgtestimated" type="text" step="any" bind:value={newWool.isnetwgtestimated} required />
                </div>
               
                <div class="field">
                     <label for="grosswgt">Peso Bruto</label>
                     <input id="grosswgt" type="number" step="any" bind:value={newWool.grosswgt} required />
                </div>
                  
               <div class="field">
                     <label for="isgrosswgtestimated">¿Está el peso bruto estimado?</label>
                     <input id="isgrosswgtestimated" type="text" step="any" bind:value={newWool.isgrosswgtestimated} required />
               </div>
                 
               <div class="field">
                     <label for="cifvalue">Valor CIF</label>
                     <input id="cifvalue" type="number" step="any" bind:value={newWool.cifvalue} required />
               </div>
               
               <div class="field">
                     <label for="fobvalue">Valor FOB</label>
                     <input id="fobvalue" type="number" step="any" bind:value={newWool.fobvalue} required />
               </div>
   
               <div class="field">
                     <label for="primaryvalue">Valor Primario</label>
                     <input id="primaryvalue" type="number" step="any" bind:value={newWool.primaryvalue} required />
               </div>

               <div class="field full-width">
                    <button type="submit" class="btn-primary">Guardar Registro</button>
                </div>
            </form>
        </section>

        <section class="card">
            <h3>Borrar un Dato</h3>
                <form class="grid-form" id="delForm" onsubmit={e => {e.preventDefault(); handleDeleteWool();}}>
                    <div class="field">
                        <label for="delPeriod">Año:</label>
                        <input type="number" id="delPeriod" name="delPeriod" required>
                    </div>
                    <div class="field">
                        <label for="delReporterdesc">País:</label>
                        <input type="text" id="delReporterdesc" name="delReporterdesc" required>
                    </div>
                    <div class="field">
                        <label for="delFlowdesc">Importación o Exportación:</label>
                        <input type="text" id="delFlowdesc" name="delFlowdesc" required>
                    </div>
                    <button type="submit" id="delButton" value="submit" class="btn-danger">Eliminar</button>
                </form>
        </section>
                <section class="card">
            <h3>Recuperar un dato específico</h3>
                <form class="grid-form" id="getSingleForm" onsubmit={e => {e.preventDefault(); handleGetSingleWool();}}>
                    <div class="field">
                        <label for="getSinglePeriod">Periodo:</label>
                        <input type="number" id="getSinglePeriod" name="getSinglePeriod" required>
                    </div>
                    <div class="field">
                        <label for="getSingleReporterdesc">País:</label>
                        <input type="text" id="getSingleReporterdesc" name="getSingleReporterdesc" required>
                    </div>
                    <div class="field">
                        <label for="getSingleFlowdesc">Importación o Exportación:</label>
                        <input type="text" id="getSingleFlowdesc" name="getSingleFlowdesc" required>
                    </div>
                    <button type="submit" id="delButton" value="submit" class="btn-secondary">Buscar</button>
                </form>
                {#if selectedWool}
                    <div class="card">
                        <h4>Resultado</h4>

                        {#each Object.entries(selectedWool) as [key, value]}
                            <div class="row">
                                <span class="key">{key}:</span>
                                <span class="value">{value}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
        </section>
        <section class="card">
                <form class="grid-form" id="putForm" onsubmit={e => { e.preventDefault(); handlePutWool(); }}>
                    <h3>Actualizar un dato</h3>
                    
                    <div class="field">
                        <label for="putPeriod">Año</label>
                        <input type="number" id="putPeriod" required />
                    </div>

                    <div class="field">
                        <label for="putReporterdesc">Pais</label>
                        <input type="text" id="putReporterdesc" required />
                    </div>

                    <div class="field">
                        <label for="putFlowdesc">Importación/Exportación</label>
                        <input type="text" id="putFlowdesc" required />
                    </div>

                    <div class="field">
                        <label for="putQtyunitAbbr">Unidad de Medida</label>
                        <input type="text" id="putQtyunitAbbr" required />
                    </div>

                    <div class="field">
                        <label for="putQty">Cantidad</label>
                        <input type="number" id="putQty" required />
                    </div>

                    <div class="field">
                        <label for="putIsqtyestimated">¿Está la cantidad estimada?</label>
                        <input type="text" id="putIsqtyestimated" required />
                    </div>

                    <div class="field">
                        <label for="putNetwgt">Cantidad exacta</label>
                        <input type="number" id="putNetwgt" required />
                    </div>

                    <div class="field">
                        <label for="putIsnetwgtestimated">¿Está la cantidad exacta estimada?</label>
                        <input type="text" id="putIsnetwgtestimated" required />
                    </div>
                     
                    <div class="field">
                        <label for="putGrosswgt">Peso Bruto</label>
                        <input type="number" id="putGrosswgt" required />
                    </div>
                        
                    <div class="field">
                        <label for="putIsgrosswgtestimated">¿Está el peso bruto estimado?</label>
                        <input type="text" id="putIsgrosswgtestimated" required />
                    </div>
                     
                    <div class="field">
                        <label for="putCifvalue">Valor CIF</label>
                        <input type="number" id="putCifvalue" required />
                    </div>
                     
                    <div class="field">
                        <label for="putFobvalue">Valor FOB</label>
                        <input type="number" id="putFobvalue" required />
                    </div>
         
                    <div class="field">
                        <label for="putPrimaryvalue">Valor Primario</label>
                        <input type="number" id="putPrimaryvalue" required />
                    </div>

                    <div class="field full-width">
                    <button type="submit" class="btn-primary">Actualizar</button>
                    </div>
                </form>
            
        </section>
        <section class="card">
            <div class="table-header">
                <h3>Listado de Datos</h3>
                <div class="actions">
                    <button onclick={getWools} class="btn-secondary">🔄 Actualizar</button>
                    <button onclick={loadInitialData} class="btn-secondary">📥 Cargar Base de datos inicial</button>
                    <button onclick={deleteAllWools} class="btn-danger">🗑️ Borrar Todo</button>
                    
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Periodo</th>
                            <th>Pais</th>
                            <th>Importacion o exportacion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each wools as wool (`${wool.period}-${wool.reporterdesc}-${wool.flowdesc}`)}
                            <tr>
                                <td><strong>{wool.period}</strong></td>
                                <td><span class="badge">{wool.reporterdesc}</span></td>
                                <td>{wool.flowdesc}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 2rem; color: #888;">
                                    No hay datos disponibles. Haz clic en "Cargar Base".
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
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
        align-wool_types: center;
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