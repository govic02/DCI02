import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Subdocumento para cada grupo de diámetro equivalente
const GrupoSchema = new Schema({
    longitud: Number,
    sumatoriaLargos: Number,
    sumatoriaDiametrosCuadradoPorLargo: Number,
    diametroEquivalente: Number
});

// Subdocumento para cada nombreFiltro2, que contiene varios grupos
const Filtro2Schema = new Schema({
    nombreFiltro2: { type: String},
    grupos: [GrupoSchema]
});

// Esquema principal que incluye la URN y los datos de todos los nombreFiltro2
const DiametroEquivalenteSchema = new Schema({
    urn: { type: String, required: true },
    filtros2: [Filtro2Schema]
});

// Crear el modelo a partir del esquema definido
const DiametroEquivalente = model('DiametroEquivalente', DiametroEquivalenteSchema);

// Exportar el modelo para su uso en otras partes de la aplicación
export default DiametroEquivalente;
