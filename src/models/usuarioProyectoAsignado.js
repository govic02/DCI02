import mongoose from 'mongoose';

const usuarioProyectoAsignadoSchema = new mongoose.Schema({
  id: { type: String, },
  idUsuario: { type: String },
  urn: { type: String },
  proyectoKey: { type: String },
  fecha: { type: String },
  hora: { type: String }
});

const UsuarioProyectoAsignado = mongoose.model('UsuarioProyectoAsignado', usuarioProyectoAsignadoSchema);

export default UsuarioProyectoAsignado;
