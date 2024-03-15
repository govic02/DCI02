import React from 'react';
import PropTypes from 'prop-types';
import { ActionsContext } from '../context/ActionContext';
import { buscaKeys, transformJsonToArray, consulta_filtro,consulta_filtro2 } from '../utils/ViewerUtils';
import axios from 'axios';
import API_BASE_URL from '../config';
const { Autodesk } = window;
var { filtroPiso } ="";
var { filtroHa } ="";

class Viewer extends React.Component {
    static contextType = ActionsContext;
    constructor(props) {
        super(props);
        this.state = {
            token: this.props.token,
            identificadoresActual: [],
            fierros: null,
            runtime: {
                options: null,
                ready: null
            }
        };
        this.container = React.createRef();
        this.viewer = null;
       
    }
    
    obtenerFiltros = async (urnBuscada) => {
        try {
            console.log("URN ANTES DE AXIOS");
            console.log(this.props);

            const response1 = await axios.get(API_BASE_URL+`/api/filtros`);
            console.log("Respuesta Filtros88");
          // const response = await axios.get(`http://localhost:3001/api/filtrosPorUrn/${this.props.urn}`);
            
            console.log(response1.data);

            let filtrado1 = response1.data[0].filtro_1;
            let filtrado2 = response1.data[0].filtro_2;
            this.setState({ fierros: response1.data[0].fierro });
            let filtros1 = [filtrado1];
            let filtros2 = [filtrado2];
            console.log("nombre de filtro 22");
            console.log(response1.data[0]);
            console.log(filtros1);
            console.log(filtros2);
            this.consultaFiltro(filtros1).then(data => {
                this.context.updateDatosFiltro1(data); // Actualiza el contexto con los nuevos datos
            });

            this.consultaFiltro(filtros2).then(data => {
                this.context.updateDatosFiltro2(data); // Actualiza el contexto con los nuevos datos
            });
        
        } catch (error) {
            console.error("Error al obtener los filtros:", error);
        }
    };
    initializeViewerRuntime = (options, token) => {
        const { runtime } = this.state;
        if (!runtime.ready) {
            runtime.options = { 
                ...options,
                token: this.props.token
            };
            runtime.ready = new Promise((resolve) => Autodesk.Viewing.Initializer(runtime.options, resolve));
            this.setState({ runtime });
        } else {
            if (['accessToken', 'getAccessToken', 'env', 'api', 'language'].some(prop => options[prop] !== runtime.options[prop])) {
                return Promise.reject('Cannot initialize another viewer runtime with different settings.');
            }
        }
        return runtime.ready;
    };

    componentDidMount() {
        this.initializeViewerRuntime(this.props.runtime || {}, this.props.token)
            .then(() => {
                this.setupViewer();
                this.context.registerAction('filtrar', this.filtrar);
                this.context.registerAction('cleanModel', this.cleanModel);
                this.context.registerAction('despliegaSavedVista', this.despliegaSavedVista);
                
            })
            .catch(err => console.error(err));
    }
    
