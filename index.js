import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { loadBackendAAP } from './src/back/v1/indexAAP.js';
import { loadBackendPMG } from './src/back/v2/indexPMG.js';
import { loadBackendFJGM } from './src/back/v1/indexFJGM.js';
import { handler } from './src/front/build/handler.js';

let PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
// ============================================================================
// ============================================================================

// app.use("/about", express.static("./static/about.html"));
// app.use("/", express.static("./static"));

app.use(bodyParser.json());



loadBackendAAP(app);
loadBackendPMG(app);
loadBackendFJGM(app);

app.use(handler);



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})