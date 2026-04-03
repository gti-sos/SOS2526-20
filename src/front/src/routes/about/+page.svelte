<div class="about-container">
    <h2>Team</h2>
    <p>Francisco Javier González Macías (<a href="https://github.com/GTT7265">https://github.com/GTT7265</a>)</p>
    <p>Amanda Liu Alcántara Perez (<a href="https://github.com/Liu11037">https://github.com/Liu11037</a>)</p>
    <p>Pedro Mata García (<a href="https://github.com/pedmatgar">https://github.com/pedmatgar</a>)</p>
    <p><strong>Project description</strong>: Our project studies how the market of natural products work. We want to kwon how it works in a global scale. For this we are going to compare the stadistics of three products: Coffee, wool and spices.</p>
    <p><strong>Repository</strong>: <a href="https://github.com/gti-sos/SOS2526-20">github.com/gti-sos/SOS2526-20</a></p>
    <p><strong>Render URI</strong>: <a href="https://sos2526-20.onrender.com/">SOS2526-20.onrender.com</a></p>
    <p><strong>API</strong>:</p>
    <p><a href="https://sos2526-20.onrender.com/api/v2/wool-stats/docs">https://sos2526-20.onrender.com/api/v2/wool-stats/docs</a> (developed by Francisco Javier González Macías)</p>
    <p><a href="https://sos2526-20.onrender.com/api/v2/coffee-stats/docs">https://sos2526-20.onrender.com/api/v2/coffee-stats/docs</a> (developed by Pedro Mata García)</p>
    <p><a href="https://sos2526-20.onrender.com/api/v2/spice-stats/docs">https://sos2526-20.onrender.com/api/v2/spice-stats/docs</a> (developed by Amanda Liu Alcántara Pérez)</p>
</div>

<style>
    /* ============================
    ABOUT PAGE
    ============================ */

    .about-container {
        max-width: 900px;
        margin: 40px auto;
        padding: 24px;
        background: linear-gradient(180deg, #fff8ef, #f6efe6);
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        color: #5a3e2b; /* café oscuro */
        font-family: "Segoe UI", sans-serif;
    }

    /* Título */
    .about-container h2 {
        text-align: center;
        font-size: 2rem;
        color: #c0392b; /* picante */
        margin-bottom: 20px;
        text-shadow: 1px 1px 0 #fff;
    }

    /* Párrafos */
    .about-container p {
        font-size: 1rem;
        line-height: 1.5;
        margin: 10px 0;
        color: #5a3e2b;
    }

    /* Enlaces */
    .about-container a {
        color: #e67e22; /* especia */
        font-weight: 600;
        text-decoration: none;
        transition: color .2s ease, transform .2s ease;
    }

    .about-container a:hover {
        color: #c0392b; /* picante */
        transform: translateX(4px);
    }

    /* Negritas */
    .about-container strong {
        color: #8b5e3c; /* café medio */
    }

    /* Bloques de API */
    .about-container .api-link {
        margin-left: 12px;
        display: block;
        padding: 6px 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
        .about-container {
            padding: 16px;
        }

        .about-container h2 {
            font-size: 1.6rem;
        }

        .about-container p {
            font-size: 0.95rem;
        }
    }
</style>