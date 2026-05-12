<script>
    import { onMount, tick } from 'svelte';
    import Highcharts from 'highcharts';

    let mensaje = "Descargando datos de las APIs...";

    async function loadInitialData() {
        try {
            console.log("1. Lanzando carga inicial de APIs...");

            // -------------------------------
            // 1) Cargar datos en el backend
            // -------------------------------
            await fetch("https://sos2526-20-stable.onrender.com/api/v2/wool-stats/loadInitialData");
            await fetch("https://soporte-sos.onrender.com/api/v1/religious-believes-stats/loadInitialData");

            // -------------------------------
            // 2) Obtener datos reales
            // -------------------------------
            const woolRes = await fetch("https://sos2526-20-stable.onrender.com/api/v2/wool-stats?limit=1000");
            const religionRes = await fetch("https://soporte-sos.onrender.com/api/v1/religious-believes-stats?limit=1000");

            const woolJson = await woolRes.json();
            const religionJson = await religionRes.json();

            const woolArray = woolJson.data || [];
            const religionArray = Array.isArray(religionJson) ? religionJson : (religionJson.data || []);

            console.log("2. Cruzando datos...");

            const puntos = [];

            woolArray.forEach(w => {
                const r = religionArray.find(rel =>
                    rel.entity &&
                    w.reporterdesc &&
                    String(rel.entity).toLowerCase().trim() === String(w.reporterdesc).toLowerCase().trim()
                );

                if (r) {
                    const lana = parseFloat(w.qty);
                    const cristianos = parseFloat(r.christian);

                    if (!isNaN(lana) && !isNaN(cristianos) && lana > 0) {
                        puntos.push({
                            name: w.reporterdesc,
                            x: cristianos,
                            y: lana
                        });
                    }
                }
            });

            if (puntos.length === 0) {
                mensaje = "No se encontraron países que coincidan en ambas tablas.";
                return;
            }

            mensaje = ""; // Ocultamos mensaje

            console.log(`3. Pintando gráfica con ${puntos.length} puntos...`);

            await tick(); // Esperar a que el DOM esté listo

            Highcharts.chart('mi-contenedor-seguro', {
                accessibility: { enabled: false },
                chart: { 
                    type: 'scatter', 
                    zooming: { type: 'xy' } 
                },
                title: { text: 'Producción de Lana vs Población Cristiana' },
                xAxis: { 
                    title: { text: 'Población Cristiana (%)' },
                    labels: { format: '{value}%' }
                },
                yAxis: { 
                    type: 'logarithmic',
                    title: { text: 'Producción de Lana (kg)' } 
                },
                tooltip: { 
                    pointFormat: '<b>{point.name}</b><br/>Cristianos: {point.x}%<br/>Lana: {point.y} kg' 
                },
                series: [{
                    name: 'Países Coincidentes',
                    color: 'rgba(5, 141, 199, 0.7)',
                    data: puntos
                }]
            });

        } catch (error) {
            console.error("Error grave:", error);
            mensaje = "Hubo un error de conexión con las APIs.";
        }
    }

    onMount(() => {
        loadInitialData();
    });
</script>

<main>
    {#if mensaje !== ""}
        <h3 class="estado">{mensaje}</h3>
    {/if}
    
    <div id="mi-contenedor-seguro"></div>
</main>

<style>
    main {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        font-family: sans-serif;
    }
    
    .estado {
        text-align: center;
        color: #0056b3;
        margin-bottom: 20px;
    }

    #mi-contenedor-seguro {
        width: 100%;
        height: 600px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fafafa;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
</style>
