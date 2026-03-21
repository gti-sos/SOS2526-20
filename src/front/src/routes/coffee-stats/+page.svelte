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
                    await getCoffees(); // Refresca la tabla
                    
                    // RESETEO DEL FORMULARIO:
                    // En JS, simplemente asignamos un objeto nuevo con valores vacíos
                    newCoffee = {
                        country: "",
                        year: null,
                        production: null,
                        export: null,
                        domestic_consumption: null,
                        gross_opening_stock: null,
                        coffee_type: ""
                    };
                } else {
                    const errorData = await res.json();
                    alert("Error al añadir: " + (errorData.message || res.statusText));
                }
            } catch (err) {
                console.error("Error en el POST:", err);
            }
    }

</script>

<div class="container">
    <header>
        <h1>☕ Coffee Statistics</h1>
        <p class="subtitle">Gestión de inventario y producción global</p>
    </header>

    <main>
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
            <div class="table-header">
                <h3>Listado de Datos</h3>
                <div class="actions">
                    <button onclick={getCoffees} class="btn-secondary">🔄 Actualizar</button>
                    <button onclick={loadInitialData} class="btn-secondary">📥 Cargar Base</button>
                    <button onclick={deleteCoffees} class="btn-danger">🗑️ Borrar Todo</button>
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
                            <tr>
                                <td><strong>{coffee.country}</strong></td>
                                <td><span class="badge">{coffee.coffee_type}</span></td>
                                <td>{coffee.year}</td>
                                <td>{coffee.production || 0} bags</td>
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

    {#if loadMessage}
        <footer class="toast">
            {loadMessage}
        </footer>
    {/if}
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
        align-items: center;
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

    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
</style>