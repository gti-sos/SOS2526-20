<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';

    let API = '/api/v1/spice-stats';
    let resultStatusCode = $state(0);
    let loadStatus = $state(null);
    let loadMessage = $state("");

    if(dev)
        API = 'http://localhost:3000'+API;

    async function getSpices(){
        try{
            const res = await fetch(API);
            const data = await res.json();
            spices = data.data;
        } catch(err){
            return err;
        }
    }

    async function deleteAll(){
        const res = await fetch(API,{
        method : "DELETE"
        });
        resultStatusCode = await res.status;
        
        if(resultStatusCode == 200)
        getSpices();
    }

    async function loadInitialData() {
        try {
            const res = await fetch(API+'/loadInitialData');

            loadStatus = res.status;

            const data = await res.json();
            loadMessage = data.message || data.error || "Sin mensaje";

        } catch (err) {
            loadStatus = 500;
            loadMessage = "Error al conectar con el servidor";
            console.error(err);
        }
    }

    async function deleteSpice(area, item, year){
        const res = await fetch(`${API}/${area}/${item}/${year}`, {
            method: "DELETE"
        })
        resultStatusCode = await res.status;
        if(resultStatusCode == 200)
            getSpices()
    }

    let selectedSpice = $state(null);

    async function getSpice(area, item, year) {
        const res = await fetch(`${API}/${area}/${item}/${year}`);
        if (res.ok) {
            const data = await res.json();
            selectedSpice = data;
        } else {
            selectedSpice = null;
        }
    }

    async function postSpice(domain_code,domain, area_code, area, element_code,item_code, item, year, unit, imp, exp, production, consumption) {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type":  "application/json"
            },
            body: JSON.stringify({ domain_code,domain, area_code, area, element_code, item_code, item, year, unit, import:imp, export:exp, production, consumption })
        });
         resultStatusCode = res.status;

        if (resultStatusCode === 201 || resultStatusCode === 200) {
            getSpices(); // refresca la tabla
        }
    }




    async function putSpice(area, item, year, updatedSpice) {
        const res = await fetch(`${API}/${area}/${item}/${year}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedSpice)
        });

        const data = await res.json();
        resultStatusCode = res.status;

        if (res.ok) {
            getSpices(); // refresca tabla
        }

        return data;
    }








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
        const domain_code   = document.getElementById("domain_code").value;
        const domain        = document.getElementById("domain").value;
        const area_code     = document.getElementById("area_code").value;
        const area          = document.getElementById("area").value;
        const element_code  = document.getElementById("element_code").value;
        const item_code     = document.getElementById("item_code").value;
        const item          = document.getElementById("item").value;
        const year          = document.getElementById("year").value;
        const unit          = document.getElementById("unit").value;
        const imp           = document.getElementById("import").value;
        const exp           = document.getElementById("export").value;
        const production    = document.getElementById("production").value;
        const consumption   = document.getElementById("consumption").value;

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





    onMount(() => {
        getSpices();
    });
</script>



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->



<h2>Spices</h2>

<table>
    <thead>
        <tr>
            <th>Área</th>
            <th>Item</th>
            <th>Año</th>
        </tr>
    </thead>

    <tbody>
        {#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
            <tr>
                <td>{spice.area}</td>
                <td>{spice.item}</td>
                <td>{spice.year}</td>
            </tr>
        {/each}
    </tbody>
</table>



<button onclick={getSpices} id="btnRefresh">Refrescar</button>
<button onclick={deleteAll} id="btnDelAll">Borrar todos los datos</button>
<button onclick={loadInitialData} id="btnLoadAll">Cargar Datos</button>

<div class="formularios">
    <div class="get1">
        <form class="form" id="getForm" onsubmit={e => {e.preventDefault(); handleGetSpice();}}>
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
    <div class="divPostForm">
        <form class="form" id="postForm" onsubmit={e => { e.preventDefault(); handlePostSpice(); }}>
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

    <div class="divDelForm">
        <form class="form" id="delForm" onsubmit={e => {e.preventDefault(); handleDeleteSpice();}}>
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
   <div class="divPutForm">
        <form class="form" id="putForm" onsubmit={e => { e.preventDefault(); handlePutSpice(); }}>
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



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->



<style>
        /* Títulos */
    h2, h4 {
        font-family: sans-serif;
        color: #333;
    }

    /* Formularios alineados */
    .formularios {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    /* Formulario */
    .form {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 6px;
        width: 300px;
        background: #fafafa;
    }

    /* Inputs */
    .labelInput {
        margin-bottom: 0.8rem;
    }

    .labelInput label {
        font-size: 0.9rem;
        margin-bottom: 0.2rem;
    }

    .labelInput input {
        width: 100%;
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    /* Botones */
    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }

    /* Colores de botones */
    #btnRefresh { background: #1e88e5; }
    #btnDelAll { background: #d32f2f; }
    #btnLoadAll { background: #2e7d32; }
    #delButton { background: #d62828; }
    #getButton { background: #1e88e5; }
    #postButton { background: #2e7d32; }
    #putButton { background: #916704; }

    button:hover {
        opacity: 0.85;
    }

        /* Formulario POST en dos columnas */
    #postForm {
        display: grid;
        grid-template-columns: 1fr 1fr; /* dos columnas iguales */
        gap: 1rem;                      /* espacio entre campos */
    }

    /* Cada campo */
    #postForm .labelInput {
        display: flex;
        flex-direction: column;
    }

    /* El botón ocupa las dos columnas */
    #postButton {
        grid-column: span 2;
    }

    .card {
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 6px;
    background: #fafafa;
    width: 280px;
    margin-top: 1rem;
}

.card h4 {
    margin-bottom: 0.8rem;
}

.row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
}

.key {
    font-weight: bold;
    color: #333;
}

.value {
    color: #555;
}
</style>