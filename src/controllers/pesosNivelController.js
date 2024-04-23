const PesosNivel = require('.../models/PesosNivel');

// Obtener todos los registros
const obtenerPesosNivel = async (req, res) => {
    try {
        const pesosNivel = await PesosNivel.find();
        res.json(pesosNivel);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por id
const obtenerPesoNivel = async (req, res) => {
    try {
        const pesoNivel = await PesosNivel.findOne({ id: req.params.id });
        if (!pesoNivel) {
            return res.status(404).send('El peso nivel con ese ID no fue encontrado');
        }
        res.json(pesoNivel);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearPesoNivel = async (req, res) => {
    try {
        const nuevoPesoNivel = new PesosNivel(req.body);
        await nuevoPesoNivel.save();
        res.status(201).json(nuevoPesoNivel);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por id
const actualizarPesoNivel = async (req, res) => {
    try {
        const pesoNivel = await PesosNivel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!pesoNivel) {
            return res.status(404).send('El peso nivel con ese ID no fue encontrado');
        }
        res.json(pesoNivel);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por id
const eliminarPesoNivel = async (req, res) => {
    try {
        const pesoNivel = await PesosNivel.findOneAndDelete({ id: req.params.id });
        if (!pesoNivel) {
            return res.status(404).send('El peso nivel con ese ID no fue encontrado');
        }
        res.send('Peso nivel eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerPesosNivel,
    obtenerPesoNivel,
    crearPesoNivel,
    actualizarPesoNivel,
    eliminarPesoNivel
};
