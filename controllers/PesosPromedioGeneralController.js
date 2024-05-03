import PesosPromedioGeneral from '../models/PesosPromedioGeneralSchema.js'; // Asegúrate de que la ruta al modelo es correcta

// Crear o actualizar el peso promedio general del proyecto
const crearActualizarPesoPromedioGeneral = async (req, res) => {
    const { urn, pesoPromedioGeneral } = req.body;
    try {
        // Verificar si ya existe un registro para la URN y actualizarlo, o crear uno nuevo
        const registroExistente = await PesosPromedioGeneral.findOne({ urn });
        if (registroExistente) {
            await PesosPromedioGeneral.updateOne({ urn }, { $set: { pesoPromedioGeneral } });
        } else {
            const nuevoRegistro = new PesosPromedioGeneral({ urn, pesoPromedioGeneral });
            await nuevoRegistro.save();
        }

        res.status(201).json({ mensaje: 'Peso promedio general creado/actualizado con éxito', urn });
    } catch (error) {
        console.error("Error al crear o actualizar el peso promedio general:", error);
        res.status(500).send(error.message);
    }
};

// Obtener el peso promedio general por URN
const obtenerPesoPromedioGeneralPorUrn = async (req, res) => {
    try {
        const { urn } = req.params;
        const promedio = await PesosPromedioGeneral.findOne({ urn });
        if (!promedio) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la URN proporcionada' });
        }
        res.json(promedio);
    } catch (error) {
        console.error("Error al obtener el peso promedio general por URN:", error);
        res.status(500).send(error.message);
    }
};

export { crearActualizarPesoPromedioGeneral, obtenerPesoPromedioGeneralPorUrn };
