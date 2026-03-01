let cool = require("cool-ascii-faces");
let express = require("express");
let bodyParser = require('body-parser');
let BASE_URL_API = "/api/v1";
let PORT = process.env.PORT || 3000;

// console.log(cool());

const app = express();

// ============================================================================
// ============================================================================

app.use("/about",express.static("./README.md"));
app.use(bodyParser.json());


app.get('/cool', (req, res) => {
  res.send(`<html><body><h1>
            ${cool()}
            </h1></body></html>`);
})

// ============================================================================
// ============================================================================

let AAP = require("./samples/AAP/index.js");

app.get('/samples/AAP', (req, res) => {
  res.send(`<html><body><h1>
            ${AAP()}
            </h1></body></html>`);
});

let FJGM = require("./samples/FJGM/index.js");

app.get('/samples/FJGM', (req, res) => {
  res.send(`<html><body><h1>
            ${FJGM()}
            </h1></body></html>`);
});

let PMG = require("./samples/PMG/index.js");

app.get('/samples/PMG', async (req, res) => {
  const resultado = await PMG(); 
  
  // Ejemplo: mostramos la media si hubo éxito, o el mensaje si falló
  res.send(`<html><body><h1>
            ${resultado.exito ? `La media es: ${resultado.media}` : resultado.mensaje}
            </h1></body></html>`);
});



// ============================================================================
// ============================================================================


let picantes = require('./samples/AAP/lectorCSV.js');

app.get(BASE_URL_API+"/spice-stats", async (req, res) =>{
  try { const datos = await leerCSV();
    res.json(datos);
    console.log("Data to be sent:", datos); 
  } catch (err) { 
    res.status(500).json({ error: "Error al leer el CSV" }); 
    console.error(err); 
  }
});

app.post(BASE_URL_API+"/spice-stats", (req, res) =>{
  let newPicante = req.body;
  console.log(`Data is: ${JSON.stringify(newPicante, null, 2)}`)
  picantes.push(newPicante);
  res.sendStatus(201, "CREATED");
})

let coffee = require('./samples/PMG/lectorCSV.js');
app.get(BASE_URL_API+"/coffee-stats", async (req, res) =>{
  try { const datos = await leerCSV();
    res.json(datos);
    console.log("Data to be sent:", datos); 
  } catch (err) { 
    res.status(500).json({ error: "Error al leer el CSV" }); 
    console.error(err); 
  }
});


// ============================================================================
// ============================================================================



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})