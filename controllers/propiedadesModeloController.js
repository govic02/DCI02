import PropiedadesModelo from '../models/propiedadesModelo.js';

const guardarPropiedadesModelo = async (req, res) => {
  const { urn, propiedades } = req.body;

  try {
    const propiedadesGuardadas = await PropiedadesModelo.findOneAndUpdate(
      { urn },
      { urn, propiedades },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ mensaje: 'Propiedades del modelo guardadas con éxito', propiedadesGuardadas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar las propiedades del modelo', error });
  }
};

const obtenerPropiedadesModelo = async (req, res) => {
  const { urn } = req.query;

  try {
    if (!urn) {
        console.log("busco propiedades para "+urn);
      return res.status(400).json({ mensaje: 'Se requiere una URN para la consulta' });
    }

    const propiedades = await PropiedadesModelo.findOne({ urn });
    console.log("propiedades encontradas ",propiedades);
    if (!propiedades) {
      return res.status(200).json({ mensaje: 'Propiedades del modelo no encontradas para la URN proporcionada.' });
    }

    res.status(200).json(propiedades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las propiedades del modelo', error });
  }
};

const eliminarPropiedadesModeloPorUrn = async (req, res) => {
  const { urn } = req.params;

  try {
    if (!urn) {
      return res.status(400).json({ mensaje: 'Se requiere una URN para realizar la eliminación' });
    }

    const resultado = await PropiedadesModelo.deleteMany({ urn });

    if (resultado.deletedCount === 0) {
      return res.status(200).json({ mensaje: 'No se encontraron propiedades del modelo con la URN proporcionada' });
    }

    res.send({ mensaje: 'Propiedades del modelo eliminadas con éxito', documentosEliminados: resultado.deletedCount });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno al intentar eliminar las propiedades del modelo' });
  }
};

export { 
  guardarPropiedadesModelo,
  obtenerPropiedadesModelo,
  eliminarPropiedadesModeloPorUrn
};
