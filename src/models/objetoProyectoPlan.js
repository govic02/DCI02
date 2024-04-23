import mongoose from 'mongoose';

const objetoProyectoPlan = new mongoose.Schema({
  urn: { type: String, required: true },
  IdObjeto: { type: String, required: true },
  fecha_plan: { type: Date, required: false },
  fecha_instalacion: { type: Date, required: false },
  fecha_plan_modelo: { type: Date, required: false },
  dateModificacion: { type: Date, required: true, default: Date.now }
});

const ObjetoProyectoPlan = mongoose.model('ObjetoProyectoPlan', objetoProyectoPlan);

export default ObjetoProyectoPlan;
