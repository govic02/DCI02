import FiltrosOpcionesProyecto from '../models/filtrosOpcionesProyecto.js'; // Asume que este es el path correcto

// Crear un nuevo FiltroOpcionesProyecto
function convertirFiltrosAObjeto(filtros) {
    // Si filtros ya es un objeto literal, simplemente devuélvelo
    if (!(filtros instanceof Map)) {
      return filtros;
    }
  
    // Si filtros es una instancia de Map, conviértelo a un objeto literal
    const objeto = {};
    filtros.forEach((valor, clave) => {
      objeto[clave] = valor;
    });
    return objeto;
  }

  function objetoAMap(objeto) {
    const map = new Map();
    for (const clave of Object.keys(objeto)) {
        map.set(clave, objeto[clave]);
    }
    return map;
}
const crearFiltroOpcionesProyecto = async (req, res) => {
  try {
    console.log("Solicitud");
    console.log(req.body);
    const nuevoFiltro = new FiltrosOpcionesProyecto(req.body);
    const filtroGuardado = await nuevoFiltro.save();
    console.log("filtro guardado");
    console.log(filtroGuardado);
    res.status(201).json(filtroGuardado);
  } catch (error) {
    console.log("Error al crear el filtro", error.message);
    res.status(400).json({ mensaje: 'Error al crear el filtro', error });
  }
};
const crearFiltroOpcionesProyectoSiNoExiste = async (req, res) => {
    try {
       // console.log("Solicitud");
       // console.log(req.body);

        // Verificar si ya existe un registro con la misma urn y nombre
        const registroExistente = await FiltrosOpcionesProyecto.findOne({
            $and: [{ urn: req.body.urn }, { nombre: req.body.nombre }]
        });

        // Si ya existe un registro, no insertar uno nuevo
        if (registroExistente) {
        //    console.log("El filtro ya existe para la URN y nombre proporcionado.");
            return res.status(409).json({ mensaje: 'El filtro ya existe para la URN y nombre proporcionado.' });
        }

        // Convertir el campo filtros de objeto literal a Map, si es necesario
        if (req.body.filtros && !(req.body.filtros instanceof Map)) {
            req.body.filtros = objetoAMap(req.body.filtros);
        }

        // Si no existe, insertar el nuevo registro
        const nuevoFiltro = new FiltrosOpcionesProyecto(req.body);
        const filtroGuardado = await nuevoFiltro.save();
      //  console.log("Filtro guardado");
       // console.log(filtroGuardado);
        res.status(201).json(filtroGuardado);

    } catch (error) {
       // console.log("Error al crear el filtro", error.message);
        res.status(400).json({ mensaje: 'Error al crear el filtro', error });
    }
};
// Leer todos los FiltrosOpcionesProyecto
const obtenerFiltrosOpcionesProyecto = async (req, res) => {
  try {
    const filtros = await FiltrosOpcionesProyecto.find();
    res.json(filtros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los filtros', error });
  }
};

// Leer un FiltroOpcionesProyecto por ID
const obtenerFiltroOpcionesProyectoPorId = async (req, res) => {
  try {
    const filtro = await FiltrosOpcionesProyecto.findById(req.params.id);
    if (!filtro) {
      return res.status(404).json({ mensaje: 'Filtro no encontrado' });
    }
    res.json(filtro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el filtro', error });
  }
};

// Buscar FiltrosOpcionesProyecto por URN
const obtenerFiltrosOpcionesProyectoPorUrn = async (req, res) => {
    try {
        console.log("LLAMADO A BUSQUEDA POR URN");
      const urn = req.params.urn; // o req.query.urn dependiendo de cómo quieras recibir la URN
      console.log(urn);
      const filtros = await FiltrosOpcionesProyecto.find({ urn: urn });
      console.log("filtros resultado");
      console.log( filtros );
      if (filtros.length === 0) {
        return res.json({ mensaje: 'sin filtros' });
      }
      res.json(filtros);
    } catch (error) {
      console.log("Error al obtener filtros por URN", error.message);
      res.status(500).json({ mensaje: 'Error al obtener los filtros por URN', error });
    }
  };
  

// Actualizar un FiltroOpcionesProyecto por ID
const actualizarFiltroOpcionesProyecto = async (req, res) => {
  try {
    const filtroActualizado = await FiltrosOpcionesProyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!filtroActualizado) {
      return res.status(404).json({ mensaje: 'Filtro no encontrado' });
    }
    res.json(filtroActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el filtro', error });
  }
};

// Borrar un FiltroOpcionesProyecto por ID
const eliminarFiltroOpcionesProyecto = async (req, res) => {
  try {
    const filtroEliminado = await FiltrosOpcionesProyecto.findByIdAndRemove(req.params.id);
    if (!filtroEliminado) {
      return res.status(404).json({ mensaje: 'Filtro no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el filtro', error });
  }
};

export {
  crearFiltroOpcionesProyecto,
  crearFiltroOpcionesProyectoSiNoExiste,
  obtenerFiltrosOpcionesProyecto,
  obtenerFiltroOpcionesProyectoPorId,
  actualizarFiltroOpcionesProyecto,
  eliminarFiltroOpcionesProyecto,
  obtenerFiltrosOpcionesProyectoPorUrn
};
