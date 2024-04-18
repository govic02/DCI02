import React, { useEffect, useState } from 'react';
import ViewerProyectos from './proyectos/ViewerProyectos';
import HeaderApp from './HeaderApp';
import ListadoProyectos from './proyectos/ListadoProyectos';
import AdministracionProyectos from './proyectos/AdministracionProyecto';
import API_BASE_URL from '../config';
import { ProyectoProvider } from '../context/ProyectoContext'; // Asegúrate de que la ruta es correcta

const Proyectos = ({ token, selectedIds, onCameraChange, onSelectionChange, refViewer }) => {
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState(null);
    const [urnSelected, setUrnSelected] = useState('');
    const [idUsuarioSelected, setIdUsuarioSelected] = useState('');
    const [proyectoKeySelected, setProyectoKeySelected] = useState('');
    const[esAdministrador,setAdministrador] = useState('');
    const userId = localStorage.getItem('userId'); // ID del usuario
    const estiloProyectos = {
        backgroundColor: '#D8D8D8',
        padding: '10px',
        height: 'calc(100vh - 64px)',
        overflowY: 'scroll',
    };

    const estiloViewerContainer = {
        maxWidth: '400px', // Ancho máximo del contenedor
        height: '90%' // Altura máxima del contenedor
       
    };

    const estiloAdministracionProyecto = {
       
     
        marginTop: '5px',
        
    };
    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo'); 
        const esAdministrador = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador';
        setAdministrador(esAdministrador);
        console.log("tipo usuario",tipoUsuario);
    }, []);
    
    useEffect(() => {
 
        const obtenerUsuarioProyecto = async () => {
          try {
            const response = await fetch(API_BASE_URL+'/api/getUserProyectId', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
    
              body: JSON.stringify({ idUsuario: userId }) // Envía el ID del usuario en el cuerpo de la solicitud
            });
            const data = await response.json();
            console.log("DATOS ASOCIADOS A USUARIO",data);
            console.log(data[0]);
            setUrnSelected(data[0].urn); // Establecer el estado de urnSelected con la urn obtenida
            setProyectoKeySeleccionado(data[0].proyectoKey);
          } catch (error) {
            console.error('Error al obtener el usuario-proyecto asignado:', error);
            toast.error('Error al obtener el usuario-proyecto asignado');
          }
          console.log("");
      };
      //
    
        obtenerUsuarioProyecto();
      }, );
    console.log(proyectoKeySelected);
    const handleProyectoSeleccionado = (proyectoKey, urn) => {
        setProyectoSeleccionado({ proyectoKey, urn });
        setUrnSelected( urn);
        setProyectoKeySeleccionado(proyectoKey);
    };
   
 
    useEffect(() => {
        const actualizarEstiloViewer = () => {
            const viewerElement = document.querySelector('.adsk-viewing-viewer');
            if (viewerElement) {
                viewerElement.style.height = '400px'; // Ajusta la altura
                viewerElement.style.width = '100%'; // Ajusta el ancho al 100% del contenedor
                viewerElement.style.overflow = 'hidden';
                viewerElement.style.marginTop = '25px';
            }
        };

        actualizarEstiloViewer(); // Aplicar estilo al montar el componente

        window.addEventListener('resize', actualizarEstiloViewer); // Aplicar estilo en cambios de tamaño de ventana

        return () => {
            window.removeEventListener('resize', actualizarEstiloViewer); // Limpiar event listener al desmontar el componente
        };
    }, []);
    if (!esAdministrador) {
        return (
            <div>
                <HeaderApp />
                <p>Ud no tiene los permisos necesarios para ver esta sección</p>
            </div>
        );
    }
    return (
      <div>
      <HeaderApp proyectoKey={proyectoKeySeleccionado} />
      <ProyectoProvider>
        <div style={estiloProyectos}>
    
            <div className='row'>

                <div className='col-4'>
                    <ListadoProyectos onProyectoSeleccionado={handleProyectoSeleccionado}
                        onProyectoKeySeleccionado={setProyectoKeySeleccionado}
                    />
                </div>
                <div className='col-8'>
                    <div className='row'>
                        <div className='col-6' style={estiloViewerContainer}>
                            <div >
                                <ViewerProyectos
                                    className="custom-viewer"
                                    runtime={{ accessToken: token }}
                                    urn={urnSelected}
                                    selectedIds={selectedIds}
                                    onCameraChange={onCameraChange}
                                    onSelectionChange={onSelectionChange}
                                    ref={refViewer}
                                    

                                />
                            </div>
                        </div>
                        <div className='col-6' style={estiloAdministracionProyecto}>
                            <AdministracionProyectos proyectoKey={proyectoKeySeleccionado}  urn={urnSelected} />
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
      </ProyectoProvider>
  </div>
    );
};

export default Proyectos;