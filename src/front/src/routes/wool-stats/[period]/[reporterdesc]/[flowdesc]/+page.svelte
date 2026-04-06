<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // Parámetros de la URL
    const { period, reporterdesc, flowdesc } = $page.params;

    // API
    let API = '/api/v2/wool-stats';
    if (dev) API = 'http://localhost:3000' + API;

    // Estado
    let record = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 📌 Diccionario de traducciones al español
    const labelsES = {
        period: "Año",
        reporterdesc: "País reportante",
        flowdesc: "Tipo de flujo",
        qtyunitabbr: "Unidad de cantidad",
        qty: "Cantidad",
        isqtyestimated: "Cantidad estimada",
        netwgt: "Peso neto",
        isnetwgtesimated: "Peso neto estimado",
        grosswgt: "Peso bruto",
        isgrosswgtesimated: "Peso bruto estimado",
        cifvalue: "Valor CIF",
        fobvalue: "Valor FOB",
        primaryvalue: "Valor primario"
    };

    // Cargar datos
    onMount(async () => {
        try {
            const url = `${API}/${period}/${encodeURIComponent(reporterdesc)}/${encodeURIComponent(flowdesc)}`;
            const res = await fetch(url);

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errData = JSON.parse(errorText);
                    throw new Error(errData.error || "No se pudo encontrar el registro.");
                } catch {
                    throw new Error(`Error ${res.status}: La ruta de la API no existe o devolvió HTML en lugar de JSON.`);
                }
            }

            record = await res.json();
        } catch (err) {
            errorMessage = err.message;
        } finally {
            isLoading = false;
        }
    });

    // Guardar cambios
    async function handleUpdate(event) {
        event.preventDefault();

        try {
            const url = `${API}/${period}/${encodeURIComponent(reporterdesc)}/${encodeURIComponent(flowdesc)}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(record)
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errData = JSON.parse(errorText);
                    throw new Error(errData.error || "Error al guardar los cambios.");
                } catch {
                    throw new Error(`Error ${res.status} al guardar: Verifica la ruta de la API.`);
                }
            }

            alert("Datos actualizados correctamente.");
            goto('/wool-stats');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
</script>

<main style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <section class="card">
        <div class="table-header">
            <h3>Editar registro: ({period}) {decodeURIComponent(reporterdesc)} - {decodeURIComponent(flowdesc)}</h3>
        </div>

        <div style="padding: 1rem;">
            {#if isLoading}
                <p>Cargando datos del servidor...</p>

            {:else if errorMessage}
                <div style="background-color: #fee; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                    <p style="color: red; margin: 0;">{errorMessage}</p>
                </div>
                <button onclick={() => goto('/wool-stats')} class="btn-secondary">Volver al listado</button>

            {:else if record}
                <form onsubmit={handleUpdate}>
                    <div class="form-grid" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">

                        {#each Object.keys(record) as key}
                            {#if key !== '_id'}
                                <div style="display: flex; flex-direction: column;">
                                    <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                        {labelsES[key] || key.replace(/_/g, ' ').toUpperCase()}
                                    </label>

                                    {#if ['period', 'reporterdesc', 'flowdesc'].includes(key)}
                                        <input 
                                            id={key}
                                            type={key === 'period' ? 'number' : 'text'}
                                            value={record[key]}
                                            disabled
                                            style="background-color: #eee; cursor: not-allowed; padding: 0.5rem; border: 1px solid #ccc;"
                                        />
                                    {:else}
                                        <input 
                                            id={key}
                                            type={typeof record[key] === 'number' ? 'number' : 'text'}
                                            step={typeof record[key] === 'number' ? 'any' : null}
                                            bind:value={record[key]}
                                            required
                                            style="padding: 0.5rem; border: 1px solid #999; border-radius: 4px;"
                                        />
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    </div>

                    <div class="actions" style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn-primary" style="flex: 1;">💾 Guardar Cambios</button>
                        <button type="button" onclick={() => goto('/wool-stats')} class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
                    </div>
                </form>
            {/if}
        </div>
    </section>
</main>
