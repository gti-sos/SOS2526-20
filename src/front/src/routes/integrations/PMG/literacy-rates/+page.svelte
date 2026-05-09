<script>
    import { onMount } from "svelte";
    import "c3/c3.css";

    onMount(async () => {
        const c3 = (await import("c3")).default;

        try {
            await fetch("../../../api/v2/coffee-stats/loadAllData");
            const res1 = await fetch("../../../api/v2/coffee-stats?limit=2000");
            const rawData1 = await res1.json(); 

            await fetch("https://sos2526-11.onrender.com/api/v1/literacy-rates/loadInitialData");
            const res2 = await fetch("https://sos2526-11.onrender.com/api/v1/literacy-rates");
            const rawData2 = await res2.json();

            const coffeeArray = Array.isArray(rawData1) ? rawData1 : rawData1.data || [];
            const literacyArray = Array.isArray(rawData2) ? rawData2 : rawData2.data || [];

            // ✨ CAMBIO CLAVE: Usamos parseInt() y parseFloat() para obligar a que sean números reales
            const coffee_x = ["coffee_x", ...coffeeArray.map(d => parseInt(d.year))]; 
            const coffee_y = ["Producción de café", ...coffeeArray.map(d => parseFloat(d.production))];

            const literacy_x = ["literacy_x", ...literacyArray.map(d => parseInt(d.year))];
            const literacy_y = ["Brecha de género educativa", ...literacyArray.map(d => parseFloat(d.gender_gap))];

            c3.generate({
                bindto: '#grafica-c3',
                data: {
                    xs: {
                        "Producción de café": 'coffee_x',
                        "Brecha de género educativa": 'literacy_x',
                    },
                    columns: [
                        coffee_x,
                        coffee_y,
                        literacy_x,
                        literacy_y
                    ],
                    type: 'scatter'
                },
                axis: {
                    x: {
                        label: 'Año',
                        tick: {
                            fit: false
                        }
                    },
                    y: {
                        label: 'Valores'
                    }
                }
            });

        } catch (error) {
            console.error("Error:", error);
        }
    });
</script>

<figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    
    <p class="description">
        Gráfico de dispersión (scatter) comparando los datos de diferencia de educación entre géneros y producción de café.
    </p>
</figure>

<style>
    /* ... (tu estilo anterior se mantiene igual) ... */
    .c3-figure {
        margin: 20px 0;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .description {
        text-align: center;
        font-family: sans-serif;
        color: #555;
        margin-top: 15px;
    }
</style>