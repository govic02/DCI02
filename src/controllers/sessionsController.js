const Sessions = require('.../models/Sessions');

// Obtener todas las sesiones
const obtenerSessions = async (req, res) => {
    try {
        const sessions = await Sessions.find();
        res.json(sessions);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener una sesión por session_id
const obtenerSession = async (req, res) => {
    try {
        const session = await Sessions.findOne({ session_id: req.params.session_id });
        if (!session) {
            return res.status(404).send('La sesión con ese session_id no fue encontrada');
        }
        res.json(session);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear una nueva sesión
const crearSession = async (req, res) => {
    try {
        const nuevaSession = new Sessions(req.body);
        await nuevaSession.save();
        res.status(201).json(nuevaSession);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar una sesión por session_id
const actualizarSession = async (req, res) => {
    try {
        const session = await Sessions.findOneAndUpdate({ session_id: req.params.session_id }, req.body, { new: true });
        if (!session) {
            return res.status(404).send('La sesión con ese session_id no fue encontrada');
        }
        res.json(session);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar una sesión por session_id
const eliminarSession = async (req, res) => {
    try {
        const session = await Sessions.findOneAndDelete({ session_id: req.params.session_id });
        if (!session) {
            return res.status(404).send('La sesión con ese session_id no fue encontrada');
        }
        res.send('Sesión eliminada');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerSessions,
    obtenerSession,
    crearSession,
    actualizarSession,
    eliminarSession
};
