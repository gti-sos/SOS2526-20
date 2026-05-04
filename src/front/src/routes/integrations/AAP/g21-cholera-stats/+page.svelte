<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script src="https://code.highcharts.com/themes/adaptive.js"></script>
</svelte:head>
<script>
    import { onMount } from 'svelte';
    import Highcharts from "highcharts";
    import HighchartsMore from "highcharts/highcharts-more";
    

    onMount(async () => {
        
        const choleraData1 = await fetch("https://soporte-sos.onrender.com/api/v1/cholera-stats", {
                method: 'GET'
            });
        const choleraData2 = await choleraData1.json();

        const choleraData3 = choleraData2.reduce((acc, item) => {
            if(!acc[item.country]) {
                acc[item.country] = 0;
            }
            acc[item.country] += item.reportedDeaths;
            return acc;
        }, {});

        console.log("1", choleraData1);
        console.log("2", choleraData2);
        console.log("3", choleraData3);


        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '100%'
            },
            title: {
                text: 'Muertes por cólera',
                align: 'left'
            },
            subtitle: {
                text: 'Source: <a href="https://soporte-sos.onrender.com/api/v1/cholera-stats" target="_blank">Cholera-stats</a>',
                align: 'left'
            },
            tooltip: {
                pointFormat: '<b>{point.name}:</b> {point.value}m CO₂'
            },
            plotOptions: {
                packedbubble: {
                    minSize: '20%',
                    maxSize: '100%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        gravitationalConstant: 0.05,
                        splitSeries: true,
                        seriesInteraction: false,
                        dragBetweenSeries: true,
                        parentNodeLimit: true
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        filter: {
                            property: 'y',
                            operator: '>',
                            value: 250
                        },
                        style: {
                            color: 'black',
                            textOutline: 'none',
                            fontWeight: 'normal'
                        }
                    }
                }
            },
            series: [{
                name: 'World',
                data: choleraData3
            }]
        });

    })
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        This chart shows how packed bubble charts can be grouped by series,
        creating a hierarchy.
    </p>
</figure>