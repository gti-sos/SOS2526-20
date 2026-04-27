<script>
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';

    let container;
    let rawSpice = $state([]);
    let rawCoffee = $state([]);
    let rawWool = $state([]);
    let selectedCountry = $state('Todos');
    let availableCountries = $state([]);
    let charts = []; 

    // ===========================
    // FUNCIONES DE LIMPIEZA
    // ===========================
    // Función para normalizar strings (quitar espacios y asegurar consistencia)
    const clean = (val) => String(val || '').trim();

    function extraerPaisesComunes(spice, coffee, wool) {
        // Creamos Sets de nombres limpios
        const spicePaises = new Set(spice.map(item => clean(item.area)).filter(Boolean));
        const coffeePaises = new Set(coffee.map(item => clean(item.country)).filter(Boolean));
        const woolPaises = new Set(wool.map(item => clean(item.reporterdesc)).filter(Boolean));
        
        // Intersección estricta de nombres limpios
        const comunes = [...spicePaises].filter(pais => 
            coffeePaises.has(pais) && woolPaises.has(pais)
        );
        
        console.log("Países encontrados en los 3 datasets:", comunes); // Para debug
        return ['Todos', ...comunes.sort()];
    }

    // ===========================
    // PROCESAMIENTO
    // ===========================
    function updateCharts(countryFilter) {
        if (!rawSpice.length && !rawCoffee.length && !rawWool.length) return;

        // 1. SPICE
        const spiceAgg = rawSpice.reduce((acc, item) => {
            const country = clean(item.area);
            if (countryFilter !== 'Todos' && country !== countryFilter) return acc;
            
            const exp = item.Export || item.export || item['Export '] || item['export '] || 0;
            const imp = item.Import || item.import || item['Import '] || item['import '] || 0;
            const y = item.Year || item.year;
            if (y) acc[y] = (acc[y] || 0) + (Number(exp) + Number(imp));
            return acc;
        }, {});

        // 2. COFFEE
        const coffeeAgg = rawCoffee.reduce((acc, item) => {
            const country = clean(item.country);
            if (countryFilter !== 'Todos' && country !== countryFilter) return acc;
            
            const y = item.year;
            if (y) acc[y] = (acc[y] || 0) + Number(item.export || 0);
            return acc;
        }, {});

        // 3. WOOL
        const woolAgg = rawWool.reduce((acc, item) => {
            const country = clean(item.reporterdesc);
            if (countryFilter !== 'Todos' && country !== countryFilter) return acc;
            
            const flow = clean(item.flowdesc).toLowerCase();
            if (flow === 'export' || flow === 'import') {
                const y = item.period;
                if (y) acc[y] = (acc[y] || 0) + Number(item.qty || 0);
            }
            return acc;
        }, {});

        // Conversión a arrays para Highcharts
        const spiceArr = Object.entries(spiceAgg).map(([year, val]) => ({ year: Number(year), val })).sort((a, b) => a.year - b.year);
        const coffeeArr = Object.entries(coffeeAgg).map(([year, val]) => ({ year: Number(year), val })).sort((a, b) => a.year - b.year);
        const woolArr = Object.entries(woolAgg).map(([year, val]) => ({ year: Number(year), val })).sort((a, b) => a.year - b.year);

        const allYears = [...spiceArr, ...coffeeArr, ...woolArr].map(e => e.year);
        if (allYears.length === 0) return;

        const minYear = Math.min(...allYears);
        const maxYear = Math.max(...allYears);
        const años = Array.from({length: maxYear - minYear + 1}, (_, i) => minYear + i);

        const fill = (años, data) => años.map(a => {
            const m = data.find(d => d.year === a);
            return m ? [a, m.val] : [a, null];
        });

        const datasets = [
            { name: `Especias (Total)`, data: fill(años, spiceArr) },
            { name: `Café (Exportaciones)`, data: fill(años, coffeeArr) },
            { name: `Lana (Total)`, data: fill(años, woolArr) }
        ];

        if (charts.length === 0) {
            crearGraficosBase(datasets);
        } else {
            datasets.forEach((ds, i) => {
                charts[i].series[0].setData(ds.data, false);
                charts[i].redraw();
            });
        }
    }
    // Función para sincronizar el reinicio del zoom
        function resetZoom(e) {
            if (e.resetSelection) {
                return;
            }
            Highcharts.charts.forEach(chart => {
                if (chart && chart !== e.target) {
                    chart.zoomOut();
                }
            });
        }
    function crearGraficosBase(datasets) {
        // 1. Sobrescribir comportamientos de Highcharts
        Highcharts.Pointer.prototype.reset = () => undefined;
        Highcharts.Point.prototype.highlight = function (event) {
            event = this.series.chart.pointer.normalize(event);
            this.onMouseOver(); 
            this.series.chart.tooltip.refresh(this); 
            this.series.chart.xAxis[0].drawCrosshair(event, this); 
        };

        // 2. AÑADIDO: Event listeners en el contenedor para sincronizar el hover
        ['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
            container.addEventListener(eventType, function (e) {
                Highcharts.charts.forEach(chart => {
                    if (chart) {
                        const event = chart.pointer.normalize(e);
                        // Buscar el punto más cercano en cada gráfico
                        const point = chart.series[0]?.searchPoint(event, true);
                        if (point) {
                            point.highlight(e);
                        }
                    }
                });
            });
        });

        // 3. Crear los gráficos
        datasets.forEach((dataset, i) => {
            const chartDiv = document.createElement('div');
            chartDiv.className = 'chart';
            container.appendChild(chartDiv);

            const hc = Highcharts.chart(chartDiv, {
                chart: { 
                    marginLeft: 60, 
                    spacingTop: 20, 
                    spacingBottom: 20, 
                    zooming: { type: 'x' },
                    // AÑADIDO: Sincronizar zoom out
                    events: {
                        selection: resetZoom
                    }
                },
                title: { text: dataset.name, align: 'left', margin: 0, x: 30 },
                credits: { enabled: false },
                legend: { enabled: false },
                xAxis: { 
                    crosshair: true, 
                    allowDecimals: false,
                    labels: { format: '{value}' },
                    events: {
                        setExtremes: function(e) {
                            const thisChart = this.chart;
                            if (e.trigger !== 'syncExtremes') {
                                Highcharts.charts.forEach(chart => {
                                    if (chart && chart !== thisChart) {
                                        if (chart.xAxis[0].setExtremes) {
                                            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                                        }
                                    }
                                });
                            }
                        }
                    }
                },
                yAxis: { title: { text: null } },
                tooltip: {
                    fixed: true,
                    position: { align: 'right', relativeTo: 'spacingBox', y: -2 },
                    pointFormat: '<b>{point.y:,.0f}</b>',
                    backgroundColor: 'none',
                    shadow: false,
                    style: { fontSize: '14px' }
                },
                series: [{
                    data: dataset.data, name: dataset.name, type: 'area',
                    color: Highcharts.getOptions().colors[i], fillOpacity: 0.3
                }]
            });
            charts.push(hc);
        });
    }

    onMount(async () => {
        try {
            const [resSpice, resCoffee, resWool] = await Promise.all([
                fetch("api/v2/spice-stats?limit=45000").then(r => r.json()),
                fetch("api/v2/coffee-stats?limit=2200").then(r => r.json()),
                fetch("api/v2/wool-stats?limit=2000").then(r => r.json())
            ]);

            // Verificamos si la data viene en .data o es el array directo
            rawSpice = resSpice.data || resSpice || [];
            rawCoffee = resCoffee.data || resCoffee || [];
            rawWool = resWool.data || resWool || [];

            availableCountries = extraerPaisesComunes(rawSpice, rawCoffee, rawWool);
        } catch (error) {
            console.error("Error cargando APIs", error);
        }
    });

    $effect(() => {
        if (availableCountries.length > 0) {
            updateCharts(selectedCountry);
        }
    });
</script>

<div class="controls">
    <label for="countrySelector">País:</label>
    <select id="countrySelector" bind:value={selectedCountry}>
        {#each availableCountries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
    {#if availableCountries.length <= 1}
        <p style="color: red; font-size: 12px;">Buscando intersección de países...</p>
    {/if}
</div>

<div id="container" bind:this={container}></div>

<style>
    .controls { margin-bottom: 20px; padding: 15px; background: #f4f4f4; border-radius: 8px; }
    select { padding: 8px; min-width: 200px; }
    #container { display: flex; flex-direction: column; gap: 1rem; }
    :global(.chart) { height: 250px; width: 100%; }
</style>