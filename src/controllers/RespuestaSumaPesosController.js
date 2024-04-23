import RespuestaSumaPesos from '../models/schemaRespuestaSumaPesos.js'; // Asegúrate de que la ruta es correcta
//import Filtros from '../models/Filtros.js';
// Guardar o actualizar la respuesta basada en la URN
const guardarSumaPisosGeneral = async (req, res) => {
    const { urn, nombreFiltro2, pesosPorValor } = req.body;


    try {
        // Buscar si ya existe un registro para la URN dada
        const registroExistente = await RespuestaSumaPesos.findOne({ urn });

        // Si existe, eliminarlo
        if (registroExistente) {
            await RespuestaSumaPesos.deleteOne({ urn });
        }

        // Crear y guardar el nuevo documento con los datos recibidos
        const nuevoRegistro = new RespuestaSumaPesos({
            urn,
            nombreFiltro2,
            pesosPorValor
        });

        await nuevoRegistro.save();

        res.json({ mensaje: 'Envio correcto' });
       // console.log(nuevoRegistro);
    } catch (error) {
        res.json({ mensaje: 'error' });
    }
};
const obtenerRegistroPorUrn = async (req, res) => {
    const { urn } = req.params; // Asume que la URN se envía como parámetro en la URL
   

    try {
        // Buscar el registro que coincida con la URN
        const registro = await RespuestaSumaPesos.findOne({ urn });

        if (!registro) {
            // Si no se encuentra un registro, enviar una respuesta indicando que no se encontró
            return res.status(404).json({ mensaje: 'Registro no encontrado para la URN proporcionada.' });
        }

        // Si se encuentra el registro, devolverlo en la respuesta
        res.json(registro);
    } catch (error) {
        // En caso de error en la búsqueda, enviar una respuesta de error
        console.error("Error al obtener el registro por URN:", error);
        res.status(500).json({ mensaje: 'Error al buscar el registro por URN.' });
    }
};
export { obtenerRegistroPorUrn,guardarSumaPisosGeneral };
