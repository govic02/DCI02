// Importa el modelo VistaGuardada
const VistaGuardada = require('../models/vistaGuardada'); // Asegúrate de que la ruta sea correcta

const vistaGuardadaController = {};

// Crear una nueva VistaGuardada
vistaGuardadaController.create = async (req, res) => {
    try {
        const { nombre, urn, idms } = req.body;
        const nuevaVista = new VistaGuardada({ nombre, urn, idms });
        await nuevaVista.save();
        res.status(201).json(nuevaVista);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Leer todas las VistaGuardada
vistaGuardadaController.readAll = async (req, res) => {
    try {
        const vistas = await VistaGuardada.find();
        res.status(200).json(vistas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Leer una VistaGuardada por ID
vistaGuardadaController.readById = async (req, res) => {
    try {
        const { id } = req.params;
        const vista = await VistaGuardada.findById(id);
        if (!vista) return res.status(404).json({ message: 'Vista no encontrada' });
        res.status(200).json(vista);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar una VistaGuardada por ID
vistaGuardadaController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, urn, idms } = req.body;
        const vistaActualizada = await VistaGuardada.findByIdAndUpdate(id, { nombre, urn, idms }, { new: true });
        if (!vistaActualizada) return res.status(404).json({ message: 'Vista no encontrada' });
        res.status(200).json(vistaActualizada);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
vistaGuardadaController.readByUrn = async (req, res) => {
    try {
        const { urn } = req.params; // Asume que la URN se pasa como parte del URL
        const vistas = await VistaGuardada.find({ urn });
        if (vistas.length === 0) return res.status(404).json({ message: 'No se encontraron vistas para la URN especificada' });
        res.status(200).json(vistas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Eliminar una VistaGuardada por ID
vistaGuardadaController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const vistaEliminada = await VistaGuardada.findByIdAndRemove(id);
        if (!vistaEliminada) return res.status(404).json({ message: 'Vista no encontrada' });
        res.status(200).json({ message: 'Vista eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = vistaGuardadaController;
