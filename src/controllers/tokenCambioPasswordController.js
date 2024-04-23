const TokenCambioPassword = require('.../models/TokenCambioPassword');

// Obtener todos los tokens
const obtenerTokensCambioPassword = async (req, res) => {
    try {
        const tokens = await TokenCambioPassword.find();
        res.json(tokens);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un token por idToken
const obtenerTokenCambioPassword = async (req, res) => {
    try {
        const token = await TokenCambioPassword.findOne({ idToken: req.params.idToken });
        if (!token) {
            return res.status(404).send('El token con ese idToken no fue encontrado');
        }
        res.json(token);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo token
const crearTokenCambioPassword = async (req, res) => {
    try {
        const nuevoToken = new TokenCambioPassword(req.body);
        await nuevoToken.save();
        res.status(201).json(nuevoToken);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un token por idToken
const actualizarTokenCambioPassword = async (req, res) => {
    try {
        const token = await TokenCambioPassword.findOneAndUpdate({ idToken: req.params.idToken }, req.body, { new: true });
        if (!token) {
            return res.status(404).send('El token con ese idToken no fue encontrado');
        }
        res.json(token);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un token por idToken
const eliminarTokenCambioPassword = async (req, res) => {
    try {
        const token = await TokenCambioPassword.findOneAndDelete({ idToken: req.params.idToken });
        if (!token) {
            return res.status(404).send('El token con ese idToken no fue encontrado');
        }
        res.send('Token eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerTokensCambioPassword,
    obtenerTokenCambioPassword,
    crearTokenCambioPassword,
    actualizarTokenCambioPassword,
    eliminarTokenCambioPassword
};
