<script>
    import { onMount } from "svelte";
    import Highcharts from "highcharts";
    // ---------------------------
    // FUNCIONES AUXILIARES
    // ---------------------------

    // Rellena años faltantes con null (Highcharts no muestra warning #15)
    function rellenarAnios(años, listaAnios, listaValores) {
        return años.map(año => {
            const index = listaAnios.indexOf(año);
            return index !== -1 ? listaValores[index] : null;
        });
    }

    // Genera un rango de años continuo
    function rangoAnios(min, max) {
        return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    // ---------------------------
    // VARIABLES PARA LA GRÁFICA
    // ---------------------------
    let años = [];
    let spice6 = [];
    let coffee6 = [];
    let wool6 = [];

    onMount(async () => {

        // ===========================
        // SPICE
        // ===========================
        const spiceData = await fetch("api/v2/spice-stats?limit=100").then(r => r.json());
        const spice3 = spiceData.data;

        const spice4 = spice3.reduce((acc, item) => {
            acc[item.year] = (acc[item.year] || 0) + item.production;
            return acc;
        }, {});

        const spice7 = Object.entries(spice4)
            .map(([year, production]) => ({ year: Number(year), production }))
            .sort((a, b) => a.year - b.year);

        const spiceYears = spice7.map(e => e.year);
        const spiceValues = spice7.map(e => e.production);

        // ===========================
        // COFFEE
        // ===========================
        const coffeeData = await fetch("api/v2/coffee-stats?limit=100").then(r => r.json());
        const coffee3 = coffeeData.data;

        const coffee4 = coffee3.reduce((acc, item) => {
            acc[item.year] = (acc[item.year] || 0) + item.production;
            return acc;
        }, {});

        const coffee7 = Object.entries(coffee4)
            .map(([year, production]) => ({ year: Number(year), production }))
            .sort((a, b) => a.year - b.year);

        const coffeeYears = coffee7.map(e => e.year);
        const coffeeValues = coffee7.map(e => e.production);


        // ===========================
        // WOOL
        // ===========================
        const woolData = await fetch("api/v2/wool-stats?limit=100").then(r => r.json());
        const wool3 = woolData.data;

        const wool4 = wool3.reduce((acc, item) => {
            acc[item.period] = (acc[item.period] || 0) + item.qty;
            return acc;
        }, {});

        const wool7 = Object.entries(wool4)
            .map(([period, qty]) => ({ period: Number(period), qty }))
            .sort((a, b) => a.period - b.period);

        const woolYears = wool7.map(e => e.period);
        const woolValues = wool7.map(e => e.qty);

        const minYear = Math.min(
            spiceYears[0],
            coffeeYears[0],
            woolYears[0]
        );

        const maxYear = Math.max(
            spiceYears[spiceYears.length - 1],
            coffeeYears[coffeeYears.length - 1],
            woolYears[woolYears.length - 1]
        );

        años = rangoAnios(minYear, maxYear);
        spice6 = rellenarAnios(años, spiceYears, spiceValues);
        coffee6 = rellenarAnios(años, coffeeYears, coffeeValues);
        wool6 = rellenarAnios(años, woolYears, woolValues);

        // creamos la constante que las acumula según el ejemplo de highcharts: https://www.highcharts.com/samples/data/activity.json

        const todosLosDatos = {
            "xData": años,
            "datasets": [
                {
                    "name": "Lana",
                    "data": wool6
                },
                {
                    "name": "Café",
                    "data": coffee6
                },
                {
                    "name": "Especias",
                    "data": spice6
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
