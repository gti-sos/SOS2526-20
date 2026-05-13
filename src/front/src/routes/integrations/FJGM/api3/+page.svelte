<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    let chart;
    let mensaje = "Cargando datos...";

    onMount(async () => {
        try {
            // 1. Obtener datos de la API
            const res = await fetch("https://api.sampleapis.com/cartoons/cartoons2D");
            const cartoons = await res.json();

            // 2. Filtrar cartoons con rating válido
            const valid = cartoons
                .filter(c => c.rating && !isNaN(parseFloat(c.rating)))
                .slice(0, 10); // solo 10 para que el pie sea legible

            if (valid.length === 0) {
                mensaje = "No hay datos válidos.";
                return;
            }

            // 3. Preparar datos para Chart.js
            const labels = valid.map(c => c.title);
            const ratings = valid.map(c => parseFloat(c.rating));

            const colors = [
                "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff",
                "#ff9f40", "#c9cbcf", "#ff6384aa", "#36a2ebaa", "#ffcd56aa"
            ];

            mensaje = "";

            // 4. Crear gráfico
            const ctx = document.getElementById("myChart");

            chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Rating",
                            data: ratings,
                            backgroundColor: colors
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top"
                        },
                        title: {
                            display: true,
                            text: "Ratings de series 2D (SampleAPIs)"
                        }
                    }
                }
            });

        } catch (err) {
            console.error(err);
            mensaje = "Error cargando datos.";
        }
    });
</script>

{#if mensaje}
<h3>{mensaje}</h3>
{/if}

<canvas id="myChart" width="400" height="400"></canvas>

<style>
    h3 {
        text-align: center;
        font-family: sans-serif;
    }
    canvas {
        max-width: 600px;
        margin: 0 auto;
        display: block;
    }
</style>
