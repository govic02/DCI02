const ProyectosUsuario = require('.../models/ProyectosUsuario');

// Obtener todos los registros
const obtenerProyectosUsuario = async (req, res) => {
    try {
        const proyectos = await ProyectosUsuario.find();
        res.json(proyectos);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por nameusuario
const obtenerProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOne({ nameusuario: req.params.nameusuario });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.json(proyecto);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearProyectoUsuario = async (req, res) => {
    try {
        const nuevoProyecto = new ProyectosUsuario(req.body);
        await nuevoProyecto.save();
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por nameusuario
const actualizarProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOneAndUpdate({ nameusuario: req.params.nameusuario }, req.body, { new: true });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.json(proyecto);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por nameusuario
const eliminarProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOneAndDelete({ nameusuario: req.params.nameusuario });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.send('Proyecto eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerProyectosUsuario,
    obtenerProyectoUsuario,
    crearProyectoUsuario,
    actualizarProyectoUsuario,
    eliminarProyectoUsuario
};
