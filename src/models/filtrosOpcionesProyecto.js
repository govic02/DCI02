import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const filtroDetalleSchema = new Schema({
  cantidad: {
    type: Number,
    required: false
  },
  dbIds: {
    type: [Number], // Array de números para almacenar los dbIds
    required: false
  }
}, { _id: false }); // Omitimos el _id para este subdocumento

const filtrosOpcionesProyectoSchema = new Schema({
  id: {
    type: Number,
    required: false
  },
  urn: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  filtros: {
    type: Map,
    of: filtroDetalleSchema // Utilizamos el esquema definido anteriormente para los valores del Map
  }
});

// Middleware para asegurar que el campo 'filtros' es un Map antes de guardar
filtrosOpcionesProyectoSchema.pre('save', function(next) {
    if (this.filtros && !(this.filtros instanceof Map)) {
      // Transforma el objeto literal a un Map si no lo es
      this.filtros = new Map(Object.entries(this.filtros));
    }
    next();
});

const FiltrosOpcionesProyecto = mongoose.model('FiltrosOpcionesProyecto', filtrosOpcionesProyectoSchema);

export default FiltrosOpcionesProyecto;
