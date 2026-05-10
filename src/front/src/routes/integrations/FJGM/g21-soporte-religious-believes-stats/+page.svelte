<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    let mensaje = "Descargando datos de las APIs...";

    onMount(async () => {
        try {
            console.log("1. Pidiendo datos...");
            const [woolRes, religionRes] = await Promise.all([
                fetch("https://sos2526-20-stable.onrender.com/api/v2/wool-stats?limit=1000"),
                fetch("https://soporte-sos.onrender.com/api/v1/religious-believes-stats?limit=1000")
            ]);

            const woolJson = await woolRes.json();
            const religionJson = await religionRes.json();

            const woolArray = woolJson.data || [];
            const religionArray = Array.isArray(religionJson) ? religionJson : (religionJson.data || []);

            console.log("2. Cruzando datos...");
            const puntos = [];

            woolArray.forEach(w => {
                const r = religionArray.find(rel => 
                    rel.entity && w.reporterdesc &&
                    String(rel.entity).toLowerCase().trim() === String(w.reporterdesc).toLowerCase().trim()
                );

                if (r) {
                    const lana = parseFloat(w.qty);
                    const cristianos = parseFloat(r.christian);

                    // lana > 0 es obligatorio para la escala logarítmica
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

            // Ocultamos el mensaje de texto porque ya tenemos datos
            mensaje = ""; 

            console.log(`3. Pintando gráfica con ${puntos.length} puntos...`);

            // Le decimos a Highcharts que ataque directamente al ID del div. ¡Nada de intermediarios!
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
                    type: 'logarithmic', // Escala logarítmica para que países inmensos como China no aplasten al resto
                    title: { text: 'Producción de Lana (kg)' } 
                },
                tooltip: { 
                    pointFormat: '<b>{point.name}</b><br/>Cristianos: {point.x}%<br/>Lana: {point.y} kg' 
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 5,
                            states: {
                                hover: { enabled: true, lineColor: 'rgb(100,100,100)' }
                            }
                        }
                    }
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