
import mongoose from 'mongoose';


const estadoDetalleSchema = new mongoose.Schema({
    est: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    nombreUsuario: { type: String, required: true }
});

const pedidoSchema = new mongoose.Schema({
    ids: { type: [String], required: true },
    fecha: { type: String, required: true },
    proveedor: { type: String },
    id_int1: { type: Number },
    pesos: { type: String },
    largos: { type: String },
    listado_pesos: { type: String },
    listado_largos: { type: String },
    nombre_pedido: { type: String, required: true },
    urn_actual: { type: String, required: true },
    url:{ type: String },
    estados: {
        paquetizado: estadoDetalleSchema,
        espera_aprobacion: estadoDetalleSchema,
        rechazado: estadoDetalleSchema,
        aceptado: estadoDetalleSchema,
        fabricacion: estadoDetalleSchema,
        despacho: estadoDetalleSchema,
        recepcionado: estadoDetalleSchema,
        instalado: estadoDetalleSchema,
        inspeccionado: estadoDetalleSchema,
        hormigonado: estadoDetalleSchema
    }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

export default Pedido;
