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

export  {
    obtenerVistasSave,
    obtenerVistaSave,
    crearVistaSave,
    eliminarVistaSave,
    obtenerVistasPorUrn
};
