import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocumento para los promedios de longitud
const LongitudPromedioSchema = new Schema({
    nombreFiltro2: { type: String}, // Clave del filtro
    promedioLongitud: { type: Number, required: true } // Promedio de longitud calculado
});

// Esquema principal que incluye la URN y los datos de todos los promedios por nombreFiltro2
const LongitudesPromedioSchema = new Schema({
    urn: { type: String, required: true }, // URN asociada a los datos
    longitudes: [LongitudPromedioSchema] // Lista de promedios por nombreFiltro2
});

// Crear el modelo a partir del esquema definido
const LongitudesPromedio = model('LongitudesPromedio', LongitudesPromedioSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default LongitudesPromedio;
