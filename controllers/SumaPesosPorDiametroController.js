import RespuestaSumaPesosPorDiametro from '../models/pesosPorDiametroSchema.js';

// Guardar o actualizar la respuesta basada en la URN
const guardarActualizarRespuesta = async (req, res) => {
    const { urn, nombreFiltro2, pesosPorPiso } = req.body;
    console.log("LLAMANDO A GUARDAR/ACTUALIZAR RESPUESTA POR DIAMETRO " + nombreFiltro2 + " para URN: " + urn);
   
    try {
        // Buscar si ya existe un registro para la URN dada
        const registroExistente = await RespuestaSumaPesosPorDiametro.findOne({ urn });

        // Si existe, eliminarlo
        if (registroExistente) {
            await RespuestaSumaPesosPorDiametro.deleteOne({ urn });
        }

        // Crear y guardar el nuevo documento con los datos recibidos
        const nuevoRegistro = new RespuestaSumaPesosPorDiametro({
            urn,
            nombreFiltro2,
            pesosPorPiso
        });

        await nuevoRegistro.save();

        res.json({ mensaje: 'Envío correcto', registro: nuevoRegistro });
    } catch (error) {
        console.error("Error al guardar/actualizar la respuesta por diametro para la URN:", error);
        res.json({ mensaje: 'Error al guardar/actualizar la respuesta.' });
    }
};

// Obtener la respuesta asociada a una URN
const obtenerRespuestaPorUrn = async (req, res) => {
    const { urn } = req.params;
    console.log("Buscando registro para URN:", urn);

    try {
        // Buscar el registro que coincida con la URN
        const registro = await RespuestaSumaPesosPorDiametro.findOne({ urn });

        if (!registro) {
            return res.status(404).json({ mensaje: 'Registro no encontrado para la URN proporcionada.' });
        }

        res.json(registro);
    } catch (error) {
        console.error("Error al obtener el registro por URN:", error);
        res.status(500).json({ mensaje: 'Error al buscar el registro por URN.' });
    }
};

export { obtenerRespuestaPorUrn, guardarActualizarRespuesta };
