import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define un subesquema para los objetos de la lista
const itemSchema = new Schema({
  nombreFiltro1: { type: String }, // Reemplaza 'AEC Partición HA'
  nombreFiltro2: { type: String }, // Reemplaza 'AEC Piso'
  diametroBarra: { type: Number },
  fecha: { type: String, default: "" }, // Puedes cambiar el tipo a Date si necesitas almacenar una fecha real
  id: { type: Number, required: true },
  longitudTotal: { type: Number },
  pesoLineal: { type: Number }
});

// Define el esquema principal que incluye el subesquema
const barraUrnSchema = new Schema({
  urn: { type: String, required: true },
  detalles: [itemSchema] // Lista de objetos con la estructura definida en itemSchema
});

// Crea el modelo a partir del esquema
const BarraUrn = mongoose.model('BarraUrn', barraUrnSchema);

export default BarraUrn;
