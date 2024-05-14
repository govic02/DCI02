import OrdenNiveles from '../models/ordenNivelesSchema.js'; // Ajusta la ruta de importación según sea necesario

// Crear o actualizar un registro de OrdenNiveles
const crearActualizarOrdenNiveles = async (req, res) => {
    const { urn, listaNiveles } = req.body;
    console.log("intento de ingreso de niveles para "+urn);
    console.log(listaNiveles);
    try {
        await OrdenNiveles.findOneAndDelete({ urn });
        const nuevoRegistro = new OrdenNiveles({ urn, listaNiveles });
        await nuevoRegistro.save();
        console.log("registro de orden niveles guardado exitosamente");
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error al crear o actualizar los niveles:", error);
        res.status(500).send(error.message);
    }
};

// Obtener un registro de OrdenNiveles por URN
const obtenerOrdenNivelesPorUrn = async (req, res) => {
    const { urn } = req.params;
    console.log("intento buscar niveles");
    try {
        const registro = await OrdenNiveles.findOne({ urn });

        if (!registro) {
            console.log("sin registros de ordenes");
            res.json({mensaje:"sin registros"});
            return ;
        }
        console.log("se envian registros de ordenes");
        res.json(registro);
    } catch (error) {
        console.error("Error al obtener los niveles por URN:", error);
        res.status(500).send(error.message);
    }
};

export {
    obtenerOrdenNivelesPorUrn,
    crearActualizarOrdenNiveles
};