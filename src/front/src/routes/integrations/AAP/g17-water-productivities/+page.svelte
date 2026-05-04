<script>
    import { onMount } from 'svelte';

    let waterData = $state([]);

    onMount(async () => {
        
        const response = await fetch("https://sos2526-17.onrender.com/api/v1/water-productivities", {
            method: 'GET'
        });

        waterData = await response.json();
    });
</script>

<div class="container" id="contenedor">
    {#if waterData.length > 0}
        <table border="1">
            <thead>
                <tr>
                    <th>País</th>
                    <th>Año</th>
                    <th>Código del país</th>
                    <th>Productividad del agua</th>
                    <th>Estrés hídrico</th>
                    <th>Agua dulce anual</th>
                </tr>
            </thead>
            <tbody>
                {#each waterData as item}
                    <tr>
                        <td>{item.country}</td>
                        <td>{item.year}</td>
                        <td>{item.countryCode}</td>
                        <td>{item.waterProductivity}</td>
                        <td>{item.waterStress}</td>
                        <td>{item.annualFreshwater}</td>
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