<script>
    import { onMount } from 'svelte';

    import Highcharts from 'highcharts';
    import 'highcharts/highcharts-more';

    let mensaje = "Cargando datos iniciales...";

    // =========================
    // Variables globales
    // =========================
    let woolData = [];
    let pandemicData = [];

    /**
     * Cargar datos iniciales
     * en ambos backends
     */
    async function inicializarAPIs() {

        console.log("1. Inicializando APIs...");

        // =====================================
        // WOOL LOAD INITIAL DATA
        // =====================================

        try {

            await fetch(
                "https://sos2526-20-stable.onrender.com/api/v2/wool-stats/loadInitialData"
            );

            console.log("WOOL inicializada");

        } catch (error) {

            console.warn(
                "WOOL ya tenía datos o falló loadInitialData"
            );
        }

        // =====================================
        // PANDEMICS LOAD INITIAL DATA
        // =====================================

        try {

            await fetch(
                "https://sos2526-10.onrender.com/api/v2/pandemics/loadInitialData"
            );

            console.log("PANDEMICS inicializada");

        } catch (error) {

            console.warn(
                "PANDEMICS ya tenía datos o falló loadInitialData"
            );
        }
    }

    /**
     * Cargar datos reales
     */
    async function cargarDatosIniciales() {

        console.log("2. Descargando datos reales...");

        // =========================
        // WOOL API
        // =========================

        const woolResponse = await fetch(
            "https://sos2526-20-stable.onrender.com/api/v2/wool-stats?limit=1000"
        );

        const woolJson = await woolResponse.json();

        // IMPORTANTE:
        // wool SIEMPRE viene en .data
        woolData = woolJson.data || [];

        // =========================
        // PANDEMICS API
        // =========================

        const pandemicResponse = await fetch(
            "https://sos2526-10.onrender.com/api/v2/pandemics?limit=1000"
        );

        const pandemicJson = await pandemicResponse.json();

        pandemicData = Array.isArray(pandemicJson)
            ? pandemicJson
            : (pandemicJson.data || []);

        console.log("WOOL:", woolData);

        console.log("PANDEMICS:", pandemicData);

        console.log(
            "Ejemplo pandemics:",
            pandemicData[0]
        );
    }

    /**
     * Cruzar datos
     */
    function generarSeries() {

        const puntos = [];

        console.log("3. Cruzando datos...");

        woolData.forEach(wool => {

            const pandemia = pandemicData.find(p =>

                p.entity &&
                wool.reporterdesc &&

                String(p.entity).toLowerCase().trim() ===
                String(wool.reporterdesc).toLowerCase().trim()
            );

            if (pandemia) {

                console.log(
                    "Coincidencia:",
                    wool.reporterdesc
                );

                const lana = parseFloat(wool.qty);

                // usamos malaria
                const malaria = parseFloat(
                    pandemia.malaria || 0
                );

                if (
                    !isNaN(lana) &&
                    !isNaN(malaria) &&
                    lana > 0 &&
                    malaria > 0
                ) {

                    puntos.push({

                        name: wool.reporterdesc,

                        // tamaño burbuja
                        value: lana,

                        // tooltip
                        malariaCases: malaria
                    });
                }
            }
        });

        console.log("PUNTOS:", puntos);

        return puntos;
    }

    /**
     * Crear gráfica
     */
    function crearGrafica(seriesData) {

        Highcharts.chart('contenedor-burbujas', {

            accessibility: {
                enabled: false
            },

            chart: {
                type: 'packedbubble',
                height: '700px'
            },

            title: {
                text: 'Producción de Lana vs Malaria'
            },

            subtitle: {
                text:
                    'Datos cruzados entre wool-stats y pandemics'
            },

            tooltip: {

                useHTML: true,

                pointFormat:
                    '<b>{point.name}</b><br/>' +
                    'Lana: {point.value}<br/>' +
                    'Malaria: {point.malariaCases}'
            },

            plotOptions: {

                packedbubble: {

                    minSize: '20%',

                    maxSize: '100%',

                    zMin: 0,

                    zMax: 1000000,

                    layoutAlgorithm: {

                        gravitationalConstant: 0.05,

                        splitSeries: false,

                        seriesInteraction: true,

                        dragBetweenSeries: true,

                        parentNodeLimit: true
                    },

                    dataLabels: {

                        enabled: true,

                        format: '{point.name}',

                        style: {
                            color: 'black',
                            textOutline: 'none'
                        }
                    }
                }
            },

            series: [{

                name: 'Países',

                data: seriesData
            }]
        });
    }

    /**
     * Inicio principal
     */
    onMount(async () => {

        try {

            console.log("Iniciando aplicación...");

            // =====================================
            // 1. Inicializar APIs
            // =====================================

            await inicializarAPIs();

            // =====================================
            // 2. Descargar datos reales
            // =====================================

            await cargarDatosIniciales();

            // =====================================
            // 3. Cruzar datos
            // =====================================

            const seriesData = generarSeries();

            if (seriesData.length === 0) {

                mensaje =
                    "No se encontraron coincidencias.";

                return;
            }

            // =====================================
            // 4. Pintar gráfica
            // =====================================

            mensaje = "";

            console.log("4. Pintando gráfica...");

            crearGrafica(seriesData);

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

    <div id="contenedor-burbujas"></div>

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

    #contenedor-burbujas {
        width: 100%;
        height: 700px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fafafa;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

</style>