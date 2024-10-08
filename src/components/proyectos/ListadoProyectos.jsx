import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import API_BASE_URL from '../../config';

const ListadoProyectos = ({ onProyectoSeleccionado, onProyectoKeySeleccionado }) => {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tokenVar, setToken] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [bucketKey, setBucketKey] = useState('');
  const [urnSelected, setUrnSelected] = useState('');
  const [idUsuarioSelected, setIdUsuarioSelected] = useState('');
  const [proyectoKeySelected, setProyectoKeySelected] = useState('');
  const userId = localStorage.getItem('userId');
  const [translationProgress, setTranslationProgress] = useState(null); // Initially null
  const [monitoringUrn, setMonitoringUrn] = useState(null);
  const monitoringIntervalIdRef = useRef(null);
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (monitoringIntervalIdRef.current) {
        clearInterval(monitoringIntervalIdRef.current);
        monitoringIntervalIdRef.current = null;
      }
    };
  }, []);

  const fetchFilters = async () => {
    if (tokenVar) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`, {
          headers: {
            Authorization: `${tokenVar}`
          }
        });
        const data = await response.json();
        if (data.length > 0) {
          var data1 = data.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
          setBucketKey(data[0]?.bucketKey);
          setProyectos(data1);
        }
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
      } catch (error) {
        console.error('Error al obtener el token:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (monitoringUrn) {
      // Iniciar monitoreo
      monitorTranslationProgress(monitoringUrn);
    }

    // Función de limpieza para detener el monitoreo anterior
    return () => {
      if (monitoringIntervalIdRef.current) {
        clearInterval(monitoringIntervalIdRef.current);
        monitoringIntervalIdRef.current = null;
      }
    };
  }, [monitoringUrn]);

  const checkTranslationStatus = async (urn) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manifests/${urn}`);
      if (response.ok) {
        const manifest = await response.json();
        const status = manifest.status.toLowerCase();
        if (status === 'success') {
          return 'complete';
        } else if (status === 'inprogress' || status === 'pending') {
          return 'inprogress';
        } else if (status === 'failed') {
          return 'failed';
        } else {
          return 'unknown';
        }
      } else if (response.status === 404) {
        // Manifiesto no encontrado, traducción no iniciada
        return 'notfound';
      } else {
        console.error('Error al obtener el manifiesto:', response.statusText);
        return 'error';
      }
    } catch (error) {
      console.error('Error al obtener el manifiesto:', error);
      return 'error';
    }
  };

  const handleListItemClick = async (proyectoKey, urn) => {
    setProyectoSeleccionado(proyectoKey);
    setUrnSelected(urn);
    const translationStatus = await checkTranslationStatus(urn);
    if (translationStatus === 'complete') {
      // Proyecto traducido completamente
      setTranslationProgress(null); // No mostrar mensajes de traducción
      onProyectoSeleccionado(proyectoKey, urn);
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
      } catch (error) {
        console.error('Error al actualizar el usuario-proyecto asignado:', error);
        toast.error('Error al abrir el proyecto', { toastId: 'errorAbrirProyecto' });
      }
    } else if (translationStatus === 'inprogress' || translationStatus === 'pending') {
      // Proyecto en proceso de traducción
      setTranslationProgress(0);
      setMonitoringUrn(urn);
      toast.info('La traducción del proyecto está en progreso.', { toastId: 'traduccionEnProgreso' });
    } else if (translationStatus === 'notfound') {
      // Proyecto no traducido
      setTranslationProgress(0);
      const confirmTranslate = window.confirm('El proyecto no está traducido. ¿Desea iniciar la traducción ahora?');
      if (confirmTranslate) {
        translateObject({ id: urn, parents: [bucketKey] });
        setMonitoringUrn(urn);
      }
    } else {
      // Error o estado desconocido
      toast.error('Error al verificar el estado de la traducción.', { toastId: 'errorVerificarTraduccion' });
    }
  };

  const handleDeleteButtonClick = () => {
    if (proyectoSeleccionado) {
      const objectKey = proyectoSeleccionado;

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
          toast.success(`${objectKey} ha sido borrado exitosamente`, { toastId: 'borradoExitoso' });

          // Si el objeto se eliminó exitosamente, procede a eliminar los pedidos asociados
          return fetch(`${API_BASE_URL}/api/eliminarPedidoURN/${urnSelected}`, {
            method: 'DELETE'
          });
        })
        .then(data => {
          toast.success('Datos asociados eliminados exitosamente', { toastId: 'datosAsociadosEliminados' });

          // Procede a eliminar los filtros asociados a la URN
          return fetch(`${API_BASE_URL}/api/filtrosOpcionesProyectoEliminar/${urnSelected}`, {
            method: 'DELETE'
          });
        })
        .then(data => {
          toast.success('Pedidos asociados eliminados exitosamente', { toastId: 'pedidosAsociadosEliminados2' });

          // Procede a eliminar la configuración del visor asociada a la URN
          return fetch(`${API_BASE_URL}/api/configuracionViewerEliminar/${urnSelected}`, {
            method: 'DELETE'
          });
        })
        .then(data => {
          toast.success('Asignaciones de usuarios asociadas eliminadas exitosamente', { toastId: 'asignacionesEliminadas' });

          // Actualiza los filtros u otras listas que dependan de estos datos
          fetchFilters(() => {
            if (proyectos.length > 0) {
              setProyectoSeleccionado(proyectos[0].proyectoKey);
              setUrnSelected(urn);
              onProyectoSeleccionado(proyectos[0].proyectoKey, urn);
            }
          });
          handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
        })
        .catch(error => {
          console.error('Error:', error);
          toast.error(`Error al intentar borrar ${objectKey}`, { toastId: 'errorBorrar' });

          fetchFilters();
          handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
        });
    } else {
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
    return () => {
      if (monitoringIntervalIdRef.current) {
        clearInterval(monitoringIntervalIdRef.current);
        monitoringIntervalIdRef.current = null;
      }
    };
  }, []);

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
          if (data.length > 0) {
            var data1 = data.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
            setBucketKey(data[0]?.bucketKey);
            setProyectos(data1);
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
          body: JSON.stringify({ idUsuario: userId })
        });
        const data = await response.json();

        if (data.length > 0) {
          setUrnSelected(data[0].urn);
          setIdUsuarioSelected(data[0].idUsuario);
          setProyectoKeySelected(data[0].proyectoKey);
          seleccionarProyectoPorNombre(data[0].proyectoKey);
          // Check translation status when application starts
          const initialTranslationStatus = await checkTranslationStatus(data[0].urn);
          if (initialTranslationStatus === 'complete') {
            setTranslationProgress(null);
          } else {
            setTranslationProgress(0);
            setMonitoringUrn(data[0].urn);
          }
        } else {
          console.log("No hay proyectos asignados al usuario");
        }
      } catch (error) {
        console.error('Error al obtener el usuario-proyecto asignado:', error);
        toast.error('Error al obtener el usuario-proyecto asignado');
      }
    };

    obtenerUsuarioProyecto();
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

        let ck = currentChunk + 1;

        toast.update(toastId, {
          render: `Parte ${currentChunk + 1} de ${totalChunks} subida con éxito.`
        });
        if (ck == totalChunks) {
          toast.info(`El proceso de carga en el repositorio ha iniciado. La operación puede tardar varios segundos..`, { autoClose: false });
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
            fileId = data.fileId;
          }

          toast.update(toastId, {
            render: `Parte ${currentChunk + 1} de ${totalChunks} subida con éxito.`
          });

          currentChunk++;
        } catch (error) {
          console.error('Error uploading chunk:', error);
          toast.success('Archivo subido completamente.', { toastId: 'archivoSubido' });
          return;
        }
      }

      toast.success('Archivo subido completamente.', { toastId: 'archivoSubido' });

      fetchFilters();
    };

    input.click();
    toast.success('Carga en proceso, puede demorar algunos minutos', { toastId: 'cargaEnProceso' });
  };

  const handleFileTranslate = async () => {
    translateObject({ id: urnSelected, parents: [bucketKey] });
  };

  const translateObject = async (node) => {
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    const username = localStorage.getItem('username');
    try {
      toast.success('Proceso de traducción iniciado, el proceso tomará algunos minutos, recibirá un correo electrónico que notificará cuando esté disponible', { toastId: 'traduccionIniciada' });
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey, 'username': username })
      });
      setTranslationProgress(0);

      setMonitoringUrn(objectKey);
      if (response.ok) {
        toast.success('Traducción Iniciada, el proyecto estará disponible en los próximos minutos.', { toastId: 'traduccion' });
      } else {
        toast.error('Error al intentar traducir, intente nuevamente', { toastId: 'errorTraduccion' });
        console.error('Error al intentar traducir:', response.statusText);
      }
    } catch (error) {
      toast.error('Error al intentar traducir, intente nuevamente', { toastId: 'errorTraduccion' });
      console.error('Error al intentar traducir:', error);
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (monitoringIntervalIdRef.current) {
        clearInterval(monitoringIntervalIdRef.current);
        monitoringIntervalIdRef.current = null;
      }
    };
  }, []);

  const monitorTranslationProgress = (urn) => {
    const checkInterval = 5000; // Intervalo en milisegundos
    let currentProgress = 0;

    const checkProgress = async () => {
      if (!isMountedRef.current) {
        if (monitoringIntervalIdRef.current) {
          clearInterval(monitoringIntervalIdRef.current);
          monitoringIntervalIdRef.current = null;
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/manifests/${urn}`);

        if (response.ok) {
          const manifest = await response.json();
          const progress = getTranslationProgress(manifest);

          if (progress === 'complete') {
            toast.success('La traducción ha finalizado con éxito.', { toastId: 'traduccionCompleta' });
            if (isMountedRef.current) {
              setTranslationProgress(null); // No mostrar mensajes de traducción
            }

            // Detener el intervalo
            clearInterval(monitoringIntervalIdRef.current);
            monitoringIntervalIdRef.current = null;
          } else if (progress === 'failed') {
            toast.error('La traducción ha fallado.', { toastId: 'traduccionFallida' });
            if (isMountedRef.current) {
              setTranslationProgress(0);
            }

            // Detener el intervalo
            clearInterval(monitoringIntervalIdRef.current);
            monitoringIntervalIdRef.current = null;
          } else if (progress === 'inprogress') {
            // Simular progreso incrementando el porcentaje
            currentProgress += 10;
            if (currentProgress > 90) currentProgress = 90;
            if (isMountedRef.current) {
              setTranslationProgress(currentProgress);
            }
          } else if (progress === 'pending') {
            if (isMountedRef.current) {
              setTranslationProgress(0);
            }
          } else {
            console.error('Estado de traducción desconocido:', progress);
            clearInterval(monitoringIntervalIdRef.current);
            monitoringIntervalIdRef.current = null;
          }
        } else if (response.status === 404) {
          if (isMountedRef.current) {
            setTranslationProgress(0);
          }
        } else {
          console.error('Error al obtener el manifiesto:', response.statusText);
        }
      } catch (error) {
        console.error('Error al obtener el manifiesto:', error);
      }
    };

    // Iniciar el intervalo
    if (monitoringIntervalIdRef.current) {
      clearInterval(monitoringIntervalIdRef.current);
    }
    checkProgress(); // Ejecutar inmediatamente
    monitoringIntervalIdRef.current = setInterval(checkProgress, checkInterval);
  };

  const getTranslationProgress = (manifest) => {
    if (!manifest || !manifest.status) {
      return 'unknown';
    }

    const status = manifest.status.toLowerCase();

    if (status === 'failed') {
      return 'failed';
    }

    if (status === 'success') {
      return 'complete';
    }

    if (status === 'inprogress') {
      return 'inprogress';
    }

    if (status === 'pending') {
      return 'pending';
    }

    return 'unknown';
  };

  return (
    <Card style={cardStyle}>
      <ToastContainer />

      <CardContent>
        {translationProgress !== null && translationProgress !== 100 && (
          <div style={{ marginTop: '10px' }}>
            <Typography variant="body2">
              {translationProgress === 0
                ? 'La traducción está en espera o acaba de iniciarse.'
                : `Progreso de traducción: ${translationProgress}%`}
            </Typography>
            <LinearProgress variant="determinate" value={translationProgress} />
          </div>
        )}
        {translationProgress === 100 && (
          <div style={{ marginTop: '10px' }}>
            <Typography variant="body2">Traducción completada al 100%.</Typography>
            <LinearProgress variant="determinate" value={100} />
          </div>
        )}
        <p></p><br></br>
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
          <Button variant="contained" style={buttonStyle} onClick={handleFileTranslate}>
            <img src="images/uploadIcn.svg" alt="Traducir" style={{ marginRight: '5px' }} />
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
