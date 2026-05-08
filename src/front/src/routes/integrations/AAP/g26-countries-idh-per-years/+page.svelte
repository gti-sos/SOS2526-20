<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/series-label.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script src="https://code.highcharts.com/themes/high-contrast-light.js"></script>
</svelte:head>
<script>
    import Highcharts from "highcharts";
    import { onMount } from "svelte";


    onMount(async () => {
        const years = [2018, 2019, 2020, 2021, 2022, 2023];


        const spiceData1 = await fetch("../../../api/v2/spice-stats?limit=100");  //sin el "../" busca /analytics/api/v2/apice-stats?limit=100
        const spiceData2 = await spiceData1.json();
        const spiceData3 = spiceData2.data;
        const spiceData4 = years.map(year =>
        spiceData3
            .filter(row => row.year === year)
            .reduce((sum, row) => sum += row.consumption*0.0001, 0)
        );

        const countriesData1 = await fetch("https://sos2526-26.onrender.com/api/v2/countries-idh-per-years/", {
            method: "GET"
        });
        const countriesData2 = await countriesData1.json();
        const countriesData3 = years.map(year =>
            countriesData2
            .filter(row => row.year === year)
            .reduce((acc, row) => acc += row.hdi_value, 0)
        );

        
        console.log("spice1", spiceData1);
        console.log("spice2", spiceData2);
        console.log("spice3", spiceData3);
        console.log("spice4", spiceData4);
        console.log("countries1", countriesData1);
        console.log("countries2", countriesData2);
        console.log("countries3", countriesData3);


        const colors = Highcharts.getOptions().colors;

        Highcharts.chart('container', {
            chart: {
                type: 'spline'
            },

            legend: {
                symbolWidth: 40
            },

            title: {
                text: 'Integracion Especias - IDH de los países por año',
                align: 'left'
            },

            subtitle: {
                text: 'Integración g20 -g26',
                align: 'left'
            },

            yAxis: {
                title: {
                    text: 'Consumo / valor hdi'
                },
                accessibility: {
                    description: 'Consumo / valor hdi'
                }
            },

            xAxis: {
                title: {
                    text: 'Años'
                },
                accessibility: {
                    description: 'Años desde 2018 a 2023'
                },
                categories: [
                    '2018', '2019', '2020', '2021',
                    '2022', '2023'
                ]
            },

            tooltip: {
                valueSuffix: '',
                stickOnContact: true
            },

            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                window.location.href = this.series.options.website;
                            }
                        }
                    },
                    cursor: 'pointer',
                    lineWidth: 2
                }
            },

            series: [
                {
                    name: 'Especias',
                    data: spiceData4,
                    website: 'https://sos2526-20.onrender.com/api/v2/spice-stats/',
                    color: colors[2],
                    accessibility: {
                        description: 'Especias'
                    }
                }, {
                    name: 'IDH',
                    data: countriesData3,
                    website: 'https://sos2526-26.onrender.com/api/v2/countries-idh-per-years',
                    dashStyle: 'ShortDashDot',
                    color: colors[0]
                }
            ],

            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 550
                    },
                    chartOptions: {
                        chart: {
                            spacingLeft: 3,
                            spacingRight: 3
                        },
                        legend: {
                            itemWidth: 150
                        },
                        xAxis: {
                            categories: [
                                '2018', '2019', '2020', '2021',
                                '2022', '2023'
                            ],
                            title: ''
                        },
                        yAxis: {
                            visible: false
                        }
                    }
                }]
            }
        });

    })
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
        <table class="table-series">
        <thead><tr><th>Serie</th><th>Eje x</th><th>Eje y</th></tr></thead>
        <tbody>
            <tr><td>Especias</td><td>Año</td><td>Consumo (multiplicado por 0.0001 para normalizar la representación)</td></tr>
            <tr><td>IDH de los países por año</td><td>Año</td><td>Valor HDI</td></tr>
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