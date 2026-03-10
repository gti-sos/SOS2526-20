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
// app.use("/", express.static("./onrendercom.html"));
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

let AAP = require("./samples/AAP/index.js");

app.get('/samples/AAP', (req, res) => {
  res.send(`<html><body><h1>
            ${AAP()}
            </h1></body></html>`);
});

// ============================================================================

let FJGM = require("./samples/FJGM/index.js");

app.get('/samples/FJGM', (req, res) => {
  res.send(`<html><body><h1>
            ${FJGM()}
            </h1></body></html>`);
});

// ============================================================================

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
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================


let picantes = require('./samples/AAP/lectorCSV.js');
let listaPicante =[];

// ============================================================================

app.get(BASE_URL_API+"/spice-stats", (req, res) =>{
  res.send(JSON.stringify(listaPicante, null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaPicante, null)}`);
});



app.get(BASE_URL_API + "/spice-stats/loadInitialData", async (req, res) => {
  try {
    if (listaPicante.length > 0) {
      return res.status(409).send({ 
        message: "Los datos ya estaban cargados", 
        loaded: listaPicante.length }); 
    }
    const datos = await picantes();   // leer CSV
    listaPicante = datos.slice(0, 10); // guardar solo 10 registros

    res.status(201).send({
      message: "Datos iniciales cargados correctamente",
      loaded: listaPicante.length
    });

    console.log("Datos cargados:", listaPicante.length);
  } catch (error) {
    console.error("Error al cargar CSV:", error);
    res.status(500).send({ error: "No se pudieron cargar los datos" });
  }
});



app.get('/api/v1/spice-stats/docs', (req, res) => {
  res.redirect('https://documenter.getpostman.com/view/52408352/2sBXierDwv');
});



app.get(BASE_URL_API + "/spice-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const wantedSpice = req.body;

  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaPicante.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  res.send(JSON.stringify(listaPicante[index], null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaPicante, null)}`);
});

// ============================================================================

app.post(BASE_URL_API + "/spice-stats", (req, res) => {
  const newSpice = req.body;

  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "domain_code", "domain", "area_code", "area",
    "element_code", "item_code", "item",
    "year", "unit", "import", "export",
    "production", "consumption"
  ];

  // Validar campos obligatorios
  const missing = requiredFields.filter(f => !(f in newSpice));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing
    });
  }

  // Evitar duplicados: por ejemplo, misma combinación área + item + año
  const exists = listaPicante.some(e =>
    e.area === newSpice.area &&
    e.item === newSpice.item &&
    e.year === newSpice.year
  );

  if (exists) {
    return res.status(409).json({
      error: "El recurso ya existe (duplicado)"
    });
  }

  // Insertar en la lista
  listaPicante.push(newSpice);

  return res.status(201).json({
    message: "Recurso creado correctamente",
    data: newSpice
  });
});


app.post(BASE_URL_API + "/spice-stats/:index", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  });
});

// ============================================================================

app.put(BASE_URL_API + "/spice-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const updatedSpice = req.body;

  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaPicante.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  // Validar cuerpo
  if (!updatedSpice || Object.keys(updatedSpice).length === 0) {
    return res.status(400).send({ error: "El cuerpo de la petición está vacío o es inválido" });
  }

  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "domain_code", "domain", "area_code", "area",
    "element_code", "item_code", "item",
    "year", "unit", "import", "export",
    "production", "consumption"
  ];

  const missing = requiredFields.filter(f => !(f in updatedSpice));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios para un PUT",
      missing
    });
  }

  /*e.area === newSpice.area &&
    e.item === newSpice.item &&
    e.year === newSpice.year*/
  if(  listaPicante[index].area !== req.body.area 
    || listaPicante[index].item!==req.body.item
    || listaPicante[index].year!== req.body.year){
      return res.sendStatus(400, "Bad Request");
    }

  // Reemplazar el elemento completo
  listaPicante[index] = updatedSpice;

  res.status(200).send({
    message: "Elemento actualizado correctamente",
    data: updatedSpice
  });
});



app.put(BASE_URL_API+"/spice-stats", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  })
})

// ============================================================================

app.delete(BASE_URL_API + "/spice-stats", (req, res) => {
  listaPicante = []; // vaciar lista

  res.status(200).send({
    message: "Todos los elementos han sido eliminados",
    deleted: true
  });

  console.log("Lista vaciada");
});



app.delete(BASE_URL_API + "/spice-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const deleteSpice = req.body;

  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaPicante.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  listaPicante.splice(index,1);

  res.status(200).send({
    message: `Se ha borrado el elemento ${index} de la lista de picantes`,
    deleted: true
  });

  console.log("Picante eliminado");
});




// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================



let wool = require('./samples/FJGM/lectorCSV.js');
let listaWool = [];

