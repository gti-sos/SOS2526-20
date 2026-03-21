<script>
    // @ts-ignore
    let coffees = $state([]);
    let loadStatus = $state(null);
    let loadMessage = $state("");
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
</script>

<h2>Coffee</h2>

{#each coffees as coffee (`${coffee.country}-${coffee.coffee_type}-${coffee.year}`)}
    <tr>
        <td>{coffee.country}</td>
        <td>{coffee.coffee_type}</td>
        <td>{coffee.year}</td>
    </tr>
{/each}


<button onclick={getCoffees}>Refresh</button>
<button onclick={deleteCoffees}>Borrar</button>
<button onclick={loadInitialData}>Cargar Datos</button>
