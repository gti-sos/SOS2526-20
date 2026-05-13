<script>
  import { onMount } from 'svelte';

  let chart;
  let coffeeData = [];

  // Función para procesar los ingredientes y contar frecuencias
  function processData(data) {
    const ingredientCounts = {};
    
    data.forEach(item => {
      item.ingredients.forEach(ingredient => {
        ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
      });
    });

    // Convertimos el objeto a formato de columnas de C3: [['Ingrediente', cantidad], ...]
    return Object.entries(ingredientCounts);
  }

  onMount(async () => {
    try {
      // Usamos el endpoint funcional: /coffee/hot
      const response = await fetch('https://api.sampleapis.com/coffee/hot');
      coffeeData = await response.json();
      
      const columns = processData(coffeeData);

      // Inicializamos el gráfico
      c3.generate({
        bindto: '#chart',
        data: {
          columns: columns,
          type: 'pie',
          onclick: function (d, i) { console.log("onclick", d, i); },
          onmouseover: function (d, i) { console.log("onmouseover", d, i); },
          onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
      });
    } catch (error) {
      console.error("Error cargando la API:", error);
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>
</svelte:head>

<main>
  <h1>Distribución de Ingredientes (Coffee API)</h1>

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
    max-width: 800px;
    margin: 0 auto;
  }
</style>