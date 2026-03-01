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
/*
function calcularMediaDeUnPais() {


    // 1. FILTER
    const datosDeUnPais = datos.filter(
        fila => fila.reporter_desc === 'Argentina'
    );

    // 2. MAP
    const valoresNumericos = datosDeUnPais.map(
        fila => fila.primary_value
    );

    // 3. REDUCE
    const sumaTotal = valoresNumericos.reduce(
        (acumulador, valorActual) => acumulador + valorActual,
        0
    );

    // 4. MEDIA
    const media = valoresNumericos.length > 0
        ? sumaTotal / valoresNumericos.length
        : 0;

    return media;
}

module.exports = calcularMediaDeUnPais;
*/
const fs = require('fs');

function calcularMediaArgentina() {

    const paisFiltro = 'Argentina';

    const contenido = fs.readFileSync('datoscsv/datosFrancisco.csv', 'utf-8');
    const filas = contenido.split('\n');
    const cabeceras = filas[0].split(',');

    const datos = filas.slice(1).map(fila => {
        const valores = fila.split(',');

        let objeto = {};
        cabeceras.forEach((cabecera, index) => {
            objeto[cabecera.trim()] = valores[index]?.replace(/"/g, '').trim();
        });

        return objeto;
    });

    const valoresArgentina = datos
        .filter(fila => fila.reporterDesc === paisFiltro)
        .map(fila => parseFloat(fila.primaryValue))
        .filter(valor => !isNaN(valor));

    const sumaTotal = valoresArgentina.reduce((acc, val) => acc + val, 0);

    return valoresArgentina.length > 0
        ? sumaTotal / valoresArgentina.length
        : 0;
}

module.exports = calcularMediaArgentina;