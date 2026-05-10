<script>
    import {onMount} from 'svelte';

    onMount(async () => {
        const c3 = (await import("c3")).default;
        
        const api1 = await fetch("https://public-api-lists.github.io/public-api-lists/api/all.json", {
                method: 'GET'
            });
        const api2 = await api1.json();
        const api3 = api2.entries;
        const api4 = {};
        api3.forEach(item => {
            if(!api4[item.category]){
                api4[item.category] =0;
            }
            api4[item.category] += 1;
        });

        const columnas = ["Cantidad", ...Object.values(api4)];
        const grupos = Object.keys(api4);

        console.log("1", api1);
        console.log("2", api2);
        console.log("3", api3);
        console.log("4", api4);
        console.log("col", columnas);
        console.log("gru", grupos);

        c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: [columnas]
            },
            axis: {
                x: {
                    type: 'category',
                    categories: grupos
                }
            }
        });
    })
</script>


<figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    
    <table class="table-series">
        <thead><tr><th>Eje x</th><th>Eje y</th></tr></thead>
        <tbody>
            <tr><td>Categoría</td><td>Cantidad de entradas con esa categoria</td></tr>
        </tbody>
    </table>
</figure>

<style>
    .c3-figure {
        margin: 20px 0;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .description {
        text-align: center;
        font-family: sans-serif;
        color: #555;
        margin-top: 15px;
    }
    .table-series {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        background: #fff8ef;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        font-family: "Segoe UI", sans-serif;
        color: #5a3e2b;
    }

    .table-series thead {
        background: #c0392b; /* rojo picante */
        color: white;
    }

    .table-series th,
    .table-series td {
        padding: 12px 15px;
        text-align: left;
        font-size: 1rem;
    }

    .table-series tbody tr:nth-child(even) {
        background: #fcefdc; /* arena cálida */
    }

    .table-series tbody tr:hover {
        background: #f9d9b3; /* naranja suave */
        cursor: pointer;
    }

    /* Estilo especial para la primera columna (Serie) */
    .table-series td:first-child {
        font-weight: bold;
        color: #c0392b;
    }

    /* Bordes sutiles */
    .table-series th,
    .table-series td {
        border-bottom: 1px solid #e6c9a8;
    }

    .table-series tbody tr:last-child td {
        border-bottom: none;
    }
</style>