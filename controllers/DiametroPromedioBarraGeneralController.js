import DiametroPromedioBarraGeneral from '../models/DiametroPromedioBarraGeneral.js';

// Guardar o actualizar el diámetro promedio de barras general
const crearActualizarDiametroPromedioGeneral = async (req, res) => {
    const { urn, diametroPromedio } = req.body;
    //console.log("Guardando o actualizando el diámetro promedio general para la URN: " + urn);

    try {
        // Verificar si ya existe un registro para la URN dada
        const registroExistente = await DiametroPromedioBarraGeneral.findOne({ urn });

        // Si existe, actualizarlo
        if (registroExistente) {
            registroExistente.diametroPromedio = diametroPromedio;
            await registroExistente.save();
        } else {
            // Si no existe, crear uno nuevo
            const nuevoRegistro = new DiametroPromedioBarraGeneral({
                urn,
                diametroPromedio
            });
            await nuevoRegistro.save();
        }

        res.status(201).json({ mensaje: 'Diámetro promedio general creado/actualizado con éxito', urn });
    } catch (error) {
        console.error("Error al crear o actualizar el diámetro promedio general:", error);
        res.status(500).send(error.message);
    }
};

// Obtener el diámetro promedio general por URN
const obtenerDiametroPromedioGeneralPorUrn = async (req, res) => {
    const { urn } = req.params;
   // console.log("Obteniendo el diámetro promedio general para la URN: " + urn);

    try {
        const promedio = await DiametroPromedioBarraGeneral.findOne({ urn });
        if (!promedio) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la URN proporcionada' });
        }
        res.json(promedio);
    } catch (error) {
        console.error("Error al obtener el diámetro promedio general por URN:", error);
        res.status(500).send(error.message);
    }
};

export { crearActualizarDiametroPromedioGeneral, obtenerDiametroPromedioGeneralPorUrn };
