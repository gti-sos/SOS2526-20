let cool = require("cool-ascii-faces");
let express = require("express");
let PORT = process.env.PORT || 3000;

// console.log(cool());

const app = express();

// ============================================================================
// ============================================================================

app.use("/about",express.static("./README.md"));


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
let PMG = require("./samples/PMG/index.js");

app.get('/samples/PMG', (req, res) => {
  res.send(`<html><body><h1>
            ${PMG()}
            </h1></body></html>`);
});


let BASE_URL_API = "/api/v1";

let picantes = [
  { domain_code: "TCL", domain: "Crops and livestock products", area_code_m49: 4, area: "Afghanistan", element_code: 5610, item_code_cpc: 1654, item: "Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw", year: 2014, unit: "t", import: 283.85, export: 21099, production: 21500, consumption: 684.85 },
  { domain_code: "TCL", domain: "Crops and livestock products", area_code_m49: 4, area: "Afghanistan", element_code: 5610, item_code_cpc: 1654, item: "Anise, badian, coriander, cumin, caraway, fennel and juniper berries, raw", year: 2015, unit: "t", import: 1000.16, export: 17340, production: 18000, consumption: 1660.16 }
];

app.get(BASE_URL_API+"/spice-stats", (req, res) =>{
  res.send(JSON.stringify(picantes, null, 2));
  console.log(`Data to be sent: ${JSON.stringify(picantes, null)}`)
});

app.post(BASE_URL_API+"/spice-stats", (req, res) =>{
  let newPicante = req.body;
  console.log(`Data is: ${JSON.stringify(newPicante, null, 2)}`)
  picantes.push(newPicante);
  res.sendStatus(201, "CREATED");
})


// ============================================================================
// ============================================================================



app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
})