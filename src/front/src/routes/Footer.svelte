<footer>
    <p>Construido en Svelte</p>
</footer>

<style>
    /* ============================
    FOOTER (sin hover)
    ============================ */

    footer {
        width: 100%;
        margin-top: 40px;
        padding: 18px 0;
        text-align: center;

        background: linear-gradient(
            180deg,
            #fff8ef 0%,
            #f6efe6 100%
        ); /* tonos lana */
        
        border-top: 4px solid #e6c9a8; /* borde suave */
        color: #5a3e2b; /* café oscuro */
        font-family: "Segoe UI", sans-serif;
        font-size: 1rem;
        letter-spacing: 0.3px;

        box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
        border-radius: 0 0 12px 12px; /* toque elegante */
    }

    /* Texto del footer */
    footer p {
        margin: 0;
        padding: 4px 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
        footer {
            font-size: 0.9rem;
            padding: 14px 0;
        }
    }
</style>