<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    const { area, item, year } = $page.params;

    let API = '/api/v2/spice-stats';
    if (dev) API = 'http://localhost:3000' + API;

    let record = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 📌 Diccionario de traducciones al español
    const labelsES = {
        domain_code: "Código de dominio",
        domain: "Dominio",
        area_code: "Código de área",
        area: "Área",
        element_code: "Código de elemento",
        item_code: "Código de ítem",
        item: "Producto",
        year: "Año",
        unit: "Unidad",
        import: "Importación",
        export: "Exportación",
        production: "Producción",
        consumption: "Consumo"
    };

    onMount(async () => {
        try {
            const url = `${API}/${encodeURIComponent(area)}/${encodeURIComponent(item)}/${encodeURIComponent(year)}`;
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

    async function handleUpdate(event) {
        event.preventDefault();

        try {
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
                } catch {
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
                                        {labelsES[key] || key.replace(/_/g, ' ').toUpperCase()}
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
                        <button type="submit" class="btn-primary" style="flex: 1;" id="btnGuardarEdicion">💾 Guardar Cambios</button>
                        <button type="button" onclick={() => goto('/spice-stats')} class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
                    </div>
                </form>
            {/if}
        </div>
    </section>
</main>

<!-- <style>
    main {
        padding: 2rem;
        max-width: 700px;
        margin: 0 auto;
        font-family: "Segoe UI", sans-serif;
        color: #5a3e2b;
    }

    .card {
        background: #fff8ef;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        border-left: 6px solid #e67e22;
    }

    .table-header h3 {
        margin: 0;
        padding-bottom: 1rem;
        color: #c0392b;
        border-bottom: 2px solid #f5e6c8;
    }

    .form-grid input {
        padding: 10px;
        border: 2px solid #e6c9a8;
        border-radius: 6px;
        background: #fff;
        transition: 0.2s;
    }

    .form-grid input:focus {
        border-color: #e67e22;
        outline: none;
        box-shadow: 0 0 5px rgba(230,126,34,0.5);
    }

    .form-grid input[disabled] {
        background: #eee;
        cursor: not-allowed;
        border-color: #d5c4b0;
    }

    .btn-primary,
    .btn-secondary {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.2s;
        color: white;
    }

    .btn-primary {
        background: #27ae60;
    }

    .btn-primary:hover {
        background: #1e874b;
        transform: scale(1.05);
    }

    .btn-secondary {
        background: #c0392b;
    }

    .btn-secondary:hover {
        background: #922b21;
        transform: scale(1.05);
    }
</style> -->
