import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define el subesquema para los niveles
const nivelSchema = new Schema({
  nombre: { type: String, required: true },
  posicion: { type: Number, required: true }
});

// Define el esquema principal para ordenNiveles
const ordenNivelesSchema = new Schema({
  urn: { type: String, required: true },
  listaNiveles: [nivelSchema] // Array de niveles con nombre y posición
});

// Crea el modelo a partir del esquema
const OrdenNiveles = mongoose.model('OrdenNiveles', ordenNivelesSchema);

export default OrdenNiveles;
