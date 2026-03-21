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

    async function handleDeleteSpice() {
        const area = document.getElementById("delArea").value;
        const item = document.getElementById("delItem").value;
        const year = document.getElementById("delYear").value;
        deleteSpice(area, item, year);
    }

    onMount(() => {
        getSpices();
    });
</script>



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->



<h2>Spices</h2>

{#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
    <tr>
        <td>{spice.area}</td>
        <td>{spice.item}</td>
        <td>{spice.year}</td>
    </tr>
{/each}


<button onclick={getSpices} id="btnRefresh">Refrescar</button>
<button onclick={deleteAll} id="btnDelAll">Borrar todos los datos</button>
<button onclick={loadInitialData} id="btnLoadAll">Cargar Datos</button>

<h4>Borrar un picante</h4>
<form class="form" id="delForm" onsubmit={e => {e.preventDefault(); handleDeleteSpice();}}>
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



<!-- =========================================================================================== -->
<!-- =========================================================================================== -->



<style>
    /* Contenedor general */
h2, h4 {
    font-family: system-ui, sans-serif;
    margin-top: 1.5rem;
    color: #333;
}

/* Tabla de spices */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    font-family: system-ui, sans-serif;
}

td, th {
    padding: 0.6rem 1rem;
    border-bottom: 1px solid #ddd;
}

tr:hover {
    background-color: #f7f7f7;
}

/* Botones generales */
button {
    padding: 0.6rem 1.2rem;
    margin: 0.4rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-family: system-ui, sans-serif;
    transition: background 0.2s ease;
}

button:hover {
    opacity: 0.85;
}

/* Botón azul: Refrescar */
#btnRefresh {
    background-color: #1e88e5; /* azul */
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.2s ease;
}

#btnRefresh:hover {
    background-color: #1565c0;
}

/* Botón rojo: Borrar todos */
#btnDelAll {
    background-color: #d32f2f; /* rojo */
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.2s ease;
}

#btnDelAll:hover {
    background-color: #b71c1c;
}

/* Botón verde: Cargar datos */
#btnLoadAll {
    background-color: #2e7d32; /* verde */
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.2s ease;
}

#btnLoadAll:hover {
    background-color: #1b5e20;
}

button#delButton {
    background-color: #d62828;
    color: white;
    font-weight: bold;
}

button#delButton:hover {
    background-color: #b71d1d;
}

/* Formulario */
form.form {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    width: 320px;
    margin-top: 1rem;
    font-family: system-ui, sans-serif;
}

.labelInput {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.labelInput label {
    margin-bottom: 0.3rem;
    font-weight: 600;
    color: #444;
}

.labelInput input {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.labelInput input:focus {
    outline: none;
    border-color: #0077cc;
    box-shadow: 0 0 0 2px rgba(0, 119, 204, 0.2);
}

</style>