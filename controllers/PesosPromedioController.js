import PesosPromedio from '../models/PesosPromedio.js'; // Asegúrate de que la ruta al modelo es correcta

// Crear o actualizar promedio de peso
const crearActualizarPesoPromedio = async (req, res) => {
    const { urn, pesos } = req.body;
    try {
        // Convertir los pesos recibidos en un array de objetos adecuado para el modelo
        const pesosArray = Object.entries(pesos).map(([nombreFiltro2, promedioPeso]) => ({
            nombreFiltro2,
            promedioPeso
        }));

        // Verificar si ya existe un registro para la URN y actualizarlo, o crear uno nuevo
        const registroExistente = await PesosPromedio.findOne({ urn });
        if (registroExistente) {
            await PesosPromedio.updateOne({ urn }, { $set: { pesos: pesosArray } });
        } else {
            const nuevoRegistro = new PesosPromedio({ urn, pesos: pesosArray });
            await nuevoRegistro.save();
        }

        res.status(201).json({ mensaje: 'Promedio de peso creado/actualizado con éxito', urn });
    } catch (error) {
        console.error("Error al crear o actualizar el promedio de peso:", error);
        res.status(500).send(error.message);
    }
};

// Obtener promedio de peso por URN
const obtenerPesoPromedioPorUrn = async (req, res) => {
    try {
        const { urn } = req.params;
        const promedio = await PesosPromedio.findOne({ urn });
        if (!promedio) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la URN proporcionada' });
        }
        res.json(promedio);
    } catch (error) {
        console.error("Error al obtener el promedio de peso por URN:", error);
        res.status(500).send(error.message);
    }
};

export { crearActualizarPesoPromedio, obtenerPesoPromedioPorUrn };
