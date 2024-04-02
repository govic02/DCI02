import mongoose from 'mongoose';

const schemaRespuestaSumaPesos = new mongoose.Schema({
  urn: { type: String, required: true }, // URN del proyecto
  nombreFiltro2: { type: String, required: true }, // Nombre de filtro2, ej: "AEC Piso"
  pesosPorValor: [{
    valor: { type: String }, // Valor de filtro2, ej: "25" para "AEC Piso"
    sumaPeso: { type: Number } // Suma de los pesos para este valor
  }]
});

const RespuestaSumaPesos = mongoose.model('RespuestaSumaPesos', schemaRespuestaSumaPesos);

export default RespuestaSumaPesos;
