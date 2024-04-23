import mongoose from 'mongoose';
const modelo = new mongoose.Schema({
    nombre: String,
    id: Number,
    modelo: String
  });
  const Modelo = mongoose.model('modelo',  modelo);
  export default Modelo;