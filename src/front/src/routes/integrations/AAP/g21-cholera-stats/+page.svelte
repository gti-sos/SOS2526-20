<script>
    import { onMount } from 'svelte';

    let choleraData = $state([]);

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
                    <th>País</th>
                    <th>Año</th>
                    <th>Casos Reportados</th>
                    <th>Muertes reportadas</th>
                    <th>Ratio de mortalidad</th>
                    <th>Región</th>
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


<style>
    /* ---------------------- */
    /* TABLA DE DATOS DE CÓLERA */
    /* ---------------------- */

    #contenedor table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 25px;
        background: #fff8ef;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    }

    #contenedor thead {
        background: #c0392b; /* rojo picante */
        color: white;
    }

    #contenedor th, 
    #contenedor td {
        padding: 12px 15px;
        text-align: left;
        color: #5a3e2b; /* marrón oscuro */
    }

    #contenedor tbody tr:nth-child(even) {
        background: #fcefdc; /* arena cálida */
    }

    #contenedor tbody tr:hover {
        background: #f9d9b3; /* naranja suave */
        cursor: pointer;
    }

    /* Ajuste opcional: bordes suaves */
    #contenedor td {
        border-bottom: 1px solid #e6c9a8;
    }

</style>