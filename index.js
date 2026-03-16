import express from 'express';
import bodyParser from 'body-parser';

import { loadBackendAAP } from './src/back/indexAAP.js';
import { loadBackendPMG } from './src/back/indexPMG.js';
import { loadBackendFJGM } from './src/back/indexFJGM.js';

let PORT = process.env.PORT || 3000;

const app = express();

// ============================================================================
// ============================================================================

app.use("/about", express.static("./static/about.html"));
app.use("/", express.static("./static"));

app.use(bodyParser.json());



loadBackendAAP(app);
loadBackendPMG(app);
loadBackendFJGM(app);



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})