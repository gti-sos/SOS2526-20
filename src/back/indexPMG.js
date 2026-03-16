import { leerCSV } from "./lectorCSV.js";
import dataStore from 'nedb';
let BASE_URL_API = "/api/v1";
let db = new dataStore(); 

function loadBackendPMG(app) {

    // let coffee = require('./samples/PMG/lectorCSV.js');
    // let listaCoffee = [];

// Requests tipo get

    app.get('/api/v1/coffee-stats/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52409546/2sBXigLYrv');
    });

      app.get(BASE_URL_API + "/coffee-stats", (req, res) => {
        // Leer parámetros de paginación
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        // Valores por defecto si no se envían
        if (isNaN(limit) || limit <= 0) limit = 10;
        if (isNaN(offset) || offset < 0) offset = 0;

        // Contar total de documentos (para info de paginación)
    // Crear objeto de filtros dinámicos
    const filters = { ...req.query };

    // Eliminar parámetros que NO son filtros
    delete filters.limit;
    delete filters.offset;

    // Convertir números cuando corresponda
    for (const key in filters) {
        const num = Number(filters[key]);
        if (!isNaN(num)) filters[key] = num;
    }

    // Contar total con filtros aplicados
    db.count(filters, (err, total) => {
            if (err) {
                console.error("Error al contar documentos:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            // Obtener documentos con paginación
            db.find(filters)
                .skip(offset)
                .limit(limit)
                .exec((err, docs) => {
                    if (err) {
                        console.error("Error al obtener documentos:", err);
                        return res.status(500).json({ error: "Error interno del servidor" });
                    }

                    // Eliminar _id antes de enviar
                const sanitized = docs.map(({ _id, ...rest }) => rest);
                    });

                    res.status(200).json({
                    total,
                    limit,
                    offset,
                    returned: sanitized.length,
                    filters,
                        data: sanitized
                    });

                console.log(`Enviados ${sanitized.length} elementos con filtros`, filters);                });
        });
    };


    app.get(BASE_URL_API + "/coffee-stats/loadInitialData", async (req, res) => {
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

                const datos = await leerCSV('./datoscsv/coffee-stats.csv');
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

    app.get(BASE_URL_API + "/coffee-stats/:country/:coffee_type/:year", (req, res) => {
        const country = req.params.country;
        const coffee_type = req.params.coffee_type;
        const year = parseInt(req.params.year);

        if (isNaN(year)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        db.findOne({ country, coffee_type, year }, (err, doc) => {
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



// Requests tipo post

     app.post(BASE_URL_API + "/coffee-stats", (req, res) => {
        const newcoffee = req.body;
        console.log(`New coffee received: ${JSON.stringify(newcoffee, null, 2)}`);

        // Campos obligatorios
        const requiredFields = [
            "country","year","production","export","domestic_consumption","gross_opening_stock","coffee_type"
        ];

        // Validar campos obligatorios
        const missing = requiredFields.filter(f => !(f in newcoffee));
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

        // Comprobar duplicado por country + coffee_type + year
        db.findOne(
            { country: newcoffee.country, coffee_type: newcoffee.coffee_type, year: newcoffee.year },
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
                db.insert(newcoffee, (err, inserted) => {
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

    app.post(BASE_URL_API + "/coffee-stats/:country/:coffee_type/:year", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        });
    });

// Requests tipo put

    app.put(BASE_URL_API + "/coffee-stats/:country/:coffee_type/:year", (req, res) => {
        const country = req.params.country;
        const coffee_type = req.params.coffee_type;
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
            "country","year","production","export","domestic_consumption","gross_opening_stock","coffee_type"
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
        db.findOne({ country, coffee_type, year }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (!doc) {
                return res.status(404).json({ error: "Recurso no encontrado" });
            }

            // No permitir cambiar claves naturales
            if (doc.country !== updated.country ||
                doc.coffee_type !== updated.coffee_type ||
                doc.year !== updated.year) {
                return res.status(400).json({
                    error: "No se pueden modificar country, coffee_type o year"
                });
            }

            // Actualizar documento
            db.update({ country, coffee_type, year }, updated, {}, (err, numUpdated) => {
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

    app.put(BASE_URL_API + "/coffee-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })

// Requests tipo delete


    app.delete(BASE_URL_API + "/coffee-stats", (req, res) => {
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

    app.delete(BASE_URL_API + "/coffee-stats/:country/:coffee_type/:year", (req, res) => {
        const country = req.params.country;
        const coffee_type = req.params.coffee_type;
        const year = parseInt(req.params.year);

        // Validar año
        if (isNaN(year)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        // Intentar eliminar el documento
        db.remove({ country, coffee_type, year }, {}, (err, numRemoved) => {
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

            console.log("Dato eliminado:", numRemoved);
        });
    });


export { loadBackendPMG };