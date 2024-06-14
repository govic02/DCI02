import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const ListadoProyectosAdministrador = ({ onProyectoSeleccionado,onProyectoKeySeleccionado }) => {
  const [proyectos, setProyectos] = useState([]);
  const [tokenVar, setToken] = useState(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('');
  const tipo = localStorage.getItem('tipo'); // Tipo de usuario
  const userId = localStorage.getItem('userId'); // ID del usuario
  const cardStyle = {
    marginTop: '25px',
    marginLeft: '20px',
    marginRight: '25px',
    borderRadius: '20px',
  };
  const listStyle2 = {
    maxHeight: '500px',  // Ajusta este valor según las necesidades de tu diseño
    overflowY: 'auto',   // Habilita el desplazamiento vertical
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

  useEffect(() => {
    const fetchProjects = async () => {
      if (!tokenVar) return;
  
      let url = 'http://localhost:3001/api/bucketsProyectos';
      let options = {
        headers: {
          Authorization: `Bearer ${tokenVar}`
        }
      };
  
      if (tipo !== 'administrador' && tipo !== 'Administrador' ) {
        url = 'http://localhost:3001/api/getUserProyectId';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenVar}`
          },
          body: JSON.stringify({ idUsuario: userId })
        };
      }
  
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.ok) {
          // Verifica si la respuesta es un objeto y conviértela en un arreglo si es necesario
          if (!Array.isArray(data)) {
            setProyectos([data]); // Convierte el objeto en un arreglo con un solo elemento
          } else {
            setProyectos(data);
          }
        } else {
          throw new Error(data.mensaje);
        }
      } catch (error) {
        console.error('Error al buscar los proyectos:', error);
        toast.error('Error al cargar proyectos');
      }
    };
  
    fetchProjects();
  }, [tokenVar, tipo, userId]);
  

  const handleListItemClick = async (proyectoKey, urn) => {
    toast.info('Abriendo Proyecto...'); // Duración en milisegundos
    setProyectoSeleccionado(proyectoKey);
    console.log("URN del proyecto:", urn);
    onProyectoSeleccionado(proyectoKey, urn); // Llamar a la función onProyectoSeleccionado

    // Llamar a translateObject para forzar la traducción del archivo
   
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
  if (!Array.isArray(proyectos)){
     return ("No Hay proyectos Asignados");
  }
  if(tipo !== 'administrador' && tipo !== 'Administrador'){
    console.log("estos son los proyectos", proyectos);
    return (
      <Card style={{ marginTop: '25px', marginLeft: '20px', marginRight: '25px', borderRadius: '20px' }}>
        <ToastContainer />
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="images/proyectosListadoIcn.svg" alt="Icono" style={{ marginRight: '10px' }} />
            <Typography variant="h6" style={{ fontSize: 14, fontWeight: 'bold' }}>
            Directorio de Proyectos Disponibles
            </Typography>
          </div>
          <Typography variant="body2" style={{ marginTop: '10px', marginBottom: '35px' }}>
            
          </Typography>
          <List style={listStyle}>
            {proyectos.map((proyecto, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleListItemClick(proyecto.proyectoKey, proyecto.urn)}
                style={{ backgroundColor: 'transparent', color: 'inherit' }}
              >
                <ListItemText primary={proyecto.proyectoKey} />
              </ListItem>
            ))}
           
          </List>
          <br></br>
        </CardContent>
      </Card>
    );

  }
  return (
    <Card style={{ marginTop: '25px', marginLeft: '20px', marginRight: '25px', borderRadius: '20px' }}>
      <ToastContainer />
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="images/proyectosListadoIcn.svg" alt="Icono" style={{ marginRight: '10px' }} />
          <Typography variant="h6" style={{ fontSize: 14, fontWeight: 'bold' }}>
            Listado de Proyectos Administrador
          </Typography>
        </div>
        <Typography variant="body2" style={{ marginTop: '10px', marginBottom: '35px' }}>
          Directorio de Proyectos Disponibles
        </Typography>
        <List style={listStyle2}>
          {proyectos.map((proyecto, index) => (
            <ListItem
              key={index}
              button
              onClick={() => handleListItemClick(proyecto.objectKey, proyecto.urn)}
              style={{ backgroundColor: 'transparent', color: 'inherit' }}
            >
              <ListItemText primary={proyecto.objectKey} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};


export default ListadoProyectosAdministrador;
