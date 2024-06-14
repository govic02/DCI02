import UsuarioProyectoAsignado from'../models/usuarioProyectoAsignado.js';

// Función para generar la fecha y hora actual
const obtenerFechaHoraActual = () => {
  const ahora = new Date();
  const fecha = ahora.toISOString().split('T')[0]; // Obtiene la fecha en formato 'YYYY-MM-DD'
  const hora = ahora.toTimeString().split(' ')[0]; // Obtiene la hora en formato 'HH:MM:SS'
  return { fecha, hora };
};

const obtenerUsuariosProyectoAsignadoPorUrn = async (req, res) => {
  try {
    const { urn } = req.params; // Asume que la URN viene como parámetro en la URL
    const registros = await UsuarioProyectoAsignado.find({ urn });
    console.log("entro a buscar y encuentro :");
    console.log(registros);
    if (registros.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron registros para la URN proporcionada' });
    }
    
    res.json(registros);
    console.log("envio registros");
  } catch (error) {
    console.error('Error al obtener registros por URN:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Controlador para crear un nuevo registro
const crearUsuarioProyectoAsignado = async (req, res) => {
  try {
    const { id, idUsuario, urn, proyectoKey,tipoUsuario } = req.body;

    // Verificar si ya existe una asignación para el idUsuario y urn
    const asignacionExistente = await UsuarioProyectoAsignado.findOne({ idUsuario, urn });

    if (asignacionExistente) {
      // Si la asignación ya existe, devolver un mensaje de éxito sin crear un nuevo registro
      console.log("La asignación para este usuario y urn ya existe");
      return res.status(200).json({ mensaje: "OK" });
    }

    // Si no existe una asignación previa, crear un nuevo registro
    const { fecha, hora } = obtenerFechaHoraActual();
    const nuevoRegistro = new UsuarioProyectoAsignado({
      id,
      idUsuario,
      urn,
      proyectoKey,
      fecha,
      tipoUsuario,
      hora
    });
    console.log("Creando nueva asignación");
    console.log(nuevoRegistro);
    const usuarioProyectoAsignadoGuardado = await nuevoRegistro.save();
    res.status(201).json(usuarioProyectoAsignadoGuardado);
  } catch (error) {
    console.log("Error al intentar crear la asignación");
    res.status(400).json({ mensaje: error.message });
  }
};


// Controlador para actualizar un registro por idUsuario
const actualizarUsuarioProyectoAsignadoPorIdUsuario = async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { idUsuario, urn, proyectoKey } = req.body;

    // Función para obtener fecha y hora actual
    const obtenerFechaHoraActual = () => {
      const ahora = new Date();
      const fecha = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const hora = ahora.toTimeString().split(' ')[0]; // Formato HH:MM:SS
      return { fecha, hora };
    };

    // Verificar si existe un registro de UsuarioProyectoAsignado con el ID de usuario y URN
    const usuarioProyectoAsignadoExistente = await UsuarioProyectoAsignado.findOne({ idUsuario, urn });

    if (!usuarioProyectoAsignadoExistente) {
      // Si no existe, crear uno nuevo con fecha y hora actual
      const { fecha, hora } = obtenerFechaHoraActual();
      const nuevoRegistro = new UsuarioProyectoAsignado({
        idUsuario,
        urn,
        proyectoKey,
        fecha,
        hora
      });
      await nuevoRegistro.save();
      res.status(201).json({ mensaje: 'Nuevo registro creado exitosamente' });
    } else {
      // Si ya existe, actualizar solamente la fecha y la hora
      const { fecha, hora } = obtenerFechaHoraActual();
      usuarioProyectoAsignadoExistente.fecha = fecha;
      usuarioProyectoAsignadoExistente.hora = hora;
      await usuarioProyectoAsignadoExistente.save();
      res.status(200).json({ mensaje: 'Registro actualizado exitosamente' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario-proyecto asignado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


const obtenerUsuarioProyectoAsignadoPorIdUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.body;
    //console.log("usuario asignacion");
   // console.log(idUsuario);

    const usuarioProyectosAsignados = await UsuarioProyectoAsignado.find({ idUsuario })
      .sort({ fecha: -1, hora: -1 }) // Ordena primero por fecha y luego por hora, ambos en orden descendente
      .exec();

    if (usuarioProyectosAsignados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron registros' });
    }

    //console.log("Proyectos asignados ordenados:", usuarioProyectosAsignados);
    res.status(200).json(usuarioProyectosAsignados);
  } catch (error) {
    console.error('Error al buscar los proyectos asignados:', error);
    res.status(400).json({ mensaje: error.message });
  }
};



const eliminarUsuarioProyectoAsignado = async (req, res) => {
  try {
    const { urn, idUsuario } = req.params; // Asume que la URN y el idUsuario vienen como parámetros en la URL

    // Buscar y eliminar el registro que coincide con la URN y el ID de usuario proporcionados
    const resultado = await UsuarioProyectoAsignado.findOneAndDelete({ urn, idUsuario });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'No se encontró el registro para eliminar' });
    }

    res.json({ mensaje: 'Registro eliminado con éxito', resultado });
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const transferirUsuarioProyectoPerfil = async (req, res) => {
  const { URNconsulta, URNreemplazo } = req.body;

  if (!URNconsulta || !URNreemplazo) {
      return res.status(400).send('Se requieren los campos URNconsulta y URNreemplazo para realizar la transferencia.');
  }

  if (URNconsulta === URNreemplazo) {
      return res.status(400).send('La URN de consulta y la URN de reemplazo no pueden ser iguales.');
  }

  try {
      // Obtener todos los usuarios de proyecto asociados a URNconsulta
      const usuarios = await UsuarioProyectoAsignado.find({ urn: URNconsulta });

      let documentosActualizados = 0;
      for (let usuario of usuarios) {
          // Verificar si ya existe un usuario con el mismo idUsuario y URNreemplazo
          const usuarioExistente = await UsuarioProyectoAsignado.findOne({ idUsuario: usuario.idUsuario, urn: URNreemplazo });
          if (!usuarioExistente) {
              // Si no existe, actualiza la URN del usuario encontrado a URNreemplazo
              usuario.urn = URNreemplazo;
              await usuario.save();
              documentosActualizados++;
          }
          // Si existe, no hacemos nada para evitar duplicados
      }

      res.json({
          message: 'Usuarios de proyecto transferidos o actualizados correctamente',
          URNoriginal: URNconsulta,
          URNnueva: URNreemplazo,
          documentosActualizados: documentosActualizados
      });
  } catch (error) {
      console.error('Error al transferir usuarios de proyecto:', error);
      res.status(500).send('Error interno al intentar actualizar los usuarios de proyecto.');
  }
};


  export  {
  crearUsuarioProyectoAsignado,
  actualizarUsuarioProyectoAsignadoPorIdUsuario,
  obtenerUsuarioProyectoAsignadoPorIdUsuario,
  obtenerUsuariosProyectoAsignadoPorUrn,
  eliminarUsuarioProyectoAsignado,
  transferirUsuarioProyectoPerfil 
};
