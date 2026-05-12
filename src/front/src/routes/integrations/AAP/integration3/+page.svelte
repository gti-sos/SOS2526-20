<script>
    import {onMount} from 'svelte';

    let api3Data2 = $state([]);
    
    onMount(async () => {
        const c3 = (await import("c3")).default;

        const api3Data1 = await fetch("../../../proxy/AAP");
        api3Data2 = await api3Data1.json();
    });
</script>



<h2>Videojuegos</h2>
<div class="container" id="contenedor">
    {#if api3Data2.length > 0}
        <table border="1">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Géneros</th>
                    <th>Desarrolladores</th>
                    <th>Editores</th>
                    <th>Fechas de estreno</th>
                </tr>
            </thead>
            <tbody>
                {#each api3Data2 as item}
                    <tr>
                        <td>{item.name}</td>
                        <td>{item.genre}</td>
                        <td>{item.developers}</td>
                        <td>{item.publishers}</td>
                        <td>{Object.entries(item.releaseDates)
                                .map(([region, date]) => `${region}: ${date}`)
                                .join(", ")}</td>
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