<script>
    import Highcharts from "highcharts";
    import { onMount } from 'svelte';


    onMount(async () => {
        const años = [
            1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
            2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
            2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
            2020, 2021, 2022, 2023, 2024
        ];

        // SPICE
        const spiceData1 = await fetch("api/v2/spice-stats?limit=100");
        const spiceData2 = await spiceData1.json();

        // Sacamos solo el array de objetos
        const spiceData3 = spiceData2.data;

        // Agrupamos por año y sumamos producción
        const spiceData4 = spiceData3.reduce((acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = 0;
            }
            acc[item.year] += item.production;
            return acc;
        }, {});

        // Convertimos spiceData4 en una lista ordenada por año
        const entries = Object.entries(spiceData4)
            .map(([year, production]) => ({ year: Number(year), production }))
            .sort((a, b) => a.year - b.year);

        // Creamos spiceData5 con arrays paralelos
        const spiceData5 = {
            year: entries.map(e => e.year),
            production: entries.map(e => e.production)
        };

        // Rellenamos con 0 los años que no existan en spiceData5
        const spiceData6 = años.map(año => {
            const index = spiceData5.year.indexOf(año);
            return index !== -1 ? spiceData5.production[index] : 0;
        });

        console.log("3", spiceData3);
        console.log("4", spiceData4);
        console.log("5", spiceData5);
        console.log("6", spiceData6);



        // COFFEE
        const coffeeData1 = await fetch("api/v2/coffee-stats");
        const coffeeData2 = await coffeeData1.json();
        const coffeeData3 = coffeeData2.data.map(item => item.export);

        // WOOL
        const woolData1 = await fetch("api/v2/wool-stats");
        const woolData2 = await woolData1.json();
        const woolData3 = woolData2.data.map(item => item.qty);

        // creamos la constante que las acumula según el ejemplo de highcharts: https://www.highcharts.com/samples/data/activity.json

        const todosLosDatos = {
            "xData": años,
            "datasets": [
                {
                    "name": "Lana",
                    "data": woolData3
                },
                {
                    "name": "Café",
                    "data": coffeeData3
                },
                {
                    "name": "Especias",
                    "data": spiceData6
                }
            ]
        };

        ['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
            document.getElementById('container').addEventListener(
                eventType,
                function (e) {
                    let chart,
                        point,
                        i,
                        event;

                    for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                        chart = Highcharts.charts[i];
                        // Find coordinates within the chart
                        event = chart.pointer.normalize(e);
                        // Get the hovered point
                        point = chart.series[0].searchPoint(event, true);

                        if (point) {
                            point.highlight(e);
                        }
                    }
                }
            );
        });

        /**
         * Override the reset function, we don't need to hide the tooltips and
         * crosshairs.
         */
        Highcharts.Pointer.prototype.reset = function () {
            return undefined;
        };

        /**
         * Highlight a point by showing tooltip, setting hover state and draw crosshair
         */
        Highcharts.Point.prototype.highlight = function (event) {
            event = this.series.chart.pointer.normalize(event);
            this.onMouseOver(); // Show the hover marker
            this.series.chart.tooltip.refresh(this); // Show the tooltip
            this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
        };

        /**
         * Synchronize extremes (zooming) through the setExtremes event handler.
         */
        function syncExtremes(e) {
            const thisChart = this.chart;

            if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
                Highcharts.charts.forEach(chart => {
                    if (chart !== thisChart) {
                        if (chart.xAxis[0].setExtremes) { // It is null while updating
                            chart.xAxis[0].setExtremes(
                                e.min,
                                e.max,
                                undefined,
                                false,
                                { trigger: 'syncExtremes' }
                            );
                        }
                    }
                });
            }
        }

        /**
         * Resets chart zoom on selection event.
         */
        function resetZoom(e) {
            // Prevent feedback loop
            if (e.resetSelection) {
                return;
            }

            // Zoom out all other charts on selection
            Highcharts.charts.forEach(chart => {
                if (chart !== e.target) {
                    chart.zoomOut();
                }
            });
        }

        (async () => {
            // Get the data
            const activity = todosLosDatos;

            // Loop the data sets and create one chart each
            activity.datasets.forEach(function (dataset, i) {
                // Add X values
                dataset.data = dataset.data.map((val, j) => [activity.xData[j], val]);

                const chartDiv = document.createElement('div');
                chartDiv.className = 'chart';
                document.getElementById('container').appendChild(chartDiv);

                Highcharts.chart(chartDiv, {
                    chart: {
                        marginLeft: 40, // Keep all charts left aligned
                        spacingTop: 20,
                        spacingBottom: 20,
                        zooming: {
                            type: 'x'
                        },
                        events: {
                            selection: resetZoom
                        }
                    },
                    title: {
                        text: dataset.name,
                        align: 'left',
                        margin: 0,
                        x: 30
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes
                        },
                        labels: {
                            format: '{value}'
                        },
                        accessibility: {
                            description: 'Year',
                            rangeDescription: '---'
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        fixed: true,
                        position: {
                            align: 'right',
                            relativeTo: 'spacingBox',
                            y: -2
                        },
                        padding: 0,
                        pointFormat: '{point.y}',
                        backgroundColor: 'none',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '18px'
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    series: [{
                        data: dataset.data,
                        name: dataset.name,
                        type: dataset.type,
                        color: Highcharts.getOptions().colors[i],
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit
                        }
                    }]
                });
            });
        })();


    });
</script>



<!-- ========================================================================================= -->
<!-- ========================================================================================= -->
<!-- ========================================================================================= -->



<div id="container"></div>
