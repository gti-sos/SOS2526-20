<script>
    // @ts-ignore
    let coffees = $state([]);
    let loadStatus = $state(null);
    let loadMessage = $state("");

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

    let API = '/api/v1/coffee-stats';
     let resultStatusCode = $state(0);
    if(dev)
        API = 'http://localhost:3000'+API;

    async function getCoffees(){
        try{
            const res = await fetch(API);
            const data = await res.json();
            coffees = data.data;
        } catch(err){
            return err;
        }
    }

    async function deleteCoffees(){

    //console.log("DELETE "+name);

    const res = await fetch(API,{
      method : "DELETE"
    });
    resultStatusCode = await res.status;
    
    if(resultStatusCode == 200)
      getCoffees();

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
    async function postCoffee(event) {
            event.preventDefault(); // Evita que la página se recargue
            
            try {
                const res = await fetch(API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCoffee)
                });

                if (res.ok) {
                    await getCoffees(); // Refresca la lista
                    // Opcional: Limpiar el formulario
                    Object.keys(newCoffee).forEach(key => newCoffee[key] = (typeof newCoffee[key] === 'string' ? "" : null));
                } else {
                    const errorData = await res.json();
                    alert("Error al añadir: " + (errorData.message || res.statusText));
                }
            } catch (err) {
                console.error("Error en el POST:", err);
            }
    }

</script>

<h2>Coffee Stats</h2>

<section style="margin-bottom: 2em; padding: 1em; border: 1px solid #ccc;">
    <h3>Añadir Nueva Entrada</h3>
    <form onsubmit={postCoffee}>
        <input type="text" placeholder="País" bind:value={newCoffee.country} required />
        <input type="number" placeholder="Año" bind:value={newCoffee.year} required />
        <input type="number" step="any" placeholder="Producción" bind:value={newCoffee.production} required />
        <input type="number" step="any" placeholder="Exportación" bind:value={newCoffee.export} required />
        <input type="number" step="any" placeholder="Consumo doméstico" bind:value={newCoffee.domestic_consumption} required />
        <input type="number" step="any" placeholder="Stock inicial bruto" bind:value={newCoffee.gross_opening_stock} required />
        <input type="text" placeholder="Tipo de café" bind:value={newCoffee.coffee_type} required />
        
        <button type="submit">Añadir Registro</button>
    </form>
</section>

<hr />

<table>
    <thead>
        <tr>
            <th>País</th>
            <th>Tipo</th>
            <th>Año</th>
        </tr>
    </thead>
    <tbody>
        {#each coffees as coffee (`${coffee.country}-${coffee.coffee_type}-${coffee.year}`)}
            <tr>
                <td>{coffee.country}</td>
                <td>{coffee.coffee_type}</td>
                <td>{coffee.year}</td>
            </tr>
        {/each}
    </tbody>
</table>

<div style="margin-top: 1em;">
    <button onclick={getCoffees}>Actualizar Lista</button>
    <button onclick={deleteCoffees} style="color: red;">Borrar Todo</button>
    <button onclick={loadInitialData}>Cargar Datos Iniciales</button>
</div>

{#if loadMessage}
    <p><small>{loadMessage}</small></p>
{/if}