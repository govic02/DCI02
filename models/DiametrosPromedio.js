import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocumento para los promedios de diámetro
const DiametroPromedioSchema = new Schema({
    nombreFiltro2: { type: String }, // Clave del filtro (nombre del piso o nivel)
    promedioDiametro: { type: Number, required: true } // Promedio de diámetro calculado
});

// Esquema principal que incluye la URN y los datos de todos los promedios por nombreFiltro2
const DiametrosPromedioSchema = new Schema({
    urn: { type: String, required: true }, // URN asociada a los datos
    diametros: [DiametroPromedioSchema] // Lista de promedios por nombreFiltro2
});

// Crear el modelo a partir del esquema definido
const DiametrosPromedio = model('DiametrosPromedio', DiametrosPromedioSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default DiametrosPromedio;
