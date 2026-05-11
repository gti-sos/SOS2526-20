<script>
    import {onMount} from 'svelte';
    
    onMount(async () => {
        const c3 = (await import("c3")).default;


        c3.generate({
            bindto: '#grafica-c3',
            data: {
                columns: [
                    ['data1', 300, 350, 300, 0, 0, 100],
                    ['data2', 130, 100, 140, 200, 150, 50]
                ],
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