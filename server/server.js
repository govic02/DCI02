import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import stream from 'stream';
import fs from 'fs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPublicToken,getInternalToken ,getClient} from './oauth.js'; // Ruta corregida
import forgeSDK from 'forge-apis'; // Importa todo el paquete forge-apis
import crypto from 'crypto';
const { DerivativesApi, JobPayload, JobPayloadInput, JobPayloadOutput, JobSvfOutputPayload } = forgeSDK; // Extrae los objetos 

const { BucketsApi, ObjectsApi, PostBucketsPayload } = forgeSDK;
import { crearActualizarOrdenNiveles, obtenerOrdenNivelesPorUrn } from '../controllers/OrdenNivelesController.js';
import { guardarPropiedadesModelo, obtenerPropiedadesModelo, eliminarPropiedadesModeloPorUrn } from '../controllers/propiedadesModeloController.js';

import { obtenerFiltros,actualizarFiltro } from '../controllers/filtrosController.js';
import {crearPedido,crearArchivoPedido,eliminarPedido,obtenerPedidos,actualizarEstadoPedido,transfierePedido,eliminarPedidosPorUrn } from '../controllers/pedidoController.js'; // PEDIDOS
import  {actualizarUsuarioProyectoAsignadoPorIdUsuario,obtenerUsuarioProyectoAsignadoPorIdUsuario } from '../controllers/usuarioProyectoAsignadoController.js'; // Asignación proyectos
import { manipularConfiguracionViewer,obtenerConfiguracionViewer,eliminarConfiguracionViewerPorUrn} from '../controllers/ConfiguracionViewerController.js'; 
import { buscarCrearActualizarObjetoProyectoPlan, obtenerObjetosPorUrn ,CrearObjetoProyectoPlan,obtenerPorDbIdYUrn,procesarObjetosProyectoPlanMasivamente,transfiereObjetoProyectoPlan} from '../controllers/ObjetoProyectoPlanController.js';
import {guardarSumaPisosGeneral,obtenerRegistroPorUrn} from '../controllers/RespuestaSumaPesosController.js';
import{ obtenerUsuario, obtenerUsuarios, obtenerUsuarioPorUsername,crearUsuario,actualizarUsuario,eliminarUsuario,obtenerUsuariosAdministradores} from '../controllers/usersController.js'
import { insertarObjetoConDetalles, obtenerRegistroPorUrnBarras,obtenerBarrasPorUrneIds } from '../controllers/BarraUrnControlller.js';
import {crearUsuarioProyectoAsignado, obtenerUsuariosProyectoAsignadoPorUrn,eliminarUsuarioProyectoAsignado,transferirUsuarioProyectoPerfil, eliminarAsignacionesPorUrn } from '../controllers/usuarioProyectoAsignadoController.js'
import {guardarActualizarRespuesta,obtenerRespuestaPorUrn} from '../controllers/SumaPesosPorDiametroController.js';
import { crearActualizarDiametroPromedioGeneral, obtenerDiametroPromedioGeneralPorUrn } from '../controllers/DiametroPromedioBarraGeneralController.js';

import { crearActualizarDiametroEquivalente, obtenerDiametroPorUrn } from '../controllers/DiametroEquivalenteController.js';
import { crearActualizarPesoPromedio,obtenerPesoPromedioPorUrn } from '../controllers/PesosPromedioController.js';
import { crearActualizarPesoPromedioGeneral, obtenerPesoPromedioGeneralPorUrn } from '../controllers/PesosPromedioGeneralController.js'; 

import { crearConversacion,
  agregarMensaje,
  eliminarMensaje,
  eliminarConversacion,
  editarConversacion,
  editarMensaje,
  obtenerConversacionesPorParticipante,
  obtenerConversacionPorId } from '../controllers/RDImensajesController.js';

import {
  crearFiltroOpcionesProyecto,crearFiltroOpcionesProyectoSiNoExiste,
  obtenerFiltrosOpcionesProyecto,
  obtenerFiltroOpcionesProyectoPorId,
  obtenerFiltrosOpcionesProyectoPorUrn,
  actualizarFiltroOpcionesProyecto,
  eliminarFiltroOpcionesProyecto,
  eliminarFiltrosOpcionesProyectoPorUrn
} from '../controllers/FiltrosOpcionesProyectoController.js'; 
import { crearAdicionalPedido,obtenerAdicionalesPorPedidoId ,eliminarAdicionalPedido,obtenerAdicionalesPorUrn,transfiereAdicionalesPedidos } from '../controllers/pedidoController.js';
import {crearActualizarLongitudPromedio ,obtenerLongitudPromedioPorUrn,eliminarLongitudPromedioPorUrn} from '../controllers/LongitudesPromedioController.js';
import {crearActualizarPesosTotalversusPedidos, obtenerPesosTotalversusPedidosPorUrn} from '../controllers/PesosTotalversusPedidosController.js';


