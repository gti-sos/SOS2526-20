<script>
    import {onMount} from 'svelte';
    
    onMount(async () => {
        const c3 = (await import("c3")).default;

        const api3Data1 = await fetch("../../../proxy/AAP");
        const api3Data2 = await api3Data1.json();
        const api3Data3 = api3Data2.reduce((acc, item) => {
            item.genre.forEach(g => {
                const genero = g.trim();
                if(!acc[genero]){
                    acc[genero] = 0
                }
                acc[genero] += 1;
            });
            
            return acc;
        }, {});
        const api3Data4 = Object.entries(api3Data3);

        console.log("1", api3Data1);
        console.log("2", api3Data2);
        console.log("3", api3Data3);
        console.log("4", api3Data4);


        c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: api3Data4,
                types: {
                    data1: 'step',
                    data2: 'area-step'
                }
            }
        });


    });
</script>
<div>
    <figure class="c3-figure">
    <div id="grafica-c3" style="min-height: 400px; width: 100%;"></div>
    <p>Integracion 3</p>
</figure>
</div>