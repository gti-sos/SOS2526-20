<script>
  import { onMount } from 'svelte';

  let countriesData = [];
  let chartCanvas; // Referencia al elemento canvas

  // Procesamos los datos: extraemos nombres y población
  function processData(data) {
    // Tomamos solo los primeros 30 países para que el gráfico sea más legible
    const limitedData = data.slice(0, 30); 
    
    const labels = limitedData.map(c => c.name);
    const populations = limitedData.map(c => c.population);

    return { labels, populations };
  }

  onMount(async () => {
    try {
      const response = await fetch('https://api.sampleapis.com/countries/countries');
      countriesData = await response.json();

      const { labels, populations } = processData(countriesData);

      // Instanciamos Chart.js en el canvas
      const ctx = chartCanvas.getContext('2d');

      new window.Chart(ctx, {
        type: 'bar', // Cambiado a gráfico de barras ('line' también funcionaría bien)
        data: {
          labels: labels,
          datasets: [{
            label: 'Población',
            data: populations,
            backgroundColor: 'rgba(54, 162, 235, 0.5)', // Color de relleno
            borderColor: 'rgba(54, 162, 235, 1)',       // Color del borde
            borderWidth: 1,
            fill: true // Si cambias type a 'line', esto emulará el 'area-spline'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 75,
                minRotation: 75
              }
            },
            y: {
              beginAtZero: true
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
  <h1>Población por País (Countries API)</h1>

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
    max-width: 900px;
    margin: 0 auto;
  }
</style>