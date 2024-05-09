import ObjetoProyectoPlan from '../models/objetoProyectoPlan.js';

// Buscar o crear/actualizar un registro
const buscarCrearActualizarObjetoProyectoPlan = async (req, res) => {
    const { urn, IdObjeto, fecha_plan, fecha_instalacion, fecha_plan_modelo, dateModificacion } = req.body;

    try {
        let objetoProyectoPlan = await ObjetoProyectoPlan.findOne({ IdObjeto, urn });

        if (objetoProyectoPlan) {
            // Actualizar si ya existe
            objetoProyectoPlan.fecha_plan = fecha_plan;
            objetoProyectoPlan.fecha_instalacion = fecha_instalacion;
            objetoProyectoPlan.fecha_plan_modelo = fecha_plan_modelo;
            objetoProyectoPlan.dateModificacion = dateModificacion || Date.now();
            await objetoProyectoPlan.save();
        } else {
            // Crear si no existe
            const nuevoObjetoProyectoPlan = new ObjetoProyectoPlan({
                urn,
                IdObjeto,
                fecha_plan,
                fecha_instalacion,
                fecha_plan_modelo,
                dateModificacion: dateModificacion || Date.now()
            });
            await nuevoObjetoProyectoPlan.save();
            objetoProyectoPlan = nuevoObjetoProyectoPlan;
        }

        res.json(objetoProyectoPlan);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};
const procesarObjetosProyectoPlanMasivamente = async (req, res) => {
    const objetos = req.body; // Espera un array de objetos

    let resultados = [];
    let errores = [];

    for (const { urn, IdObjeto, fecha_plan, fecha_instalacion, fecha_plan_modelo, dateModificacion } of objetos) {
        try {
            let objetoProyectoPlan = await ObjetoProyectoPlan.findOne({ IdObjeto, urn });

            if (objetoProyectoPlan) {
                // Actualizar si ya existe
                objetoProyectoPlan.fecha_plan = fecha_plan;
                objetoProyectoPlan.fecha_instalacion = fecha_instalacion;
                objetoProyectoPlan.fecha_plan_modelo = fecha_plan_modelo;
                objetoProyectoPlan.dateModificacion = dateModificacion || Date.now();
                await objetoProyectoPlan.save();
            } else {
                // Crear si no existe
                const nuevoObjetoProyectoPlan = new ObjetoProyectoPlan({
                    urn,
                    IdObjeto,
                    fecha_plan,
                    fecha_instalacion,
                    fecha_plan_modelo,
                    dateModificacion: dateModificacion || Date.now()
                });
                await nuevoObjetoProyectoPlan.save();
                objetoProyectoPlan = nuevoObjetoProyectoPlan;
            }

            resultados.push(objetoProyectoPlan);
        } catch (error) {
            console.error(error);
            // Agregar al objeto de error la información relevante para identificar el registro fallido
            errores.push({ IdObjeto, error: error.message });
        }
    }

    if (errores.length > 0) {
        // Enviar respuesta con errores si existen
        return res.status(500).json({ message: "Se encontraron errores en algunas inserciones.", errores, resultados });
    } else {
        // Enviar respuesta con éxito si todo salió bien
        res.json({ message: "Todos los registros fueron procesados con éxito.", resultados });
    }
};

const CrearObjetoProyectoPlan = async (req, res) => {
    const { urn, IdObjeto, fecha_plan, fecha_instalacion, fecha_plan_modelo, dateModificacion } = req.body;
  
    try {
        // Buscar si ya existe un registro con el mismo IdObjeto y urn
        const objetoProyectoPlanExistente = await ObjetoProyectoPlan.findOne({ IdObjeto, urn });

        if (objetoProyectoPlanExistente) {
            // Si ya existe, devuelve el objeto existente sin crear uno nuevo
            console.log("entro si existe");
            console.log(""+IdObjeto+"    "+urn);
            return res.status(409).json({ mensaje: "El objeto ya existe", objetoProyectoPlan: objetoProyectoPlanExistente });
        }

        // Si no existe, crea uno nuevo
        const nuevoObjetoProyectoPlan = new ObjetoProyectoPlan({
            urn,
            IdObjeto,
            fecha_plan,
            fecha_instalacion,
            fecha_plan_modelo,
            dateModificacion: dateModificacion || Date.now()
        });

      //  await nuevoObjetoProyectoPlan.save();
        res.status(201).json(nuevoObjetoProyectoPlan);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

const obtenerPorDbIdYUrn = async (req, res) => {
    const { dbId, urn } = req.params; // Asumiendo que los recibes como parámetros de la ruta
  
    try {
        const objeto = await ObjetoProyectoPlan.findOne({ IdObjeto: dbId, urn:urn});
        if (!objeto) {
          
            return res.json({}); 
        }
        console.log("Resultado Llamado");
        console.log(dbId);
        console.log( objeto);
        res.json(objeto);
    } catch (error) {
        console.log(error);
        console.error(error);
        res.status(500).send(error.message);
    }
};
// Obtener todos los registros asociados a una urn
const obtenerObjetosPorUrn = async (req, res) => {
    try {
        const { urn } = req.params;
        const objetos = await ObjetoProyectoPlan.find({ urn });
        res.json(objetos);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};
const transfiereObjetoProyectoPlan = async (req, res) => {
    const { URNconsulta, URNreemplazo } = req.body;

    if (!URNconsulta || !URNreemplazo) {
        return res.status(400).send('Se requieren los campos URNconsulta y URNreemplazo para realizar la transferencia.');
    }

    if (URNconsulta === URNreemplazo) {
        return res.status(400).send('La URN de consulta y la URN de reemplazo no pueden ser iguales.');
    }

    try {
        // Obtener todos los objetos de proyecto planificados asociados a URNconsulta
        const objetos = await ObjetoProyectoPlan.find({ urn: URNconsulta });

        for (let objeto of objetos) {
            // Verificar si ya existe un objeto con el mismo IdObjeto y URNreemplazo
            const objetoExistente = await ObjetoProyectoPlan.findOne({ IdObjeto: objeto.IdObjeto, urn: URNreemplazo });
            if (objetoExistente) {
                // Si existe, actualiza el objeto existente con los datos del objeto encontrado
                objetoExistente.fecha_plan = objeto.fecha_plan;
                objetoExistente.fecha_instalacion = objeto.fecha_instalacion;
                objetoExistente.fecha_plan_modelo = objeto.fecha_plan_modelo;
                objetoExistente.dateModificacion = Date.now();
                await objetoExistente.save();
            } else {
                // Si no existe, actualiza la URN del objeto encontrado a URNreemplazo
                objeto.urn = URNreemplazo;
                objeto.dateModificacion = Date.now();
                await objeto.save();
            }
        }

        res.json({
            message: 'Objetos de proyecto transferidos o actualizados correctamente',
            URNoriginal: URNconsulta,
            URNnueva: URNreemplazo,
            documentosProcesados: objetos.length
        });
    } catch (error) {
        console.error('Error al transferir objetos de proyecto:', error);
        res.status(500).send('Error interno al intentar actualizar los objetos de proyecto.');
    }
};


export { buscarCrearActualizarObjetoProyectoPlan, obtenerObjetosPorUrn,CrearObjetoProyectoPlan,obtenerPorDbIdYUrn,procesarObjetosProyectoPlanMasivamente,transfiereObjetoProyectoPlan };
