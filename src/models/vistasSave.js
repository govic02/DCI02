import mongoose from 'mongoose';
const vistasSave = new mongoose.Schema({
  
    nombre: String,
    ids:[{ type: Number }] ,
    urn: String
  });
  export default mongoose.model('vistasSave', vistasSave);

