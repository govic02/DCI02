import mongoose from 'mongoose';
const Users = new mongoose.Schema({
    idUsu: { type: Number },
    username: { type: String, required: true,unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    tipoUsuario: String
  } ,{ timestamps: true });

  Users.index({ username: 1 }, { 
    unique: true, 
    collation: { locale: 'es', strength: 2 } 
});

  export default mongoose.model('Users',Users);
  