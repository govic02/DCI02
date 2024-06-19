import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Define un subesquema para los objetos de la lista
const itemSchema = new Schema({
  nombreFiltro1: { type: String },
  nombreFiltro2: { type: String },
  diametroBarra: { type: Number },
  fecha: { type: String, default: "" },
  id: { type: Number, required: true },
  longitudTotal: { type: Number },
  pesoLineal: { type: Number },
  nivel: { type: String },
  particion: { type: String },
  numeroArmadura: { type: String },
  imagen: { type: String },
  marcaTablaPlanificacion: { type: String },
  comentarios: { type: String },
  marca: { type: String },
  aecGrupo: { type: String },
  aecForma: { type: String },
  aecCodigoInterno: { type: String },
  aecBloquearBarras: { type: String },
  aecUsoBarra: { type: String },
  aecUsoBarraBloquear: { type: String },
  aecCantidad: { type: Number },
  aecId: { type: String },
  aecPiso: { type: String },
  aecUbicacion: { type: String },
  aecSecuenciaHormigonado: { type: String },
  aecSubUsoBarra: { type: String },
  faseCreacion: { type: String },
  faseDerribo: { type: String },
  estadosVisibilidadVista: { type: String },
  geometria: { type: String },
  estilo: { type: String },
  a: { type: String },
  b: { type: String },
  c: { type: String },
  d: { type: String },
  e: { type: String },
  f: { type: String },
  g: { type: String },
  h: { type: String },
  j: { type: String },
  k: { type: String },
  i: {type: String},
  o: { type: String },
  r: { type: String },
  volumenRefuerzo: { type: Number },
  reglaDiseno: { type: String },
  cantidad: { type: Number },
  espaciado: { type: String },
  forma: { type: String },
  imagenForma: { type: String },
  ganchoInicio: { type: String },
  rotacionGanchoInicio: { type: String },
  tratamientoExtremoInicio: { type: String },
  ganchoFinal: { type: String },
  rotacionGanchoFinal: { type: String },
  tratamientoExtremoFinal: { type: String },
  modificarLongitudesGancho: { type: String },
  categoriaAnfitrion: { type: String },
  marcaAnfitrion: { type: String },
  modificacionesRedondeo: { type: String },
  nombreTipo: { type: String },
  material: { type: String },
  subcategoria: { type: String },
  diametroCurvaturaEstandar: { type: Number },
  diametroCurvaturaGanchoEstandar: { type: Number },
  diametroCurvaturaEstriboTirante: { type: Number },
  longitudesGancho: { type: String },
  radioMaximoCurvatura: { type: Number },
  deformacion: { type: String },
  imagenTipo: { type: String },
  notaClave: { type: String },
  modelo: { type: String },
  fabricante: { type: String },
  comentariosTipo: { type: String },
  url: { type: String },
  descripcion: { type: String },
  descripcionMontaje: { type: String },
  codigoMontaje: { type: String },
  marcaTipo: { type: String },
  costo: { type: Number }
});

// Define el esquema principal que incluye el subesquema
const barraUrnSchema = new Schema({
  urn: { type: String, required: true },
  detalles: [itemSchema], // Lista de objetos con la estructura definida en itemSchema
  largoTipo:{type:String},
  pesoTipo: {type:String}
});

// Crea el modelo a partir del esquema
const BarraUrn = mongoose.model('BarraUrn', barraUrnSchema);

export default BarraUrn;
