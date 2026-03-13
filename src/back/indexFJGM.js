import { leerCSV } from "./lectorCSV.js";
import dataStore from 'nedb';

let BASE_URL_API = "/api/v1";
let db = new dataStore();       //Variable con la base de datos

function loadBackendFJGM(app) {




    app.get(BASE_URL_API + "/wool-stats", (req, res) => {
        // Leer parámetros de paginación
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        // Valores por defecto si no se envían
        if (isNaN(limit) || limit <= 0) limit = 10;
        if (isNaN(offset) || offset < 0) offset = 0;

        // Contar total de documentos (para info de paginación)
        db.count({}, (err, total) => {
            if (err) {
                console.error("Error al contar documentos:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            // Obtener documentos con paginación
            db.find({})
                .skip(offset)
                .limit(limit)
                .exec((err, docs) => {
                    if (err) {
                        console.error("Error al obtener documentos:", err);
                        return res.status(500).json({ error: "Error interno del servidor" });
                    }

                    // Eliminar _id antes de enviar
                    const sanitized = docs.map(d => {
                        delete d._id;
                        return d;
                    });

                    res.status(200).json({
                        total, // total de documentos en la BD
                        limit, // límite aplicado
                        offset, // desplazamiento aplicado
                        returned: sanitized.length, // cuántos se devuelven
                        data: sanitized
                    });

                    console.log(`Enviados ${sanitized.length} elementos (offset=${offset}, limit=${limit})`);
                });
        });
    });

    app.get(BASE_URL_API + "/wool-stats/loadInitialData", async (req, res) => {
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

                const datos = await leerCSV('./datoscsv/datosFrancisco.csv');
                const p = datos.slice(0, 50);

                db.insert(p, (err, inserted) => {
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


    app.get('/api/v1/wool-stats/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52408352/2sBXierDwv');
    });

    app.get(BASE_URL_API + "/wool-stats/:period/:reporterDesc/:flowDesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterDesc = req.params.reporterDesc;
        const flowDesc = req.params.flowDesc;

        if (isNaN(period)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        db.findOne({ period, reporterDesc, flowDesc }, (err, doc) => {
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



    app.post(BASE_URL_API + "/wool-stats", (req, res) => {
        const newWool = req.body;
        console.log(`New Wool received: ${JSON.stringify(newWool, null, 2)}`);

        // Campos obligatorios
        const requiredFields = [
            "period", "reporterDesc", "flowDesc", "qtyUnitAbbr", "qty", "isQtyEstimated", "netWgt", 
            "isNetWgtEstimated", "grossWgt", "isGrossWgtEstimated", "cifvalue", "fobvalue", 
            "primaryValue"
        ];

        // Validar campos obligatorios
        const missing = requiredFields.filter(f => !(f in newWool));
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

        // Comprobar duplicado por period + reporterDesc + flowDesc
        db.findOne(
            { period: newWool.period, reporterDesc: newWool.reporterDesc, flowDesc: newWool.flowDesc },
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
                db.insert(newWool, (err, inserted) => {
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

    app.post(BASE_URL_API + "/wool-stats/:period/:reporterDesc/:flowDesc", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        });
    });



    app.put(BASE_URL_API + "/wool-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })

    app.put(BASE_URL_API + "/wool-stats/:period/:reporterDesc/:flowDesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterDesc = req.params.reporterDesc;
        const flowDesc = req.params.flowDesc;
        const updated = req.body;

        // Validar año
        if (isNaN(period)) {
            return res.status(400).json({ error: "El period debe ser numérico" });
        }

        // Validar cuerpo
        if (!updated || Object.keys(updated).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la petición está vacío o es inválido" });
        }

        // Campos obligatorios
        const requiredFields = [
            "period", "reporterDesc", "flowDesc", "qtyUnitAbbr", "qty", "isQtyEstimated", "netWgt", 
            "isNetWgtEstimated", "grossWgt", "isGrossWgtEstimated", "cifvalue", "fobvalue", 
            "primaryValue"
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
        db.findOne({ period, reporterDesc, flowDesc }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (!doc) {
                return res.status(404).json({ error: "Recurso no encontrado" });
            }

            // No permitir cambiar claves naturales
            if (doc.period !== updated.period ||
                doc.reporterDesc !== updated.reporterDesc ||
                doc.flowDesc !== updated.flowDesc) {
                return res.status(400).json({
                    error: "No se pueden modificar period, reporterDesc o flowDesc"
                });
            }

            // Actualizar documento
            db.update({ period, reporterDesc, flowDesc }, updated, {}, (err, numUpdated) => {
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



    app.delete(BASE_URL_API + "/wool-stats", (req, res) => {
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

    app.delete(BASE_URL_API + "/wool-stats/:period/:reporterDesc/:flowDesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterDesc = req.params.reporterDesc;
        const flowDesc = req.params.flowDesc;

        // Validar period
        if (isNaN(period)) {
            return res.status(400).json({ error: "El period debe ser numérico" });
        }

        // Intentar eliminar el documento
        db.remove({ period, reporterDesc, flowDesc }, {}, (err, numRemoved) => {
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

            console.log("wool eliminado:", numRemoved);
        });
    });
}

export { loadBackendFJGM };

