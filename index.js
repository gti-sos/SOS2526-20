// let cool = require("cool-ascii-faces");
// let express = require("express");
// let bodyParser = require('body-parser');

// import cool from 'cool-ascii-faces';
import express from 'express';
import bodyParser from 'body-parser';

import { loadBackendAAP } from './src/back/indexAAP.js';
import { loadBackendPMG } from './src/back/indexPMG.js';
import { loadBackendFJGM } from './src/back/indexFJGM.js';

let BASE_URL_API = "/api/v1";
let PORT = process.env.PORT || 3000;

const app = express();

// ============================================================================
// ============================================================================

// app.use("/", express.static("./onrendercom.html"));
app.use("/about", express.static("./static/about.html"));
app.use("/", express.static("./static"));

// const path = require("path");
import path from 'path';

app.use(bodyParser.json());



loadBackendAAP(app);
loadBackendPMG(app);
loadBackendFJGM(app);




app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})