import Pedido from '../models/pedido.js';
import AdicionalesPedidos from '../models/adicionalesPedidos.js';
import { parse } from 'json2csv';
import fs from 'fs';
import {join, dirname} from 'path';
import { fileURLToPath } from 'url';
// Obtener todos los registros
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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


// Función para actualizar el estado de un pedido
const actualizarEstadoPedido = async (req, res) => {
    const { pedidoId, nombreEstado, fecha, nombreUsuario } = req.body;
   // console.log("Solicitud cambio estado pedido");
   // console.log("Pedido ID:", pedidoId);
    //console.log("Nombre Usuario:", nombreUsuario);
   // console.log("Estado a actualizar:", nombreEstado);

    // Preparar la ruta de actualización
    const estadoPath = `estados.${nombreEstado}`; // Construye la ruta del campo del estado a actualizar

    try {
        // Encuentra el pedido y actualiza el estado específico
        const pedidoActualizado = await Pedido.findOneAndUpdate(
            { "_id": pedidoId }, // Identificador del pedido
            {
                "$set": {
                    [`${estadoPath}.est`]: "ok", // Actualiza el campo est a 'ok'
                    [`${estadoPath}.fecha`]: fecha || new Date(), // Usa la fecha proporcionada o la actual
                    [`${estadoPath}.nombreUsuario`]: nombreUsuario // Actualiza el nombre del usuario
                }
            },
            { new: true } // Devuelve el documento actualizado
        );

        if (!pedidoActualizado) {
            console.log("No se encontró un pedido con los datos proporcionados.");
            return res.status(404).send('No se encontró el pedido con el ID proporcionado.');
        }

        res.json(pedidoActualizado); // Envía el pedido actualizado como respuesta
    } catch (error) {
        console.log("Se encontró el pedido pero hubo un error: " + error.message);
        res.status(500).send("Error al actualizar el estado del pedido: " + error.message);
    }
};