app.get(BASE_URL_API+"/wool-stats", (req, res) =>{
  res.send(JSON.stringify(listaWool, null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaWool, null)}`);
});



app.get(BASE_URL_API + "/wool-stats/loadInitialData", async (req, res) => {
  try {
    if (listaWool.length > 0) {
      return res.status(409).send({
        message: "Los datos ya estaban cargados",
        loaded: listaWool.length });
    }
    const datos = await wool();   // leer CSV
    listaWool = datos.slice(0, 10); // guardar solo 10 registros


    res.status(201).send({
      message: "Datos iniciales cargados correctamente",
      loaded: listaWool.length
    });


    console.log("Datos cargados:", listaWool.length);
  } catch (error) {
    console.error("Error al cargar CSV:", error);
    res.status(500).send({ error: "No se pudieron cargar los datos" });
  }
});



app.get(BASE_URL_API + "/wool-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const wantedwool = req.body;


  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaWool.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }


  res.send(JSON.stringify(listaWool[index], null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaWool, null)}`);
});



app.post(BASE_URL_API + "/wool-stats", (req, res) => {
  const newwool = req.body;


  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "typeCode","freqCode","refPeriodId","refYear","refMonth","period","reporterCode","reporterISO","reporterDesc","flowCode","flowDesc","partnerCode","partnerISO","partnerDesc","partner2Code","partner2ISO","partner2Desc","classificationCode","classificationSearchCode","isOriginalClassification","cmdCode","cmdDesc","aggrLevel","isLeaf","customsCode","customsDesc","mosCode","motCode","motDesc","qtyUnitCode","qtyUnitAbbr","qty","isQtyEstimated","altQtyUnitCode","altQtyUnitAbbr","altQty","isAltQtyEstimated","netWgt","isNetWgtEstimated","grossWgt","isGrossWgtEstimated","cifvalue","fobvalue","primaryValue","legacyEstimationFlag","isReported","isAggregate"
  ];


  // Validar campos obligatorios
  const missing = requiredFields.filter(f => !(f in newwool));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing
    });
  }


  // Evitar duplicados: por ejemplo, misma combinación área + item + año
  const exists = listaWool.some(e =>
    e.reporterCode === newwool.reporterCode &&
    e.partnerCode === newwool.partnerCode &&
    e.flowCode === newwool.flowCode &&
    e.cmdCode === newwool.cmdCode &&
    e.period === newwool.period
  );


  if (exists) {
    return res.status(409).json({
      error: "El recurso ya existe (duplicado)"
    });
  }


  // Insertar en la lista
  listaWool.push(newwool);


  return res.status(201).json({
    message: "Recurso creado correctamente",
    data: newwool
  });
});



app.post(BASE_URL_API + "/wool-stats/:index", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  });
});


// ============================================================================


app.put(BASE_URL_API + "/wool-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const updatedwool = req.body;
   
  if (
    req.params.refYear !== req.body.refYear || 
    req.params.reporterCode !== req.body.reporterCode || 
    req.params.partnerCode !== req.body.partnerCode || 
    req.params.flowCode !== req.body.flowCode || 
    req.params.cmdCode !== req.body.cmdCode
    ) {
    return res.status(400).json({error: "id del recurso no coincide"}); // Bad Request: Los identificadores no coinciden
  }
  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaWool.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }


  // Validar cuerpo
  if (!updatedwool || Object.keys(updatedwool).length === 0) {
    return res.status(400).send({ error: "El cuerpo de la petición está vacío o es inválido" });
  }


  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "typeCode","freqCode","refPeriodId","refYear","refMonth","period","reporterCode","reporterISO","reporterDesc","flowCode","flowDesc","partnerCode","partnerISO","partnerDesc","partner2Code","partner2ISO","partner2Desc","classificationCode","classificationSearchCode","isOriginalClassification","cmdCode","cmdDesc","aggrLevel","isLeaf","customsCode","customsDesc","mosCode","motCode","motDesc","qtyUnitCode","qtyUnitAbbr","qty","isQtyEstimated","altQtyUnitCode","altQtyUnitAbbr","altQty","isAltQtyEstimated","netWgt","isNetWgtEstimated","grossWgt","isGrossWgtEstimated","cifvalue","fobvalue","primaryValue","legacyEstimationFlag","isReported","isAggregate"
  ];


  const missing = requiredFields.filter(f => !(f in updatedwool));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios para un PUT",
      missing
    });
  }


  // Reemplazar el elemento completo
  listaWool[index] = updatedwool;


  res.status(200).send({
    message: "Elemento actualizado correctamente",
    data: updatedwool
  });
});



app.put(BASE_URL_API+"/wool-stats", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  })
})


// ============================================================================


app.delete(BASE_URL_API + "/wool-stats", (req, res) => {
  if (listaWool.length === 0) {
    return res.status(404).send({
      message: "La lista ya está vacía"
    });
  }


  listaWool = []; // vaciar lista


  res.status(200).send({
    message: "Todos los elementos han sido eliminados",
    deleted: true
  });


  console.log("Lista vaciada");
});



