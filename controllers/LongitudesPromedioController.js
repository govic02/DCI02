import LongitudesPromedio from '../models/LongitudPromedio.js'; // Update the path as necessary

// Obtener los promedios de longitud por URN
const obtenerLongitudesPromedio = async (req, res) => {
    try {
        const longitudes = await LongitudesPromedio.find();
        res.json(longitudes);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

// Obtener promedio de longitud por URN específica
const obtenerLongitudPromedioPorUrn = async (req, res) => {
    try {
        const longitud = await LongitudesPromedio.findOne({ urn: req.params.urn });
        if (!longitud) {
            return res.status(404).send('No se encontraron datos para la URN proporcionada');
        }
        res.json(longitud);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear o actualizar promedio de longitud
const crearActualizarLongitudPromedio = async (req, res) => {
    const { urn, longitudes } = req.body;
    console.log("inicio envio de datos longitudes promedio", urn);
    console.log(longitudes);

    // Transformar el objeto de longitudes en un array de objetos adecuado para el modelo
    const longitudesArray = Object.keys(longitudes).map(nombreFiltro2 => ({
        nombreFiltro2,
        promedioLongitud: longitudes[nombreFiltro2]
    }));

    try {
        // Verificar si ya existe un registro para la URN y eliminarlo
        await LongitudesPromedio.findOneAndDelete({ urn });

        // Crear un nuevo registro con los datos transformados
        const nuevoRegistro = new LongitudesPromedio({ urn, longitudes: longitudesArray });
        await nuevoRegistro.save();

        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error al crear o actualizar promedio de longitud", error);
        res.status(400).send(error.message);
    }
};


// Eliminar promedio de longitud por URN
const eliminarLongitudPromedioPorUrn = async (req, res) => {
    try {
        const resultado = await LongitudesPromedio.findOneAndDelete({ urn: req.params.urn });
        if (!resultado) {
            return res.status(404).send('No se encontraron datos para la URN proporcionada');
        }
        res.send('Promedio de longitud eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export {
    obtenerLongitudesPromedio,
    obtenerLongitudPromedioPorUrn,
    crearActualizarLongitudPromedio,
    eliminarLongitudPromedioPorUrn
};
