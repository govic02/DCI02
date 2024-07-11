import React, { useRef ,useState,useEffect} from 'react';
import Viewer from './Viewer';

import TabsComponent from './TabsComponent';
import TabsComponentMobile from './TabsComponentMobile';
import AdministradorDeVistas from './visualizador/AdministradorDeVistas';
import AdministradorDeVistasMobile from './visualizador/AdministradorDeVistasMobile';
import Paleta from './visualizador/Paleta';
import HeaderApp from './HeaderApp';
import { ActionsProvider } from '../context/ActionContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { useMediaQuery } from 'react-responsive';
import './styles/columna.css'; // Ajusta la ruta según dónde se encuentre el archivo CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // 
import ViewerMobile from './ViewerMobile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from '../ErrorBoundary';
const ColumnaDerecha = ({ isCollapsed, token, urn, selectedIds, onCameraChange, onSelectionChange, refViewer }) => {
  const { token: tokenContexto } = useAuth();
    const [urnSelected, setUrnSelected] = useState('');
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const [showTabsComponentMobile, setShowTabsComponentMobile] = useState(false); 
    const [showAdministradorVistasMobile, setShowAdministradorVistasMobile] = useState(false); 
    const { logout } = useAuth();
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState(null);
    const isDesktopOrLaptop = useMediaQuery({
      query: '(min-width: 580px) and (min-height: 580px)'
    });
    const isTabletOrMobile = useMediaQuery({
      query: '(max-width: 579px) or (max-height: 579px)'
    });
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
    const isPortraitAndWidthMoreThan400 = useMediaQuery({
      query: '(orientation: portrait) and (min-width: 400px)'
    });
  
    const estiloColapsado = {
        width: '100%',
    };

    const estiloExpandido = {
        width: '100%',
    };
   
    const estiloActual = isCollapsed ? estiloColapsado : estiloExpandido;
    const tabsRef = useRef(null);
    const refViewer2 = useRef({refViewer});
    const [identificadoresActual, setIdentificadoresActual] = useState([]);

    const guardarIdentificadores = (identificadores) => {
        setIdentificadoresActual(identificadores);
    };

    
    window.onunhandledrejection = function (event) {
      console.error("Unhandled rejection (promise):", event.promise, "reason:", event.reason);
      return true; // Previene la propagación y la consola del navegador mostrando el error
    };
    self.onerror = function (event) {
      console.error('Error en el worker:', event.message);
      return true; // Previene el error de ser propagado
  };

  const verificarUsuario = async () => {
      try {
          const userId = localStorage.getItem('userId');
          const response = await axios.get(`${API_BASE_URL}/api/usuarios/${userId}`);
        //console.log("Usuario verificado:", response.data);
      } catch (error) {
          logout();
          window.location.reload();
          console.error("Error al verificar el usuario:", error);
      }
  };

  
    useEffect(() => {

      const obtenerUsuarioProyecto = async () => {
      //console.log("token desde jwt",tokenContexto);
        const tipo = localStorage.getItem('tipo');
        
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
      //console.log("token desde jwt",userId);
      //console.log("token desde jwt",username);
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
          //console.log("listado de proyectos asignados al usuario", data);
            
            if (data.length > 0) {  // Asegúrate de que data es un arreglo y tiene al menos un elemento
              setUrnSelected(data[0].urn); // Toma el URN del primer proyecto
              setProyectoKeySeleccionado(data[0].proyectoKey); // Toma el proyectoKey del primer proyecto
            //console.log("Urn seleccionada en useEffect:", data[0].urn);
            //console.log("Proyecto Key seleccionado en useEffect:", data[0].proyectoKey);
            } else {
            //console.log("No hay proyectos asignados al usuario");
            }
          } else {
            const errorData = await response.text(); // O response.json() dependiendo de cómo el servidor envía errores
          //console.log("error carga usuario proyecto");
          }
        } catch (error) {
        //console.log('Error al obtener el usuario-proyecto asignado:', error);
          toast.error('Error al obtener el usuario-proyecto asignado');
        }
    };
    
      obtenerUsuarioProyecto();
    }, );
  
    const handleFilterBarsClick = () => {
      //verificarUsuario();
      if (showAdministradorVistasMobile) {
          setShowAdministradorVistasMobile(false); // Si el Administrador de Vistas está visible, ocultarlo
      }
      setShowTabsComponentMobile(prev => !prev); // Alternar la visibilidad de TabsComponentMobile
  };
    
  const handleViewsClick = () => {
    //verificarUsuario();
    if (showTabsComponentMobile) {
        setShowTabsComponentMobile(false); // Si TabsComponentMobile está visible, ocultarlo
    }
    setShowAdministradorVistasMobile(prev => !prev); // Alternar la visibilidad de AdministradorDeVistasMobile
};
   
    return (
      <div>
        {isDesktopOrLaptop && 
        
        <div>
            <div style={estiloActual}>
            <ErrorBoundary>
              <HeaderApp proyectoKey={proyectoKeySeleccionado}  urn={urnSelected}/> {/* Instancia el componente HeaderApp aquí */}
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
</ErrorBoundary>
            </div>
        </div>}
        {isTabletOrMobile && (
        <div>
          <div className="container-fluid p-0">
            <div className="row no-gutters">
              <div className="col-12">
                <HeaderApp className="header-app" proyectoKey={proyectoKeySeleccionado} urn={urnSelected} />
              </div>
            </div>
          </div>
          {isPortrait ? (
            <div className="text-center mt-5">
              <h2>Por favor, coloca el dispositivo en horizontal</h2>
            </div>
          ) : (
            <div className="container-fluid p-0">
              <div className="row no-gutters">
                <div className="col-12">
                  <ActionsProvider viewerRef={refViewer}>
                    <div className="row">
                      <div className="col-6" style={{ height: '-200px' }}>
                        <ViewerMobile
                          runtime={{ accessToken: token }}
                          urn={urnSelected}
                          selectedIds={selectedIds}
                          onCameraChange={onCameraChange}
                          onSelectionChange={onSelectionChange}
                          ref={refViewer}
                          token={token}
                          guardarIdentificadores={guardarIdentificadores}
                        />
                      </div>
                      <div className="col-12">
                        {showTabsComponentMobile && <TabsComponentMobile urnBuscada={urnSelected} />}
                      </div>
                      <div className="col-12">
                        {showAdministradorVistasMobile && <AdministradorDeVistasMobile identificadoresActual={identificadoresActual} urnBuscada={urnSelected} />}
                      </div>
                      <div className="bottom-buttons">
                        <button className="bottom-button" onClick={handleFilterBarsClick}>Filtro/Barras</button>
                        <button className="bottom-button" onClick={handleViewsClick}>Vistas</button>
                      </div>
                    </div>
                  </ActionsProvider>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ColumnaDerecha;