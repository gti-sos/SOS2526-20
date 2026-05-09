<script>
    import { onMount } from "svelte";
    import "c3/c3.css";

    onMount(async () => {
        const c3 = (await import("c3")).default;

        try {
            // 1. Cargar datos de ambas APIs
            await fetch("../../../api/v2/coffee-stats/loadAllData");
            const res1 = await fetch("../../../api/v2/coffee-stats?limit=2000");
            const rawData1 = await res1.json(); 

            await fetch("https://soporte-sos.onrender.com/api/v1/aids-deaths-stats/loadInitialData");
            const res2 = await fetch("https://soporte-sos.onrender.com/api/v1/aids-deaths-stats");
            const rawData2 = await res2.json();

            const coffeeArray = Array.isArray(rawData1) ? rawData1 : rawData1.data || [];
            const aidsArray = Array.isArray(rawData2) ? rawData2 : rawData2.data || [];

            // 2. Extraer y ordenar todos los años únicos
            const allYears = [...new Set([
                ...coffeeArray.map(d => parseInt(d.year)),
                ...aidsArray.map(d => parseInt(d.year))
            ])].filter(y => !isNaN(y)).sort((a, b) => a - b);

            // 3. Mapear la producción de café por año
            const coffee_y = ['Producción de café', ...allYears.map(year => {
                const found = coffeeArray.find(d => parseInt(d.year) === year);
                return found ? parseFloat(found.production) : null;
            })];

            // 4. Mapear las muertes por SIDA por año (sumando todas las edades de ese año)
            const aids_y = ['Muertes por SIDA', ...allYears.map(year => {
                const found = aidsArray.find(d => parseInt(d.year) === year);
                if (found) {
                    return parseFloat(found.death_count_hiv_aids_under_5 || 0) +
                           parseFloat(found.death_count_hiv_aids_5_14 || 0) +
                           parseFloat(found.death_count_hiv_aids_15_49 || 0) +
                           parseFloat(found.death_count_hiv_aids_50_69 || 0) +
                           parseFloat(found.death_count_hiv_aids_70_plus || 0);
                }
                return null;
            })];

            // 5. Generar la gráfica de barras con categorías (sin timeseries)
            c3.generate({
                bindto: '#grafica-c3',
                data: {
                    columns: [
                        coffee_y,
                        aids_y
                    ],
                    type: 'bar', // Gráfico de barras
                    axes: {
                        'Producción de café': 'y',  // Eje izquierdo
                        'Muertes por SIDA': 'y2'    // Eje derecho
                    }
                },
                axis: {
                    x: {
                        type: 'category', // Eje categórico en lugar de timeseries
                        categories: allYears.map(String), // Convertimos los años a texto para las etiquetas
                        label: {
                            text: 'Año',
                            position: 'outer-center'
                        },
                        tick: {
                            rotate: 45, // Rotamos las etiquetas para que no se pisen si hay muchos años
                            multiline: false
                        }
                    },
                    y: {
                        label: {
                            text: 'Producción de Café (Eje Izquierdo)',
                            position: 'outer-middle'
                        }
                    },
                    y2: {
                        show: true,
                        label: {
                            text: 'Muertes por SIDA (Eje Derecho)',
                            position: 'outer-middle'
                        }
                    }
                }
            });

        } catch (error) {
            console.error("Error al cargar o procesar los datos:", error);
        }
    });
</script>

<figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    
    <p class="description">
        Comparativa por años mediante barras (eje categórico). La producción de café utiliza la escala izquierda y las muertes por SIDA la derecha.
    </p>
</figure>

<style>
    .c3-figure {
        margin: 20px 0;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .description {
        text-align: center;
        font-family: sans-serif;
        color: #555;
        margin-top: 15px;
    }
</style>