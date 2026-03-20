<script>
   let wools = $state([])

async function getwool(){
   const res = await fetch("http://localhost:3000/api/v1/wool-stats",{
        method: "GET"
   });
   const data = await res.json();
   wools = data;
}
</script>

<p>LANA</p>
<ul>
{#each  wools as wool (wool.period, wool.reporterDesc,wool.flowDesc)}
    <li> {wool.period} - {wool.reporterDesc} - {wool.flowDesc}</li>
{/each}
</ul>

<button onclick={getwool}>Refresh</button>