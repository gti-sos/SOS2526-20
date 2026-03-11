// let cool = require("cool-ascii-faces");
// let express = require("express");
// let bodyParser = require('body-parser');

import cool from 'cool-ascii-faces';
import express from 'express';
import bodyParser from 'body-parser';

import { loadBackendAAP } from './src/back/indexAAP.js';
import { loadBackendPMG } from './src/back/indexPMG.js';
import { loadBackendFJGM } from './src/back/indexFJGM.js';

let BASE_URL_API = "/api/v1";
let PORT = process.env.PORT || 3000;

// console.log(cool());

const app = express();

// ============================================================================
// ============================================================================

// app.use("/", express.static("./onrendercom.html"));
app.use("/about",express.static("./README.md"));

const path = require("path");
console.log(__dirname);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "onrendercom.html"));
});

app.use(bodyParser.json());


app.get('/cool', (req, res) => {
  res.send(`<html><body><h1>
            ${cool()}
            </h1></body></html>`);
})

// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
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



loadBackendAAP(app);
loadBackendPMG(app);
loadBackendFJGM(app);




app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})