import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Definir el esquema para los pesos totales versus pedidos
const PesosTotalversusPedidosSchema = new Schema({
    urn: { type: String, required: true, unique: true }, // URN asociada a los datos
    pesoTotalProyecto: { type: Number, required: true }, // Peso total del proyecto
    pesoTotalPedidos: { type: Number, required: true } // Peso total de los pedidos
});

// Crear el modelo a partir del esquema definido
const PesosTotalversusPedidos = model('PesosTotalversusPedidos', PesosTotalversusPedidosSchema);

export default PesosTotalversusPedidos;
