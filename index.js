let cool = require("cool-ascii-faces");
let express = require("express");
let PORT = process.env.PORT || 3000;

// console.log(cool());

const app = express();

app.use("/",express.static("./static"));


app.get('/cool', (req, res) => {
  res.send(`<html><body><h1>
            ${cool()}
            </h1></body></html>`);
})

app.listen(PORT, () => {
  console.log('Server is running on ${PORT}');
})