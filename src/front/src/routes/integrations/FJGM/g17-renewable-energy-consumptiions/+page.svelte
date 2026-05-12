<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';

    let mensaje = "Cargando datos de las APIs...";

    // =========================
    // Variables globales
    // =========================
    let woolData = [];
    let renewableData = [];

    /**
     * Cargar datos iniciales
     */
    async function cargarDatosIniciales() {

        console.log("1. Lanzando carga inicial de APIs...");

        // =====================================
        // LOAD INITIAL DATA
        // =====================================

        try {
            await fetch(
                "https://sos2526-20-stable.onrender.com/api/v2/wool-stats/loadInitialData"
            );
        } catch (e) {
            console.warn("Wool ya tenía datos");
        }

        try {
            await fetch(
                "https://sos2526-17.onrender.com/api/v1/renewable-energy-consumptions/loadInitialData"
            );
        } catch (e) {
            console.warn("Renewable ya tenía datos");
        }

        console.log("2. Datos iniciales cargados");

        // =====================================
        // OBTENER DATOS
        // =====================================

        const woolResponse = await fetch(
            "https://sos2526-20-stable.onrender.com/api/v2/wool-stats?limit=1000"
        );

        const renewableResponse = await fetch(
            "https://sos2526-17.onrender.com/api/v1/renewable-energy-consumptions?limit=1000"
        );

        const woolJson = await woolResponse.json();
        const renewableJson = await renewableResponse.json();

        woolData = woolJson.data || [];
        renewableData = Array.isArray(renewableJson)
            ? renewableJson
            : (renewableJson.data || []);

        console.log("WOOL:", woolData);
        console.log("RENEWABLE:", renewableData);
    }

    /**
     * Generar datos para gráfica
     */
    function generarSeries() {

        const years = [];
        const woolSeries = [];
        const renewableSeries = [];

        console.log("3. Cruzando datos...");

        woolData.forEach(wool => {

            // renewable usa "country"
            const renewable = renewableData.find(r =>
                r.country &&
                wool.reporterdesc &&
                String(r.country).toLowerCase().trim() ===
                String(wool.reporterdesc).toLowerCase().trim()
            );

            if (renewable) {

                console.log("Coincidencia encontrada:", wool.reporterdesc);

                // 🔥 AÑO CORRECTO: wool.period
                const year = parseInt(wool.period);

                const lana = parseFloat(wool.qty);

                // Campos reales de renewable
                const renewableValue = parseFloat(
                    renewable.wind ||
                    renewable.hydro ||
                    renewable.solar ||
                    renewable.other_renewables ||
                    0
                );

                if (
                    !isNaN(year) &&
                    !isNaN(lana) &&
                    !isNaN(renewableValue)
                ) {
                    years.push(year);
                    woolSeries.push(lana);
                    renewableSeries.push(renewableValue);
                }
            }
        });

        console.log("YEARS:", years);
        console.log("WOOL SERIES:", woolSeries);
        console.log("RENEWABLE SERIES:", renewableSeries);

        return {
            years,
            woolSeries,
            renewableSeries
        };
    }

    /**
     * Crear gráfica
     */
    function crearGrafica(data) {

        Highcharts.chart('contenedor-grafica', {

            accessibility: { enabled: false },

            chart: { type: 'areaspline' },

            title: { text: 'Producción de Lana vs Energía Renovable' },

            subtitle: {
                text: 'Cruce entre wool-stats y renewable-energy-consumptions'
            },

            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 120,
                y: 70,
                floating: true,
                borderWidth: 1,
                backgroundColor: '#FFFFFF'
            },

            xAxis: {
                categories: data.years,
                title: { text: 'Año' }
            },

            yAxis: {
                title: { text: 'Cantidad' }
            },

            tooltip: {
                shared: true,
                headerFormat: '<b>Año {point.key}</b><br/>'
            },

            credits: { enabled: false },

            plotOptions: {
                series: { marker: { enabled: true } },
                areaspline: { fillOpacity: 0.5 }
            },

            series: [
                {
                    name: 'Producción Lana',
                    data: data.woolSeries
                },
                {
                    name: 'Energía Renovable',
                    data: data.renewableSeries
                }
            ]
        });
    }

    /**
     * Inicio
     */
    onMount(async () => {

        try {
            console.log("Iniciando aplicación...");

            await cargarDatosIniciales();

            const data = generarSeries();

            if (data.woolSeries.length === 0) {
                mensaje = "No se encontraron coincidencias entre ambas APIs.";
                return;
            }

            mensaje = "";

            console.log("4. Pintando gráfica...");

            crearGrafica(data);

        } catch (error) {
            console.error("ERROR:", error);
            mensaje = "Error cargando APIs.";
        }
    });

</script>

<main>

    {#if mensaje !== ""}
        <h3 class="estado">{mensaje}</h3>
    {/if}

    <div id="contenedor-grafica"></div>

</main>

<style>

    main {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: sans-serif;
    }

    .estado {
        text-align: center;
        color: #0056b3;
        margin-bottom: 20px;
    }

    #contenedor-grafica {
        width: 100%;
        height: 650px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fafafa;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

</style>
