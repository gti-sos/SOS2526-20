<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';

    let API = '/api/v1/spice-stats';
    if(dev)
        API = 'http://localhost:3000'+API;

    async function getspices(){
        try{
            const res = await fetch(API, {
                method: "GET"
            });
            if (!res.ok) {
				return;
			}
            const data = await res.json();
            spices = data;
        } catch(err){
            return err;
        }
    }
</script>

<h2>Spices</h2>

{spices}

<!-- {#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
    <tr>
        <td>{spice.area}</td>
        <td>{spice.item}</td>
        <td>{spice.year}</td>
    </tr>
{/each} -->


<button onclick={getspices}>Refresh</button>