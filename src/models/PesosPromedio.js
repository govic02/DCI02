import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocumento para los promedios de peso
const PesoPromedioSchema = new Schema({
    nombreFiltro2: { type: String}, // Clave del filtro
    promedioPeso: { type: Number, required: true } // Promedio de peso calculado
});

// Esquema principal que incluye la URN y los datos de todos los promedios por nombreFiltro2
const PesosPromedioSchema = new Schema({
    urn: { type: String, required: true }, // URN asociada a los datos
    pesos: [PesoPromedioSchema] // Lista de promedios por nombreFiltro2
});

// Crear el modelo a partir del esquema definido
const PesosPromedio = model('PesosPromedio', PesosPromedioSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default PesosPromedio;
