import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import stream from 'stream';

import { getPublicToken,getInternalToken ,getClient} from './oauth.js'; // Ruta corregida
import forgeSDK from 'forge-apis'; // Importa todo el paquete forge-apis
const { DerivativesApi, JobPayload, JobPayloadInput, JobPayloadOutput, JobSvfOutputPayload } = forgeSDK; // Extrae los objetos que necesitas

const { BucketsApi, ObjectsApi, PostBucketsPayload } = forgeSDK;
import { obtenerFiltros } from '../controllers/filtrosController.js';
import {crearPedido,eliminarPedido,obtenerPedidos } from '../controllers/pedidoController.js';
import  {actualizarUsuarioProyectoAsignadoPorIdUsuario,obtenerUsuarioProyectoAsignadoPorIdUsuario } from '../controllers/usuarioProyectoAsignadoController.js'; 
import { manipularConfiguracionViewer,obtenerConfiguracionViewer} from '../controllers/ConfiguracionViewerController.js'; // Asegúrate de que la ruta sea correcta
import { buscarCrearActualizarObjetoProyectoPlan, obtenerObjetosPorUrn ,CrearObjetoProyectoPlan,obtenerPorDbIdYUrn,procesarObjetosProyectoPlanMasivamente} from '../controllers/ObjetoProyectoPlanController.js';
import {guardarSumaPisosGeneral,obtenerRegistroPorUrn} from '../controllers/RespuestaSumaPesosController.js';

import {guardarActualizarRespuesta,obtenerRespuestaPorUrn} from '../controllers/SumaPesosPorDiametroController.js';

import {
  crearFiltroOpcionesProyecto,crearFiltroOpcionesProyectoSiNoExiste,
  obtenerFiltrosOpcionesProyecto,
  obtenerFiltroOpcionesProyectoPorId,
  obtenerFiltrosOpcionesProyectoPorUrn,
  actualizarFiltroOpcionesProyecto,
  eliminarFiltroOpcionesProyecto
} from '../controllers/FiltrosOpcionesProyectoController.js'; 
import { crearAdicionalPedido,obtenerAdicionalesPorPedidoId ,eliminarAdicionalPedido} from '../controllers/pedidoController.js';
import { 
  obtenerVistasSave, obtenerVistaSave,obtenerVistasPorUrn,crearVistaSave, eliminarVistaSave} from '../controllers/VistasSaveController.js'; // Importar los controladores de las vistas guardadas

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('No se pudo conectar a MongoDB:', err));

const app = express();
app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
  const token = await getInternalToken();
  req.oauth_token = token;
  req.oauth_client = getClient();
  next();
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

app.post('/api/objects',  multer({ storage: multer.memoryStorage() }).single('fileToUpload'), async (req, res, next) => {
    
  console.log("tamaño archivo");
  console.log(req.file.size);
  const fileSize = req.file.size;
  //const chunkSize = 512 * 1024;
  const chunkSize = 350 * 1024 * 1024; // 200 MB en bytes
  const nbChunks = Math.round(0.5 + fileSize / chunkSize);
  let finalRes = null;
  console.log(req.file);
  if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No se ha proporcionado un archivo válido' });
  }
  const sessionId =  randomString(12);
  
  console.log(sessionId);
  console.log(req.oauth_token);
  for (let i = 0; i < nbChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(fileSize, (i + 1) * chunkSize) - 1;
      const range = `bytes ${start}-${end}/${fileSize}`;
      const length = end - start + 1;
      const memoryStream = new stream.Readable(); 
      const buffer = Buffer.from(req.file.buffer.slice(start, end + 1));
    
      memoryStream.push(buffer);
      memoryStream.push(null); // Marca el final del stream
      const { bucketKey } = req.body;
      const objectKey = req.file.originalname;
     
      try {
          const response = await new ObjectsApi().uploadChunk(
                                        bucketKey, objectKey,
                                        length, range, sessionId,
                                        memoryStream, {}, { autoRefresh: false },  req.oauth_token
                                  );
          finalRes = response;

          if (response.statusCode === 202) {
              console.log('Se ha subido una parte del archivo.');
              continue;
          } else if (response.statusCode === 200) {
              console.log('La última parte se ha subido.');
             res.status(200).json({ok:true});
          } else {
              console.log('Error en la respuesta:', response.data); 
              console.log(response.statusCode);
             
              break;
          }
      } catch (error) {
          console.error('Error al subir el archivo:', error);
          break;
      }}
  

});

app.post('/api/jobs', async (req, res, next) => {
  let job = new JobPayload();
  job.input = new JobPayloadInput();
  job.input.urn = req.body.objectName;
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
    res.status(200).end();
  } catch (err) {
    next(err);
  }
});
app.post('/api/deleteObject', async (req, res, next) => {
  console.log("LLEGA");
  
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


app.post('/api/filtrosOpcionesProyecto', crearFiltroOpcionesProyectoSiNoExiste);
app.get('/api/vistasGuardadas', obtenerVistasSave); // Obtener todas las vistas guardadas

app.get('/api/vistasGuardadas/:idVS', obtenerVistaSave); // Obtener una vista guardada por ID
app.post('/api/vistasGuardadas', crearVistaSave); // Crear una nueva vista guardada

app.delete('/api/eliminarPedido', eliminarPedido);

app.delete('/api/vistasGuardadas/:idVS', eliminarVistaSave); // Eliminar una vista guardada por ID
app.post('/api/getUserProyectId',  obtenerUsuarioProyectoAsignadoPorIdUsuario  );
app.post('/api/setproyectoAdmin',  actualizarUsuarioProyectoAsignadoPorIdUsuario );// buscar proyectoasignado, en caso de que no crea una colección y le ingresa la urn
app.post('/api/pedido', crearPedido);
app.post('/api/adicionalesPedido', crearAdicionalPedido);

app.get('/api/filtros', obtenerFiltros );
app.get('/api/data', (req, res) => {
    res.json({ mensaje: 'Datos de ejemplo' });
});
app.get('/api/vistasGuardadasPorUrn/:urn', obtenerVistasPorUrn);
app.get('/api/filtrosPorUrn/:urn', obtenerFiltrosOpcionesProyectoPorUrn);
app.get('/api/listPedidos', obtenerPedidos); //

app.post('/api/configuracionViewer',  manipularConfiguracionViewer); //
app.get('/api/configuracionViewer',  obtenerConfiguracionViewer);

app.get('/api/getadicionalesPedido/:pedidoId', obtenerAdicionalesPorPedidoId);

app.delete('/api/adicionalesPedido/eliminar/:id', eliminarAdicionalPedido);

app.post('/api/objetoProyectoPlan', buscarCrearActualizarObjetoProyectoPlan);
app.post('/api/objetoProyectoPlanMasivo', procesarObjetosProyectoPlanMasivamente);
app.post('/api/crearobjetoProyectoPlan', CrearObjetoProyectoPlan);
app.get('/api/objetoProyectoPlan/:urn', obtenerObjetosPorUrn);//
app.get('/api/objetos/:dbId/:urn', obtenerPorDbIdYUrn);

// Datos Estadísticas // 
app.post('/api/sumaTotalpiso', guardarSumaPisosGeneral);
app.get('/api/registro/:urn', obtenerRegistroPorUrn);

// Ruta para guardar o actualizar una respuesta
app.post('/api/respuestasDiametros', guardarActualizarRespuesta);
app.get('/api/respuestasDiametros/:urn', obtenerRespuestaPorUrn);

app.get('/', (req, res) => {
    res.json({ message: 'We are working for you!' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
