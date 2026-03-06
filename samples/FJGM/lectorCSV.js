const csv = require('csv-parser');
const fs = require('fs');

function normalizarClave(clave) {
  return clave
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")       // espacios → _
    .replace(/[()]/g, "")       // quitar paréntesis
    .replace(/[^a-z0-9_]/g, ""); // quitar caracteres raros
}

function convertirValor(valor) {
  const num = Number(valor);
  return isNaN(num) ? valor : num;
}

function leerCSV() {
  return new Promise((resolve, reject) => {
    const resultados = [];

    fs.createReadStream('datoscsv/datosFrancisco.csv')
      .pipe(csv({
        mapHeaders: ({ header }) => normalizarClave(header),
        mapValues: ({ value }) => convertirValor(value)
      }))
      .on('data', (fila) => resultados.push(fila))
      .on('end', () => resolve(resultados))
      .on('error', (err) => reject(err));
  });
}

module.exports = leerCSV;
