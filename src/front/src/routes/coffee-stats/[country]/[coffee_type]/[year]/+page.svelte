<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';

    const { country, coffee_type, year } = $page.params;

    let API = '/api/v2/coffee-stats';
    if (dev) API = 'http://localhost:3000' + API;

<<<<<<< HEAD
    let record = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    // 📌 Diccionario de traducciones al español
    const labelsES = {
        country: "País",
        coffee_type: "Tipo de café",
        year: "Año",
        production: "Producción",
        export: "Exportación",
        domestic_consumption: "Consumo doméstico",
        gross_opening_stock: "Inventario inicial",
        gross_closing_stock: "Inventario final"
    };

    onMount(async () => {
        try {
            const url = `${API}/${encodeURIComponent(country)}/${encodeURIComponent(coffee_type)}/${encodeURIComponent(year)}`;
            const res = await fetch(url);

=======
    // Campos editables con sus etiquetas en español
    const FIELD_LABELS = {
        production:           'Producción',
        export:               'Exportación',
        domestic_consumption: 'Consumo doméstico',
        gross_opening_stock:  'Stock de apertura bruto',
    };

    // Campos de solo lectura (identidad del registro)
    const READONLY_LABELS = {
        country:     'País',
        year:        'Año',
        coffee_type: 'Tipo de café',
    };

    let coffee = $state(null);
    let isLoading = $state(true);
    let errorMessage = $state("");

    onMount(async () => {
        try {
            const res = await fetch(`${API}/${country}/${coffee_type}/${year}`);
>>>>>>> 8d99389f6243127757f279c8be1873b15c2130fb
            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errData = JSON.parse(errorText);
                    throw new Error(errData.error || "No se pudo encontrar el registro.");
                } catch {
                    throw new Error(`Error ${res.status}: La API devolvió HTML o una ruta incorrecta.`);
                }
            }
<<<<<<< HEAD

            record = await res.json();
=======
            coffee = await res.json();
>>>>>>> 8d99389f6243127757f279c8be1873b15c2130fb
        } catch (err) {
            errorMessage = err.message;
        } finally {
            isLoading = false;
        }
    });

    async function handleUpdate(event) {
        event.preventDefault();
<<<<<<< HEAD

=======
>>>>>>> 8d99389f6243127757f279c8be1873b15c2130fb
        try {
            const url = `${API}/${encodeURIComponent(country)}/${encodeURIComponent(coffee_type)}/${encodeURIComponent(year)}`;
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
                    throw new Error(`Error ${res.status}: La API no aceptó la actualización.`);
                }
            }
            alert("Datos actualizados correctamente.");
            goto('/coffee-stats');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
</script>

<main style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <section class="card">
        <div class="table-header">
            <h3>Editar registro: {decodeURIComponent(country)} - {decodeURIComponent(coffee_type)} ({year})</h3>
        </div>

        <div style="padding: 1rem;">
            {#if isLoading}
                <p>Cargando datos del servidor...</p>

            {:else if errorMessage}
                <div style="background-color: #fee; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                    <p style="color: red; margin: 0;">{errorMessage}</p>
                </div>
                <button onclick={() => goto('/coffee-stats')} class="btn-secondary">Volver al listado</button>

<<<<<<< HEAD
            {:else if record}
                <form onsubmit={handleUpdate}>
                    <div class="form-grid" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">

                        {#each Object.keys(record) as key}
                            {#if key !== '_id'}
                                <div style="display: flex; flex-direction: column;">
                                    <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                        {labelsES[key] || key.replace(/_/g, ' ').toUpperCase()}
                                    </label>

                                    {#if ['country', 'coffee_type', 'year'].includes(key)}
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
=======
            {:else if coffee}
                <form onsubmit={handleUpdate}>
                    <div class="form-grid" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">

                        <!-- Campos de solo lectura -->
                        {#each Object.entries(READONLY_LABELS) as [key, label]}
                            <div style="display: flex; flex-direction: column;">
                                <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                    {label}
                                </label>
                                <input
                                    id={key}
                                    type={key === 'year' ? 'number' : 'text'}
                                    value={coffee[key]}
                                    disabled
                                    style="background-color: #eee; cursor: not-allowed; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"
                                />
                            </div>
>>>>>>> 8d99389f6243127757f279c8be1873b15c2130fb
                        {/each}

                        <!-- Campos editables -->
                        {#each Object.entries(FIELD_LABELS) as [key, label]}
                            <div style="display: flex; flex-direction: column;">
                                <label for={key} style="font-weight: bold; margin-bottom: 0.3rem;">
                                    {label}
                                </label>
                                <input
                                    id={key}
                                    type="number"
                                    step="any"
                                    bind:value={coffee[key]}
                                    required
                                    style="padding: 0.5rem; border: 1px solid #999; border-radius: 4px;"
                                />
                            </div>
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
