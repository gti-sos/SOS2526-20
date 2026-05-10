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

    onMount(async () => {
        
        const choleraData1 = await fetch("https://soporte-sos.onrender.com/api/v1/cholera-stats", {
                method: 'GET'
            });
        const choleraData2 = await choleraData1.json();

        const choleraData3 = choleraData2.reduce((acc, item) => {
            if(!acc[item.whoRegion]) {
                acc[item.whoRegion] = {name: item.whoRegion, data: []};
            }
            acc[item.whoRegion].data.push({
                name: item.country,
                value: item.reportedCases
            })
            return acc;
        }, {});

        const choleraData4 = Object.values(choleraData3);

        console.log("1", choleraData1);
        console.log("2", choleraData2);
        console.log("3", choleraData3);
        console.log("4", choleraData4);


        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '100%'
            },
            title: {
                text: 'Casos reportados según región y país',
                align: 'left'
            },
            subtitle: {
                text: 'Source: <a href="https://soporte-sos.onrender.com/api/v1/cholera-stats" target="_blank">API</a>',
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
            series: choleraData4
        });


    })
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
       texto
    </p>
</figure>