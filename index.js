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



let AAP = require("./samples/AAP/index.js");

app.get('/samples/AAP', (req, res) => {
  res.send(`<html><body><h1>
            ${AAP()}
            </h1></body></html>`);
});