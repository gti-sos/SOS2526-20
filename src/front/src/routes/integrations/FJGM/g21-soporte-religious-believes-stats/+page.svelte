<script>
    import { onMount, tick } from 'svelte'; // <-- Añadimos tick
    import Highcharts from 'highcharts';

    let chartContainer;
    let errorMessage = "";
    let isLoading = true;

    onMount(async () => {
        try {
            console.log("1. Pidiendo datos a las APIs...");

            fetch("https://sos2526-20.onrender.com/api/v2/wool-stats/loadInitialData").catch(()=>{});
            fetch("https://soporte-sos.onrender.com/api/v1/religious-believes-stats/loadInitialData").catch(()=>{});

            const [woolRes, religionRes] = await Promise.all([
                fetch("https://sos2526-20.onrender.com/api/v2/wool-stats?limit=2000"),
                fetch("https://soporte-sos.onrender.com/api/v1/religious-believes-stats?limit=2000")
            ]);

            const woolJson = await woolRes.json();
            const religionJson = await religionRes.json();

            const woolData = Array.isArray(woolJson) ? woolJson : (woolJson.data || []);
            const religionData = Array.isArray(religionJson) ? religionJson : (religionJson.data || []);

            const mergedData = [];

            woolData.forEach(w => {
                if (!w || !w.reporterdesc) return; 

                const r = religionData.find(rel => 
                    rel && rel.entity &&
                    String(rel.entity).toLowerCase().trim() === String(w.reporterdesc).toLowerCase().trim()
                );

                if (r) {
                    mergedData.push({
                        country: w.reporterdesc,
                        woolYear: w.period,
                        relYear: r.year,
                        woolStat: Number(w.qty) || 0,
                        religionStat: Number(r.christian) || 0
                    });
                }
            });

            console.log("3. Datos cruzados con éxito:", mergedData);

            if (mergedData.length === 0) {
                errorMessage = "No hay coincidencias de país entre las dos APIs.";
                isLoading = false;
                return;
            }

            const scatterPoints = mergedData.map(item => ({
                name: `${item.country} (Lana: ${item.woolYear}, Rel: ${item.relYear})`,
                x: item.religionStat,
                y: item.woolStat
            }));

            // --- EL ARREGLO MÁGICO ESTÁ AQUÍ ---
            isLoading = false; // 1. Quitamos el mensaje de carga
            await tick();      // 2. Esperamos a que Svelte muestre el contenedor del gráfico real

            // 3. Highcharts ya puede calcular el tamaño y pintar sin colgarse
            Highcharts.chart(chartContainer, {
                accessibility: { enabled: false },
                chart: { type: 'scatter', zooming: { type: 'xy' } },
                title: { text: 'Relación entre Producción de Lana y Cristianos' },
                xAxis: { 
                    title: { text: 'Población Cristiana (%)' }, 
                    labels: { format: '{value} %' } 
                },
                yAxis: { 
                    title: { text: 'Cantidad de Lana (kg)' } 
                },
                tooltip: { 
                    pointFormat: '<b>{point.name}</b><br/>Cristianos: {point.x} % <br/> Lana: {point.y} kg' 
                },
                series: [{ 
                    name: 'Países Coincidentes', 
                    color: 'rgba(5, 141, 199, 0.5)', 
                    data: scatterPoints 
                }]
            });

        } catch (err) {
            console.error("Error:", err);
            errorMessage = "El código falló al procesar los datos.";
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <div class="status-box info">
        <p>Cargando datos y cruzando tablas...</p>
    </div>
{:else if errorMessage}
    <div class="status-box error">
        <h3>Aviso</h3>
        <p>{errorMessage}</p>
    </div>
{/if}

<div class="chart-wrapper" class:hidden={isLoading || errorMessage}>
    <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 500px;
        margin: 0 auto;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
    }
    .chart-wrapper {
        width: 100%;
        margin-top: 20px;
    }
    
    /* Esta clase oculta el gráfico mientras carga sin romper Highcharts */
    .hidden {
        position: absolute;
        visibility: hidden;
        z-index: -10;
    }

    .status-box {
        padding: 20px;
        margin: 40px auto;
        border-radius: 8px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .status-box.info {
        background-color: #e2eefd;
        color: #004085;
        border: 1px solid #b8daff;
    }
    .status-box.error {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
    }
</style>