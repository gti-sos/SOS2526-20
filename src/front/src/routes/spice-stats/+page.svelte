<script>
  import { dev } from '$app/environment';
  import { onMount } from 'svelte';
  import { Button, Table } from 'sveltestrap';

  let API = '/api/v1/spice-stats';
  if (dev) API = "http://localhost:3000" + API;

  // @ts-ignore
  let spiceStats = $state([]);
  let resultStatusCode = $state(0);

  // Campos para insertar (ajusta según necesites)
  let newArea = $state("");
  let newItem = $state("");
  let newYear = $state(new Date().getFullYear());
  let newUnit = $state("t");
  let newImport = $state(0);
  let newExport = $state(0);
  let newProduction = $state(0);
  let newConsumption = $state(0);

  async function getSpiceStats(){
    const res = await fetch(API, { method: "GET" });
    const data = await res.json();
    spiceStats = data;
  }

  // Construye query string segura para identificar un registro
  function buildKeyQuery(area, item, year){
    const q = `area=${encodeURIComponent(area)}&item=${encodeURIComponent(item)}&year=${encodeURIComponent(year)}`;
    return q;
  }

  // DELETE usando query params: /api/v1/spice-stats?area=...&item=...&year=...
  async function deleteStat(area, item, year){
    const query = buildKeyQuery(area, item, year);
    const res = await fetch(`${API}?${query}`, { method: "DELETE" });
    resultStatusCode = res.status;
    if (resultStatusCode === 200) getSpiceStats();
  }

  // PUT para editar (ejemplo): envía el objeto completo y usa query params para identificar
  async function updateStat(area, item, year, updatedFields){
    const query = buildKeyQuery(area, item, year);
    const res = await fetch(`${API}?${query}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    });
    resultStatusCode = res.status;
    if (resultStatusCode === 200) getSpiceStats();
  }

  // POST para insertar nuevo registro
  async function insertStat(){
    const newStat = {
      domain_code: "TCL",
      domain: "Crops and livestock products",
      area: newArea,
      item: newItem,
      year: Number(newYear),
      unit: newUnit,
      import: Number(newImport),
      export: Number(newExport),
      production: Number(newProduction),
      consumption: Number(newConsumption)
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStat)
    });

    resultStatusCode = res.status;
    if (resultStatusCode === 201) getSpiceStats();
  }

  onMount(async () => {
    getSpiceStats();
  });
</script>

<h3>Spice Stats</h3>

<Table>
  <thead>
    <tr>
      <th>Area</th>
      <th>Item</th>
      <th>Year</th>
      <th>Import</th>
      <th>Export</th>
      <th>Production</th>
      <th>Consumption</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    <!-- Fila para insertar nuevo -->
    <tr>
      <td><input bind:value={newArea} placeholder="Area"/></td>
      <td><input bind:value={newItem} placeholder="Item"/></td>
      <td><input type="number" bind:value={newYear} style="width:80px"/></td>
      <td><input type="number" bind:value={newImport} step="0.01" style="width:100px"/></td>
      <td><input type="number" bind:value={newExport} step="0.01" style="width:100px"/></td>
      <td><input type="number" bind:value={newProduction} step="0.01" style="width:100px"/></td>
      <td><input type="number" bind:value={newConsumption} step="0.01" style="width:100px"/></td>
      <td><Button color="primary" onclick={insertStat}>Insert</Button></td>
    </tr>

    {#each spiceStats as stat (encodeURIComponent(stat.area) + '|' + encodeURIComponent(stat.item) + '|' + stat.year)}
      <tr>
        <td>{stat.area}</td>
        <td style="max-width:400px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{stat.item}</td>
        <td>{stat.year}</td>
        <td>{stat.import}</td>
        <td>{stat.export}</td>
        <td>{stat.production}</td>
        <td>{stat.consumption}</td>
        <td>
          <Button color="warning" onclick={() => updateStat(stat.area, stat.item, stat.year, { /* campos a actualizar */ })}>Edit</Button>
          <Button color="danger" onclick={() => deleteStat(stat.area, stat.item, stat.year)}>Delete</Button>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>

{#if resultStatusCode != 0}
  <h5>StatusCode of Operation: {resultStatusCode}</h5>
{/if}
