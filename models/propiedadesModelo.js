import mongoose from 'mongoose';

const propiedadesModeloSchema = new mongoose.Schema({
  urn: String,
  propiedades: [String]
});

const PropiedadesModelo = mongoose.model('PropiedadesModelo', propiedadesModeloSchema);

export default PropiedadesModelo;
