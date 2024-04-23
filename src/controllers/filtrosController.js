import Filtros from '../models/Filtros.js';

// Obtener todos los registros
const obtenerFiltros = async (req, res) => {
    try {
        const filtros = await Filtros.find();
    //    console.log( filtros);
        res.json(filtros);
    } catch (error) {
        console.log( error);
        res.status(500).send(error.message);
    }
};

// Obtener un registro por id
const obtenerFiltro = async (req, res) => {
    try {
        const filtro = await Filtros.findOne({ id: req.params.id });
        if (!filtro) {
            return res.status(404).send('El filtro con ese ID no fue encontrado');
        }
        res.json(filtro);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearFiltro = async (req, res) => {
    try {
        const nuevoFiltro = new Filtros(req.body);
        await nuevoFiltro.save();
        res.status(201).json(nuevoFiltro);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por id
const actualizarFiltro = async (req, res) => {
    try {
        const filtro = await Filtros.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!filtro) {
            return res.status(404).send('El filtro con ese ID no fue encontrado');
        }
        res.json(filtro);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por id
const eliminarFiltro = async (req, res) => {
    try {
        const filtro = await Filtros.findOneAndDelete({ id: req.params.id });
        if (!filtro) {
            return res.status(404).send('El filtro con ese ID no fue encontrado');
        }
        res.send('Filtro eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export {
    obtenerFiltros,
    obtenerFiltro,
    crearFiltro,
    actualizarFiltro,
    eliminarFiltro
};
