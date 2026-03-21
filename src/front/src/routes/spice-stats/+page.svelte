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
    <div class="divPostForm">
        <form class="form-horizontal" id="postForm" onsubmit={e => { e.preventDefault(); handlePostSpice(); }}>
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
   <div class="divPutForm">
        <form class="form-horizontal" id="putForm" onsubmit={e => { e.preventDefault(); handlePutSpice(); }}>
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

body {
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
    grid-template-columns: 1fr;
    gap: 40px; /* más espacio entre formularios */
    margin-top: 40px;
}

/* ---------------------- */
/* FORMULARIOS GENERALES */
/* ---------------------- */

.form {
    background: #fff8ef;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    border-left: 6px solid #e67e22;
}

.form h4 {
    margin-top: 0;
    color: #c0392b;
    text-shadow: 1px 1px 0 #fff;
}

.labelInput {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

.labelInput label {
    font-weight: bold;
    margin-bottom: 4px;
}

.labelInput input {
    padding: 8px;
    border: 2px solid #e6c9a8;
    border-radius: 6px;
    background: #fff;
    transition: 0.2s;
}

.labelInput input:focus {
    border-color: #e67e22;
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
    border-left: 6px solid #27ae60;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
}

.card h4 {
    margin-top: 0;
    color: #27ae60;
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #eee;
}

.row:last-child {
    border-bottom: none;
}

.key {
    font-weight: bold;
    color: #5a3e2b;
}

.value {
    color: #c0392b;
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
    border-left: 6px solid #e67e22;
    width: fit-content;
}

.form-horizontal .field {
    display: flex;
    flex-direction: column;
}

.form-horizontal label {
    font-weight: bold;
    margin-bottom: 4px;
    color: #5a3e2b;
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
    border-color: #e67e22;
    outline: none;
    box-shadow: 0 0 5px rgba(230,126,34,0.5);
}

.form-horizontal button {
    background: #c0392b;
    height: 42px;
}

.form-horizontal button:hover {
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