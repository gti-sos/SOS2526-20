<script>
    import { onMount } from 'svelte';
    import "c3/c3.css";


    onMount(async () => {

        const c3 = (await import("c3")).default;
        
        const choleraData1 = await fetch("https://soporte-sos.onrender.com/api/v1/cholera-stats", {
                method: 'GET'
            });
        const choleraData2 = await choleraData1.json();

        const choleraData3 = {}

        choleraData2.forEach(item => {
            const region = item.whoRegion;
            const deaths = item.reportedDeaths || 0;

            if (!choleraData3[region]){
                choleraData3[region] = 0
            }
            choleraData3[region] += deaths;
        });

        const choleraData4 = Object.entries(choleraData3);

        console.log("1", choleraData1);
        console.log("2", choleraData2);
        console.log("3", choleraData3);
        console.log("4", choleraData4);


        
        
        var chart = c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: [
                    ['data1', 30],
                    ['data2', 120],
                ],
                type : 'donut',
                onclick: function (d, i) { console.log("onclick", d, i); },
                onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                onmouseout: function (d, i) { console.log("onmouseout", d, i); }
            },
            donut: {
                title: "Muertes de cólera reportadas por región"
            }
        });

        setTimeout(function () {
            chart.load({
                columns: choleraData4
            });
        }, 1500);

        setTimeout(function () {
            chart.unload({
                ids: 'data1'
            });
            chart.unload({
                ids: 'data2'
            });
        }, 2500);





    })
</script>

<figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
</figure>

<style>
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