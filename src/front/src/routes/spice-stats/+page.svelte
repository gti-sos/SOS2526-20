<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';

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

    async function deleteSpices(){
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
</script>

<h2>Spices</h2>

{#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
    <tr>
        <td>{spice.area}</td>
        <td>{spice.item}</td>
        <td>{spice.year}</td>
    </tr>
{/each}


<button onclick={getSpices}>Refresh</button>
<button onclick={deleteSpices}>Borrar</button>
<button onclick={loadInitialData}>Cargar Datos</button>