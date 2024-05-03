import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DiametroPromedioBarraGeneralSchema = new Schema({
    urn: { type: String, required: true }, // URN asociada al proyecto
    diametroPromedio: { type: Number, required: true } // Diametro promedio de barras del proyecto
});

const DiametroPromedioBarraGeneral = mongoose.model('DiametroPromedioBarraGeneral', DiametroPromedioBarraGeneralSchema);

export default DiametroPromedioBarraGeneral;
