<script>
    // @ts-ignore
    let spices = $state([]);
    import { dev } from '$app/environment';

    let API = '/api/v1/spice-stats';
    if(dev)
        API = 'http://localhost:3000'+API;

    async function getspices(){
        const res = await fetch(API, {
            method: "GET"
        });
        const data = await res.json();
        spices = data;
    }
</script>

<h2>Spices</h2>

{#each spices as spice (`${spice.area}-${spice.item_code}-${spice.year}`)}
    <div>
        <strong>{spice.item}</strong> — {spice.year}
    </div>
{/each}

<!-- {#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
    <tr>
        <td>{spice.area}</td>
        <td>{spice.item}</td>
        <td>{spice.year}</td>
    </tr>
{/each} -->


<button onclick={getspices}>Refresh</button>