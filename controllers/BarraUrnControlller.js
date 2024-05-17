import BarraUrn from '../models/barraUrnSchema.js'; // Asegúrate de que la ruta sea correcta

const insertarObjetoConDetalles = async (req, res) => {
    const { urn, lista } = req.body;
    console.log("INTENTO DE CARGA DE BARRAS PROYECTO", urn);
    const registroExistente = await BarraUrn.findOne({ urn });
    console.log("previo inserción barras", lista[0]);
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
        nivel: item.nivel,
        // Lista todos los campos de tu lista de requisitos
        particion: item.particion,
        numeroArmadura: item.numeroArmadura,
        imagen: item.imagen,
        marcaTablaPlanificacion: item.marcaTablaPlanificacion,
        comentarios: item.comentarios,
        marca: item.marca,
        aecGrupo: item.aecGrupo,
        aecForma: item.aecForma,
        aecCodigoInterno: item.aecCodigoInterno,
        aecBloquearBarras: item.aecBloquearBarras,
        aecUsoBarra: item.aecUsoBarra,
        aecUsoBarraBloquear: item.aecUsoBarraBloquear,
        aecCantidad: item.aecCantidad,
        aecId: item.aecId,
        aecPiso: item.aecPiso,  // Asegúrate de que todos los campos nuevos están aquí
        aecUbicacion: item.aecUbicacion,
        aecSecuenciaHormigonado: item.aecSecuenciaHormigonado,
        aecSubUsoBarra: item.aecSubUsoBarra,
        faseCreacion: item.faseCreacion,
        faseDerribo: item.faseDerribo,
        estadosVisibilidadVista: item.estadosVisibilidadVista,
        geometria: item.geometria,
        estilo: item.estilo,
        a: item.a,
        b: item.b,
        c: item.c,
        d: item.d,
        e: item.e,
        f: item.f,
        g: item.g,
        h: item.h,
        j: item.j,
        k: item.k,
        o: item.o,
        i: item.i,
        r: item.r,
        volumenRefuerzo: item.volumenRefuerzo,
        reglaDiseno: item.reglaDiseno,
        cantidad: item.cantidad,
        espaciado: item.espaciado,
        forma: item.forma,
        imagenForma: item.imagenForma,
        ganchoInicio: item.ganchoInicio,
        rotacionGanchoInicio: item.rotacionGanchoInicio,
        tratamientoExtremoInicio: item.tratamientoExtremoInicio,
        ganchoFinal: item.ganchoFinal,
        rotacionGanchoFinal: item.rotacionGanchoFinal,
        tratamientoExtremoFinal: item.tratamientoExtremoFinal,
        modificarLongitudesGancho: item.modificarLongitudesGancho,
        categoriaAnfitrion: item.categoriaAnfitrion,
        marcaAnfitrion: item.marcaAnfitrion,
        modificacionesRedondeo: item.modificacionesRedondeo,
        nombreTipo: item.nombreTipo,
        material:item.material, 
        subcategoria: item.subcategoria,
        diametroCurvaturaEstandar: item.diametroCurvaturaEstandar,
        diametroCurvaturaGanchoEstandar: item.diametroCurvaturaGanchoEstandar,
        diametroCurvaturaEstriboTirante: item.diametroCurvaturaEstriboTirante,
        longitudesGancho: item.longitudesGancho,
        radioMaximoCurvatura: item.radioMaximoCurvatura,
        deformacion: item.deformacion,
        imagenTipo: item.imagenTipo,
        notaClave: item.notaClave,
        modelo: item.modelo,
        fabricante: item.fabricante,
        comentariosTipo: item.comentariosTipo,
        url: item.url,
        descripcion: item.descripcion,
        descripcionMontaje: item.descripcionMontaje,
        codigoMontaje: item.codigoMontaje,
        marcaTipo: item.marcaTipo,
        costo: item.costo
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
        console.log("barras generales", registro)
        if (!registro) {
            return res.json("No existen Registros");
        }

        res.json(registro);
    } catch (error) {
        res.json("error" + error.message);
    }
};

const obtenerBarrasPorUrneIds = async (req, res) => {
    const { urn } = req.params; // Asume que la urn se pasa como parámetro en la URL
    const { ids } = req.body; // Recibe una lista de IDs de barras como parte del cuerpo de la solicitud

    try {
        const registro = await BarraUrn.findOne({ urn });
        if (!registro) {
            console.log("sin coincidencias barras");
            return res.status(404).json({ mensaje: "No se encontró un registro con la URN proporcionada" });
        }

        // Filtra los detalles para devolver solo las barras que coinciden con los IDs dados
        const detallesFiltrados = registro.detalles.filter(barra => ids.includes(barra.id.toString()));
        if (detallesFiltrados.length === 0) {
            console.log("sin coincidencias barras");
            return res.status(404).json({ mensaje: "No se encontraron barras con los IDs proporcionados" });
        }
        console.log("si hay coincidencias");
        console.log(detallesFiltrados);
        res.json(detallesFiltrados);
    } catch (error) {
        console.error("Error al buscar barras por URN e IDs:", error);
        res.status(500).send(error.message);
    }
};

export {
    insertarObjetoConDetalles,
    obtenerRegistroPorUrnBarras,
    obtenerBarrasPorUrneIds
};
