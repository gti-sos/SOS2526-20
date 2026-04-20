<script>
    import Highcharts from 'highcharts';
    import { onMount } from 'svelte';

    let chartContainer;
    let chart;
    let rawData = $state([]);
    
    let countries = $state([]);
    let selectedCountry = $state("");
    
    let coffeeTypes = $state([]);
    let selectedCoffeeType = $state("Todos"); 
    
    // 1. Nuevo estado para rastrear si hay datos disponibles
    let hasData = $state(true);
    
    const metrics = [
        { id: 'production', name: 'Producción' },
        { id: 'export', name: 'Exportación' },
        { id: 'domestic_consumption', name: 'Consumo Nacional' },
        { id: 'gross_opening_stock', name: 'Stock Inicial Bruto' }
    ];

    onMount(async () => {
        try {
            const response = await fetch("/api/v2/coffee-stats?limit=2000");
            const json = await response.json();
            
            rawData = json.data || json;
            
            countries = [...new Set(rawData.map(item => item.country).filter(Boolean))].sort();
            coffeeTypes = ["Todos", ...new Set(rawData.map(item => item.coffee_type).filter(Boolean))].sort();
            
            if (countries.length > 0) {
                selectedCountry = countries[0];
            }

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

        const countryData = rawData.filter(item => item.country === selectedCountry);
        
        const activeCoffeeTypes = selectedCoffeeType === "Todos" 
            ? [...new Set(countryData.map(item => item.coffee_type))]
            : [selectedCoffeeType];

        let series = [];

        activeCoffeeTypes.forEach(type => {
            const typeData = countryData
                .filter(item => item.coffee_type === type)
                .sort((a, b) => a.year - b.year);

            metrics.forEach(metric => {
                const dataPoints = typeData.map(item => {
                    const yearX = typeof item.year === 'string' && item.year.includes('-') 
                        ? new Date(item.year).getFullYear() 
                        : Number(item.year);

                    return [
                        yearX,
                        Number(item[metric.id]) || 0
                    ];
                });

                // Solo añadimos la serie si realmente hay valores distintos de cero o si la longitud es mayor a 0
                if (dataPoints.length > 0 && dataPoints.some(point => point[1] > 0)) {
                    series.push({
                        name: `${type} - ${metric.name}`,
                        data: dataPoints
                    });
                }
            });
        });

        // 2. Evaluamos si se generaron series de datos
        if (series.length === 0) {
            hasData = false;
        } else {
            hasData = true;
            const titleSuffix = selectedCoffeeType === "Todos" ? "" : ` (${selectedCoffeeType})`;
            chart.update({
                title: { text: `Estadísticas de Café: ${selectedCountry}${titleSuffix}` },
                series: series
            }, true, true);
        }
    }

    $effect(() => {
        if (selectedCountry && selectedCoffeeType && rawData.length > 0) {
            updateChart();
        }
    });
</script>

<div class="controls">
    <div class="selector-group">
        <label for="countrySelect">País:</label>
        <select id="countrySelect" bind:value={selectedCountry}>
            {#each countries as country (country)}
                <option value={country}>{country}</option>
            {/each}
        </select>
    </div>

    <div class="selector-group">
        <label for="coffeeTypeSelect">Tipo de Café:</label>
        <select id="coffeeTypeSelect" bind:value={selectedCoffeeType}>
            {#each coffeeTypes as type (type)}
                <option value={type}>{type}</option>
            {/each}
        </select>
    </div>
</div>

{#if !hasData}
    <div class="warning-message">
        <p>⚠️ No se han encontrado datos para <strong>{selectedCoffeeType}</strong> en <strong>{selectedCountry}</strong>.</p>
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

    /* Estilos para el mensaje de advertencia */
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