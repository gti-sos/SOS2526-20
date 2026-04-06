import { leerCSV } from "./lectorCSV.js";
import dataStore from 'nedb';

let BASE_URL_API = "/api/v2";
let db = new dataStore();       //Variable con la base de datos

function loadBackendFJGM(app) {

    app.get('/api/v1/wool-stats/docs', (req, res) => {
    res.redirect('https://documenter.getpostman.com/view/52408471/2sBXigLYrw');
    });
    
    app.get('/api/v2/wool-stats/docs', (req, res) => {
        res.redirect('https://documenter.getpostman.com/view/52408471/2sBXionAkm');
    });

    app.get(BASE_URL_API + "/wool-stats", (req, res) => {
    // 1. Leer parámetros de paginación
        let limit = parseInt(req.query.limit);
        let offset = parseInt(req.query.offset);

        if (isNaN(limit) || limit <= 0) limit = 10;
        if (isNaN(offset) || offset < 0) offset = 0;

        // 2. Crear objeto de filtros dinámicos
        const filters = { ...req.query };

        // Eliminar parámetros que NO son filtros directos
        delete filters.limit;
        delete filters.offset;
        
        // Capturar y eliminar los parámetros de rango
        let from = parseInt(req.query.from);
        let to = parseInt(req.query.to);
        delete filters.from;
        delete filters.to;

    // Convertir números para el resto de filtros exactos
        for (const key in filters) {
            const num = Number(filters[key]);
            if (!isNaN(num)) filters[key] = num;
        }

    // 3. Lógica para construir la búsqueda por rango
        if (!isNaN(from) || !isNaN(to)) {
            filters.period = {}; 
            if (!isNaN(from)) filters.period.$gte = from; // Mayor o igual que 'from'
            if (!isNaN(to)) filters.period.$lte = to;     // Menor o igual que 'to'
        }

    // 4. Contar y buscar
        db.count(filters, (err, total) => {
            if (err) {
                console.error("Error al contar documentos:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

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

                    res.status(200).json({
                        total,
                        limit,
                        offset,
                        returned: sanitized.length,
                        filters,
                        data: sanitized
                    });

                    console.log(`Enviados ${sanitized.length} elementos con filtros: ${JSON.stringify(filters)}`);                
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
                const p = datos.slice(200, 300);

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

    app.get(BASE_URL_API + "/wool-stats/:period/:reporterdesc/:flowdesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterdesc = req.params.reporterdesc;
        const flowdesc = req.params.flowdesc;

        if (isNaN(period)) {
            return res.status(400).json({ error: "El año debe ser numérico" });
        }

        db.findOne({ period, reporterdesc, flowdesc }, (err, doc) => {
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
            "period", "reporterdesc", "flowdesc", "qtyunitabbr", "qty", "isqtyestimated", "netwgt", 
            "isnetwgtestimated", "grosswgt", "isgrosswgtestimated", "cifvalue", "fobvalue", 
            "primaryvalue"
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
            { period: newWool.period, reporterdesc: newWool.reporterdesc, flowdesc: newWool.flowdesc },
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

    app.post(BASE_URL_API + "/wool-stats/:period/:reporterdesc/:flowdesc", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        });
    });



    app.put(BASE_URL_API + "/wool-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })

    app.put(BASE_URL_API + "/wool-stats/:period/:reporterdesc/:flowdesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterdesc = req.params.reporterdesc;
        const flowdesc = req.params.flowdesc;
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
            "period", "reporterdesc", "flowdesc", "qtyunitabbr", "qty", "isqtyestimated", "netwgt", 
            "isnetwgtestimated", "grosswgt", "isgrosswgtestimated", "cifvalue", "fobvalue", 
            "primaryvalue"
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
        db.findOne({ period, reporterdesc, flowdesc }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en BD:", err);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            if (!doc) {
                return res.status(404).json({ error: "Recurso no encontrado" });
            }

            // No permitir cambiar claves naturales
            if (doc.period !== updated.period ||
                doc.reporterdesc !== updated.reporterdesc ||
                doc.flowdesc !== updated.flowdesc) {
                return res.status(400).json({
                    error: "No se pueden modificar period, reporterdesc o flowdesc"
                });
            }

            // Actualizar documento
            db.update({ period, reporterdesc, flowdesc }, updated, {}, (err, numUpdated) => {
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

    app.delete(BASE_URL_API + "/wool-stats/:period/:reporterdesc/:flowdesc", (req, res) => {
        const period = parseInt(req.params.period);
        const reporterdesc = req.params.reporterdesc;
        const flowdesc = req.params.flowdesc;

        // Validar period
        if (isNaN(period)) {
            return res.status(400).json({ error: "El period debe ser numérico" });
        }

        // Intentar eliminar el documento
        db.remove({ period, reporterdesc, flowdesc }, {}, (err, numRemoved) => {
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
