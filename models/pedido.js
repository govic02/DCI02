import mongoose from 'mongoose';

const pedido = new mongoose.Schema({
    ids: { type: [String], required: true }, // Lista de IDs de los elementos pedidos
    fecha: { type: String, required: true }, // Fecha del pedido
    proveedor: { type: String }, // Proveedor del pedido
    id_int1: { type: Number }, // Identificador único del pedido
    pesos: { type: String }, // Peso total del pedido
    largos: { type: String }, // Largo total del pedido
    listado_pesos: { type: String }, // Listado detallado de pesos
    listado_largos: { type: String }, // Listado detallado de largos
    nombre_pedido: { type: String, required: true }, // Nombre del pedido
    urn_actual: { type: String, required: true } // URN asociada al pedido
});

const Pedido = mongoose.model('Pedido', pedido);

export default Pedido;
