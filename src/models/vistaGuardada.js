const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definición del esquema 'VistaGuardada'
const vistaGuardada = new Schema({
  nombre: { type: String, required: true },
  urn: { type: String, required: true },
  idms: [{ type: Number }] // Listado de Idm como un array de números
}, {
  timestamps: true, // Agrega automáticamente las propiedades 'createdAt' y 'updatedAt'
});

// Creación del modelo basado en el esquema
const VistaGuardada = mongoose.model('VistaGuardada', vistaGuardada);

module.exports = VistaGuardada;
