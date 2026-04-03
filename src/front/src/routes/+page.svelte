<div class="container">
    <div class="divAlumnos">
        <div class="alum">
            <h4>Francisco Javier González Macías</h4>
            <p>Fuente: wool-stats</p>
            <p><a href="/wool-stats">Página web sobre lana</a></p>
            <p><a href="https://sos2526-20.onrender.com/api/v2/wool-stats/">URL base de la API de lana</a></p>
            <p><a href="https://documenter.getpostman.com/view/52409546/2sBXigLYrv">Documentación en Postman</a></p>
        </div>
        <div class="alum">
            <h4>Pedro Mata García</h4>
            <p>Fuente: coffee-stats</p>
            <p><a href="/coffee-stats">Página web sobre café</a></p>
            <p><a href="https://sos2526-20.onrender.com/api/v2/coffee-stats/">URL base de la API de café</a></p>
            <p><a href="https://documenter.getpostman.com/view/52409546/2sBXigLYrv">Documentación en Postman de Café</a></p>
        </div>
        <div class="alum">
            <h4>Amanda Liu Alcántara Pérez</h4>
            <p>Fuente: spice-stats</p>
            <p><a href="/spice-stats">Página web sobre especias</a></p>
            <p><a href="https://sos2526-20.onrender.com/api/v2/spice-stats/">URL base de la API de especias</a></p>
            <p><a href="https://documenter.getpostman.com/view/52408352/2sBXionAkn">Documentación en Postman</a></p>
        </div>
    </div>
</div>


<style>
    /* ============================
   Estilos completos para tarjetas
   Paleta: lana (arena), café (marrón), especias (naranja/rojo)
   Las tres tarjetas ocupan en conjunto el 90% del viewport (30% cada una)
   ============================ */

:root{
  --lana-bg: #f6efe6;
  --lana-cream: #fff8f0;
  --cafe-dark: #5a3e2b;
  --cafe-mid: #8b5e3c;
  --spice: #e67e22;
  --spice-dark: #c0392b;
  --muted: #7a6a5a;
  --accent: #27ae60;
  --glass: rgba(255,255,255,0.6);
}

/* Reset y caja */
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Contenedor principal */
.container {
  max-width: 1400px;
  width: 90vw;                 /* el contenedor ocupa el 90% del viewport */
  margin: 24px auto;
  padding: 20px;
  background: linear-gradient(180deg, var(--lana-bg) 0%, #fff 100%);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  color: var(--cafe-dark);
  font-family: "Segoe UI", Roboto, system-ui, -apple-system, "Helvetica Neue", Arial;
}

/* Título (opcional) */
.container h2 {
  color: var(--spice-dark);
  text-align: center;
  margin-bottom: 18px;
  font-size: 1.6rem;
  letter-spacing: 0.2px;
}

/* -------------------------
   Grid / Layout de tarjetas
   ------------------------- */

/* Contenedor de tarjetas: 90% del viewport centrado (ya aplicado en .container),
   aquí usamos flex para forzar 3 columnas de 30% cada una */
.divAlumnos {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 2.5%;                  /* separación entre tarjetas */
  width: 100%;
  margin: 0 auto;
  padding: 8px 0;
  box-sizing: border-box;
}

/* Cada tarjeta ocupa exactamente 30% del contenedor */
.divAlumnos .alum {
  flex: 0 0 30%;
  max-width: 30%;
  min-width: 260px;           /* evita que se vuelvan demasiado estrechas */
  background: linear-gradient(180deg, var(--lana-cream), rgba(255,255,255,0.92));
  border-radius: 12px;
  padding: 16px;
  border-left: 6px solid var(--spice);
  box-shadow: 0 6px 18px rgba(90,62,43,0.08);
  transition: transform .18s ease, box-shadow .18s ease, border-left-color .18s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Hover y foco */
.divAlumnos .alum:hover,
.divAlumnos .alum:focus-within {
  transform: translateY(-6px);
  box-shadow: 0 14px 36px rgba(90,62,43,0.12);
  border-left-color: var(--spice-dark);
}

/* Encabezado de tarjeta */
.divAlumnos .alum h4 {
  margin: 0;
  color: var(--cafe-dark);
  font-size: 1.05rem;
  letter-spacing: 0.3px;
}

/* Texto secundario */
.divAlumnos .alum p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.3;
}

/* Enlaces */
.divAlumnos .alum a {
  color: var(--spice);
  text-decoration: none;
  font-weight: 600;
  transition: color .15s ease, transform .15s ease;
}

.divAlumnos .alum a:hover {
  color: var(--spice-dark);
  transform: translateX(4px);
}

/* Distinción visual por tipo (lana, café, especias) */
.divAlumnos .alum:nth-child(3n+1) { border-left-color: #bfa07a; } /* lana */
.divAlumnos .alum:nth-child(3n+2) { border-left-color: var(--cafe-mid); } /* café */
.divAlumnos .alum:nth-child(3n+3) { border-left-color: var(--spice); } /* especias */

/* Badges opcionales */
.divAlumnos .alum .badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--glass);
  color: var(--cafe-dark);
  font-size: 0.8rem;
  margin-top: 6px;
}

/* -------------------------
   Ajustes para pantallas muy grandes
   ------------------------- */

@media (min-width: 1400px) {
  .container { max-width: 1700px; width: 88vw; }
  .divAlumnos { gap: 3%; }
  .divAlumnos .alum {
    max-width: 520px;
    flex-basis: calc((90% - 2 * 3%) / 3); /* mantiene la proporción con gap */
    padding: 18px;
  }
  .divAlumnos .alum h4 { font-size: 1.12rem; }
  .divAlumnos .alum p  { font-size: 1rem; }
}

@media (min-width: 1800px) {
  .container { width: 85vw; }
  .divAlumnos { gap: 3.5%; }
  .divAlumnos .alum { max-width: 600px; padding: 20px; }
  .divAlumnos .alum h4 { font-size: 1.18rem; }
  .divAlumnos .alum p  { font-size: 1.02rem; }
}

/* -------------------------
   Responsive: pantallas pequeñas
   ------------------------- */

@media (max-width: 900px) {
  .divAlumnos {
    flex-direction: column;
    gap: 14px;
    width: 94%;
    padding: 8px;
  }

  .divAlumnos .alum {
    flex: 0 0 auto;
    max-width: 100%;
    width: 100%;
    min-width: 0;
  }
}

/* Ajustes para móviles muy pequeños */
@media (max-width: 520px) {
  .container { padding: 12px; }
  .divAlumnos { gap: 12px; }
  .divAlumnos .alum { padding: 12px; }
  .divAlumnos .alum h4 { font-size: 1rem; }
}

/* Accesibilidad: foco visible para enlaces dentro de tarjetas */
.divAlumnos .alum a:focus {
  outline: 3px solid rgba(198,120,60,0.18);
  outline-offset: 3px;
}

</style>