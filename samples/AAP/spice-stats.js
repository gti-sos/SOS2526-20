const fs = require('fs');
const csv = require('csv-parser');

const results = [];

const headerMap = {
  "Domain Code": "domain_code",
  "Domain": "domain",
  "Area Code (M49)": "area_code_m49",
  "Area": "area",
  "Element Code": "element_code",
  "Item Code (CPC)": "item_code_cpc",
  "Item": "item",
  "Year": "year",
  "Unit": "unit",
  "Import": "import",
  "Export": "export",
  "Production": "production",
  "Consumption": "consumption"
};

fs.createReadStream('datos.csv')
  .pipe(csv())
  .on('data', (row) => {
    const parsed = {};

    for (const originalKey in row) {
      const newKey = headerMap[originalKey];
      let value = row[originalKey];

      // Convertir números cuando corresponda
      if (["area_code_m49", "element_code", "item_code_cpc", "year"].includes(newKey)) {
        value = Number(value);
      } else if (["import", "export", "production", "consumption"].includes(newKey)) {
        value = Number(value);
      }

      parsed[newKey] = value;
    }

    results.push(parsed);
  })
  .on('end', () => {
    console.log(results);
  });

function elementos(){
    let texto = "";
    for(let i=0; i<results.length; i++){
        texto += `${results[i]}\n`;
    }
    return texto;
}

function funciona(){
  return "Funciona";
}

module.exports = funciona;