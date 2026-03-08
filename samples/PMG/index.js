const csv = require('csv-parser')
const fs = require('fs')
const results = [];
const paisObjetivo = 'Brazil';
const campoNumerico = 'production';


function mediaPaisCampo() {
  return new Promise((resolve, reject) => {
    const results = []; // Definido aquí para evitar acumular datos entre llamadas
    fs.createReadStream('datoscsv/coffee-stats.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const filasFiltradas = results.filter(fila => fila.country === paisObjetivo);
        if (filasFiltradas.length > 0) {
          const sumaTotal = filasFiltradas.reduce((acumulador, fila) => {
            return acumulador + parseFloat(fila[campoNumerico]);
          }, 0);

          const media = sumaTotal / filasFiltradas.length;
          
          resolve({
            exito: true,
            pais: paisObjetivo,
            campo: campoNumerico,
            total: filasFiltradas.length,
            media: parseFloat(media.toFixed(2))
          });
        } else {
          resolve({
            exito: false,
            mensaje: `No se encontraron datos para la ubicación: ${paisObjetivo}`
          });
        }
      })
      .on('error', (err) => reject(err));
  });
}

  module.exports = mediaPaisCampo;