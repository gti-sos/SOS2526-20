<script>
    import { onMount } from "svelte";
    import "c3/c3.css";

    onMount(async () => {
        const c3 = (await import("c3")).default;

        try {
            // 1. Cargar datos de la API de Café
            await fetch("../../../api/v2/coffee-stats/loadAllData");
            const res1 = await fetch("../../../api/v2/coffee-stats?limit=2000");
            const rawData1 = await res1.json(); 

            // 2. Cargar datos de la nueva API de Población Media
            await fetch("https://sos2526-12.onrender.com/api/v2/mid-population-ages/loadInitialData");
            const res2 = await fetch("https://sos2526-12.onrender.com/api/v2/mid-population-ages");
            const rawData2 = await res2.json();

            const coffeeArray = Array.isArray(rawData1) ? rawData1 : rawData1.data || [];
            const popArray = Array.isArray(rawData2) ? rawData2 : rawData2.data || [];

            // 3. Extraer y ordenar todos los años únicos de ambas APIs
            const allYears = [...new Set([
                ...coffeeArray.map(d => parseInt(d.year)),
                ...popArray.map(d => parseInt(d.year))
            ])].filter(y => !isNaN(y)).sort((a, b) => a - b);

            const x_column = ['x', ...allYears.map(year => `${year}-01-01`)];

            // 4. Mapear los valores
            const coffee_y = ['Producción de café', ...allYears.map(year => {
                const found = coffeeArray.find(d => parseInt(d.year) === year);
                return found ? parseFloat(found.production) : null;
            })];

            const pop_y = ['Población Media', ...allYears.map(year => {
                const found = popArray.find(d => parseInt(d.year) === year);
                return found ? parseFloat(found.max_age || found.total || 0) : null;
            })];

            // 5. Generar la gráfica con DOS ejes Y
            c3.generate({
                bindto: '#grafica-c3',
                data: {
                    x: 'x',
                    columns: [
                        x_column,
                        coffee_y,
                        pop_y
                    ],

                    axes: {
                        'Producción de café': 'y2', 
                        'Población Media': 'y'     
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%Y-%m-%d'
                        },
                        label: 'Año'
                    },
                    y: {
                        show: true, 
                        label: 'Población Media / Edad'
                    },
                    y2: {
                        label: 'Producción de Café'
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
        Gráfico temporal (timeseries) comparando la producción de café con los datos de media de población máxima mundial.
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