import { 
  obtenerVistasSave, obtenerVistaSave,obtenerVistasPorUrn,crearVistaSave, eliminarVistaSave,transfiereVistas} from '../controllers/VistasSaveController.js'; // Importar los controladores de las vistas guardadas
import Users from '../models/users.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'Yb8+6Wxw9QFgJP9+R+7c31aD+aRfR2jCJCatX6Q8fgM=';
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('No se pudo conectar a MongoDB:', err));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/public', express.static('public'));

app.use(async (req, res, next) => {
  const token = await getInternalToken();
  req.oauth_token = token;
  req.oauth_client = getClient();
  next();
});

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
  }
  
});
const sendEmail = async (emailOptions) => {
  try {
      let info = await mailTransport.sendMail(emailOptions);
      console.log('Message sent: %sa  asdsad', info.messageId);
  } catch (error) {
      console.error('Failed to send email', error);
  }
};

app.post('/api/send-mail', async (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: text, // plain text body
      
  };

  try {
      await sendEmail(mailOptions);
      res.status(200).send('Email sent successfully');
  } catch (error) {
      res.status(200).send('Failed to send email');
  }
});
// Middleware para analizar cuerpos de formularios URL-encoded

// Middleware de autenticación

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username);

  try {
      // Buscar el usuario por username
      const usuario = await Users.findOne({ username: new RegExp(`^${username}$`, 'i') });
     
      console.log("respuesta usuario consulta");
      console.log(usuario);
      if (!usuario) {
          console.log("no hay log");
          return res.status(200).json({ error: 'Usuario no encontrado' });
      }else{
        console.log("si hay un usuario con este");
        if (password !== usuario.password) {
          console.log("no hay log");
          return res.status(200).json({ error: 'Contraseña incorrecta' });
         }
         else{
          const token = jwt.sign({ userId: usuario.idUsu, username: usuario.username,  tipoUsuario: usuario.tipoUsuario }, JWT_SECRET, { expiresIn: '1h' });
          console.log("ok si hay log");
          console.log(token);
          res.json({ message: 'Autenticación exitosa', token,userData: {
                    userId: usuario.idUsu, 
                    username: usuario.username, 
                    tipoUsuario: usuario.tipoUsuario,
                    fullname:usuario.fullname
                } });

         }

      }

     
      
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


function randomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


app.get('/api/gettoken', async (req, res) => {

  try {
    const token = await getPublicToken();
    // console.log("Token de Acceso");
  // //   console.log(token.access_token);
    if (token.access_token) {

       console.log("Genero nuevo Token de Acceso OK");
       
     //  console.log( "a: "+token.access_token);
     //  console.log( "expira: "+token.expires_in);
      res.json({ token: token.access_token, expires_in: token.expires_in });
    } else {
     // console.log("Unauthorized - Failed to obtain access token");
      
      res.status(401).json({ error: 'Unauthorized - Failed to obtain access token' });
    }
  } catch (error) {
    console.log("Error fetching token: "+ error);
    console.error('Error fetching token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//*******Gestion de usuarios */
app.get('/api/usuarios', obtenerUsuarios); // Obtener todos los usuarios
app.get('/api/usuarios/username/:username', obtenerUsuarioPorUsername)
app.get('/api/usuariosAdministradores',obtenerUsuariosAdministradores);
app.get('/api/usuarios/:idUsu', obtenerUsuario); // Obtener un usuario por idUsu
app.post('/api/usuarios', crearUsuario); // Crear un nuevo usuario
app.put('/api/usuarios/:idUsu', actualizarUsuario); // Actualizar un usuario por idUsu
app.delete('/api/usuarios/:idUsu',eliminarUsuario); // Eliminar un usuario por idUsu
//
app.get('/api/bucketsProyectos', async (req, res, next) => {
  const bucket_name = req.query.id;
  const opc = req.query.opc;
  const token = req.headers.authorization;
  console.log("BUCKETS PREVIO REVISIÓN");
  const buckets = await new BucketsApi().getBuckets({}, req.oauth_client, req.oauth_token);
  console.log(buckets.body.items);
  if(opc =="1"){
      const bucket_name = req.query.bucketKey;
       const object_name = req.query.objName;
       
      try {
          // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
          const objects = await new ObjectsApi().deleteObject(bucket_name, object_name, req.oauth_client, req.oauth_token);
          res.json(objects.body.items.map((object) => {
              return {
                  id: Buffer.from(object.objectId).toString('base64'),
                  text: object.objectKey,
                  type: 'object',
                  children: false
              };
          }));
      } catch(err) {
          next(err);
      }
  }else{
    const buckets = await new BucketsApi().getBuckets({}, req.oauth_client, req.oauth_token);
    console.log("BUCKETS PREVIO REVISIÓN");
    console.log(buckets.body.items);
    
    // Función para obtener objetos de un bucket y agregarlos a la lista
    const obtenerObjetos = async (bucketKey, oauth_client, oauth_token, lista) => {
      let nextURL = null;
    
      do {
        const objects = await new ObjectsApi().getObjects(bucketKey, { limit: 100, startAt: nextURL }, oauth_client, oauth_token);
        console.log("OBJETOS DISPONIBLES");
        console.log(objects.body.next);
    
        // Agregar elementos a la lista
        objects.body.items.forEach(item => {
          let _item = {
            urn: Buffer.from(item.objectId).toString('base64'),
            bucketKey: item.bucketKey,
            objectKey: item.objectKey,
            size: item.size
          };
          lista.push(_item);
        });
    
        // Actualizar la URL para la próxima llamada
        nextURL = objects.body.next;
    
      } while (nextURL !== undefined);
    
      return lista;
    };
    
    // Procesar cada bucket
    const resultados = await Promise.all(buckets.body.items.map(async (bucket) => {
      let lista = [];
      await obtenerObjetos(bucket.bucketKey, req.oauth_client, req.oauth_token, lista);
      return lista;
    }));
    
    // Enviar resultados como respuesta JSON
    res.json(resultados.flat());
    
  }
  
});
function generateUniqueKey() {
  return '_'+crypto.randomBytes(4).toString('hex'); // Genera una cadena hexadecimal de 8 caracteres
}
app.post('/api/objects', upload.single('fileToUpload'), async (req, res) => {
  const file = req.file;
  const { originalname, username, bucketKey } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No se ha proporcionado un archivo válido' });
  }

  // Crear un directorio temporal para almacenar el archivo ensamblado
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Añadir el código basado en la fecha y hora al final del nombre del archivo
  const dateCode =generateUniqueKey();
  const tempFileName = originalname.replace(/(\.[\w\d_-]+)$/i, `${dateCode}$1`);
  const tempFilePath = path.join(tempDir, tempFileName);

  // Guardar el archivo temporalmente
  try {
    fs.writeFileSync(tempFilePath, file.buffer);
  } catch (err) {
    console.error('Error al escribir el archivo temporal:', err);
    return res.status(500).json({ error: 'Error al escribir el archivo temporal' });
  }

  const totalChunks = parseInt(req.body.totalChunks); // Total de fragmentos esperados
  const receivedChunkNumber = parseInt(req.body.chunkNumber); // Número del fragmento recibido

  // Verificar si es el último fragmento
  if (receivedChunkNumber === totalChunks) {
    const assembledFilePath = tempFilePath;
    const fileSize = fs.statSync(assembledFilePath).size;
    const buffer = fs.readFileSync(assembledFilePath);

    const chunkSize = 10 * 1024 * 1024; // 10 MB por fragmento
    const nbChunks = Math.ceil(fileSize / chunkSize);
    const sessionId = randomString(12);
    for (let i = 0; i < nbChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunkBuffer = buffer.slice(start, end);

      // Crear un nuevo stream para cada chunk
      const memoryStream = new stream.Readable();
      memoryStream.push(chunkBuffer);
      memoryStream.push(null); // Marcar el final del stream

      const range = `bytes ${start}-${end - 1}/${fileSize}`;
      const length = end - start;

      try {
        const response = await new ObjectsApi().uploadChunk(
          bucketKey, tempFileName,
          length, range, sessionId,
          memoryStream, {}, { autoRefresh: false }, req.oauth_token
        );
        console.log("Chunk enviado " + i);
        if (response.statusCode !== 200 && response.statusCode !== 202) {
          throw new Error(`Error al subir el fragmento: ${response.statusCode}`);
        }
      } catch (error) {
        console.error('Error al subir el fragmento:', error);
        fs.unlinkSync(assembledFilePath); // Eliminar archivo temporal
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
    sendCompletionEmail(username);
    fs.unlinkSync(assembledFilePath); // Eliminar archivo temporal después de subir todos los chunks
    res.status(200).json({ message: 'Archivo completo subido y procesado exitosamente' });
  } else {
    res.status(202).json({ message: `Fragmento ${receivedChunkNumber} de ${totalChunks} recibido` });
  }
});
/*
app.post('/api/objects', upload.single('fileToUpload'), async (req, res) => {
  const file = req.file;
  const { originalname, username, bucketKey } = req.body;

  if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado un archivo válido' });
  }

  // Crear un directorio temporal para almacenar el archivo ensamblado
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
  }

  // Ruta del archivo temporal
  const tempFilePath = path.join(tempDir, originalname);
  fs.appendFileSync(tempFilePath, file.buffer);

  const totalChunks = parseInt(req.body.totalChunks);  // Total de fragmentos esperados
  const receivedChunkNumber = parseInt(req.body.chunkNumber);  // Número del fragmento recibido

  // Verificar si es el último fragmento
  if (receivedChunkNumber === totalChunks) {
      const assembledFilePath = tempFilePath;
      const fileSize = fs.statSync(assembledFilePath).size;
      const buffer = fs.readFileSync(assembledFilePath);

      const chunkSize = 10 * 1024 * 1024; // 500 MB por fragmento
      const nbChunks = Math.ceil(fileSize / chunkSize);
      const sessionId = randomString(12);
      for (let i = 0; i < nbChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, fileSize);
          const chunkBuffer = buffer.slice(start, end);

          // Crear un nuevo stream para cada chunk
          const memoryStream = new stream.Readable();
          memoryStream.push(chunkBuffer);
          memoryStream.push(null); // Marcar el final del stream

          const range = `bytes ${start}-${end - 1}/${fileSize}`;
          
          const length = end - start;

          try {
              const response = await new ObjectsApi().uploadChunk(
                  bucketKey, originalname,
                  length, range, sessionId,
                  memoryStream, {}, { autoRefresh: false }, req.oauth_token
              );
              console.log("Chunk enviado " + i);
              if (response.statusCode !== 200 && response.statusCode !== 202) {
                  throw new Error(`Error al subir el fragmento: ${response.statusCode}`);
              }
          } catch (error) {
              console.error('Error al subir el fragmento:', error);
              fs.unlinkSync(assembledFilePath); // Eliminar archivo temporal
              return res.status(500).json({ error: 'Error interno del servidor' });
          }
      }
      sendCompletionEmail(username);
      fs.unlinkSync(assembledFilePath); // Eliminar archivo temporal después de subir todos los chunks
      res.status(200).json({ message: 'Archivo completo subido y procesado exitosamente' });

  } else {
      res.status(202).json({ message: `Fragmento ${receivedChunkNumber} de ${totalChunks} recibido` });
  }
});
*/

async function sendCompletionEmail(userEmail) {
  const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: userEmail,
      subject: 'Archivo Subido Exitosamente',
      html: `<p>Estimado usuario, tu archivo ha sido subido con éxito a la plataforma. Ahora puedes iniciar el proceso de traducción recuerda que una vez iniciado puede tardar varios minutos</p>`
  };

  try {
      await mailTransport.sendMail(mailOptions);
      console.log('Email de notificación enviado.');
  } catch (error) {
      console.error('Error al enviar el email de notificación', error);
  }
}

async function sendCompletioTranslatenEmail(userEmail) {
  const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: userEmail,
      subject: 'Archivo Traducido Exitosamente',
      html: `<p>Estimado usuario, tu archivo ha sido Traducido con éxito . Ahora puedes está listo para ser utilizado.</p>`
  };

  try {
      await mailTransport.sendMail(mailOptions);
      console.log('Email de notificación enviado.');
  } catch (error) {
      console.error('Error al enviar el email de notificación', error);
  }
}
app.post('/api/jobs', async (req, res, next) => {
  let job = new JobPayload();
  job.input = new JobPayloadInput();
  job.input.urn = req.body.objectName;
  const username = req.body.username
  job.output = new JobPayloadOutput([
    new JobSvfOutputPayload()
  ]);
  job.output.formats[0].type = 'svf';
  job.output.formats[0].views = ['2d', '3d'];
  try {
    console.log("PREVIO JOB");
    console.log(job);
    // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
    await new DerivativesApi().translate(job, {}, req.oauth_client, req.oauth_token);
    sendCompletioTranslatenEmail(username);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});
app.post('/api/deleteObject', async (req, res, next) => {
  console.log("inicio operacion borrado");
  
  let finalRes = null;
  const bucket_name = req.body.bucketKey;
  const object_name = req.body.objectName;
  console.log(bucket_name);
  console.log(object_name);
      try {
          // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
          const objects = await new ObjectsApi().deleteObject(bucket_name, object_name, req.oauth_client, req.oauth_token);
          console.log("Borro llama objs");
          console.log(objects);
          finalRes = objects;
          res.json({ status: "success" })
          res.status(200).json({ok:true});
         
      } catch(err) {
          next(err);
      }
  
});
// Gestión asignaciones usuario a proyecto 
app.post('/api/asignarUsuarioProyecto', crearUsuarioProyectoAsignado);
app.get('/api/usuariosProyectoAsignado/:urn',obtenerUsuariosProyectoAsignadoPorUrn);
app.delete('/api/usuariosProyectoAsignado/:urn/:idUsuario', eliminarUsuarioProyectoAsignado);
/////
app.post('/api/filtrosOpcionesProyecto', crearFiltroOpcionesProyectoSiNoExiste);
app.get('/api/vistasGuardadas', obtenerVistasSave); // Obtener todas las vistas guardadas

app.get('/api/vistasGuardadas/:idVS', obtenerVistaSave); // Obtener una vista guardada por ID
app.post('/api/vistasGuardadas', crearVistaSave); // Crear una nueva vista guardada

app.delete('/api/eliminarPedido', eliminarPedido);

app.delete('/api/vistasGuardadas/:idVS', eliminarVistaSave); // Eliminar una vista guardada por ID
app.post('/api/getUserProyectId',  obtenerUsuarioProyectoAsignadoPorIdUsuario  );
app.post('/api/setproyectoAdmin',  actualizarUsuarioProyectoAsignadoPorIdUsuario );// buscar proyectoasignado, en caso de que no crea una colección y le ingresa la urn

// PEDIDOS
app.post('/api/pedido', crearPedido);
app.post('/api/pedidoCVS', crearArchivoPedido);
app.post('/api/adicionalesPedido', crearAdicionalPedido);
app.get('/api/obtenerAdicionalesPorUrn/:urn',obtenerAdicionalesPorUrn);
app.post('/api/actualizarEstadoPedido', actualizarEstadoPedido); //
app.delete('/api/eliminarPedidoURN/:urn', eliminarPedidosPorUrn);
//


app.get('/api/filtros', obtenerFiltros );
app.post('/api/setFiltros',actualizarFiltro);
app.get('/api/vistasGuardadasPorUrn/:urn', obtenerVistasPorUrn);
app.get('/api/filtrosPorUrn/:urn', obtenerFiltrosOpcionesProyectoPorUrn);
app.get('/api/listPedidos', obtenerPedidos); 
app.delete('/api/filtrosOpcionesProyectoEliminar/:urn', eliminarFiltrosOpcionesProyectoPorUrn);


app.post('/api/configuracionViewer',  manipularConfiguracionViewer); //
app.get('/api/configuracionViewer',  obtenerConfiguracionViewer);
app.delete('/api/configuracionViewerEliminar/:urn', eliminarConfiguracionViewerPorUrn);
app.get('/api/getadicionalesPedido/:pedidoId', obtenerAdicionalesPorPedidoId);

app.delete('/api/adicionalesPedido/eliminar/:id', eliminarAdicionalPedido);

app.post('/api/objetoProyectoPlan', buscarCrearActualizarObjetoProyectoPlan);
app.post('/api/objetoProyectoPlanMasivo', procesarObjetosProyectoPlanMasivamente);
app.post('/api/crearobjetoProyectoPlan', CrearObjetoProyectoPlan);
app.get('/api/objetoProyectoPlan/:urn', obtenerObjetosPorUrn);//
app.get('/api/objetos/:dbId/:urn', obtenerPorDbIdYUrn);
//
// Propiedades Proyecto
app.post('/api/guardarPropiedadesModelo', guardarPropiedadesModelo);
app.get('/api/obtenerPropiedadesModelo', obtenerPropiedadesModelo);
app.delete('/api/eliminarPropiedadesModelo/:urn', eliminarPropiedadesModeloPorUrn);

//
// Insertar barras URN
// 
app.post('/api/barraurn', insertarObjetoConDetalles);

// Ruta para obtener un registro por urn
app.get('/api/barraurn/:urn', obtenerRegistroPorUrnBarras);


// Datos Estadísticas // 
app.post('/api/sumaTotalpiso', guardarSumaPisosGeneral);
app.get('/api/pesosTotales/:urn', obtenerRegistroPorUrn);

  // estadisticas - diametro equivalente
app.post('/api/diametroequivalente', crearActualizarDiametroEquivalente);
app.get('/api/diametroequivalente/:urn', obtenerDiametroPorUrn);
  // indicadores peso Promedio
app.post('/api/pesoPromedioGeneral', crearActualizarPesoPromedioGeneral);
app.get('/api/pesoPromedioGeneral/:urn', obtenerPesoPromedioGeneralPorUrn); 
// Indicador promedio diametro Barras
// Rutas para el manejo del diámetro promedio de barras general
app.post('/api/diametroPromedioGeneral', crearActualizarDiametroPromedioGeneral);
app.get('/api/diametroPromedioGeneral/:urn', obtenerDiametroPromedioGeneralPorUrn);

// Pedidos/barras/maestroFierros

app.post('/api/barrasPorUrneIds/:urn', obtenerBarrasPorUrneIds);


  // estadisticas longitudes promedio      
app.post('/api/crearLongitudPromedio', crearActualizarLongitudPromedio);
app.get('/api/getLongitudPromedio/:urn', obtenerLongitudPromedioPorUrn);
  // estadistica pesos promedio   
app.post('/api/crearPesoPromedio', crearActualizarPesoPromedio);
app.get('/api/getPesoPromedio/:urn',obtenerPesoPromedioPorUrn);

  // estadisticas pesos total vs pedidos , 
  app.post('/api/crearPesovsPedidos', crearActualizarPesosTotalversusPedidos);
  app.get('/api/getPesovsPedidos/:urn',obtenerPesosTotalversusPedidosPorUrn);


// Ruta para guardar o actualizar una respuesta
app.post('/api/respuestasDiametros', guardarActualizarRespuesta);
app.get('/api/respuestasDiametros/:urn', obtenerRespuestaPorUrn);


// Mensajes  
// Endpoint for creating a new conversation
app.post('/api/conversaciones', crearConversacion);

// Endpoint for adding a message to a conversation
app.post('/api/conversaciones/mensajes', agregarMensaje);

// Endpoint for deleting a specific message from a conversation
app.delete('/api/conversaciones/:conversationId/mensajes/:mensajeId', eliminarMensaje);

// Endpoint for deleting an entire conversation
app.delete('/api/conversaciones/:conversationId', eliminarConversacion);

// Endpoint for editing the participants of a conversation
app.put('/api/conversaciones/:conversationId', editarConversacion);

// Endpoint for editing a specific message within a conversation
app.put('/api/conversaciones/:conversationId/mensajes/:mensajeId', editarMensaje);

app.get('/api/conversaciones/participante/:participant', obtenerConversacionesPorParticipante); // Ruta para obtener conversaciones por participante
app.get('/api/conversaciones/:conversationId', obtenerConversacionPorId);

/*******
 * Transferencia de datos
 * 
 */

// transferencia Pedidos: 
app.post('/api/transfierePedido', transfierePedido);

// transfiere Adicionales pedidos
app.post('/api/transfiereAdicionalesPedidos', transfiereAdicionalesPedidos);

// Transfiere Vistas
app.post('/api/transfiereVistas', transfiereVistas);

// transfiere planes de objetos-proyecto
app.post('/api/transfiereObjetoProyectoPlan', transfiereObjetoProyectoPlan);

// transfiere usuarios de un proyecto a otro
app.post('/api/transferirUsuarioProyectoPerfil', transferirUsuarioProyectoPerfil);

// Elimina asignaciones asociadas a una URN  eliminarAsignacionesPorUrn
app.delete('/api/eliminarPorUrn/:urn', eliminarAsignacionesPorUrn);
//  Orden de niveles
// Ruta para crear o actualizar un registro de OrdenNiveles
app.post('/api/ordenNiveles', crearActualizarOrdenNiveles);

app.get('/api/ordenNiveles/:urn', obtenerOrdenNivelesPorUrn);


app.get('/', (req, res) => {
    res.json({ message: 'Estamos trabajando para ti!' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
