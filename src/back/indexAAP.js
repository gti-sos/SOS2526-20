import { leerCSV } from "./lectorCSV.js";
import dataStore from 'nedb';

let BASE_URL_API = "/api/v1";
let db = new dataStore();       //Variable con la base de datos

function loadBackendAAP(app) {

    let listaPicante = [];

    db.insert(listaPicante);



    app.get(BASE_URL_API + "/spice-stats", (req, res) => {
        db.find({}, (err, listaPicante) => {
            let jsonDataPicantes = JSON.stringify(listaPicante.map((c) => {
                delete c._id; return c;
            }), null, 2);
            console.log(`Data to be sent: ${jsonDataPicantes}`);
            res.send(jsonDataPicantes);
        });
    });

    app.get(BASE_URL_API + "/spice-stats/loadInitialData", async (req, res) => {
        try {
            db.count({}, async (err, count) => {
                if (err) {
                    console.error("Error al contar documentos:", err);
                    return res.status(500).json({ error: "Error interno al acceder a la BD" });
                }

                if (count > 0) {
                    return res.status(409).json({
                        message: "Los datos ya estaban cargados",
                        loaded: count
                    });
                }

                const datos = await leerCSV('./datoscsv/consumo_picante.csv');
                const primeros10 = datos.slice(0, 10);

                db.insert(primeros10, (err, inserted) => {
                    if (err) {
                        console.error("Error al insertar en BD:", err);
                        return res.status(500).json({ error: "No se pudieron insertar los datos" });
                    }

                    res.status(201).json({
                        message: "Datos iniciales cargados correctamente",
                        loaded: inserted.length
                    });
                    console.log("Datos cargados:", inserted.length);
                });
            });

        } catch (error) {
            console.error("Error al cargar CSV:", error);
            res.status(500).json({ error: "No se pudieron cargar los datos" });
        }
    });


    app.get('/api/v1/spice-stats/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52408352/2sBXierDwv');
    });

    // app.get(BASE_URL_API + "/spice-stats/:index", (req, res) => {
    //     const index = parseInt(req.params.index);

    //     // Validar índice
    //     if (isNaN(index) || index < 0 || index >= listaPicante.length) {
    //         return res.status(404).send({ error: "Índice no válido" });
    //     }

    //     res.send(JSON.stringify(listaPicante[index], null, 2));
    //     console.log(`Data to be sent: ${JSON.stringify(listaPicante, null)}`);
    // });



    app.post(BASE_URL_API + "/spice-stats", (req, res) => {
        const newSpice = req.body;
        console.log(`New Spice received: ${JSON.stringify(newSpice, null, 2)}`)

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

        db.find({ area: newSpice.area, item: newSpice.item, year: newSpice.year }, (err, listaPicante) => {
            if (listaPicante.length > 0) {
                res.sendStatus(409, "El recurso ya existe (duplicado)");
            } else {
                db.insert(newSpice);
                return res.sendStatus(201, "Recurso creado correctamente");
            }
        });
    });

    app.post(BASE_URL_API + "/spice-stats/:index", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        });
    });



    app.put(BASE_URL_API + "/spice-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })
    
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
        if (listaPicante[index].area !== req.body.area
            || listaPicante[index].item !== req.body.item
            || listaPicante[index].year !== req.body.year) {
            return res.sendStatus(400, "Bad Request");
        }

        // Reemplazar el elemento completo
        listaPicante[index] = updatedSpice;

        res.status(200).send({
            message: "Elemento actualizado correctamente",
            data: updatedSpice
        });
    });



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

        listaPicante.splice(index, 1);

        res.status(200).send({
            message: `Se ha borrado el elemento ${index} de la lista de picantes`,
            deleted: true
        });

        console.log("Picante eliminado");
    });

    app.delete(BASE_URL_API + "/spice-stats/:year", (req, res) => {
        const year = parseInt(req.body.year);

        db.find({ year: year }, (err, listaPicante) => {
            if (listaPicante.length == 0) {
                res.sendStatus(404, "No existe el recurso");
            } else {
                db.remove({ year: year }, {}, (err, numRemoved) => {
                    if (err) {
                        console.log(`Error ${err}`);
                        res.sendStatus(550, "ERROR");
                    } else {
                        res.sendStatus(200, "OK");
                    }
                });
            }
        });
    });
}

export { loadBackendAAP };