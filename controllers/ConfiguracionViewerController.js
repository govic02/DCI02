// Importar el modelo
import ConfiguracionViewer from '../models/configuracionViewer.js';

// Método para manipular la configuración del visor (actualizar o crear)
const manipularConfiguracionViewer = async (req, res) => {
  const { urn, filtro01, filtro02, variableBarra, variableTiempo } = req.body;
  console.log("intento ingreso de configuracion viewer");
 console.log(req.body);
  try {
    // Intenta encontrar el primer/único documento y actualizarlo. Si no existe, crea uno nuevo.
    const configuracion = await ConfiguracionViewer.findOneAndUpdate({}, 
      { urn, filtro01, filtro02, variableBarra, variableTiempo },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Si la operación es exitosa, devuelve la configuración actualizada o recién creada
    res.status(200).json({ mensaje: 'Configuración actualizada/creada con éxito', configuracion });
  } catch (error) {
    // En caso de error, devuelve un mensaje indicando el error
    res.status(500).json({ mensaje: 'Error al manipular la configuración del visor', error });
  }
};

const obtenerConfiguracionViewer = async (req, res) => {
    try {
      // Intenta encontrar el primer/único documento en la colección
      const configuracion = await ConfiguracionViewer.findOne();
  
      if (!configuracion) {
        // Si no existe ninguna configuración, devuelve un mensaje indicando que aún no se ha configurado
        return res.status(404).json({ mensaje: 'Configuración del visor no encontrada.' });
      }
  
      // Si se encuentra la configuración, la devuelve
      res.status(200).json({ mensaje: 'Configuración del visor obtenida con éxito', configuracion });
    } catch (error) {
      // En caso de error, devuelve un mensaje indicando el error
      res.status(500).json({ mensaje: 'Error al obtener la configuración del visor', error });
    }
  };
// Exporta todas las funciones del controlador como un objeto
export { 
  manipularConfiguracionViewer,obtenerConfiguracionViewer
};
