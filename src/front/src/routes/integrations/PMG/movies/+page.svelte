<script>
  import { onMount } from 'svelte';

  let moviesData = [];

  // data: array de objetos { id, title, posterURL, imdbId }
  function processData(data) {
    const titles = data.map(m => m.title);
    const titleLengths = data.map(m => m.title.length);

    const xColumn = ['x', ...titles];                 // categorías (títulos)
    const yColumn = ['Longitud título', ...titleLengths]; // valores numéricos

    return { xColumn, yColumn };
  }

  onMount(async () => {
    try {
      const response = await fetch('https://api.sampleapis.com/movies/animation');
      moviesData = await response.json();

      const { xColumn, yColumn } = processData(moviesData);

      const c3 = window.c3;

      c3.generate({
        bindto: '#chart',
        data: {
          x: 'x',
          columns: [xColumn, yColumn],
          types: {
            'Longitud título': 'area-spline'
          }
        },
        axis: {
          x: {
            type: 'category',
            label: 'Película',
            tick: {
              rotate: 75,
              multiline: false
            },
            height: 80
          },
          y: {
            label: 'Longitud del título'
          }
        },
        point: {
          show: true
        }
      });
    } catch (error) {
      console.error('Error cargando la API:', error);
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>
</svelte:head>

<main>
  <h1>Longitud de títulos (Movies API)</h1>

  <div id="chart"></div>
</main>

<style>
  main {
    font-family: sans-serif;
    text-align: center;
    padding: 2rem;
  }

  #chart {
    height: 400px;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }
</style>
