// Importar el modelo
import ConfiguracionViewer from '../models/configuracionViewer.js';

// Método para manipular la configuración del visor (actualizar o crear)
const manipularConfiguracionViewer = async (req, res) => {
  // Extraer urn de un objeto si es necesario
  const urn = req.body.urn.urn || req.body.urn; // Asegúrate de manejar ambos casos: como objeto y como string directo

  const { filtro01, filtro02, variableBarra, variableTiempo,variableLargo, variablePesoLineal ,variableDiametro,variableNivel} = req.body;
 // console.log("intento ingreso de configuracion viewer");
//  console.log(req.body);
  try {
    // Intenta encontrar el documento por la URN y actualizarlo. Si no existe, crea uno nuevo.
    const configuracion = await ConfiguracionViewer.findOneAndUpdate(
      { urn },  // Clave de búsqueda
      { urn, filtro01, filtro02, variableBarra, variableTiempo, variableLargo,variablePesoLineal,variableDiametro,variableNivel },  // Datos para actualizar
      { new: true, upsert: true, setDefaultsOnInsert: true }  // Opciones
    );

    // Si la operación es exitosa, devuelve la configuración actualizada o recién creada
    res.status(200).json({ mensaje: 'Configuración actualizada/creada con éxito', configuracion });

  } catch (error) {
    // En caso de error, devuelve un mensaje indicando el error
    res.status(500).json({ mensaje: 'Error al manipular la configuración del visor', error });
  }
};


const obtenerConfiguracionViewer = async (req, res) => {
  // Extraer la 'urn' de los parámetros de la consulta
  const { urn } = req.query;
  console.log("urn consultada configuracion",urn);
  try {
    if (!urn) {
      // Devuelve un error si no se proporciona una 'urn'
      return res.status(400).json({ mensaje: 'Se requiere una URN para la consulta' });
    }

    // Intenta encontrar un documento que coincida con la 'urn' proporcionada
    const configuracion = await ConfiguracionViewer.findOne({ urn });

    console.log("datos de configuración");
    console.log(configuracion);

    if (!configuracion) {
      // Si no se encuentra ninguna configuración con esa 'urn', devuelve un mensaje indicando que no se ha configurado
      return res.status(404).json({ mensaje: 'Configuración del visor no encontrada para la URN proporcionada.' });
    }

    // Si se encuentra la configuración, la devuelve
    res.json(configuracion);
  } catch (error) {
    // En caso de error, devuelve un mensaje indicando el error
    res.status(500).json({ mensaje: 'Error al obtener la configuración del visor', error });
  }
};
const eliminarConfiguracionViewerPorUrn = async (req, res) => {
  const urn = req.params.urn;
  console.log("Eliminando configuración del visor asociada a la URN:", urn);
  try {
    if (!urn) {
      return res.status(400).json({ mensaje: 'Se requiere una URN para realizar la eliminación' });
    }

    const resultado = await ConfiguracionViewer.deleteMany({ urn });

    if (resultado.deletedCount === 0) {
      return res.status(200).json({ mensaje: 'No se encontraron configuraciones del visor con la URN proporcionada' });
    }

    res.send({ mensaje: 'Configuraciones del visor eliminadas con éxito', documentosEliminados: resultado.deletedCount });
  } catch (error) {
    console.error('Error al eliminar configuraciones del visor:', error);
    res.status(500).json({ mensaje: 'Error interno al intentar eliminar las configuraciones del visor' });
  }
};
// Exporta todas las funciones del controlador como un objeto
export { 
  manipularConfiguracionViewer,obtenerConfiguracionViewer,eliminarConfiguracionViewerPorUrn
};
