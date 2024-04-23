const AdicionalesPedidos = require('.../models/AdicionalesPedidos');

// Obtener todos los registros
const obtenerAdicionalesPedidos = async (req, res) => {
    try {
        const pedidos = await AdicionalesPedidos.find();
        res.json(pedidos);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por nombre_pedido
const obtenerAdicionalPedido = async (req, res) => {
    try {
        const pedido = await AdicionalesPedidos.findOne({ nombre_pedido: req.params.nombre_pedido });
        if (!pedido) {
            return res.status(404).send('El pedido con ese nombre no fue encontrado');
        }
        res.json(pedido);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearAdicionalPedido = async (req, res) => {
    try {
        const nuevoPedido = new AdicionalesPedidos(req.body);
        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por nombre_pedido
const actualizarAdicionalPedido = async (req, res) => {
    try {
        const pedido = await AdicionalesPedidos.findOneAndUpdate({ nombre_pedido: req.params.nombre_pedido }, req.body, { new: true });
        if (!pedido) {
            return res.status(404).send('El pedido con ese nombre no fue encontrado');
        }
        res.json(pedido);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por nombre_pedido
const eliminarAdicionalPedido = async (req, res) => {
    try {
        const pedido = await AdicionalesPedidos.findOneAndDelete({ nombre_pedido: req.params.nombre_pedido });
        if (!pedido) {
            return res.status(404).send('El pedido con ese nombre no fue encontrado');
        }
        res.send('Pedido eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    obtenerAdicionalesPedidos,
    obtenerAdicionalPedido,
    crearAdicionalPedido,
    actualizarAdicionalPedido,
    eliminarAdicionalPedido
};