    setupViewer = () => {
        this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container.current);
        this.viewer.start();
        this.viewer.loadExtension('FiltrosVisuales');
        this.viewer.loadExtension('HandleSelectionExtension');
        this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onModelLoaded);
        this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onViewerCameraChange);
        this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onViewerSelectionChange);
        this.updateViewerState({});
        
    }

    onModelLoaded = () => {
        this.fetchAndProcessFiltros();
        this.obtenerFiltros(this.props.urn);
    };

    despliegaSavedVista = (identificadores) => {
        if (this.viewer) {
            this.viewer.isolate(identificadores);
            this.viewer.fitToView(identificadores, this.viewer.model);
        } else {
            console.error("El visor no está inicializado.");
        }
    };

    cleanModel =() =>{
        this.viewer.isolate();
        this.props.guardarIdentificadores([]);
        this.viewer.fitToView(this.viewer.model);
    }

    filtrar =  async (identificadores) => {
       this.viewer.isolate(identificadores);
      
       console.log("Muestro ids filtrar",identificadores);
       const { fierros } = this.state;

       console.log("Valor de fierros:", fierros);

       let pesoTotal = 0;
       let largoTotal = 0;
       let totalBarras = 0; // Inicia totalBarras en 0 y lo incrementaremos solo si el identificador es una barra válida
   
       const obtenerPropiedades = (id) => new Promise(resolve => this.viewer.getProperties(id, resolve));
   
       const promesasPropiedades = identificadores.map(id => obtenerPropiedades(id));
   
       const todasPropiedades = await Promise.all(promesasPropiedades);
   
       todasPropiedades.forEach(result => {
           let pesoActual = 0;
           let largoActual = 0;
           let esBarraValida = false; // Asumimos que no es válida hasta encontrar las propiedades necesarias
   
           result.properties.forEach(prop => {
               if (prop.displayName === "RS Peso Lineal (kg/m)" && parseFloat(prop.displayValue) > 0) {
                   pesoActual = parseFloat(prop.displayValue);
                   esBarraValida = true; // Se encontró peso, marcamos como válida
               } else if (prop.displayName === "Total Bar Length" && parseFloat(prop.displayValue) > 0) {
                   largoActual = parseFloat(prop.displayValue) / 100; // Conversión si es necesario
                   esBarraValida = true; // Se encontró largo, marcamos como válida
               }
           });
   
           if (esBarraValida) {
               // Solo acumula y cuenta si es una barra válida
               pesoTotal += pesoActual * largoActual;
               largoTotal += largoActual;
               totalBarras += 1; // Incrementamos el contador de barras válidas
           }
       });
   
        console.log("Peso Total:", pesoTotal.toFixed(1));
        console.log("Largo Total:", largoTotal.toFixed(1));
        console.log("Total Barras:", totalBarras);
        this.context.updatePesoTotal(pesoTotal);
        this.context.updateLargoTotal(largoTotal);
        this.context.updateTotalBarras(totalBarras);
    };
    
    fetchAndProcessFiltros = async () => {
        try {
            // Lógica para obtener y procesar filtros
        } catch (error) {
            console.error('Error al obtener o procesar filtros:', error);
        }
    };

    consultaFiltro = (filtros) => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                reject(new Error("El modelo del visualizador no está cargado."));
                return;
            }
            this.viewer.model.getBulkProperties([], filtros, (result) => {
                let test = result.filter(x => x.properties.length === filtros.length);
                let data = {};
                test.forEach(element => {
                    // Procesamiento de los resultados
                    if (element.properties.length === 1) {
                        let key = element.properties[0].displayValue;
                        if (key in data) {
                            data[key].cantidad++;
                            data[key].dbIds.push(element.dbId);
                        } else {
                            let a = {
                                cantidad: 1,
                                dbIds: [element.dbId]
                            };
                            data[key] = a;
                        }
                    }
                    // Más lógica de procesamiento si es necesario
                });
                console.log("Resultado obtenido:");
                console.log(data); // Muestra el resultado por consola
                resolve(data);
                resolve(data);
            }, (error) => {
                reject(error);
            });
        });
    };

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
        if (this.viewer && this.props.urn !== prevProps.urn) {
            Autodesk.Viewing.Document.load(
                'urn:' + this.props.urn,
                (doc) => this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()),
                (code, message, errors) => console.error(code, message, errors)
            );
        }
    }

    updateViewerState = (prevProps) => {
        // Actualización del estado del visor
    };

    onViewerCameraChange = (event) => {
        // Manejar el cambio de la cámara del visor aquí si es necesario
    };

    onViewerSelectionChange = (event) => {
        // Manejar el cambio de la selección del visor aquí si es necesario
    };

    render() {
        return <div ref={this.container} style={{ width: '100%', height: '100%' }} />;
    }
}

Viewer.propTypes = {
    urn: PropTypes.string.isRequired,
    runtime: PropTypes.object,
    guardarIdentificadores: PropTypes.func
};

export default Viewer;
