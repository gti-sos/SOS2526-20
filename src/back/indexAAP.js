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

    app.get(BASE_URL_API + "/spice-stats/:area/:item/:year", (req, res) => {
        const area = req.params.area;
        const item = req.params.item;
        const year = parseInt(req.params.year);

        if (isNaN(year)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        db.findOne({ area, item, year }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en la BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (!doc) {
                return res.status(404).json({ error: "Recurso no encontrado" });
            }

            delete doc._id;

            res.status(200).json(doc);
            console.log("Documento enviado:", doc);
        });
    });



    app.post(BASE_URL_API + "/spice-stats", (req, res) => {
        const newSpice = req.body;
        console.log(`New Spice received: ${JSON.stringify(newSpice, null, 2)}`);

        // Campos obligatorios
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

        if ("_id" in req.body) {
            return res.status(400).json({
                error: "El campo _id no está permitido"
            });
        }

        // Comprobar duplicado por area + item + year
        db.findOne(
            { area: newSpice.area, item: newSpice.item, year: newSpice.year },
            (err, doc) => {

                if (err) {
                    console.error("Error al buscar duplicado:", err);
                    return res.status(500).json({ error: "Error interno del servidor" });
                }

                if (doc) {
                    return res.status(409).json({
                        error: "El recurso ya existe (duplicado)"
                    });
                }

                // Insertar en BD
                db.insert(newSpice, (err, inserted) => {
                    if (err) {
                        console.error("Error al insertar:", err);
                        return res.status(500).json({ error: "No se pudo insertar el recurso" });
                    }

                    res.status(201).json({
                        message: "Recurso creado correctamente",
                        data: inserted
                    });
                });
            }
        );
    });

    app.post(BASE_URL_API + "/spice-stats/:area/:item/:year", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        });
    });



    app.put(BASE_URL_API + "/spice-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })

    app.put(BASE_URL_API + "/spice-stats/:area/:item/:year", (req, res) => {
        const area = req.params.area;
        const item = req.params.item;
        const year = parseInt(req.params.year);
        const updated = req.body;

        // Validar año
        if (isNaN(year)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        // Validar cuerpo
        if (!updated || Object.keys(updated).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la petición está vacío o es inválido" });
        }

        // Campos obligatorios
        const requiredFields = [
            "domain_code", "domain", "area_code", "area",
            "element_code", "item_code", "item",
            "year", "unit", "import", "export",
            "production", "consumption"
        ];

        const missing = requiredFields.filter(f => !(f in updated));
        if (missing.length > 0) {
            return res.status(400).json({
                error: "Faltan campos obligatorios para un PUT",
                missing
            });
        }
        
        if ("_id" in req.body) {
            return res.status(400).json({
                error: "El campo _id no está permitido"
            });
        }

        // Buscar el documento original
        db.findOne({ area, item, year }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (!doc) {
                return res.status(404).json({ error: "Recurso no encontrado" });
            }

            // No permitir cambiar claves naturales
            if (doc.area !== updated.area ||
                doc.item !== updated.item ||
                doc.year !== updated.year) {
                return res.status(400).json({
                    error: "No se pueden modificar area, item o year"
                });
            }

            // Actualizar documento
            db.update({ area, item, year }, updated, {}, (err, numUpdated) => {
                if (err) {
                    console.error("Error al actualizar BD:", err);
                    return res.status(500).json({ error: "No se pudo actualizar el recurso" });
                }

                res.status(200).json({
                    message: "Elemento actualizado correctamente",
                    data: updated
                });
            });
        });
    });



    app.delete(BASE_URL_API + "/spice-stats", (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                console.error("Error al eliminar documentos:", err);
                return res.status(500).json({
                    error: "No se pudieron eliminar los elementos"
                });
            }

            res.status(200).json({
                message: "Todos los elementos han sido eliminados",
                deleted: true,
                removed: numRemoved
            });

            console.log("Documentos eliminados:", numRemoved);
        });
    });

    app.delete(BASE_URL_API + "/spice-stats/:area/:item/:year", (req, res) => {
        const area = req.params.area;
        const item = req.params.item;
        const year = parseInt(req.params.year);

        // Validar año
        if (isNaN(year)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        // Intentar eliminar el documento
        db.remove({ area, item, year }, {}, (err, numRemoved) => {
            if (err) {
                console.error("Error al eliminar en BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (numRemoved === 0) {
                return res.status(404).json({
                    error: "No se encontró el recurso a eliminar"
                });
            }

            res.status(200).json({
                message: `Elemento eliminado correctamente`,
                deleted: true,
                removed: numRemoved
            });

            console.log("Picante eliminado:", numRemoved);
        });
    });
}

export { loadBackendAAP };