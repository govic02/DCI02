import mongoose from 'mongoose';
const plan = new mongoose.Schema({
    dbId: Number,
    fecha_base: String,
    fecha_plan: String,
    urn: String
  });

  const Plan = mongoose.model('plan', plan);
  export default Plan;
  