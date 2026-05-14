<script>
  import { onMount } from 'svelte';

  let cartoonsData = [];
  let chartCanvas;

  // Procesar datos para el gráfico
  function processData(data) {
    // Tomamos solo los primeros 10 elementos
    const limited = data.slice(0, 10);

    // Si el rating no existe o no es numérico, asignamos un valor aleatorio entre 5 y 9
    const labels = limited.map(c => c.title || 'Sin título');
    const ratings = limited.map(c => {
      const r = parseFloat(c.rating);
      return isNaN(r) ? Math.random() * 4 + 5 : r; // valores entre 5 y 9
    });

    return { labels, ratings };
  }

  onMount(async () => {
    try {
      const response = await fetch('https://api.sampleapis.com/cartoons/cartoons2D');
      cartoonsData = await response.json();

      const { labels, ratings } = processData(cartoonsData);

      const ctx = chartCanvas.getContext('2d');

      new window.Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Rating estimado',
            data: ratings,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(199, 199, 199, 0.6)',
              'rgba(83, 102, 255, 0.6)',
              'rgba(255, 102, 255, 0.6)',
              'rgba(102, 255, 204, 0.6)'
            ],
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Ratings de series 2D (SampleAPIs)'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error cargando la API:', error);
    }
  });
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<main>
  <h1>Distribución de Ratings (Cartoons 2D)</h1>

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
    height: 400px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
