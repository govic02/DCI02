// Controlador para crear o actualizar los datos de peso total versus pedidos
import PesosTotalversusPedidos from '../models/PesosTotalversusPedidos.js';

const crearActualizarPesosTotalversusPedidos = async (req, res) => {
    const { urn, pesoTotalProyecto, pesoTotalPedidos } = req.body;
    try {
        const resultado = await PesosTotalversusPedidos.findOneAndUpdate(
            { urn },
            { pesoTotalProyecto, pesoTotalPedidos },
            { new: true, upsert: true }
        );
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error al crear o actualizar los pesos totales:", error);
        res.status(400).send(error.message);
    }
};

// Controlador para obtener los datos de peso total versus pedidos por URN
const obtenerPesosTotalversusPedidosPorUrn = async (req, res) => {
    try {
        const { urn } = req.params;
        const resultado = await PesosTotalversusPedidos.findOne({ urn });
        if (!resultado) {
            return res.status(404).send('No se encontraron datos para la URN proporcionada');
        }
        res.json(resultado);
    } catch (error) {
        console.error("Error al obtener los pesos totales por URN:", error);
        res.status(500).send(error.message);
    }
};

export { crearActualizarPesosTotalversusPedidos, obtenerPesosTotalversusPedidosPorUrn };
