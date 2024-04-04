import BarraUrn from '../models/barraUrnSchema.js'; // Asegúrate de que la ruta sea correcta

const insertarObjetoConDetalles = async (req, res) => {
    const { urn, lista } = req.body;
    const registroExistente = await BarraUrn.findOne({ urn });
    console.log("previo inserción barras");
    if (registroExistente) {
        await BarraUrn.deleteOne({ urn });
    }
    // Formatea cada objeto de la lista para que coincida con el esquema BarraUrn
    const detallesFormateados = lista.map(item => ({
        nombreFiltro1: item.nombreFiltro1,
        nombreFiltro2: item.nombreFiltro2,
        diametroBarra: item.diametroBarra,
        fecha: item.fecha,
        id: item.id,
        longitudTotal: item.longitudTotal,
        pesoLineal: item.pesoLineal,
    }));

    // Crea el documento a insertar
    const barraUrn = new BarraUrn({
        urn,
        detalles: detallesFormateados
    });

    try {
        // Guarda el documento en la base de datos
        await barraUrn.save();
        console.log("inserción barras proyecto por urn exitoso");
        res.status(201).json(barraUrn);
    } catch (error) {
        // Maneja errores de inserción
        console.log("Error inserción barras proyecto");
        res.status(400).send(error.message);
    }
};

const obtenerRegistroPorUrnBarras = async (req, res) => {
    const { urn } = req.params; // Asume que la urn se pasa como parámetro en la URL

    try {
        const registro = await BarraUrn.findOne({ urn });
        console.log()
        if (!registro) {
            return  res.json("No existen Registros");
        }

        res.json(registro);
    } catch (error) {
        res.json("error"+error.message);
       
    }
};


export {
    insertarObjetoConDetalles,
    obtenerRegistroPorUrnBarras
};
