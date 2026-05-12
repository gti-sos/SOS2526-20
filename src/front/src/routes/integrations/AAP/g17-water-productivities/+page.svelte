<script>
    import { onMount } from 'svelte';


    onMount(async () => {
        const c3 = (await import("c3")).default;
        
        const waterData1 = await fetch("https://sos2526-17.onrender.com/api/v1/water-productivities", {
            method: 'GET'
        });

        const waterData2 = await waterData1.json();
        const waterData3 = waterData2.reduce((acc, item) => {
            if (!acc[item.country]) {
                acc[item.country] = {
                    waterProductivity: 0,
                    waterStress: 0,
                    annualFreshwater: 0
                };
            }
            acc[item.country].waterProductivity += item.waterProductivity;
            acc[item.country].waterStress += item.waterStress;
            acc[item.country].annualFreshwater += item.annualFreshwater;
            return acc;
        }, {});

        const waterData4 = Object.entries(waterData3).map(([country, values]) => {
            return [ country, values.waterProductivity, values.waterStress, values.annualFreshwater ];
        });

        console.log("1", waterData1);
        console.log("2", waterData2);
        console.log("3", waterData3);
        console.log("4", waterData4);



        c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: waterData4,
                types: {
                    data1: 'step',
                    data2: 'area-step'
                }
            }
        });


    });
</script>

<div>
    <figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    <table class="table-series">
        <thead><tr><th>Valor Eje</th><th>Valor 0</th><th>Valor 1</th><th>Valor 2</th></tr></thead>
        <tbody>
            <tr><td>Eje X</td><td>Productividad del agua</td><td>Estrés hídrico</td><td>Agua dulce anual</td></tr>
            <tr><td>Eje y</td><td>Cantidad sumada de un país</td><td>Cantidad sumada de un país</td><td>Cantidad sumada de un país</td></tr>
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