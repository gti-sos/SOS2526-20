const csv = require('csv-parser');
const fs = require('fs');

function leerCSV() {
  return new Promise((resolve, reject) => {
    const resultados = [];

    fs.createReadStream('datoscsv/datospedro.csv')
      .pipe(csv())
      .on('data', (fila) => resultados.push(fila))
      .on('end', () => resolve(resultados))
      .on('error', (err) => reject(err));
  });
}

module.exports = leerCSV;
