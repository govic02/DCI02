import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Esquema para el peso promedio general del proyecto
const PesosPromedioGeneralSchema = new Schema({
    urn: { type: String, required: true }, // URN asociada al proyecto
    pesoPromedioGeneral: { type: Number, required: true } // Peso promedio total del proyecto
});

// Crear el modelo a partir del esquema definido
const PesosPromedioGeneral = model('PesosPromedioGeneral', PesosPromedioGeneralSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default PesosPromedioGeneral;
