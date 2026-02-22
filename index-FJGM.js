// a. Inicializa un array con los datos de ejemplo (hemos simplificado algunas columnas para mayor claridad, manteniendo las necesarias)
const datos = [
    { period: 2014, reporter_desc: 'Algeria', flow_desc: 'Import', qty: 2200, primary_value: 46258 },
    { period: 2014, reporter_desc: 'Algeria', flow_desc: 'Export', qty: 94000, primary_value: 121208 },
    { period: 2014, reporter_desc: 'Andorra', flow_desc: 'Import', qty: 1681, primary_value: 19513568 },
    { period: 2014, reporter_desc: 'Angola', flow_desc: 'Import', qty: 40608, primary_value: 94718 },
    { period: 2014, reporter_desc: 'Azerbaijan', flow_desc: 'Import', qty: 1998, primary_value: 1600 },
    { period: 2014, reporter_desc: 'Argentina', flow_desc: 'Import', qty: 100031, primary_value: 687299.12 },
    { period: 2014, reporter_desc: 'Argentina', flow_desc: 'Export', qty: 15397340, primary_value: 60332116.89 },
    { period: 2014, reporter_desc: 'Australia', flow_desc: 'Import', qty: 2206929, primary_value: 11344037 },
    { period: 2014, reporter_desc: 'Australia', flow_desc: 'Export', qty: 324734107, primary_value: 2178687316 },
    { period: 2014, reporter_desc: 'Austria', flow_desc: 'Import', qty: 1205097967, primary_value: 8291233728 }
];

// b. Algoritmo usando iteradores (filter, map y reduce)
const paisFiltro = 'Argentina';

// 1. FILTER: Obtenemos solo las filas donde el país (información geográfica) sea Argentina
const datosArgentina = datos.filter(fila => fila.reporter_desc === paisFiltro);

// 2. MAP: Extraemos solo los valores numéricos del campo que nos interesa (primary_value)
const valoresNumericos = datosArgentina.map(fila => fila.primary_value);

// 3. REDUCE: Calculamos la suma total de esos valores
const sumaTotal = valoresNumericos.reduce((acumulador, valorActual) => acumulador + valorActual, 0);

// 4. Calculamos la media
let media = 0;
if (valoresNumericos.length > 0) {
    media = sumaTotal / valoresNumericos.length;
}

// c. Mostrar el resultado por consola
console.log(`--- Resultados del análisis ---`);
console.log(`País analizado: ${paisFiltro}`);
console.log(`Número de registros encontrados: ${valoresNumericos.length}`);
console.log(`La media del campo 'primary_value' es: ${media}`);