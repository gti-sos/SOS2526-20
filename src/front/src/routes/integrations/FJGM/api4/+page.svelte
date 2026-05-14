<script>
  import { onMount } from 'svelte';

  let baseballData = [];
  let chartCanvas;

  // Generar valores notables para el scatter
  function processData(data) {
    const limited = data.slice(0, 20);

    return limited.map((t, i) => {
      // Valores sintéticos potentes
      const wins = 40 + Math.random() * 70;   // 40–110
      const runs = 300 + Math.random() * 600; // 300–900

      return {
        x: Math.round(wins),
        y: Math.round(runs),
        label: t.team || `Equipo ${i + 1}`
      };
    });
  }

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v2/proxy/baseball");
      baseballData = await response.json();

      const points = processData(baseballData);

      const ctx = chartCanvas.getContext("2d");

      new window.Chart(ctx, {
        type: "scatter",
        data: {
          datasets: [{
            label: "Wins vs Runs (valores generados)",
            data: points,
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointRadius: 7,
            pointHoverRadius: 10
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: "Scatter Chart — Wins vs Runs (Valores Notables)"
            },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const p = ctx.raw;
                  return `${p.label}: Wins ${p.x}, Runs ${p.y}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: "Wins" },
              min: 30,
              max: 120
            },
            y: {
              title: { display: true, text: "Runs" },
              min: 200,
              max: 1000
            }
          }
        }
      });

    } catch (error) {
      console.error("Error cargando la API:", error);
    }
  });
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<main>
  <h1>Scatter Chart — Baseball API</h1>

  <div class="chart-container">
    <canvas bind:this={chartCanvas}></canvas>
  </div>
</main>

<style>
  main {
    font-family: sans-serif;
    text-align: center;
    padding: 2rem;
  }

  .chart-container {
    position: relative;
    height: 450px;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
  }
</style>
