import React, { useRef ,useState,useEffect} from 'react';
import Viewer from './Viewer';
import VisualizadorDev from './VisualizadorDev';
import TabsComponent from './TabsComponent';
import AdministradorDeVistas from './visualizador/AdministradorDeVistas';
import Paleta from './visualizador/Paleta';
import HeaderApp from './HeaderApp';
import { ActionsProvider } from '../context/ActionContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
const ColumnaDerecha = ({ isCollapsed, token, urn, selectedIds, onCameraChange, onSelectionChange, refViewer }) => {
  const { token: tokenContexto } = useAuth();
    const [urnSelected, setUrnSelected] = useState('');
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const estiloColapsado = {
        width: '100%',
    };

    const estiloExpandido = {
        width: '100%',
    };
    console.log("Recu");
    console.log(urn);
    const estiloActual = isCollapsed ? estiloColapsado : estiloExpandido;
    const tabsRef = useRef(null);
    const refViewer2 = useRef({refViewer});
    const [identificadoresActual, setIdentificadoresActual] = useState([]);

    const guardarIdentificadores = (identificadores) => {
        setIdentificadoresActual(identificadores);
    };

    
    useEffect(() => {
      const obtenerUsuarioProyecto = async () => {
        console.log("token desde jwt",tokenContexto);
        const tipo = localStorage.getItem('tipo');
        
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        console.log("token desde jwt",userId);
        console.log("token desde jwt",username);
        try {
          const response = await fetch(API_BASE_URL+'/api/getUserProyectId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenContexto}`
            },
  
            body: JSON.stringify({ idUsuario: userId }) // Envía el ID del usuario en el cuerpo de la solicitud
          });
          if (response.ok) {
            const data = await response.json();
            console.log("listado de proyectos asignados al usuario", data);
            
            if (data.length > 0) {  // Asegúrate de que data es un arreglo y tiene al menos un elemento
              setUrnSelected(data[0].urn); // Toma el URN del primer proyecto
              setProyectoKeySeleccionado(data[0].proyectoKey); // Toma el proyectoKey del primer proyecto
              console.log("Urn seleccionada en useEffect:", data[0].urn);
              console.log("Proyecto Key seleccionado en useEffect:", data[0].proyectoKey);
            } else {
              console.log("No hay proyectos asignados al usuario");
            }
          } else {
            const errorData = await response.text(); // O response.json() dependiendo de cómo el servidor envía errores
            throw new Error(errorData || 'Error al obtener los proyectos');
          }
        } catch (error) {
          console.error('Error al obtener el usuario-proyecto asignado:', error);
          toast.error('Error al obtener el usuario-proyecto asignado');
        }
    };
    
      obtenerUsuarioProyecto();
    }, );
  
    return (
        <div style={estiloActual}>
        
            <HeaderApp proyectoKey={proyectoKeySeleccionado} /> {/* Instancia el componente HeaderApp aquí */}
            <ActionsProvider  viewerRef={refViewer}>
                    <div style={{ position: 'fixed', top: '64px', width: '100%', height: '88%', marginBottom: '30px' }}>
                        <Viewer                            runtime={{ accessToken: token }}
                            urn={urnSelected}
                            selectedIds={selectedIds}
                            onCameraChange={onCameraChange}
                            onSelectionChange={onSelectionChange}
                            ref={refViewer}
                            token = {token}
                            guardarIdentificadores={guardarIdentificadores} // Pasar la función para guardar identificadores
                        />
                        <div ref={tabsRef}>
                            <TabsComponent  urnBuscada={urnSelected} /> {/* Instanciar TabsComponent */}
                        </div>
                        <AdministradorDeVistas   identificadoresActual={identificadoresActual} urnBuscada={urnSelected} /> {/* Pasar la ref a AdministradorDeVistas */}
                        <Paleta  urnBuscada={urnSelected} /> {/* Instanciar Paleta aquí */}
                    </div>

            </ActionsProvider>
          
        </div>
    );
};

export default ColumnaDerecha;
