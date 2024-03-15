import mongoose from 'mongoose';

const { Schema } = mongoose;

const adicionalesPedidos = new Schema({
  nombre_pedido: String,
  diametro: String,
  cantidad: String,
  largo: String,
  urn: String,
  // Referencia al modelo Pedido
  pedidoId: { type: Schema.Types.ObjectId, ref: 'Pedido' },
});

const AdicionalesPedidos = mongoose.model('AdicionalesPedidos', adicionalesPedidos);

export default AdicionalesPedidos;
