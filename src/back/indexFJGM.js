import { leerCSV } from "./lectorCSV.js";
let BASE_URL_API = "/api/v1";

function loadBackendFJGM(app) {

    // let wool = require('./samples/FJGM/lectorCSV.js');
    let listaWool = [];



    app.get(BASE_URL_API + "/wool-stats", (req, res) => {
        res.send(JSON.stringify(listaWool, null, 2));
        console.log(`Data to be sent: ${JSON.stringify(listaWool, null)}`);
    });

    app.get(BASE_URL_API + "/wool-stats/loadInitialData", async (req, res) => {
        try {
            if (listaWool.length > 0) {
                return res.status(409).send({
                    message: "Los datos ya estaban cargados",
                    loaded: listaWool.length
                });
            }
            const datos = await leerCSV('./datoscsv/datosFrancisco.csv');   // leer CSV
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
            "typeCode", "freqCode", "refPeriodId", "refYear", "refMonth", "period", "reporterCode", "reporterISO", "reporterDesc", "flowCode", "flowDesc", "partnerCode", "partnerISO", "partnerDesc", "partner2Code", "partner2ISO", "partner2Desc", "classificationCode", "classificationSearchCode", "isOriginalClassification", "cmdCode", "cmdDesc", "aggrLevel", "isLeaf", "customsCode", "customsDesc", "mosCode", "motCode", "motDesc", "qtyUnitCode", "qtyUnitAbbr", "qty", "isQtyEstimated", "altQtyUnitCode", "altQtyUnitAbbr", "altQty", "isAltQtyEstimated", "netWgt", "isNetWgtEstimated", "grossWgt", "isGrossWgtEstimated", "cifvalue", "fobvalue", "primaryValue", "legacyEstimationFlag", "isReported", "isAggregate"
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
            return res.status(400).json({ error: "id del recurso no coincide" }); // Bad Request: Los identificadores no coinciden
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
            "typeCode", "freqCode", "refPeriodId", "refYear", "refMonth", "period", "reporterCode", "reporterISO", "reporterDesc", "flowCode", "flowDesc", "partnerCode", "partnerISO", "partnerDesc", "partner2Code", "partner2ISO", "partner2Desc", "classificationCode", "classificationSearchCode", "isOriginalClassification", "cmdCode", "cmdDesc", "aggrLevel", "isLeaf", "customsCode", "customsDesc", "mosCode", "motCode", "motDesc", "qtyUnitCode", "qtyUnitAbbr", "qty", "isQtyEstimated", "altQtyUnitCode", "altQtyUnitAbbr", "altQty", "isAltQtyEstimated", "netWgt", "isNetWgtEstimated", "grossWgt", "isGrossWgtEstimated", "cifvalue", "fobvalue", "primaryValue", "legacyEstimationFlag", "isReported", "isAggregate"
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

    app.put(BASE_URL_API + "/wool-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })



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


        listaWool.splice(index, 1);


        res.status(200).send({
            message: `Se ha borrado el elemento ${index} de la lista de lana`,
            deleted: true
        });


        console.log("Lana eliminado");
    });
}

export { loadBackendFJGM };