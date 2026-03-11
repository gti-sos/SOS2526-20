import { leerCSV } from "./lectorCSV.js";
let BASE_URL_API = "/api/v1";

function loadBackendPMG(app) {

    // let coffee = require('./samples/PMG/lectorCSV.js');
    let listaCoffee = [];



    app.get(BASE_URL_API + "/coffee-stats", async (req, res) => {
        res.send(JSON.stringify(listaCoffee, null, 2));
        console.log(`Data to be sent: ${JSON.stringify(listaCoffee, null)}`)
    });

    app.get(BASE_URL_API + "/coffee-stats/loadInitialData", async (req, res) => {
        if (listaCoffee.length > 0) {
            return res.status(409).send({
                message: "Los datos ya estaban cargados",
                loaded: listaCoffee.length
            });
        }
        try {
            const datos = await leerCSV('./datoscsv/coffee-stats.csv');   // leer CSV
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
            "country", "year", "production", "export", "domestic_consumption", "gross_opening_stock", "coffee_type"
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
            "country", "year", "production", "export", "domestic_consumption", "gross_opening_stock", "coffee_type"
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
        if (listaCoffee[index].country !== req.body.country
            || listaCoffee[index].coffee_type !== req.body.coffee_type
            || listaCoffee[index].year !== req.body.year) {
            return res.sendStatus(400, "Bad Request");
        }

        // Reemplazar el elemento completo
        listaCoffee[index] = updatedCoffee;

        res.status(200).send({
            message: "Elemento actualizado correctamente",
            data: updatedCoffee
        });
    });

    app.put(BASE_URL_API + "/coffee-stats", (req, res) => {
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

        listaCoffee.splice(index, 1);

        res.status(200).send({
            message: `Se ha borrado el elemento ${index} de la lista`,
            deleted: true
        });

        console.log("Dato eliminado");
    });
}

export { loadBackendPMG };