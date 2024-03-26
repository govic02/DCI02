import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../extensions/FiltrosVisuales.js';  
import '../../extensions/HandleSelectionExtension.js';
import { buscaKeys, transformJsonToArray, printConsola, consulta_filtro2 } from '../../utils/ViewerUtils';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../config';

const { Autodesk } = window;

class ViewerProyectos extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            idsConFecha: [], // Guarda los IDs con fecha
            idsSinFecha: [], // Guarda los IDs sin fecha
            nombreParametroFecha: ''
        },
        this.container = React.createRef();
        this.viewer = null;
        this.runtime = {
            options: null,
            ready: null
        };
    }

    componentDidMount() {
        this.getForgeToken()
            .then(token => {
                return this.initializeViewerRuntime(token);
            })
            .then(() => {
                this.setupViewer();
            })
            .catch(err => console.error(err));
    }

    getForgeToken = () => {
        return fetch('http://localhost:3001/api/gettoken')
            .then(res => res.json())
            .then(data => {
                return data.token;
            });
    }

    initializeViewerRuntime = (token) => {
        
        if (!this.runtime.ready) {
            this.runtime.options = { 
                ...this.props.runtime,
                getAccessToken: (callback) => callback(token, 3600)
            };
            this.runtime.ready = new Promise((resolve) => Autodesk.Viewing.Initializer(this.runtime.options, resolve));
        }
       
        return this.runtime.ready;
    }

    setupViewer = () => {
        this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container.current);
        this.viewer.start();
   
        this.viewer.loadExtension('HandleSelectionExtension');
        this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onModelLoaded);
        this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onViewerCameraChange);
        this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onViewerSelectionChange);
        this.updateViewerState({});
    }

    componentWillUnmount() {
        if (this.viewer) {
            this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onModelLoaded);
            this.viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onViewerCameraChange);
            this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onViewerSelectionChange);
            this.viewer.finish();
            this.viewer = null;
        }
    }
    
    componentDidUpdate(prevProps) {
        console.log("nueva urn a cargar");
        console.log(this.props.urn);
       
        if (this.viewer && (this.props.urn !== prevProps.urn || this.props.idUsuario !== prevProps.idUsuario || this.props.proyectoKey !== prevProps.proyectoKey)) {
            Autodesk.Viewing.Document.load(
                'urn:' + this.props.urn,
                (doc) => this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()),
                (code, message, errors) =>{ 
                    console.log("no se pudo cargar debe traducir");
                    toast.info('No se pudo abrir, proceso de traducción del archivo iniciado'); // Duración en milisegundos
                    console.error(code, message, errors);}
            );
        }
    }

    cargarConfiguracion = async () => {
        const url = `${API_BASE_URL}/api/configuracionViewer`;
        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            if (respuesta.ok) {
                const { configuracion } = resultado;
                // Actualiza el estado con el nombre del parámetro de fecha obtenido
                this.setState({ nombreParametroFecha: configuracion.variableTiempo || '' });
                console.log("parametro fecha buscado");
                console.log(configuracion.variableTiempo);
            } else {
                console.error('Configuración no encontrada:', resultado.mensaje);
            }
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
        }
    };
    obtenerIdsConFecha = async () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                return reject(new Error("El modelo del visualizador no está cargado."));
            } else {
                const { nombreParametroFecha, urn } = this.state;
                console.log("NOMBRE DEL PARAMETRO FECHA");
                console.log(nombreParametroFecha);
                this.viewer.model.getBulkProperties([], { propFilter: [nombreParametroFecha] }, async (result) => {
                    let idsConFechaYValor = result
                        .filter(element => element.properties.some(prop => prop.displayName === nombreParametroFecha))
                        .map(element => {
                            let propiedadFecha = element.properties.find(prop => prop.displayName === nombreParametroFecha);
                            return {
                                id: element.dbId,
                                fecha: propiedadFecha ? propiedadFecha.displayValue : null
                            };
                        });
    
                    // Ahora iteramos sobre cada ID para asegurarnos de que exista un registro para él
                    for (let objeto of idsConFechaYValor) {
                        await axios.post(`${API_BASE_URL}/api/crearObjetoProyectoPlan`, {
                            urn:this.props.urn,
                            IdObjeto: objeto.id,
                            fecha_plan: objeto.fecha,
                            // Los demás campos pueden ir según necesites, o dejarlos como undefined si son opcionales
                        });
                    }
    
                    console.log("IDs con fecha y su valor:", idsConFechaYValor);
                    resolve(idsConFechaYValor);
                }, (error) => {
                    reject(error);
                });
            }
        });
    };
    getIdManageFecha = async () => {
        console.log("Inicio búsqueda de ids fechas");
    
        try {
            const idsConFecha = await this.obtenerIdsConFecha();
            const idsSinFecha = await this.obtenerIdsSinFecha();
            this.setState({ idsConFecha, idsSinFecha });
        } catch (error) {
            console.error("Error al obtener IDs:", error);
            // A pesar del error, el flujo del programa continúa, evitando bloquear la pantalla.
        }
    }
    
    obtenerIdsSinFecha = async () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                return reject(new Error("El modelo del visualizador no está cargado."));
            }
    
            const { nombreParametroFecha, urn } = this.state;
    
            this.viewer.model.getBulkProperties([], { propFilter: [nombreParametroFecha] }, async (result) => {
                let idsSinFecha = result.filter(element => !element.properties.some(prop => prop.displayName === nombreParametroFecha)).map(element => element.dbId);
                
                // Ahora iteramos sobre cada ID sin fecha para asegurarnos de que exista un registro para él
                for (let idSinFecha of idsSinFecha) {
                    await axios.post(`${API_BASE_URL}/api/crearObjetoProyectoPlan`, {
                        urn: this.props.urn,
                        IdObjeto: idSinFecha,
                        fecha_plan: '', // Enviamos un string vacío para fecha_plan
                        // Los demás campos pueden ir según necesites, o dejarlos como undefined si son opcionales
                    });
                }
    
                console.log("IDS SIN FECHA:", idsSinFecha);
                resolve(idsSinFecha);
            }, (error) => {
                reject(error);
            });
        });
    };
    updateViewerState = (prevProps) => {
        if (this.props.urn && this.props.urn !== prevProps.urn) {
            Autodesk.Viewing.Document.load(
                'urn:' + this.props.urn,
                (doc) => this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()),
                (code, message, errors) => console.error(code, message, errors)
            );
        }
    };

    onModelLoaded = async () => {
        try {
            // Espera a que ambas funciones asincrónicas se completen.
            const [idsConFecha, idsSinFecha] = await Promise.all([
                this.obtenerIdsConFecha(),
                this.obtenerIdsSinFecha()
            ]);
    
            // Actualiza el estado con los resultados obtenidos.
            this.setState({ idsConFecha, idsSinFecha });
            this.cargarConfiguracion();
        } catch (error) {
            console.error("Error al obtener IDs:", error);
        }
    };
    
    onViewerCameraChange = (event) => {
        // Manejar el cambio de la cámara del visor aquí si es necesario
    };

    onViewerSelectionChange = (event) => {
        // Manejar el cambio de la selección del visor aquí si es necesario
    };

    render() {
        return <div ref={this.container} style={{ position: 'relative', marginLeft: '5px', marginTop: '27px', width: '100%', height: '380px' }} />;
    }
}

ViewerProyectos.propTypes = {
    urn: PropTypes.string.isRequired,
    idUsuario: PropTypes.string.isRequired, // Nueva prop idUsuario
    proyectoKey: PropTypes.string.isRequired, // Nueva prop proyectoKey
    runtime: PropTypes.object
    
};

export default ViewerProyectos;
