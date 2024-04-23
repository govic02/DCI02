import mongoose from 'mongoose';
const filtros = new mongoose.Schema({
    filtro_1: String,
    filtro_2: String,
    id: Number,
    fierro: String,
    largo: String,
    diametro: String,
    nueva: String
  });
  
  const Filtros = mongoose.model('filtros', filtros);
  export default Filtros;