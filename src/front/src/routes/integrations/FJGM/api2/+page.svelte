<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import c3 from "c3";

    let chart;

    onMount(async () => {

        // 1. Obtener datos de la API
        const res = await fetch("https://api.sampleapis.com/wines/reds");
        const wines = await res.json();

        console.log("Vinos:", wines);

        // 2. Filtrar vinos con rating válido y quedarnos con el TOP 20
        const validWines = wines
            .filter(w => w.rating?.average)
            .sort((a, b) => b.rating.average - a.rating.average)
            .slice(0, 20);

        // 3. Preparar columnas para C3
        const wineNames = ["x", ...validWines.map(w => w.wine)];
        const ratings = ["Rating", ...validWines.map(w => w.rating.average)];

        // 4. Crear gráfica C3 (solo tipo area)
        chart = c3.generate({
            bindto: "#chart",
            data: {
                x: "x",
                columns: [
                    wineNames,
                    ratings
                ],
                types: {
                    Rating: "area"
                }
            },
            axis: {
                x: {
                    type: "category",
                    tick: {
                        rotate: 60,       // Más inclinación → más espacio
                        multiline: false,
                        culling: false    // No elimina etiquetas
                    },
                    height: 120          // Más espacio para etiquetas
                },
                y: {
                    label: "Rating promedio",
                    padding: { top: 20, bottom: 20 }
                }
            },
            padding: {
                top: 20,
                right: 30,
                bottom: 40,              // Más espacio inferior
                left: 60
            },
            point: {
                r: 3                     // Puntos más pequeños
            },
            size: {
                height: 500,             // Gráfica más alta
                width: 1100              // Gráfica más ancha
            }
        });
    });
</script>

<h2 style="text-align:center;">Top 20 vinos tintos por rating</h2>

<div id="chart"></div>

<style>
    #chart {
        max-width: 1200px;
        margin: 0 auto;
    }
</style>
