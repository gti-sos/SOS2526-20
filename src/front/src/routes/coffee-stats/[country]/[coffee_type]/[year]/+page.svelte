<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    // 1. Extraemos los parámetros de la URL actual
    const { country, coffee_type, year } = $page.params;

    let API = '/api/v2/coffee-stats';
    if(dev) API = 'http://localhost:3000' + API;

    let coffee = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 2. Cargamos los datos del registro específico
    onMount(async () => {
        try {
            // Hacemos el GET a tu API (usamos las variables de la URL)
            const res = await fetch(`${API}/${country}/${coffee_type}/${year}`);
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "No se pudo encontrar el registro.");
            }
            
            // Guardamos el JSON que nos devuelve el backend en la variable reactiva
            coffee = await res.json(); 
            
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
            const res = await fetch(`${API}/${country}/${coffee_type}/${year}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(coffee)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Error al guardar los cambios.");
            }

            alert("Datos actualizados correctamente.");
            // Usamos goto() para volver a la tabla sin recargar la página (evita el 404)
            goto('/coffee-stats'); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
</script>

<main style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <section class="card">
        <div class="table-header">
            <h3>Editar registro: {decodeURIComponent(country)} ({year})</h3>
        </div>

        <div style="padding: 1rem;">
            {#if isLoading}
                <p>Cargando datos del servidor...</p>
            {:else if errorMessage}
                <div style="background-color: #fee; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                    <p style="color: red; margin: 0;">{errorMessage}</p>
                </div>
                <button onclick={() => goto('/coffee-stats')} class="btn-secondary">Volver al listado</button>
            {:else if coffee}
                <form onsubmit={handleUpdate}>
                    <div class="form-grid" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                        
                        {#each Object.keys(coffee) as key}
                            {#if key !== '_id'}
                                <div style="display: flex; flex-direction: column;">
                                    <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                        {key.replace(/_/g, ' ').toUpperCase()}
                                    </label>
                                    
                                    {#if ['country', 'coffee_type', 'year'].includes(key)}
                                        <input 
                                            id={key} 
                                            type={key === 'year' ? 'number' : 'text'} 
                                            value={coffee[key]} 
                                            disabled 
                                            style="background-color: #eee; cursor: not-allowed; padding: 0.5rem; border: 1px solid #ccc;"
                                        />
                                    {:else}
                                        <input 
                                            id={key} 
                                            type="number" 
                                            step="any"
                                            bind:value={coffee[key]} 
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
                        <button type="button" onclick={() => goto('/coffee-stats')} class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
                    </div>
                </form>
            {/if}
        </div>
    </section>
</main>