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
const ListadoProyectos = ({ onProyectoSeleccionado,onProyectoKeySeleccionado }) => {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const [tokenVar, setToken] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [bucketKey, setBucketKey] = useState('');
  const [urnSelected, setUrnSelected] = useState(''); // Variable para almacenar la urn
  const [idUsuarioSelected, setIdUsuarioSelected] = useState(''); // Variable para almacenar el id de usuario
  const [proyectoKeySelected, setProyectoKeySelected] = useState(''); // Variable para almacenar el proyectoKey
  const userId = localStorage.getItem('userId'); // ID del usuario
  
  const cardStyle = {
    marginTop: '25px',
    marginLeft: '20px',
    marginRight: '25px',
    borderRadius: '20px',
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
            const response = await fetch('http://localhost:3001/api/bucketsProyectos', {
                headers: {
                    Authorization: `${tokenVar}`
                }
            });
            const data = await response.json();
            console.log(data);
            if (data.length > 0) {
                console.log(data[0]?.bucketKey);
                setBucketKey(data[0]?.bucketKey);
            }
            setProyectos(data);
        } catch (error) {
            console.error('Error al buscar los filtros:', error);
        }
    }
};

  useEffect(() => {
    const fetchToken = async () => {
      try {
        
        const response = await fetch('http://localhost:3001/api/gettoken');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error al obtener el token:', error);
      }
    };

    fetchToken();
  }, []);

  const handleListItemClick = async (proyectoKey, urn) => {
    toast.info('Abriendo Proyecto...'); // Duración en milisegundos
    setProyectoSeleccionado(proyectoKey);
    console.log("URN del proyecto:", urn);
    console.log("Nombre de  proyecto:", proyectoKey);
    setUrnSelected(urn);
    onProyectoSeleccionado(proyectoKey, urn); // Llamar a la función onProyectoSeleccionado

    // Llamar a translateObject para forzar la traducción del archivo
    translateObject({ id: urn, parents: [bucketKey] });
    onProyectoKeySeleccionado(proyectoKey);

    try {
      const response = await fetch('http://localhost:3001/api/setproyectoAdmin', {
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
      // Puedes realizar acciones adicionales según sea necesario con la respuesta del servidor
    } catch (error) {
      console.error('Error al actualizar el usuario-proyecto asignado:', error);
      toast.error('Error al abrir el proyecto');
    }


  };

  const handleDeleteButtonClick = () => {
    if (proyectoSeleccionado) {
      console.log('Proyecto seleccionado:', proyectoSeleccionado);
      
        const objectKey = proyectoSeleccionado;
        console.log("datos borrado");
        console.log(bucketKey);
        console.log(objectKey);
        handleListItemClick(proyectos[0].objectKey, proyectos[0].urn);
          fetch('http://localhost:3001/api/deleteObject', {
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
              console.log('Éxito:', data);
              toast.success(`${objectKey} ha sido borrado exitosamente`);
              fetchFilters(() => {
                if (proyectos.length > 0) {
                  setProyectoSeleccionado(proyectoKey);
                  console.log("URN del proyecto:", urn);
                  console.log("Nombre de  proyecto:", proyectoKey);
                  setUrnSelected(urn);
                  onProyectoSeleccionado(proyectoKey, urn); // Llamar a la función onProyectoSeleccionado
                 
                }
            });
              // Aquí puedes agregar lógica adicional si es necesario
          })
          
          .catch(error => {
              console.error('Error:', error);
              toast.error(`Error al intentar borrar ${objectKey}`);
              fetchFilters();
              // Aquí puedes agregar lógica adicional si es necesario
          });
         
      }
          
      

     else {
      toast.error('Debe seleccionar un proyecto antes de eliminarlo');
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
          const response = await fetch('http://localhost:3001/api/bucketsProyectos', {
            headers: {
              Authorization: `${tokenVar}`
            }
          });
          const data = await response.json();
          console.log(data);
          if (data.length > 0) {
            console.log(data[0]?.bucketKey);
            setBucketKey(data[0]?.bucketKey);
          }
          setProyectos(data);
        } catch (error) {
          console.error('Error al buscar los filtros:', error);
        }
      }
    };

    fetchFilters();
  }, [tokenVar]);
  useEffect(() => {
    const obtenerUsuarioProyecto = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/getUserProyectId', {
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
          console.log("Urn seleccionada en useEffect:", data[0].urn);
          console.log("Proyecto Key seleccionado en useEffect:", data[0].proyectoKey);
        } else {
          console.log("No hay proyectos asignados al usuario");
        }
        
      } catch (error) {
        console.error('Error al obtener el usuario-proyecto asignado:', error);
        toast.error('Error al obtener el usuario-proyecto asignado');
      }
      console.log("");
  };
  //

    obtenerUsuarioProyecto();
  }, [proyectos]);
  
  const handleFileUpload = () => {
    
    console.log(bucketKey);
    console.log("entro");
  
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.dwg'; 
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const fileName = file.name; // Obtiene el nombre del archivo sin la extensión
      console.log("nombre archivo",fileName);
      const proyectoExistente = proyectos.some(proyecto => proyecto.objectKey === fileName);

      if (proyectoExistente) {
            toast.error(`Ya existe un archivo con el nombre ${fileName}. Por favor, elige otro archivo.`);
            return;
      }
      const formData = new FormData();
      formData.append('fileToUpload', file);
      formData.append('bucketKey', bucketKey); // Ajusta esto según tu lógica de obtención de la clave del bucket

      try {
        toast.success(` Inicio de proceso de carga, el proceso puede tardar algunos minutos. Te notificaremos una vez esté listo`);
        const response = await fetch('http://localhost:3001/api/objects', {
          method: 'POST',
          body: formData,
          processData: false,
          contentType: false
        });
        console.log("respuesta");
        console.log(response);
        if (response.ok) {
          // Aquí puedes actualizar la interfaz o mostrar un mensaje de éxito
          console.log('Archivo subido exitosamente');
          toast.success(`Se ha guardado y cargado exitosamente el nuevo proyecto`);
          fetchFilters();
        } else {
          // Aquí puedes manejar el caso de error
          console.error('Error al subir el archivo:', response.statusText);
          toast.error(` Error en el proceso de carga, vuelva a intentarlo`);
        }
      } catch (error) {
        console.error('Error al subir el archivo:', error);
        toast.error(` Error en el proceso de carga , vuelva a intentarlo`);
      }
    };
    input.click();
    toast.success(` Carga en proceso , puede demorar algunos minutos`);
  };

  const translateObject = async (node) => {

   
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    console.log(bucketKey);
    console.log(objectKey);
    try {
      toast.success(` Proceso de traducción  iniciado , el proceso tomará algunos minutos`);
      const response = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey })
      });
      console.log(response);
      if (response.ok) {
      
       console.log('Traducción Iniciada, espere unos instantes..');
      } else {
        toast.success(` Error al intentar traducir , intente nuevamente`);
        console.error('Error al intentar traducir:', response.statusText);
      }
    } catch (error) {
      toast.success(` Error al intentar traducir , intente nuevamente`);
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
          <Button variant="contained" style={buttonStyle}>
            <img src="images/uploadIcn.svg" alt="Traducir" style={{ marginRight: '5px' }} />
            Traducir
          </Button>
          <Button variant="contained" style={buttonStyle} onClick={handleDeleteButtonClick}>
            <img src="images/uploadIcn.svg" alt="Eliminar" style={{ marginRight: '5px' }} />
            Eliminar
          </Button>
        </div>
        <List>
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
