import DiametroEquivalente from '../models/DiametroEquivalente.js'; // Asegúrate de tener la ruta correcta al modelo

const crearActualizarDiametroEquivalente = async (req, res) => {
    const { urn, filtros2 } = req.body;
    console.log("Datos originales recibidos:", filtros2);

    // Transformar filtros2 en una estructura adecuada para Mongoose
    const filtrosTransformados = Object.entries(filtros2).map(([nombreFiltro2, grupos]) => {
        return {
            nombreFiltro2,
            grupos: Object.entries(grupos).map(([longitud, grupo]) => ({
                longitud: parseFloat(longitud),
                sumatoriaLargos: grupo.sumatoriaLargos,
                sumatoriaDiametrosCuadradoPorLargo: grupo.sumatoriaDiametrosCuadradoPorLargo,
                diametroEquivalente: grupo.diametroEquivalente
            }))
        };
    });

    console.log("Filtros transformados:", filtrosTransformados);

    try {
        const registroExistente = await DiametroEquivalente.findOne({ urn });

        if (registroExistente) {
            await DiametroEquivalente.deleteOne({ urn });
        }

        const nuevoRegistro = new DiametroEquivalente({ urn, filtros2: filtrosTransformados });
        await nuevoRegistro.save();

        res.status(201).json({ mensaje: 'Registro creado/actualizado con éxito', datos: nuevoRegistro });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
    }
};

const obtenerDiametroPorUrn = async (req, res) => {
    const { urn } = req.params;

    try {
        const registro = await DiametroEquivalente.findOne({ urn });
        if (registro) {
            res.status(200).json(registro);
        } else {
            res.status(404).json({ mensaje: 'Registro no encontrado para la URN proporcionada' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el registro', error: error.message });
    }
};

export { crearActualizarDiametroEquivalente, obtenerDiametroPorUrn };
