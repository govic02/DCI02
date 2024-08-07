import mongoose from 'mongoose';

// Definir el esquema para la configuración del visor
const configuracionViewerSchema = new mongoose.Schema({
  urn: String,
  filtro01: String,
  filtro02: String,
  variableBarra: String,
  variableTiempo: String,
  variableLargo:String,
  variablePesoLineal:String,
  variableDiametro:String,
  variableNivel:String,
  propiedades: [String] 
});

// Crear el modelo a partir del esquema definido
const ConfiguracionViewer = mongoose.model('configuracionViewer', configuracionViewerSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default ConfiguracionViewer;
