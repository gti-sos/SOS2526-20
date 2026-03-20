<script>
    // @ts-ignore
    let spices = $state([]);

    async function getspices(){
        const res = await fetch("http://localhost:3000/api/v1/spice-stats/", {
            method: "GET"
        });
        const data = await res.json();
        spices = data;
    }
</script>

<p>Spices</p>

{#each spices as spice (`${spice.area}-${spice.item}-${spice.year}`)}
    <tr>
        <td>{spice.area}</td>
        <td>{spice.item}</td>
        <td>{spice.year}</td>
    </tr>
{/each}


<button onclick={getspices}>Refresh</button>