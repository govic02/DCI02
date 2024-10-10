import DiametrosPromedio from '../models/DiametrosPromedio.js';

// Función para calcular y guardar el diámetro promedio por piso (nombreFiltro2)
const crearActualizarDiametroPromedio = async (req, res) => {
    const { urn, diametros } = req.body;
    console.log("Inicio envío de datos diámetros promedio", urn);
    console.log(diametros);

    // Transformar el objeto de diámetros en un array de objetos adecuado para el modelo
    const diametrosArray = Object.keys(diametros).map(nombreFiltro2 => ({
        nombreFiltro2,
        promedioDiametro: diametros[nombreFiltro2]
    }));

    try {
        // Verificar si ya existe un registro para la URN y eliminarlo
        await DiametrosPromedio.findOneAndDelete({ urn });

        // Crear un nuevo registro con los datos transformados
        const nuevoRegistro = new DiametrosPromedio({ urn, diametros: diametrosArray });
        await nuevoRegistro.save();

        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error al crear o actualizar promedio de diámetro", error);
        res.status(400).send(error.message);
    }
};

// Obtener promedio de diámetros por URN específica
const obtenerDiametrosPromedioPorUrn = async (req, res) => {
    try {
        const diametros = await DiametrosPromedio.findOne({ urn: req.params.urn });
        if (!diametros) {
            return res.status(404).send('No se encontraron datos para la URN proporcionada');
        }
        res.json(diametros);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Eliminar promedio de diámetros por URN
const eliminarDiametroPromedioPorUrn = async (req, res) => {
    try {
        const resultado = await DiametrosPromedio.findOneAndDelete({ urn: req.params.urn });
        if (!resultado) {
            return res.status(404).send('No se encontraron datos para la URN proporcionada');
        }
        res.send('Promedio de diámetros eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export {
    crearActualizarDiametroPromedio,
    obtenerDiametrosPromedioPorUrn,
    eliminarDiametroPromedioPorUrn
};
