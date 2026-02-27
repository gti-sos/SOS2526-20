const csv = require('csv-parser')
const fs = require('fs')
const results = [];

fs.createReadStream('datoscsv/datospedro.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const paisObjetivo = 'Brazil';
    const campoNumerico = 'production';

    const filasFiltradas = results.filter(fila => fila.country === paisObjetivo);

    if (filasFiltradas.length > 0) {
      // Importante: usamos parseFloat porque los datos del CSV entran como String
      const sumaTotal = filasFiltradas.reduce((acumulador, fila) => {
        return acumulador + parseFloat(fila[campoNumerico]);
      }, 0);

      const media = sumaTotal / filasFiltradas.length;

      console.log(`--- Resultados para el país: ${paisObjetivo} ---`);
      console.log(`Campo analizado: ${campoNumerico}`);
      console.log(`Número de registros encontrados: ${filasFiltradas.length}`);
      console.log(`Media calculada: ${media.toFixed(2)}`);
    } else {
      console.log(`No se encontraron datos para la ubicación: ${paisObjetivo}`);
    }
  });