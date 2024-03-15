import Pedido from '../models/Pedido.js';
import AdicionalesPedidos from '../models/adicionalesPedidos.js';
// Obtener todos los registros

// Obtener un registro por id_int1
const obtenerPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findOne({ id_int1: req.params.id_int1 });
        if (!pedido) {
            return res.status(404).send('El pedido con ese ID no fue encontrado');
        }
        res.json(pedido);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const crearAdicionalPedido = async (req, res) => {
    try {
        console.log("Entro a pedidos adicionales");
        
        // Extrae la información del cuerpo de la solicitud y el ID del pedido
        const { nombre_pedido, diametro, cantidad, largo, urn, pedidoId } = req.body;

        // Verifica que el ID del pedido esté presente
        if (!pedidoId) {
            return res.status(400).send('El ID del pedido es necesario');
        }

        // Crea un nuevo documento AdicionalesPedidos con la información proporcionada
        const nuevoAdicional = new AdicionalesPedidos({
            nombre_pedido,
            diametro,
            cantidad,
            largo,
            urn,
            pedidoId
        });
        console.log( nuevoAdicional);
        // Guarda el adicional en la base de datos
        await nuevoAdicional.save();

        // Envía una respuesta con el adicional creado
        res.status(201).json(nuevoAdicional);
    } catch (error) {
        // En caso de error, envía una respuesta con el mensaje de error
        res.status(500).send(error.message);
    }
};

const obtenerAdicionalesPorPedidoId = async (req, res) => {
    try {
        const { pedidoId } = req.params; // Asume que recibes el ID del pedido como parámetro en la URL

        // Verifica que el ID del pedido esté presente
        if (!pedidoId) {
            return res.status(400).send('El ID del pedido es necesario para obtener los adicionales');
        }

        // Busca todos los adicionales que correspondan al ID del pedido
        const adicionales = await AdicionalesPedidos.find({ pedidoId });

        // Si no se encuentran adicionales, devuelve una respuesta vacía
        if (!adicionales.length) {
            return res.status(204).send('No se encontraron adicionales para el pedido especificado');
        }

        // Envía una respuesta con los adicionales encontrados
        res.json(adicionales);
    } catch (error) {
        // En caso de error, envía una respuesta con el mensaje de error
        res.status(500).send(error.message);
    }
};
const eliminarAdicionalPedido = async (req, res) => {
    try {
        // Asume que el ID del adicional a eliminar viene en la URL como parámetro
        const { id } = req.params;

        // Utiliza findByIdAndDelete para eliminar el documento
        const adicionalEliminado = await AdicionalesPedidos.findByIdAndDelete(id);

        if (!adicionalEliminado) {
            return res.status(404).send('El adicional con el ID proporcionado no fue encontrado');
        }

        res.send({ mensaje: 'Adicional eliminado con éxito', adicional: adicionalEliminado });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const obtenerPedidos = async (req, res) => {
    try {
        // Verificar si se proporcionó un urn en la consulta
        const urn = req.query.urn;

        let pedidos;
        if (urn) {
            // Buscar pedidos que coincidan con el urn proporcionado
            pedidos = await Pedido.find({ urn_actual: urn });
        } else {
            // Buscar todos los documentos en la colección "Pedidos" si no se proporcionó urn
            return res.status(204).send();
        }

        // Si no hay pedidos, enviar una respuesta vacía
        if (!pedidos.length) {
            return res.status(204).send();
        }

        // Enviar una respuesta con los pedidos encontrados
        res.json(pedidos);
    } catch (error) {
        // Enviar una respuesta de error si ocurre algún problema
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearPedido = async (req, res) => {
    try {
        // Extraer información del cuerpo de la solicitud
        console.log("Recibe llamado a pedido");
        const { ids, fecha, proveedor, id_int1, pesos, largos, listado_pesos, listado_largos, nombre_pedido, urn_actual } = req.body;

        // Crear un nuevo documento de pedido con la información proporcionada
        const nuevoPedido = new Pedido({
            ids,
            fecha,
            proveedor, // Este campo es opcional
            id_int1, // Este campo es opcional pero debería ser único si se proporciona
            pesos, // Este campo es opcional
            largos, // Este campo es opcional
            listado_pesos, // Este campo es opcional
            listado_largos, // Este campo es opcional
            nombre_pedido,
            urn_actual
        });

        // Guardar el nuevo pedido en la base de datos
        await nuevoPedido.save();

        // Enviar una respuesta con el pedido creado
        res.status(201).json(nuevoPedido);
    } catch (error) {
        // Enviar una respuesta de error si ocurre algún problema
        res.status(400).send(error.message);
    }
};
// Actualizar un registro por id_int1
const actualizarPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findOneAndUpdate({ id_int1: req.params.id_int1 }, req.body, { new: true });
        if (!pedido) {
            return res.status(404).send('El pedido con ese ID no fue encontrado');
        }
        res.json(pedido);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por id_int1
const eliminarPedido = async (req, res) => {
    try {
        // Asume que req.params.id es el _id del pedido a eliminar.
        const { id } = req.body; // Cambia req.params.id a req.body.id
        await AdicionalesPedidos.deleteMany({ pedidoId: id });
        const pedido = await Pedido.findOneAndDelete({ _id: id });
        if (!pedido) {
            return res.status(404).send('El pedido con ese ID no fue encontrado');
        }
        res.send({ mensaje: 'Pedido y todos sus adicionales eliminados con éxito' });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
export {
    obtenerPedidos,
    obtenerPedido,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    crearAdicionalPedido,
    obtenerAdicionalesPorPedidoId,
    eliminarAdicionalPedido
};