const obtenerAdicionalesPorUrn = async (req, res) => {
    try {
        const { urn } = req.query; // Recibe la URN como parámetro de consulta
        if (!urn) {
            return res.status(400).send('Se requiere una URN para buscar pedidos adicionales');
        }

        // Buscar todos los pedidos adicionales que coincidan con la URN dada
        const adicionales = await AdicionalesPedidos.find({ urn }).populate('pedidoId', 'nombre_pedido');
        if (!adicionales.length) {
            return res.status(204).send('No se encontraron pedidos adicionales para la URN proporcionada');
        }

        res.json(adicionales);
    } catch (error) {
        console.error('Error al obtener pedidos adicionales por URN:', error);
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
        console.log("recibo solicitud para urn",urn);
       
        if (urn) {
            // Buscar pedidos que coincidan con el urn proporcionado
            let pedidos = await Pedido.find({ urn_actual: urn });
         //   console.log("respuesta pedidos");
        //    console.log(pedidos);
           
    
            // Enviar una respuesta con los pedidos encontrados
         //   console.log("envio pedidos",pedidos);
           return  res.status(200).json(pedidos);
        } else {
            // Buscar todos los documentos en la colección "Pedidos" si no se proporcionó urn
            return res.status(204).send();
        }

        // Si no hay pedidos, enviar una respuesta vacía
       
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
        const fileUrl = '0';

        const pedidoExistente = await Pedido.findOne({
            $or: [
                { urn_actual, nombre_pedido },
                { urn_actual, ids: { $in: ids } }
            ]
        });

        if (pedidoExistente) {
            return res.status(305).json({ message: "Pedido repetido" });
        }
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
            urn_actual,
            fileUrl
        });

        // Guardar el nuevo pedido en la base de datos
       
      //  console.log("Guardo datos del pedidos inicio guardado CVs");
      //  const fields = ['ids', 'fecha', 'nombre_pedido', 'pesos', 'largos'];
      //  const csvData = parse({ ids, fecha, nombre_pedido, pesos, largos }, { fields });
      //  const fileName = `${nombre_pedido}-${Date.now()}.csv`;
     //   const filePath = join(__dirname, '..','public', fileName);

      //  fs.writeFileSync(filePath, csvData);
        // Guardar la URL del archivo en la base de datos
       // const fileUrl = `${req.protocol}://${req.get('host')}/public/pedidos/${fileName}`;
      // const fileUrl = `${req.protocol}://${req.get('host')}/public/${fileName}`;

        await nuevoPedido.save();
       // await Pedido.updateOne({ _id: savedPedido._id }, { $set: { fileUrl: fileUrl } });
        // Enviar una respuesta con el pedido creado
        res.status(201).json({ pedido: nuevoPedido, fileUrl });
    } catch (error) {
        // Enviar una respuesta de error si ocurre algún problema
        console.log(error.message);
        res.status(400).send(error.message);
    }
};
const crearArchivoPedido = async (req, res) => {
    try {
        const { barras, nombrePedido, urn } = req.body; // Asume que la solicitud contiene la lista de objetos y datos adicionales
        console.log("Request body:", req.body);

        // Mapea los datos al formato deseado para el CSV, incluyendo datos adicionales
        const formattedData = barras.map(bar => ({
            'EJE/VIGA/LOSA': bar.nombreFiltro1,
            'ELEM CONST': bar.nombreFiltro2,
            'PISO': bar.aecPiso,
            'CICLO': bar.aecSecuenciaHormigonado,
            'Cantidad': bar.cantidad,
            'Ø mm': bar.diametroBarra,
            'Figura': bar.aecForma,
            'L/m': bar.longitudTotal,
            'Uso': bar.aecUsoBarra,
            'A/cm': bar.a,
            'B/cm': bar.b,
            'C/cm': bar.c,
            'D/cm': bar.d,
            'E/cm': bar.e,
            'F/cm': bar.f,
            'G/cm': bar.g,
            'H/cm': bar.h,
            'I/cm': bar.i,
            'J/cm': bar.j,
            'AngV': '',
            'AngV2': '',
            'AngV3': '',
            'R/cm': bar.r,
            'Peso Kg': bar.pesoLineal,
            'Id': bar.id
        }));

        
        const csvFields = Object.keys(formattedData[0]);
        const csvData = parse(formattedData, { fields: csvFields, delimiter: ';' });

        const fileName = `Pedido-${nombrePedido.replace(/ /g, '_')}-${Date.now()}.csv`;
        const filePath = join(__dirname, '..', 'public', fileName);
        const header = `Nombre del Pedido: ${nombrePedido}, URN: ${urn}\n\n`;
        // Escribe 
        fs.writeFileSync(filePath,  header +csvData);

        // Construye la URL del archivo para acceso público
        const fileUrl = `${req.protocol}://${req.get('host')}/public/${fileName}`;
        const t = await Pedido.findOneAndUpdate(
            { urn_actual: urn, nombre_pedido: nombrePedido },
            { $set: { url: fileUrl } },
            { new: true }
        );
        console.log("respuesta de actualización");
        console.log(t);
        // Devuelve la respuesta con la URL del archivo
        res.status(201).json({ message: "Archivo creado con éxito", fileUrl });
    } catch (error) {
        console.error("Error al crear el archivo CSV: ", error.message);
        res.status(500).send(error.message);
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

// Función para eliminar pedidos por URN
const eliminarPedidosPorUrn = async (req, res) => {
    try {
        const { urn } = req.params; // Obtiene la URN desde los parámetros de la ruta
        console.log("busca pedidos asociados a URN");
        console.log(urn);
        if (!urn) {
            return res.status(400).send('Se requiere una URN para realizar la eliminación');
        }

        // Eliminar todos los pedidos que tengan el urn_actual especificado
        const resultado = await Pedido.deleteMany({ urn_actual: urn });
        
        if (resultado.deletedCount === 0) {
            return res.status(404).send('No se encontraron pedidos con la URN proporcionada');
        }

        res.send({ mensaje: 'Pedidos eliminados con éxito', documentosEliminados: resultado.deletedCount });
    } catch (error) {
        console.error('Error al eliminar pedidos:', error);
        res.status(500).send('Error interno al intentar eliminar los pedidos');
    }
};

const transfierePedido = async (req, res) => {
    const { URNconsulta, URNreemplazo } = req.body;

    if (!URNconsulta || !URNreemplazo) {
        return res.status(400).send('Los parámetros URNconsulta y URNreemplazo son obligatorios.');
    }

    try {
        // Realiza la actualización de los documentos que coincidan
        const resultado = await Pedido.updateMany(
            { urn_actual: URNconsulta },
            { $set: { urn_actual: URNreemplazo } }
        );

        if (resultado.modifiedCount === 0) {
            return res.json({
                message: 'No Se encontraron coincidencias',
                URNoriginal: URNreemplazo,
                URNnueva: URNconsulta,
                documentosActualizados: resultado.modifiedCount
            });
        }

        res.json({
            message: 'Pedidos actualizados correctamente',
            URNoriginal: URNreemplazo,
            URNnueva: URNconsulta,
            documentosActualizados: resultado.modifiedCount
        });
    } catch (error) {
        console.error('Error al transferir pedidos:', error);
        res.status(500).send('Error interno al intentar actualizar los pedidos.');
    }
};
const transfiereAdicionalesPedidos = async (req, res) => {
    const { URNconsulta, URNreemplazo } = req.body;

    if (!URNconsulta || !URNreemplazo) {
        return res.status(400).send('Se requieren los campos URNconsulta y URNreemplazo para realizar la transferencia.');
    }

    try {
        // Realiza la actualización de los documentos que coincidan con URNconsulta
        const resultado = await AdicionalesPedidos.updateMany(
            { urn: URNreemplazo },
            { $set: { urn: URNconsulta } }
        );

        if (resultado.modifiedCount === 0) {
            return res.json({
                message: 'No Se encontraron coincidencias',
                URNoriginal: URNreemplazo,
                URNnueva: URNconsulta,
                documentosActualizados: resultado.modifiedCount
            });
        }

        res.json({
            message: 'Adicionales de pedidos actualizados correctamente',
            URNoriginal: URNconsulta,
            URNnueva: URNreemplazo,
            documentosActualizados: resultado.modifiedCount
        });
    } catch (error) {
        console.error('Error al transferir adicionales de pedidos:', error);
        res.send('Error interno al intentar actualizar los adicionales de pedidos.');
    }
};
export {
    obtenerPedidos,
    obtenerPedido,
    crearPedido,
    crearArchivoPedido,
    actualizarPedido,
    eliminarPedido,
    crearAdicionalPedido,
    obtenerAdicionalesPorPedidoId,
    eliminarAdicionalPedido,
    obtenerAdicionalesPorUrn,
    actualizarEstadoPedido,
    transfierePedido,
    transfiereAdicionalesPedidos,
    eliminarPedidosPorUrn
};
