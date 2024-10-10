// Importar mongoose
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Esquema para el promedio de longitud del proyecto
const LongitudPromedioProyectoSchema = new Schema({
    urn: { type: String, required: true, unique: true }, // URN asociada al proyecto
    promedioLongitudProyecto: { type: Number, required: true } // Promedio de longitud del proyecto
});

// Crear el modelo a partir del esquema definido
const LongitudPromedioProyecto = model('LongitudPromedioProyecto', LongitudPromedioProyectoSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default LongitudPromedioProyecto;
