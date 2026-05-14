<header>
    <h2>SOS2526-20</h2>

    <nav>
        <a href="/">Página base</a>
        <a href="/about">Sobre nosotros</a>
        <a href="https://github.com/gti-sos/SOS2526-20">Github de SOS2526-20</a>
        <a href="/analytics">Gráfica grupal</a>
        <a href="/integrations">Integraciones</a>
        <ul class="menu">
            <li class="dropdown">
                <a href="#">Vídeos</a>
                <ul class="dropdown-content">
                <li><a href="https://www.youtube.com/watch?v=o8yAMzufz_M">GTT7265</a></li>
                <li><a href="#">Pedmatgar</a></li>
                <li><a href="#">Liu11037</a></li>
                </ul>
            </li>
        </ul>
    </nav>
</header>

<style>
    /* ============================
    CABECERA: TÍTULO + NAV
    ============================ */

    /* Contenedor general de la cabecera */
    header {
        width: 100%;
        padding: 20px 0 10px 0;
        margin-bottom: 20px;
        text-align: center;
    }

    /* Título principal */
    header h2 {
        font-size: 2.2rem;
        margin: 0;
        color: #c0392b; /* rojo picante */
        text-shadow: 1px 1px 0 #fff;
        letter-spacing: 1px;
    }

    /* Barra de navegación */
    nav {
        margin-top: 14px;
        display: flex;
        justify-content: center;
        gap: 22px;
        flex-wrap: wrap;
        padding: 10px 0;
    }

    /* Enlaces del menú */
    nav a {
        text-decoration: none;
        font-weight: 600;
        padding: 8px 14px;
        border-radius: 8px;
        color: #5a3e2b; /* marrón café */
        background: #fff8ef; /* tono lana */
        border: 2px solid #e6c9a8; /* borde suave */
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    /* Hover */
    nav a:hover {
        background: #e67e22; /* especia */
        color: white;
        border-color: #e67e22;
        transform: translateY(-3px);
        box-shadow: 0 6px 14px rgba(0,0,0,0.15);
    }

    /* Activo o foco */
    nav a:focus,
    nav a:active {
        outline: none;
        background: #c0392b; /* picante */
        color: white;
        border-color: #c0392b;
    }

    /* Responsive: pantallas pequeñas */
    @media (max-width: 600px) {
        header h2 {
            font-size: 1.8rem;
        }

        nav {
            gap: 12px;
        }

        nav a {
            padding: 8px 12px;
            font-size: 0.95rem;
        }
    }

    /* Pantallas grandes */
    @media (min-width: 1400px) {
        header h2 {
            font-size: 2.6rem;
        }

        nav a {
            font-size: 1.05rem;
            padding: 10px 18px;
        }
    }


    /* ============================
    DROPDOWN DEL MENÚ
    ============================ */

    /* Contenedor del menú principal */
    .menu {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    /* Elemento que contiene el dropdown */
    .menu .dropdown {
        position: relative;
        display: inline-block;
    }

    /* Contenido del dropdown (oculto por defecto) */
    .dropdown-content {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        background: #fff8ef;
        border: 2px solid #e6c9a8;
        border-radius: 8px;
        min-width: 160px;
        padding: 8px 0;
        box-shadow: 0 6px 14px rgba(0,0,0,0.15);
        z-index: 999;
    }

    /* Enlaces dentro del dropdown */
    .dropdown-content a {
        display: block;
        padding: 10px 14px;
        color: #5a3e2b;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    /* Hover en los enlaces del dropdown */
    .dropdown-content a:hover {
        background: #e67e22;
        color: white;
    }

    /* Mostrar dropdown al pasar el ratón */
    .dropdown:hover .dropdown-content {
        display: block;
    }

</style>