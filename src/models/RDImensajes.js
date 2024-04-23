import mongoose from 'mongoose';

const { Schema } = mongoose;

const mensajeSchema = new Schema({
  senderId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversacionSchema = new Schema({
  conversationId: { type: String, required: true, unique: true },
  participants: [{ type: String }],
  messages: [mensajeSchema],
  estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
  asunto: { type: String, required: true } // 
});

const RDImensajes = mongoose.model('RDImensajes', conversacionSchema);

export default RDImensajes;
