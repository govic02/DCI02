import mongoose from 'mongoose';
const proyectosUsuario = new mongoose.Schema({
    usuario: String,
    namep: String,
    urn: String,
    nameusuario: String
  });
  const ProyectosUsuario = mongoose.model('proyectosUsuario', proyectosUsuario);
  export default ProyectosUsuario;