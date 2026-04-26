<script>
    import Highcharts from "highcharts";
    import { onMount } from "svelte";

    onMount(async () => {

        // 1. Cargar datos de wool
        const woolRes = await fetch("../api/v2/wool-stats?limit=100");
        const woolJson = await woolRes.json();
        const woolData = woolJson.data;

        // 2. Agrupar por país y año
        const grouped = {};

        woolData.forEach(item => {
            const pais = item.reporterdesc;
            const year = item.period;
            const qty = item.qty ?? 0;

            if (!grouped[pais]) grouped[pais] = {};
            if (!grouped[pais][year]) grouped[pais][year] = 0;

            grouped[pais][year] += qty;
        });

        // 3. Obtener lista de países
        let paises = Object.keys(grouped);

        // 4. Obtener lista de años
        const yearsSet = new Set();
        woolData.forEach(item => yearsSet.add(item.period));
        const years = Array.from(yearsSet).sort();

        // 5. Ordenar países por producción total
        paises.sort((a, b) => {
            const totalA = years.reduce((s, y) => s + (grouped[a][y] ?? 0), 0);
            const totalB = years.reduce((s, y) => s + (grouped[b][y] ?? 0), 0);
            return totalB - totalA;
        });

        // 6. Construir series
        const series = years.map(year => ({
            name: `Año ${year}`,
            data: paises.map(p => grouped[p][year] ?? 0)
        }));

        // 7. Crear gráfica
        Highcharts.chart("container", {
            chart: {
                type: "column",
                inverted: true,          // ← Horizontal real
                height: paises.length * 35, // ← Más espacio entre países
                backgroundColor: "#f8f9fb"
            },

            colors: ['#4F8EF7', '#1B3C87', '#7FB3FF', '#A5C8FF'],

            title: {
                text: "Producción de Wool por País y Año"
            },
            subtitle: {
                text: "Datos obtenidos desde API interna"
            },

            // Países (vertical)
            xAxis: {
                categories: paises,
                title: { text: null }
            },

            // Producción (horizontal, logarítmico)
            yAxis: {
                type: "logarithmic",
                gridLineWidth: 1,
                gridLineColor: "#e6e6e6",
                title: {
                    text: "Producción (kg)"
                },
                labels: {
                    formatter() {
                        return Highcharts.numberFormat(this.value, 0);
                    }
                }
            },

            tooltip: {
                shared: true,
                formatter() {
                    let s = `<b>${this.x}</b><br>`;
                    this.points.forEach(p => {
                        s += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${Highcharts.numberFormat(p.y, 0)}</b><br>`;
                    });
                    return s;
                }
            },

            legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "top",
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                borderRadius: 6,
                backgroundColor: "#ffffff",
                shadow: false
            },

            plotOptions: {
    series: {
        pointPadding: 0.4,
        groupPadding: 0.25,
        borderWidth: 0,
        dataLabels: {
            enabled: false   // ← Desactiva los números dentro de las barras
        }
    }
},

            credits: { enabled: false },
            series
        });
    });
</script>

<figure class="highcharts-figure">
    <div id="container"></div>
</figure>
