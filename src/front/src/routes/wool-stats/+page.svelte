<script>
  // @ts-ignore
  let wools = $state([]);
  import { dev } from '$app/environment';

  let API = 'http://localhost:3000/api/v1/wool-stats';



async function getWool(){
  const res = await fetch(API,{
    method : "GET"
  });
  const data = await res.json();
  wools  = data;
}

</script>

<p>Wool</p>

<ul>
{#each wools as wool (wool.period)}
  <li>{wool.period} - {wool.reporterDesc} - {wool.flowDesc}</li>
{/each}
</ul>

<button onclick={getWool}>Refresh</button>