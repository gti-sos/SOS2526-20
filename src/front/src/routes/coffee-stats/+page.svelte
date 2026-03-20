<script>
  // @ts-ignore
  let coffees = $state([]);
  import { dev } from '$app/environment';

  let API = '/api/v1/coffee-stats';

  if(dev)
    API = "http://localhost:3000"+API;

async function getCoffee(){
  const res = await fetch(API,{
    method : "GET"
  });
  const data = await res.json();
  coffees  = data;
}

</script>

<p>Coffee</p>

<ul>
{#each coffees as coffee (coffee.country, coffee.coffee_type, coffee.year) }
  <li>{coffee.country} - {coffee.coffee_type}</li>
{/each}
</ul>

<button onclick={getCoffee}>Refresh</button>