<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // 1. Extraemos los parámetros de la URL
    const { period, reporterdesc, flowdesc } = $page.params;

    // DEFINICIÓN DE LA API
    let API = '/api/v2/wool-stats';
    if(dev) API = 'http://localhost:3000' + API;

    // Variables de estado (Svelte 5)
    let record = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 2. Cargamos los datos del registro específico
    onMount(async () => {
        try {
            const url = `${API}/${encodeURIComponent(period)}/${encodeURIComponent(reporterdesc)}/${encodeURIComponent(flowdesc)}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errData = JSON.parse(errorText);
                    throw new Error(errData.error || "No se pudo encontrar el registro.");
                } catch (parseError) {
                    throw new Error(`Error ${res.status}: La ruta de la API no existe o devolvió HTML.`);
                }
            }
            
            record = await res.json(); 
            
        } catch (err) {
            errorMessage = err.message;
        } finally {
            isLoading = false;
        }
    });

    // 3. Función para guardar los datos
    async function handleUpdate(event) {
        event.preventDefault(); 
        
        try {
            const url = `${API}/${encodeURIComponent(period)}/${encodeURIComponent(reporterdesc)}/${encodeURIComponent(flowdesc)}`;
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
                } catch (parseError) {
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
            <h3>Editar registro: {decodeURIComponent(reporterdesc)} - {decodeURIComponent(flowdesc)} ({period})</h3>
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
                                {@const keyLower = key.toLowerCase()}
                                
                                <div style="display: flex; flex-direction: column;">
                                    <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                        {key.toUpperCase()}
                                    </label>
                                    
                                    {#if ['period', 'reporterdesc', 'flowdesc'].includes(keyLower)}
                                        <input 
                                            id={key} 
                                            type="text" 
                                            value={record[key]} 
                                            disabled 
                                            style="background-color: #eee; cursor: not-allowed; padding: 0.5rem; border: 1px solid #ccc;"
                                        />
                                    
                                    {:else if typeof record[key] === 'boolean' || keyLower.startsWith('is')}
                                        <div style="display: flex; align-items: center; height: 100%;">
                                            <input 
                                                id={key} 
                                                type="checkbox" 
                                                bind:checked={record[key]} 
                                                style="width: 20px; height: 20px; cursor: pointer;"
                                            />
                                            <span style="margin-left: 0.5rem; color: #555;">(Marcar si es verdadero)</span>
                                        </div>

                                    {:else if ['qty', 'netwgt', 'grosswgt', 'cifvalue', 'fobvalue', 'primaryvalue'].includes(keyLower)}
                                        <input 
                                            id={key} 
                                            type="number" 
                                            step="any"
                                            bind:value={record[key]} 
                                            style="padding: 0.5rem; border: 1px solid #999; border-radius: 4px;"
                                        />

                                    {:else}
                                        <input 
                                            id={key} 
                                            type="text" 
                                            bind:value={record[key]} 
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