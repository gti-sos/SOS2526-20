<script>
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';

    let chartContainer;
    let chart;
    let rawData = $state([]);
    
    let countries = $state([]);
    
    // Inicializamos por defecto en "Todos"
    let selectedCountry = $state("Todos"); 
    
    const metrics = [
        { id: 'production', name: 'Producción' },
        { id: 'export', name: 'Exportación' },
        { id: 'domestic_consumption', name: 'Consumo Nacional' },
        { id: 'gross_opening_stock', name: 'Stock Inicial Bruto' }
    ];

    let selectedMetric = $state(metrics[0].id); 
    
    let hasData = $state(true);

    onMount(async () => {
        try {
            const response = await fetch("/api/v2/coffee-stats?limit=2000");
            const json = await response.json();
            
            rawData = json.data || json;
            
            countries = [...new Set(rawData.map(item => item.country).filter(Boolean))].sort();

            chart = Highcharts.chart(chartContainer, {
                chart: { type: 'area' },
                title: { text: 'Estadísticas de Café' },
                xAxis: {
                    title: { text: 'Año' },
                    allowDecimals: false
                },
                yAxis: {
                    title: { text: 'Cantidad' }
                },
                tooltip: { 
                    shared: true,
                    headerFormat: '<span style="font-size:12px"><b>Año: {point.key}</b></span><br>'
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666'
                        }
                    }
                },
                series: [] 
            });

        } catch (error) {
            console.error("Error al cargar los datos de la API:", error);
        }
    });

    function updateChart() {
        if (!chart || rawData.length === 0 || !selectedCountry) return;

        // 1. Filtramos los datos dependiendo de si es "Todos" o un país específico
        const targetData = selectedCountry === "Todos" 
            ? rawData 
            : rawData.filter(item => item.country === selectedCountry);
        
        // Extraemos los tipos de café presentes en esos datos
        const activeCoffeeTypes = [...new Set(targetData.map(item => item.coffee_type).filter(Boolean))];
        const currentMetric = metrics.find(m => m.id === selectedMetric);

        let series = [];

        activeCoffeeTypes.forEach(type => {
            const typeData = targetData.filter(item => item.coffee_type === type);

            // 2. Lógica de Agregación: Sumamos los valores si hay múltiples países en el mismo año
            const yearlyAggregates = {};

            typeData.forEach(item => {
                const yearX = typeof item.year === 'string' && item.year.includes('-') 
                    ? new Date(item.year).getFullYear() 
                    : Number(item.year);
                
                if (!yearlyAggregates[yearX]) {
                    yearlyAggregates[yearX] = 0;
                }
                
                yearlyAggregates[yearX] += Number(item[currentMetric.id]) || 0;
            });

            // 3. Convertimos el objeto en un array de puntos [x, y] y lo ordenamos por año
            const dataPoints = Object.keys(yearlyAggregates)
                .map(year => [Number(year), yearlyAggregates[year]])
                .sort((a, b) => a[0] - b[0]);

            // Solo añadimos la serie si tiene valores reales por encima de 0
            if (dataPoints.length > 0 && dataPoints.some(point => point[1] > 0)) {
                series.push({
                    name: `${type} - ${currentMetric.name}`,
                    data: dataPoints
                });
            }
        });

        if (series.length === 0) {
            hasData = false;
        } else {
            hasData = true;
            
            const countryNameDisplay = selectedCountry === "Todos" ? "Todos los países" : selectedCountry;
                
            chart.update({
                title: { text: `Estadísticas de Café: ${countryNameDisplay} (${currentMetric.name})` },
                series: series
            }, true, true);
        }
    }

    $effect(() => {
        if (selectedCountry && selectedMetric && rawData.length > 0) {
            updateChart();
        }
    });
</script>

<div class="controls">
    <div class="selector-group">
        <label for="countrySelect">País:</label>
        <select id="countrySelect" bind:value={selectedCountry}>
            <option value="Todos">Todos los países</option>
            {#each countries as country (country)}
                <option value={country}>{country}</option>
            {/each}
        </select>
    </div>

    <div class="selector-group">
        <label for="metricSelect">Métrica:</label>
        <select id="metricSelect" bind:value={selectedMetric}>
            {#each metrics as metric (metric.id)}
                <option value={metric.id}>{metric.name}</option>
            {/each}
        </select>
    </div>
</div>

{#if !hasData}
    <div class="warning-message">
        <p>⚠️ No se han encontrado datos para <strong>{metrics.find(m => m.id === selectedMetric)?.name}</strong> en <strong>{selectedCountry === 'Todos' ? 'ningún país' : selectedCountry}</strong>.</p>
    </div>
{/if}

<div style="display: {hasData ? 'block' : 'none'};">
    <div bind:this={chartContainer}></div>
</div>

<style>
    .controls {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 8px;
    }
    
    .selector-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
        min-width: 150px;
    }

    .warning-message {
        padding: 15px;
        margin-bottom: 20px;
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
        border-radius: 8px;
        text-align: center;
    }

    .warning-message p {
        margin: 0;
        font-size: 16px;
    }
</style>