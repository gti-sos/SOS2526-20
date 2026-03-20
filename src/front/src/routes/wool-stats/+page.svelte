
<!-- <ul>
{#each wools as wool (wool.period)}
  <li>{wool.period} - {wool.reporterDesc} - {wool.flowDesc}</li>
{/each}
</ul> -->

<script>
    // @ts-ignore
    let wools = $state([]);
    import { dev } from '$app/environment';

    let API = '/api/v1/wool-stats';
     let resultStatusCode = $state(0);
    if(dev)
        API = 'http://localhost:3000'+API;

    async function getWools(){
        try{
            const res = await fetch(API);
            const data = await res.json();
            wools = data.data;
        } catch(err){
            return err;
        }
    }

    async function deleteWools(){

    //console.log("DELETE "+name);

    const res = await fetch(API,{
      method : "DELETE"
    });
    resultStatusCode = await res.status;
    
    if(resultStatusCode == 200)
      getWools();

  }
</script>

<h2>Wools</h2>

{#each wools as wool (`${wool.period}-${wool.reporterDesc}-${wool.flowDesc}`)}
    <tr>
        <td>{wool.period}</td>
        <td>{wool.reporterDesc}</td>
        <td>{wool.flowDesc}</td>
    </tr>
{/each}


<button onclick={getWools}>Refresh</button>
<button onclick={deleteWools}>Borrar</button>