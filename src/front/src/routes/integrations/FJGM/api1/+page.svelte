<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import c3 from "c3";

    let chart;

    let beerName = "";
    let beerPrice = "";
    let beerImage = "";
    let rating = 0;
    let reviews = 0;

    onMount(async () => {

        const res = await fetch("https://api.sampleapis.com/beers/ale");
        const beers = await res.json();

        console.log("Cervezas:", beers);

        // Buscar cerveza COMPLETA
        const beer = beers.find(b =>
            b.rating &&
            b.rating.average &&
            b.rating.reviews &&
            b.price &&
            b.image &&
            !isNaN(parseFloat(b.rating.average))
        );

        if (!beer) {
            console.error("No se encontró ninguna cerveza con datos completos");
            return;
        }

        beerName = beer.name;
        beerPrice = beer.price;
        beerImage = beer.image;
        rating = parseFloat(beer.rating.average);
        reviews = beer.rating.reviews;

        const porcentaje = (rating / 5) * 100;

        chart = c3.generate({
            bindto: "#gauge",
            data: {
                columns: [
                    ["Rating", porcentaje]
                ],
                type: "gauge"
            },
            gauge: {
                label: {
                    format: value => value.toFixed(1) + "%"
                }
            },
            color: {
                pattern: ["#FF0000", "#F97600", "#F6C600", "#60B044"],
                threshold: {
                    values: [30, 60, 90, 100]
                }
            },
            size: {
                height: 220
            }
        });

        setTimeout(() => {
            chart.load({
                columns: [["Rating", porcentaje]]
            });
        }, 1000);
    });
</script>

<div style="text-align:center;">
    <h2>{beerName}</h2>
    <p><strong>Precio:</strong> {beerPrice}</p>
    <p><strong>Rating:</strong> {rating} / 5</p>
    <p><strong>Reseñas:</strong> {reviews}</p>

    {#if beerImage}
        <img src="{beerImage}" alt="Imagen cerveza" style="max-width:200px; border-radius:8px; margin:10px 0;">
    {/if}
</div>

<div id="gauge"></div>

<style>
    #gauge {
        max-width: 400px;
        margin: 0 auto;
    }
</style>
