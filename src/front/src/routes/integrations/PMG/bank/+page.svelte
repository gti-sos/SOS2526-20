<script>
  import { onMount } from 'svelte';

  let accountsData = [];
  let chartCanvas; // Referencia al canvas

  // Procesamos los datos para el gráfico de Dona (Doughnut)
  function processData(data) {
    // Limitamos a los primeros 10-12 elementos. En gráficos de dona, 
    // demasiadas porciones hacen que sea imposible de leer.
    const limitedData = data.slice(0, 10); 
    
    const labels = limitedData.map(acc => acc.accountName || `Cuenta ${acc.id}`);
    const debits = limitedData.map(acc => acc.debit || 0); // Usamos debit como corregiste

    // Generamos colores de fondo aleatorios/dinámicos para cada porción
    const backgroundColors = limitedData.map((_, i) => `hsl(${(i * 360) / limitedData.length}, 70%, 60%)`);
    const borderColors = limitedData.map((_, i) => `hsl(${(i * 360) / limitedData.length}, 70%, 45%)`);

    return { labels, debits, backgroundColors, borderColors };
  }

  onMount(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v2/proxy/fakebank');
      accountsData = await response.json();

      const { labels, debits, backgroundColors, borderColors } = processData(accountsData);
      const ctx = chartCanvas.getContext('2d');

      new window.Chart(ctx, {
        type: 'doughnut', // Cambiado a dona
        data: {
          labels: labels, // Los nombres de las cuentas se muestran en la leyenda
          datasets: [{
            label: 'Débito',
            data: debits, // Los valores de los débitos
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top', // Configuración solicitada
            },
            title: {
              display: true,
              text: 'Chart.js Doughnut Chart' // Título solicitado
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
  <h1>Distribución de Débitos (FakeBank API)</h1>

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
    height: 450px; /* Un poco más de altura para que la leyenda "top" y la dona quepan cómodas */
    width: 100%;
    max-width: 600px; /* Las donas se ven mejor si son más contenidas y no tan estiradas */
    margin: 0 auto;
  }
</style>