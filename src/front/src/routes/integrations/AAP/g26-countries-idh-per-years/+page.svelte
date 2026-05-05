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
            .reduce((sum, row) => sum + row.consumption*0.00001, 0)
        );

        const countriesData1 = await fetch("https://sos2526-26.onrender.com/api/v2/countries-idh-per-years/", {
            method: "GET"
        });
        const countriesData2 = await countriesData1.json();
        const countriesData3 = years.map(year =>
            countriesData2
            .filter(row => row.year === year)
            .reduce((acc, row) => acc = row.hdi_value, 0)
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
    <p class="highcharts-description">Especias: Muestra el consumo total de año cada año. (multiplicado por 0.00001 para normalizar la representación)</p>
        <p class="highcharts-description">IDH: Muestra el valor HDI total de cada año.</p>

</figure>
