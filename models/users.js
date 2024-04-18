import mongoose from 'mongoose';
const Users = new mongoose.Schema({
    idUsu: { type: Number },
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    tipoUsuario: String
  });


  export default mongoose.model('Users',Users);
  