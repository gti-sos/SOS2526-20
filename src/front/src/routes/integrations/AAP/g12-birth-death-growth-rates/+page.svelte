<script>
    import { onMount } from 'svelte';

    let birthData = $state([]);

    onMount(async () => {
        
        const response = await fetch("https://sos2526-12.onrender.com/api/v2/birth-death-growth-rates/", {
            method: 'GET'
        });

        birthData = await response.json();
    });
</script>

<div class="container" id="contenedor">
    {#if birthData.length > 0}
        <table border="1">
            <thead>
                <tr>
                    <th>Código del país</th>
                    <th>País</th>
                    <th>Año</th>
                    <th>Tasa de nacimientos crudo</th>
                    <th>Tasa de muertes crudo</th>
                    <th>Saldo migratorio</th>
                    <th>Tasa de aumento natural</th>
                    <th>Tasa de crecimiento</th>
                </tr>
            </thead>
            <tbody>
                {#each birthData as item}
                    <tr>
                        <td>{item.country_code}</td>
                        <td>{item.country_name}</td>
                        <td>{item.year}</td>
                        <td>{item.crude_birth_rate}</td>
                        <td>{item.crude_death_rate}</td>
                        <td>{item.net_migration}</td>
                        <td>{item.rate_natural_increase}</td>
                        <td>{item.growth_rate}</td>
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