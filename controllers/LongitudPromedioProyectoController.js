import LongitudPromedioProyecto from '../models/LongitudPromedioProyecto.js';

const crearActualizarLongitudPromedioProyecto = async (req, res) => {
    const { urn, promedioLongitudProyecto } = req.body;
   // console.log("Inicio envío de datos de longitud promedio del proyecto", urn);
   // console.log("Promedio de longitud del proyecto:", promedioLongitudProyecto);

    try {
        // Verificar si ya existe un registro para la URN y actualizarlo o crearlo
        const registroActualizado = await LongitudPromedioProyecto.findOneAndUpdate(
            { urn },
            { promedioLongitudProyecto },
            { new: true, upsert: true } // upsert: true crea el documento si no existe
        );

        res.status(201).json(registroActualizado);
    } catch (error) {
        console.error("Error al crear o actualizar el promedio de longitud del proyecto", error);
        res.status(400).send(error.message);
    }
};
const obtenerLongitudPromedioProyecto = async (req, res) => {
    const { urn } = req.params;
   // console.log("Buscando longitud promedio del proyecto para la URN:", urn);

    try {
        const registro = await LongitudPromedioProyecto.findOne({ urn });
        if (!registro) {
            return res.status(404).json({ mensaje: 'No se encontró un registro para la URN proporcionada' });
        }
        res.status(200).json(registro);
    } catch (error) {
        console.error("Error al obtener el promedio de longitud del proyecto", error);
        res.status(500).send(error.message);
    }
};

export{ crearActualizarLongitudPromedioProyecto,
        obtenerLongitudPromedioProyecto

};
