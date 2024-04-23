const Plan = require('.../models/Plan');

// Obtener todos los registros
const obtenerPlanes = async (req, res) => {
    try {
        const planes = await Plan.find();
        res.json(planes);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por dbId
const obtenerPlan = async (req, res) => {
    try {
        const plan = await Plan.findOne({ dbId: req.params.dbId });
        if (!plan) {
            return res.status(404).send('El plan con ese dbId no fue encontrado');
        }
        res.json(plan);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearPlan = async (req, res) => {
    try {
        const nuevoPlan = new Plan(req.body);
        await nuevoPlan.save();
        res.status(201).json(nuevoPlan);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por dbId
const actualizarPlan = async (req, res) => {
    try {
        const plan = await Plan.findOneAndUpdate({ dbId: req.params.dbId }, req.body, { new: true });
        if (!plan) {
            return res.status(404).send('El plan con ese dbId no fue encontrado');
        }
        res.json(plan);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por dbId
const eliminarPlan = async (req, res) => {
    try {
        const plan = await Plan.findOneAndDelete({ dbId: req.params.dbId });
        if (!plan) {
            return res.status(404).send('El plan con ese dbId no fue encontrado');
        }
        res.send('Plan eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerPlanes,
    obtenerPlan,
    crearPlan,
    actualizarPlan,
    eliminarPlan
};
