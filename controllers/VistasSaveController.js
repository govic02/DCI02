import VistasSave from '../models/vistasSave.js';

// Obtener todas las vistas guardadas
const obtenerVistasSave = async (req, res) => {
    try {
        const vistas = await VistasSave.find();
        res.json(vistas);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener una vista guardada por idVS
const obtenerVistaSave = async (req, res) => {
    try {
        const vista = await VistasSave.findOne({ _id: req.params.idVS });
        if (!vista) {
            return res.status(404).send('La vista guardada con ese ID no fue encontrada');
        }
        res.json(vista);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear una nueva vista guardada
// Crear una nueva vista guardada asegurándose de que esté asociada a una URN
const crearVistaSave = async (req, res) => {
    try {
        // Verificar que el cuerpo de la solicitud contiene una URN
        if (!req.body.urn) {
            return res.status(400).send("La URN es necesaria para crear una vista guardada.");
        }

        // Crear una nueva instancia de VistasSave con los datos recibidos
        const nuevaVista = new VistasSave(req.body);

        // Guardar la nueva vista en la base de datos
        await nuevaVista.save();

        // Responder con la nueva vista creada
        res.status(201).json(nuevaVista);
    } catch (error) {
        // En caso de error, enviar una respuesta indicando el mensaje de error
        res.status(400).send(error.message);
    }
};

// Actualizar una vista guardada por idVS
const actualizarVistaSave = async (req, res) => {
    try {
        const vista = await VistasSave.findOneAndUpdate({ _id: req.params.idVS }, req.body, { new: true });
        if (!vista) {
            return res.status(404).send('La vista guardada con ese ID no fue encontrada');
        }
        res.json(vista);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar una vista guardada por idVS
const eliminarVistaSave = async (req, res) => {
    try {
        const vista = await VistasSave.findOneAndDelete({ _id: req.params.idVS });
        if (!vista) {
            return res.status(404).send('La vista guardada con ese ID no fue encontrada');
        }
        res.send('Vista guardada eliminada');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const obtenerVistasPorUrn = async (req, res) => {
    try {
        const vistas = await VistasSave.find({ urn: req.params.urn });
        res.json(vistas);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const transfiereVistas = async (req, res) => {
    const { URNconsulta, URNreemplazo } = req.body;

    if (!URNconsulta || !URNreemplazo) {
        return res.status(400).send('Se requieren los campos URNconsulta y URNreemplazo para realizar la transferencia.');
    }

    if (URNconsulta === URNreemplazo) {
        return res.status(400).send('La URN de consulta y la URN de reemplazo no pueden ser iguales.');
    }

    try {
        // Actualizar la URN de todas las vistas guardadas que coincidan con URNconsulta
        const resultado = await VistasSave.updateMany(
            { urn: URNconsulta },
            { $set: { urn: URNreemplazo } }
        );

        // Verificar si se realizaron cambios
        if (resultado.modifiedCount === 0) {
            return res.status(404).json({
                message: 'No se encontraron vistas guardadas con la URN de consulta proporcionada para actualizar.',
                URNoriginal: URNconsulta,
                URNnueva: URNreemplazo,
                documentosActualizados: resultado.modifiedCount
            });
        }

        res.json({
            message: 'Vistas guardadas actualizadas correctamente',
            URNoriginal: URNconsulta,
            URNnueva: URNreemplazo,
            documentosActualizados: resultado.modifiedCount
        });
    } catch (error) {
        console.error('Error al actualizar vistas guardadas:', error);
        res.status(500).send('Error interno al intentar actualizar las vistas guardadas.');
    }
};


export  {
    obtenerVistasSave,
    obtenerVistaSave,
    crearVistaSave,
    eliminarVistaSave,
    obtenerVistasPorUrn,
    transfiereVistas
};
