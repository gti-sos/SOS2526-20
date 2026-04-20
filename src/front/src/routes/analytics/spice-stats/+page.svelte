<script>
    import Highcharts from "highcharts";

    import { onMount } from 'svelte';

    onMount(async () => {

        const spiceData1 = await fetch("../api/v2/spice-stats?limit=100");  //sin el "../" busca /analytics/api/v2/apice-stats?limit=100
        const spiceData2 = await spiceData1.json();

        // Sacamos solo el array de objetos
        const spiceData3 = spiceData2.data;

        // Agrupamos por item y sumamos producción
        const spiceData4 = spiceData3.reduce((acc, item) => {
            if (!acc[item.item]) {
                acc[item.item] = 0;
            }
            acc[item.item] += item.import;
            return acc;
        }, {});

        const spiceData5 =  Object.entries(spiceData4);

        console.log("1", spiceData1);
        console.log("2", spiceData2);
        console.log("3", spiceData3);
        console.log("4", spiceData4);
        console.log("5", spiceData5);

        
        /*Highcharts.chart('container', {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45
                }
            },
            title: {
                text: 'Importes de especias'
            },
            subtitle: {
                text: '3D donut in Highcharts'
            },
            plotOptions: {
                pie: {
                    innerSize: 100,
                    depth: 45
                }
            },
            series: [{
                name: 'Importes',
                data: spiceData5
            }]
        });*/

        Highcharts.chart('container', {
            chart: {
                type: 'pie',
                custom: {},
                events: {
                    render() {
                        const chart = this,
                            series = chart.series[0];
                        let customLabel = chart.options.chart.custom.label;

                        if (!customLabel) {
                            customLabel = chart.options.chart.custom.label =
                                chart.renderer.label(
                                    'Especias'
                                )
                                    .css({
                                        color:
                                            'var(--highcharts-neutral-color-100, #000)',
                                        textAnchor: 'middle'
                                    })
                                    .add();
                        }

                        const x = series.center[0] + chart.plotLeft,
                            y = series.center[1] + chart.plotTop -
                            (customLabel.attr('height') / 2);

                        customLabel.attr({
                            x,
                            y
                        });
                        // Set font size based on chart diameter
                        customLabel.css({
                            fontSize: `${series.center[2] / 12}px`
                        });
                    }
                }
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            title: {
                text: 'Importes según items'
            },
            subtitle: {
                text: 'Importes según item'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.0f}%</b>'
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderRadius: 8,
                    dataLabels: [{
                        enabled: true,
                        distance: 20,
                        format: '{point.name}'
                    }, {
                        enabled: true,
                        distance: -15,
                        format: '{point.percentage:.0f}%',
                        style: {
                            fontSize: '0.9em'
                        }
                    }],
                    showInLegend: true
                }
            },
            series: [{
                name: 'Registrations',
                colorByPoint: true,
                innerSize: '75%',
                data: spiceData5
            }]
        });


    })
    
</script>


<figure class="highcharts-figure">
    <div id="container"></div>
</figure>
