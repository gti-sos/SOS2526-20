import { leerCSV } from "./lectorCSV.js";
let BASE_URL_API = "/api/v1";

function loadBackendAAP(app) {

    // let picantes = require('./samples/AAP/lectorCSV.js');
    let listaPicante = []; 



    app.get(BASE_URL_API + "/spice-stats", (req, res) => {
        res.send(JSON.stringify(listaPicante, null, 2));
        console.log(`Data to be sent: ${JSON.stringify(listaPicante, null)}`);
    });

    app.get(BASE_URL_API + "/spice-stats/loadInitialData", async (req, res) => {
        try {
            if (listaPicante.length > 0) {
                return res.status(409).send({
                    message: "Los datos ya estaban cargados",
                    loaded: listaPicante.length
                });
            }
            const datos = await leerCSV('./datoscsv/consumo_picante.csv');   // leer CSV
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

    app.put(BASE_URL_API + "/spice-stats", (req, res) => {
        res.status(405).send({
            message: "Método no permitido"
        })
    })


    
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
}

export { loadBackendAAP };