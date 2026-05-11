<script>
    import {onMount} from 'svelte';
    
    onMount(async () => {
        const c3 = (await import("c3")).default;

        const spiceData1 = await fetch("../../../api/v2/spice-stats?limit=100");  //sin el "../../../ busca en integrations/AAP/g11..."
        const spiceData2 = await spiceData1.json();
        const spiceData3 = spiceData2.data;
        const spiceData4 = spiceData3.reduce((acc, item) => {
            if (!acc[item.area]) {
                acc[item.area] = [];
            }

            acc[item.area].push(item.consumption);
            return acc;
        }, {});
        const spiceData5 = Object.entries(spiceData4);
        const spiceData6 = spiceData5.map(([area, consumos]) => [area, ...consumos]);


        const api1 = await fetch('https://api.sampleapis.com/recipes/recipes');
        const api2 = await api1.json();
        const api3 = api2.reduce((acc,item) => {
            if(!acc[item.cuisine]) {
                acc[item.cuisine] = [];
            }

            acc[item.cuisine].push(item.calories || 0);
            return acc;
        }, {});

        const api4 = Object.entries(api3);
        const api5 = api4.map(([cuisine, calories]) => [cuisine, ...calories])


        console.log("API1", api1);
        console.log("API2", api2);
        console.log("API3", api3);
        console.log("API4", api4);


        console.log("1", spiceData1);
        console.log("2", spiceData2);
        console.log("3", spiceData3);
        console.log("4", spiceData4);
        console.log("5", spiceData5);


       c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: [
                    spiceData6[0],
                    api5[0]
                ],
                type: 'spline'
            }
        });


    })
</script>

<div>
    <figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    
    <table class="table-series">
        <thead><tr><th>API</th><th>Eje x</th><th>Eje y</th></tr></thead>
        <tbody>
            <tr><td>Api sobre especias</td><td>Consumo de un país</td><td>Cantidad de cada entrada</td></tr>
            <tr><td>Api sobre cocina</td><td>Calorías de un tipo de cocina</td><td>Cantidad de cada entrada</td></tr>
        </tbody>
    </table>
</figure>
</div>

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