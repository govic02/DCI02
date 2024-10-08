import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import API_BASE_URL from '../../config'; 
const ListadoProyectos = ({ onProyectoSeleccionado,onProyectoKeySeleccionado }) => {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tokenVar, setToken] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [bucketKey, setBucketKey] = useState('');
  const [urnSelected, setUrnSelected] = useState(''); 
  const [idUsuarioSelected, setIdUsuarioSelected] = useState(''); 
  const [proyectoKeySelected, setProyectoKeySelected] = useState(''); 
  const userId = localStorage.getItem('userId');
  const cardStyle = {
    marginTop: '25px',
    marginLeft: '20px',
    marginRight: '25px',
    borderRadius: '20px'
  };

  const buttonStyle = {
    backgroundColor: '#DA291C',
    color: '#FFF',
    flex: '1',
    marginRight: '5px',
    borderRadius: '10px'
  };
  
  const fetchFilters = async () => {
    if (tokenVar) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`, {
                headers: {
                    Authorization: `${tokenVar}`
                }
            });
            const data = await response.json();
          //console.log(data);
            if (data.length > 0) {
              var data1 = data.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
              //console.log("Datos ordenados:", data1);
                setBucketKey(data[0]?.bucketKey); // Establece el bucketKey del primer proyecto
                setProyectos( data1);
          }

        //  setProyectos(data); // Establece los proyectos ordenados en el estado
        } catch (error) {
            console.error('Error al buscar los filtros:', error);
        }
    }
};

  useEffect(() => {
    const fetchToken = async () => {
      try {
        
        const response = await fetch(`${API_BASE_URL}/api/gettoken`);
        const data = await response.json();
        setToken(data.token);
      //console.log("Ok token");
      } catch (error) {
        console.error('Error al obtener el token:', error);
      }
    };

    fetchToken();
  }, []);

  const handleListItemClick = async (proyectoKey, urn) => {
    toast.info('Abriendo Proyecto', { toastId: 'abriendoProyecto' });
    setProyectoSeleccionado(proyectoKey);
  //console.log("URN del proyecto:", urn);
  //console.log("Nombre de  proyecto:", proyectoKey);
    setUrnSelected(urn);
    onProyectoSeleccionado(proyectoKey, urn); // Llamar a la función onProyectoSeleccionado

    // Llamar a translateObject para forzar la traducción del archivo

    onProyectoKeySeleccionado(proyectoKey);

    try {
      const response = await fetch(`${API_BASE_URL}/api/setproyectoAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idUsuario: userId, urn, proyectoKey })
        
      });
      const data = await response.json();
    console.log("Resultado usuario proyecto");
    console.log(data);
   console.log( urn);
    
    } catch (error) {
      console.error('Error al actualizar el usuario-proyecto asignado:', error);
      toast.error('Error al abrir el proyecto', { toastId: 'errorAbrirProyecto' });
    }


  };
  
  const handleDeleteButtonClick = () => {
    if (proyectoSeleccionado) {
    //console.log('Proyecto seleccionado:', proyectoSeleccionado);
      
        const objectKey = proyectoSeleccionado;
      //console.log("datos borrado");
      //console.log(bucketKey);
      //console.log(objectKey);
       
          fetch(`${API_BASE_URL}/api/deleteObject`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey })
          })
          .then(response => {
              if (response.ok) {
                  return response.json();
              } else {
                  throw new Error('Error al eliminar el objeto');
              }
          })
          .then(data => {
          //console.log('Éxito en Borrado inicial :', data);
            //  urnSelected
            toast.success(`${objectKey} ha sido borrado exitosamente`, { toastId: 'borradoExitoso' });


            // Si el objeto se eliminó exitosamente, procede a eliminar los pedidos asociados
            return fetch(`${API_BASE_URL}/api/eliminarPedidoURN/${urnSelected}`, {
                method: 'DELETE'
            });
        })
        
        .then(data => {
        //console.log('Pedidos eliminados exitosamente:', data);
        toast.success('Datos asociados eliminados exitosamente', { toastId: 'datosAsociadosEliminados' });
       
        //console.log("eliminacion de filtros asociados a URN");
          // Procede a eliminar los filtros asociados a la URN
          return fetch(`${API_BASE_URL}/api/filtrosOpcionesProyectoEliminar/${urnSelected}`, {
            method: 'DELETE'
          });
        })
        .then(data => {
        //console.log('Filtros eliminados exitosamente:', data);
        toast.success('Pedidos asociados eliminados exitosamente', { toastId: 'pedidosAsociadosEliminados2' });
        //console.log('Inicio borrado configuración');
          // Procede a eliminar la configuración del visor asociada a la URN
          return fetch(`${API_BASE_URL}/api/configuracionViewerEliminar/${urnSelected}`, {
            method: 'DELETE'
          });
        })
        .then(data => {
          //console.log('Pedidos eliminados exitosamente:', data);
          toast.success('Asignaciones de usuarios asociadas eliminadas exitosamente', { toastId: 'asignacionesEliminadas' });
          
            // Actualiza los filtros u otras listas que dependan de estos datos
           /* fetchFilters(() => {
                if (proyectos.length > 0) {
                    setProyectoSeleccionado(proyectos[0].proyectoKey);
                  //console.log("URN del proyecto:", urn);
                  //console.log("Nombre de proyecto:", proyectos[0].proyectoKey);
                    setUrnSelected(urn);
                    onProyectoSeleccionado(proyectos[0].proyectoKey, urn); // Llamar a la función onProyectoSeleccionado
                }
            });*/
          //  handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
            return fetch(`${API_BASE_URL}/api/eliminarPorUrn/${urnSelected}`, {
              method: 'DELETE'
          });
        })
        .then(data => {
        //console.log('Asignaciones de usuarios eliminadas exitosamente:', data);
        toast.success('Asignaciones de usuarios asociadas eliminadas exitosamente', { toastId: 'asignacionesEliminadas' });
            
          // Actualiza los filtros u otras listas que dependan de estos datos
          fetchFilters(() => {
              if (proyectos.length > 0) {
                  setProyectoSeleccionado(proyectos[0].proyectoKey);
                //console.log("URN del proyecto:", urn);
                //console.log("Nombre de proyecto:", proyectos[0].proyectoKey);
                  setUrnSelected(urn);
                  onProyectoSeleccionado(proyectos[0].proyectoKey, urn); // Llamar a la función onProyectoSeleccionado
              }
          });
          handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
      })
          .catch(error => {
              console.error('Error:', error);
              toast.error(`Error al intentar borrar ${objectKey}`, { toastId: 'errorBorrar' });
             
              fetchFilters();
              handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
              // Aquí puedes agregar lógica adicional si es necesario
          });
         
      }
          
      

     else {
      toast.error('Debe seleccionar un proyecto antes de eliminarlo', { toastId: 'debeSeleccionarProyecto' });
   
    }
  };
  const seleccionarProyectoPorNombre = (nombreProyecto) => {
    const proyectoEncontrado = proyectos.find(proyecto => proyecto.objectKey === nombreProyecto);
    if (proyectoEncontrado) {
      setProyectoSeleccionado(proyectoEncontrado.objectKey);
      const listItem = document.getElementById(proyectoEncontrado.objectKey);
      if (listItem) {
        listItem.click();
      }
    }
  };
  

  useEffect(() => {
    const fetchFilters = async () => {
      if (tokenVar) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`, {
            headers: {
              Authorization: `${tokenVar}`
            }
          });
          const data = await response.json();
          console.log("DATOS BUCKET");
          console.log(data);
          if (data.length > 0) {
           var data1 = data.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
              //console.log("Datos ordenados:", data1);
                setBucketKey(data[0]?.bucketKey); // Establece el bucketKey del primer proyecto
                setProyectos( data1);
          }
         
        } catch (error) {
          console.error('Error al buscar los filtros:', error);
          toast.error('Error al obtener el usuario-proyecto asignado', { toastId: 'errorObtenerUsuarioProyecto' });
        }
      }
    };

    fetchFilters();
  }, [tokenVar]);
  useEffect(() => {
    const obtenerUsuarioProyecto = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getUserProyectId`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({ idUsuario: userId }) // Envía el ID del usuario en el cuerpo de la solicitud
        });
        const data = await response.json();

        if (data.length > 0) {  // Asegúrate de que data es un arreglo y tiene al menos un elemento
          setUrnSelected(data[0].urn);
          setIdUsuarioSelected(data[0].idUsuario);
          setProyectoKeySelected(data[0].proyectoKey);
          seleccionarProyectoPorNombre(data[0].proyectoKey); // Toma el proyectoKey del primer proyecto
        //console.log("Urn seleccionada en useEffect:", data[0].urn);
        //console.log("Proyecto Key seleccionado en useEffect:", data[0].proyectoKey);
        } else {
        //console.log("No hay proyectos asignados al usuario");
        }
        
      } catch (error) {
        console.error('Error al obtener el usuario-proyecto asignado:', error);
        toast.error('Error al obtener el usuario-proyecto asignado');
      }
    //console.log("");
  };
  //

    //obtenerUsuarioProyecto();
  }, [proyectos]);
  
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rvt,.ifc';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        toast.error("Seleccione un archivo para subir.", { toastId: 'seleccioneArchivo' });
      
        return;
      }
  
      const fileName = file.name;
      const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
    //console.log("File name:", fileName);
    //console.log("File extension:", fileExtension);
  
      if (!['rvt', 'ifc'].includes(fileExtension.toLowerCase())) {
        toast.error('Solamente puede subir archivos .rvt y .ifc.', { toastId: 'formatoInvalido' });
       
        return;
      }
  
      const isExistingProject = proyectos.some(proyecto => proyecto.objectKey === fileName);
      if (isExistingProject) {
        toast.error(`Ya existe un archivo con el nombre ${fileName} Por favor modifique y vuelva a intentarlo.`, { toastId: 'archivoExistente' });
       
        return;
      }
  
      const chunkSize = 5 * 1024 * 1024; // 5 MB
      const totalChunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let fileId = null;
      const toastId = toast.info(`Iniciando la carga de ${totalChunks} partes.`, { autoClose: false });
      while (currentChunk < totalChunks) {
        const start = currentChunk * chunkSize;
        const end = Math.min((currentChunk + 1) * chunkSize, file.size);
        const chunk = file.slice(start, end);
  
        const formData = new FormData();
        formData.append('fileToUpload', chunk);
        formData.append('chunkNumber', currentChunk + 1);
        formData.append('totalChunks', totalChunks);
        formData.append('originalname', file.name);
        formData.append('bucketKey', bucketKey);
        formData.append('username', localStorage.getItem('username'));
        if (fileId) {
          formData.append('fileId', fileId);
        }
      //console.log(`Uploading chunk ${currentChunk + 1} of ${totalChunks}`);
        let ck = currentChunk+1
        
        toast.update(toastId, {
          render: `Parte ${currentChunk + 1} de ${totalChunks} subida con éxito.`
        });
        if( ck ==totalChunks){
        //console.log("INICIO PROCESO ");
          toast.info( `El proceso de carga en el repositorio ha iniciado. La operación puede tardar varios segundos..`, { autoClose: false });
        }
        try {
          const response = await fetch(`${API_BASE_URL}/api/objects`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokenVar}`
            },
            body: formData
          });
          if (!response.ok) throw new Error('Failed to upload chunk.');

          const data = await response.json();
  
          if (!fileId && data.fileId) {
            fileId = data.fileId; // Guardar el fileId para las siguientes solicitudes
          }
  
         
          toast.update(toastId, {
            render: `Parte ${currentChunk + 1} de ${totalChunks} subida con éxito.`
          })
          
        //console.log(`Chunk ${currentChunk + 1} uploaded successfully.`);
          
          currentChunk++;
        } catch (error) {
          console.error('Error uploading chunk:', error);
          toast.success('Archivo subido completamente.', { toastId: 'archivoSubido' });
          return;
        }
      }
  
    //console.log('proceso terminado de subida.');
    toast.success('Archivo subido completamente.', { toastId: 'archivoSubido' });

      fetchFilters(); 
    };
  
    input.click();
    toast.success('Carga en proceso, puede demorar algunos minutos', { toastId: 'cargaEnProceso' });
  };
  
  
  const handleFileTranslate = async ()=>{
  //console.log("busco traducir"+bucketKey ,urnSelected);
    translateObject({ id: urnSelected, parents: [bucketKey] });
  }
  const translateObject = async (node) => {

   
    var bucketKey = node.parents[0];
    console.log("BUCKET KEY EXTRAIDO");
    var objectKey = node.id;
  console.log(bucketKey);
  console.log(objectKey);
    const username = localStorage.getItem('username');
    try {
      toast.success('Proceso de traducción iniciado, el proceso tomará algunos minutos, recibirá un correo electrónico que notificará cuando esté disponible', { toastId: 'traduccionIniciada' });
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey ,'username':username})
      });
    //console.log(response);
      if (response.ok) {
      
     //console.log('Traducción Iniciada, espere unos instantes..');
      } else {
        console.log("respuesta al traducir");
        console.log(response);
        toast.success('Error al intentar traducir, intente nuevamente', { toastId: 'errorTraduccion' });
      
        console.error('Error al intentar traducir:', response.statusText);
      }
    } catch (error) {
      toast.success('Error al intentar traducir, intente nuevamente', { toastId: 'errorTraduccion' });
     
      console.error('Error al intentar traducir:', error);
    }
  };

  return (
    <Card style={cardStyle}>
       <ToastContainer />
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="images/proyectosListadoIcn.svg" alt="Icono" style={{ marginRight: '10px' }} />
          <Typography variant="h6" style={{ fontSize: 14, fontWeight: 'bold' }}>
            Proyectos
          </Typography>
        </div>
        <Typography variant="body2" style={{ marginTop: '10px', marginBottom: '35px' }}>
          Directorio de Proyectos Disponibles
        </Typography>
        <div style={{ marginTop: '10px' }}>
          <Button variant="contained" style={buttonStyle} onClick={handleFileUpload}>
            <img src="images/uploadIcn.svg" alt="Upload" style={{ marginRight: '5px' }} />
            Upload
          </Button>
          <Button variant="contained" style={buttonStyle}  onClick={handleFileTranslate}>
            <img src="images/uploadIcn.svg" alt="Traducir"  style={{ marginRight: '5px' }} />
            Traducir
          </Button>
          <Button variant="contained" style={buttonStyle} onClick={handleDeleteButtonClick}>
            <img src="images/uploadIcn.svg" alt="Eliminar" style={{ marginRight: '5px' }} />
            Eliminar
          </Button>
        </div>
        <List style={{ height: '300px', overflowY: 'auto' }}>
          {proyectos.map((proyecto, index) => (
            <ListItem
              key={index}
              button
              selected={proyectoSeleccionado === proyecto.objectKey}
              onClick={() => handleListItemClick(proyecto.objectKey, proyecto.urn)}
              style={{
                backgroundColor: proyectoSeleccionado === proyecto.objectKey ? '#DA291C' : 'transparent',
                color: proyectoSeleccionado === proyecto.objectKey ? '#FFF' : 'inherit'
              }}
            >
              <ListItemText primary={proyecto.objectKey} style={{ fontSize: '12px !important' }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ListadoProyectos;
