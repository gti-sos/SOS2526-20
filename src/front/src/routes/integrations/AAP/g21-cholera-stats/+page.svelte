<script>
    import { onMount } from 'svelte';

    let choleraData = [];

    onMount(async () => {
        const response = await fetch("https://soporte-sos.onrender.com/api/v1/cholera-stats/", {
            method: 'GET'
        });

        choleraData = await response.json();
    });
</script>

<div class="container" id="contenedor">
    {#if choleraData.length > 0}
        <table border="1">
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Year</th>
                    <th>Reported Cases</th>
                    <th>Reported Deaths</th>
                    <th>Fatality Rate</th>
                    <th>WHO Region</th>
                </tr>
            </thead>
            <tbody>
                {#each choleraData as item}
                    <tr>
                        <td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.reportedCases}</td>
                        <td>{item.reportedDeaths}</td>
                        <td>{item.fatalityRate}</td>
                        <td>{item.whoRegion}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>Cargando datos...</p>
    {/if}
</div>
