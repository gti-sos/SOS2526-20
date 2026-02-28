let cool = require("cool-ascii-faces");
let express = require("express");
let PORT = process.env.PORT || 3000;

// console.log(cool());

const app = express();

app.use("/about",express.static("./README.md"));


app.get('/cool', (req, res) => {
  res.send(`<html><body><h1>
            ${cool()}
            </h1></body></html>`);
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})


// app.use("/samples/AAP", express.static("./samples/AAP/index.js")); //Devuelve todo el codigo

let AAP = require("./samples/AAP/index.js");
const devuelveMedia = require("./samples/AAP/index.js");

app.get('/samples/AAP', (req, res) => {
  res.send(`<html><body><h1>
            ${AAP()}
            </h1></body></html>`);
});