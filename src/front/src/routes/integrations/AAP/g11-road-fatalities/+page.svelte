<script>
    import { onMount } from "svelte";
    import Highcharts from "highcharts";
	import { isAwaitKeyword } from "typescript";
    

    onMount(async () => {

        const spiceData1 = await fetch("../../../api/v2/spice-stats?limit=100");  //sin el "../../../ busca en integrations/AAP/g11..."
        const spiceData2 = await spiceData1.json();
        const spiceData3 = spiceData2.data;
        const spiceData4 = spiceData3.map(d => [
            d.year, d.production, d.consumption
        ]);

        const roadData1 = await fetch("https://sos2526-11.onrender.com/api/v2/road-fatalities", {
            method: "GET"
        });
        const roadData2 = await roadData1.json();
        const roadData3 = roadData2.map(d => [
            d.year, d.total_death, d.vehicle_death_rate
        ]);

        console.log("spice1",spiceData1);
        console.log("spice2",spiceData2);
        console.log("spice3",spiceData3);
        console.log("spice4",spiceData4);
        console.log("road1",roadData1);
        console.log("road2",roadData2);
        console.log("road3",roadData3);

        Highcharts.chart('container', {
            chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                zooming: {
                    type: 'xy'
                }
            },

            title: {
                text: 'Integración Especias-Carretera'
            },

            xAxis: {
                gridLineWidth: 1,
                accessibility: {
                    rangeDescription: 'Range: 0 to 100.'
                }
            },

            yAxis: {
                startOnTick: false,
                endOnTick: false,
                accessibility: {
                    rangeDescription: 'Range: 0 to 100.'
                }
            },

            series: [{
                name: "Especias",
                data: spiceData4,
                marker: {
                    fillColor: {
                        radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                        stops: [
                            [0, 'white'],
                            [1, Highcharts.getOptions().colors[0]]
                        ]
                    }
                }
            }, {
                name: "Muertes en carretera",
                data:roadData3,
                marker: {
                    fillColor: {
                        radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                        stops: [
                            [0, 'rgba(255,255,255,0.5)'],
                            [
                                1,
                                Highcharts.color(
                                    Highcharts.getOptions().colors[1]
                                ).setOpacity(0.5).get('rgba')
                            ]
                        ]
                    }
                }
            }]

        });

    })
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        Bubble chart demonstrating a decorative 3D rendering effect using
        gradient fills on the bubbles.
    </p>
    
    <table class="table-series">
        <thead><tr><th>Serie</th><th>Eje x</th><th>Eje y</th><th>Tamaño</th></tr></thead>
        <tbody>
            <tr><td>Especias</td><td>Año</td><td>Produccion</td><td>Consumo</td></tr>
            <tr><td>Muertes en carretera</td><td>Año</td><td>Total de muertes</td><td>Tasa de muertes por vehículo</td></tr>
        </tbody>
    </table>
</figure>

<style>
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