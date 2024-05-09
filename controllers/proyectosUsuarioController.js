const ProyectosUsuario = require('.../models/ProyectosUsuario');

// Obtener todos los registros
const obtenerProyectosUsuario = async (req, res) => {
    try {
        const proyectos = await ProyectosUsuario.find();
        res.json(proyectos);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Obtener un registro por nameusuario
const obtenerProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOne({ nameusuario: req.params.nameusuario });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.json(proyecto);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Crear un nuevo registro
const crearProyectoUsuario = async (req, res) => {
    try {
        const nuevoProyecto = new ProyectosUsuario(req.body);
        await nuevoProyecto.save();
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Actualizar un registro por nameusuario
const actualizarProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOneAndUpdate({ nameusuario: req.params.nameusuario }, req.body, { new: true });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.json(proyecto);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Eliminar un registro por nameusuario
const eliminarProyectoUsuario = async (req, res) => {
    try {
        const proyecto = await ProyectosUsuario.findOneAndDelete({ nameusuario: req.params.nameusuario });
        if (!proyecto) {
            return res.status(404).send('El proyecto con ese nameusuario no fue encontrado');
        }
        res.send('Proyecto eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const transfiereProyectoUsuario = async (req, res) => {
    const { URNconsulta, URNreemplazo } = req.body;

    if (!URNconsulta || !URNreemplazo) {
        return res.status(400).send('Se requieren los campos URNconsulta y URNreemplazo para realizar la transferencia.');
    }

    if (URNconsulta === URNreemplazo) {
        return res.status(400).send('La URN de consulta y la URN de reemplazo no pueden ser iguales.');
    }

    try {
        // Obtener todos los proyectos de usuario asociados a URNconsulta
        const proyectos = await ProyectosUsuario.find({ urn: URNconsulta });

        let proyectosActualizados = 0;
        for (let proyecto of proyectos) {
            // Verificar si ya existe un proyecto con el mismo nameusuario y URNreemplazo
            const proyectoExistente = await ProyectosUsuario.findOne({ nameusuario: proyecto.nameusuario, urn: URNreemplazo });
            if (!proyectoExistente) {
                // Si no existe, actualiza la URN del proyecto encontrado a URNreemplazo
                proyecto.urn = URNreemplazo;
                await proyecto.save();
                proyectosActualizados++;
            }
        }

        res.json({
            message: 'Proyectos de usuario transferidos o actualizados correctamente',
            URNoriginal: URNconsulta,
            URNnueva: URNreemplazo,
            documentosActualizados: proyectosActualizados
        });
    } catch (error) {
        console.error('Error al transferir proyectos de usuario:', error);
        res.status(500).send('Error interno al intentar actualizar los proyectos de usuario.');
    }
};

module.exports = {
    obtenerProyectosUsuario,
    obtenerProyectoUsuario,
    crearProyectoUsuario,
    actualizarProyectoUsuario,
    eliminarProyectoUsuario,
    transfiereProyectoUsuario
};
