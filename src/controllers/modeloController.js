const Modelo = require('.../models/Modelo');

// Obtener todos los registros
const obtenerModelos = async (req, res) => {
    try {
        const modelos = await Modelo.find();
        res.json(modelos);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por id
const obtenerModelo = async (req, res) => {
    try {
        const modelo = await Modelo.findOne({ id: req.params.id });
        if (!modelo) {
            return res.status(404).send('El modelo con ese ID no fue encontrado');
        }
        res.json(modelo);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearModelo = async (req, res) => {
    try {
        const nuevoModelo = new Modelo(req.body);
        await nuevoModelo.save();
        res.status(201).json(nuevoModelo);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por id
const actualizarModelo = async (req, res) => {
    try {
        const modelo = await Modelo.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!modelo) {
            return res.status(404).send('El modelo con ese ID no fue encontrado');
        }
        res.json(modelo);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por id
const eliminarModelo = async (req, res) => {
    try {
        const modelo = await Modelo.findOneAndDelete({ id: req.params.id });
        if (!modelo) {
            return res.status(404).send('El modelo con ese ID no fue encontrado');
        }
        res.send('Modelo eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerModelos,
    obtenerModelo,
    crearModelo,
    actualizarModelo,
    eliminarModelo
};
