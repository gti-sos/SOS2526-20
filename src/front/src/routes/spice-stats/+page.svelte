<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';

    let API = '/api/v1/spice-stats';
     let resultStatusCode = $state(0);
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