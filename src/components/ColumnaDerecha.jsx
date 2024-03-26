import React, { useRef ,useState,useEffect} from 'react';
import Viewer from './Viewer';
import VisualizadorDev from './VisualizadorDev';
import TabsComponent from './TabsComponent';
import AdministradorDeVistas from './visualizador/AdministradorDeVistas';
import Paleta from './visualizador/Paleta';
import HeaderApp from './HeaderApp';
import { ActionsProvider } from '../context/ActionContext';
import API_BASE_URL from '../config';
const ColumnaDerecha = ({ isCollapsed, token, urn, selectedIds, onCameraChange, onSelectionChange, refViewer }) => {
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
        try {
          const response = await fetch(API_BASE_URL+'/api/getUserProyectId', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
  
            body: JSON.stringify({ idUsuario: '10' }) // Envía el ID del usuario en el cuerpo de la solicitud
          });
          const data = await response.json();
          setUrnSelected(data.urn); 
          setProyectoKeySeleccionado(data.proyectoKey);
          console.log("Urn seleccionada en useEffect:", urnSelected);
          console.log("Urn recibida en la respuesta:", data.urn);
          console.log("Urn recibida en la respuesta:", urnSelected);
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