app.delete(BASE_URL_API + "/wool-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const deletewool = req.body;


  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaWool.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }


  listaWool.splice(index,1);


  res.status(200).send({
    message: `Se ha borrado el elemento ${index} de la lista de lana`,
    deleted: true
  });


  console.log("Lana eliminado");
});


// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================



let coffee = require('./samples/PMG/lectorCSV.js');
let listaCoffee = [];

app.get(BASE_URL_API+"/coffee-stats", async (req, res) =>{
  res.send(JSON.stringify(listaCoffee, null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaCoffee, null)}`)
});

app.get(BASE_URL_API + "/coffee-stats/loadInitialData", async (req, res) => {
      if (listaCoffee.length > 0) {
      return res.status(409).send({ 
        message: "Los datos ya estaban cargados", 
        loaded: listaCoffee.length }); 
    }
  try {
    const datos = await coffee();   // leer CSV
    listaCoffee = datos.slice(0, 10); // guardar solo 10 registros

    res.status(201).send({
      message: "Datos iniciales cargados correctamente",
      loaded: listaCoffee.length
    });

    console.log("Datos cargados:", listaCoffee.length);
  } catch (error) {
    console.error("Error al cargar CSV:", error);
    res.status(500).send({ error: "No se pudieron cargar los datos" });
  }
});

app.get(BASE_URL_API + "/coffee-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);


  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaCoffee.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  res.send(JSON.stringify(listaCoffee[index], null, 2));
  console.log(`Data to be sent: ${JSON.stringify(listaCoffee, null)}`);
});

app.post(BASE_URL_API + "/coffee-stats", (req, res) => {
  const newCoffee = req.body;

  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "country","year","production","export","domestic_consumption","gross_opening_stock","coffee_type"
  ];

  // Validar campos obligatorios
  const missing = requiredFields.filter(f => !(f in newCoffee));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing
    });
  }

  // Evitar duplicados: por ejemplo, misma combinación área + item + año
  const exists = listaCoffee.some(e =>
    e.area === newCoffee.country &&
    e.item === newCoffee.coffee_type &&
    e.year === newCoffee.year
  );

  if (exists) {
    return res.status(409).json({
      error: "El recurso ya existe (duplicado)"
    });
  }

  // Insertar en la lista
  listaCoffee.push(newCoffee);

  return res.status(201).json({
    message: "Recurso creado correctamente",
    data: newCoffee
  });
});


app.post(BASE_URL_API + "/coffee-stats/:index", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  });
});

app.put(BASE_URL_API + "/coffee-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const updatedCoffee = req.body;

  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaPicante.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  // Validar cuerpo
  if (!updatedSpice || Object.keys(updatedCoffee).length === 0) {
    return res.status(400).send({ error: "El cuerpo de la petición está vacío o es inválido" });
  }

  // Lista de campos obligatorios según tu CSV normalizado
  const requiredFields = [
    "country","year","production","export","domestic_consumption","gross_opening_stock","coffee_type"
  ];

  const missing = requiredFields.filter(f => !(f in updatedCoffee));
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios para un PUT",
      missing
    });
  }

  /*e.area === newSpice.area &&
    e.item === newSpice.item &&
    e.year === newSpice.year*/
  if(  listaCoffee[index].country !== req.body.country 
    || listaCoffee[index].coffee_type!==req.body.coffee_type
    || listaCoffee[index].year!== req.body.year){
      return res.sendStatus(400, "Bad Request");
    }

  // Reemplazar el elemento completo
  listaCoffee[index] = updatedCoffee;

  res.status(200).send({
    message: "Elemento actualizado correctamente",
    data: updatedCoffee
  });
});

app.put(BASE_URL_API+"/coffee-stats", (req, res) => {
  res.status(405).send({
    message: "Método no permitido"
  })
})

app.delete(BASE_URL_API + "/coffee-stats", (req, res) => {
  if (listaCoffee.length === 0) {
    return res.status(404).send({
      message: "La lista ya está vacía"
    });
  }

  listaCoffee = []; // vaciar lista

  res.status(200).send({
    message: "Todos los elementos han sido eliminados",
    deleted: true
  });

  console.log("Lista vaciada");
});

app.delete(BASE_URL_API + "/coffee-stats/:index", (req, res) => {
  const index = parseInt(req.params.index);

  // Validar índice
  if (isNaN(index) || index < 0 || index >= listaCoffee.length) {
    return res.status(404).send({ error: "Índice no válido" });
  }

  listaCoffee.splice(index,1);

  res.status(200).send({
    message: `Se ha borrado el elemento ${index} de la lista`,
    deleted: true
  });

  console.log("Dato eliminado");
});




// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
})