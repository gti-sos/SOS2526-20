<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // 1. Extraemos los nuevos parámetros de la URL actual
    // Asegúrate de que tu estructura de carpetas coincida: [area]/[item]/[year]
    const { area, item, year } = $page.params;

    // DEFINICIÓN DE LA API: Cambia esta ruta por la de tu backend real
    let API = '/api/v2/spice-stats';
    if(dev) API = 'http://localhost:3000' + API;

    // Variables de estado (Svelte 5)
    let record = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 2. Cargamos los datos del registro específico al montar el componente
 // 2. Cargamos los datos del registro específico
    onMount(async () => {
        try {
            // SOLUCIÓN 1: Codificar los parámetros en la URL
            const url = `${API}/${encodeURIComponent(area)}/${encodeURIComponent(item)}/${encodeURIComponent(year)}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                // SOLUCIÓN 2: Manejo seguro de errores por si devuelve HTML
                const errorText = await res.text();
                try {
                    const errData = JSON.parse(errorText);
                    throw new Error(errData.error || "No se pudo encontrar el registro.");
                } catch (parseError) {
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

    // 3. Función para guardar los datos modificados
    async function handleUpdate(event) {
        event.preventDefault(); 
        
        try {
            // Aplicar también la codificación aquí
            const url = `${API}/${encodeURIComponent(area)}/${encodeURIComponent(item)}/${encodeURIComponent(year)}`;
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
            goto('/spice-stats'); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
</script>

<main style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <section class="card">
        <div class="table-header">
            <h3>Editar registro: {decodeURIComponent(area)} - {decodeURIComponent(item)} ({year})</h3>
        </div>

        <div style="padding: 1rem;">
            {#if isLoading}
                <p>Cargando datos del servidor...</p>
            {:else if errorMessage}
                <div style="background-color: #fee; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                    <p style="color: red; margin: 0;">{errorMessage}</p>
                </div>
                <button onclick={() => goto('/spice-stats')} class="btn-secondary">Volver al listado</button>
            {:else if record}
                <form onsubmit={handleUpdate}>
                    <div class="form-grid" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                        
                        {#each Object.keys(record) as key}
                            {#if key !== '_id'}
                                <div style="display: flex; flex-direction: column;">
                                    <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                        {key.replace(/_/g, ' ').toUpperCase()}
                                    </label>
                                    
                                    {#if ['area', 'item', 'year'].includes(key)}
                                        <input 
                                            id={key} 
                                            type={key === 'year' ? 'number' : 'text'} 
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
                        <button type="button" onclick={() => goto('/spice-stats')} class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
                    </div>
                </form>
            {/if}
        </div>
    </section>
</main>