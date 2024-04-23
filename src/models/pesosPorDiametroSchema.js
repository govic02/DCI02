import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const pesosPorDiametroSchema = new Schema({
  diametro: { type: Number },
  pesoTotal: { type: Number }
});

const pisoConPesosSchema = new Schema({
  piso: { type: String },
  diametros: [pesosPorDiametroSchema]
});

const respuestaSumaPesosPorDiametroSchema = new Schema({
  urn: { type: String, required: true },
  nombreFiltro2: { type: String, required: true },
  pesosPorPiso: [pisoConPesosSchema]
});

const RespuestaSumaPesosPorDiametro = mongoose.model('RespuestaSumaPesosPorDiametro', respuestaSumaPesosPorDiametroSchema);

export default RespuestaSumaPesosPorDiametro;
