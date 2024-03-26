import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { ActionsContext } from '../context/ActionContext';
import { buscaKeys, transformJsonToArray, consulta_filtro,consulta_filtro2 } from '../utils/ViewerUtils';
import axios from 'axios';
import API_BASE_URL from '../config';
import moment from 'moment'; 
import { toast } from 'react-toastify';
const { Autodesk } = window;
var { filtroPiso } ="";
var { filtroHa } ="";

class Viewer extends React.Component {
    static contextType = ActionsContext;
    
    constructor(props) {
        super(props);
        this.state = {
            matrizHormigonado: [],
            procesoCalculo: 0,
            token: this.props.token,
            identificadoresActual: [],
            idsConFecha: [], // Guarda los IDs con fecha
            idsSinFecha: [], // Guarda los IDs sin fecha
            idsBarras: [],
            seleccionActual:[],
            procesandoSeleccion: false,
            fierros: null,
            filtro1: '',
            filtro2: '',
            nombreParametroFecha: '',
            nombreParametroBarra: '',
            runtime: {
                options: null,
                ready: null
            }
        };
        this.container = React.createRef();
        this.viewer = null;
       
    }
    calculaSeleccionHormigon = (seleccionActual) => {
     
        this.setState({ procesandoSeleccion: true });
        let resultado_fierros = []; // Para almacenar los objetos de las barras que cumplen las condiciones
    
        // Async function para procesar cada seleccion y comparar con todas las barras
        const procesarSeleccion = async () => {
            for (let idSeleccionado of seleccionActual) {
                this.viewer.select([idSeleccionado]); // Selecciona el elemento actual
                const boxSeleccionado = this.viewer.utilities.getBoundingBox(); // Obtiene el bounding box del seleccionado
    
                for (let barra of this.state.idsBarras) {
                    this.viewer.select([barra.id]); // Selecciona la barra actual
                    const boxBarra = this.viewer.utilities.getBoundingBox(); // Obtiene el bounding box de la barra
    
                    if (boxSeleccionado.intersectsBox(boxBarra)) {
                        // Verifica si el objeto barra ya está en resultado_fierros basado en el id
                        if (!resultado_fierros.some((b) => b.id === barra.id)) {
                            resultado_fierros.push(barra); // Añade el objeto completo de la barra
                        }
                    }
                }
    
                // Resetea la selección para limpiar el visor después de cada comparación
                this.viewer.clearSelection();
            }
    
            // Una vez procesadas todas las selecciones, aísla los elementos encontrados o limpia la selección
            if (resultado_fierros.length > 0) {
                toast.success('Proceso completado con barras encontradas.');
                // Aislar solo los IDs de las barras encontradas
                const idsParaIsolar = resultado_fierros.map((barra) => barra.id);
                this.viewer.isolate(idsParaIsolar);
                this.calcularPesoYActualizarContexto(resultado_fierros.map(barra => barra.id));
                this.context.actualizarResultadoFierros(resultado_fierros); // Actualiza con los objetos completos de las barras
                this.context.actualizarSeleccionActual(seleccionActual);
                console.log("Barras que intersectan con la selección:", resultado_fierros);
            } else {
                toast.warn('No se encontraron barras que intersectan con la selección.');
                console.log("No se encontraron barras que intersectan con la selección.");
                this.context.actualizarResultadoFierros([]);
                this.context.actualizarSeleccionActual(seleccionActual);
                this.viewer.isolate([]); // Limpia el aislamiento si no hay coincidencias
            }
    
            this.setState({ procesandoSeleccion: false });
        };
    
        // Ejecuta la función asincrónica
        procesarSeleccion().catch(console.error);
    };
    
    
    calcularPesoYActualizarContexto = async (resultado_fierros) => {
        const identificadores = resultado_fierros; // Asume que resultado_fierros es un array de IDs
    
        let pesoTotal = 0;
        let largoTotal = 0;
        let totalBarras = 0;
    
        const obtenerPropiedades = (id) => new Promise(resolve => this.viewer.getProperties(id, resolve));
        const promesasPropiedades = identificadores.map(id => obtenerPropiedades(id));
    
        const todasPropiedades = await Promise.all(promesasPropiedades);
    
        todasPropiedades.forEach(result => {
            let pesoActual = 0;
            let largoActual = 0;
            let esBarraValida = false;
    
            result.properties.forEach(prop => {
                if (prop.displayName === "RS Peso Lineal (kg/m)" && parseFloat(prop.displayValue) > 0) {
                    pesoActual = parseFloat(prop.displayValue);
                    esBarraValida = true;
                } else if (prop.displayName === "Total Bar Length" && parseFloat(prop.displayValue) > 0) {
                    largoActual = parseFloat(prop.displayValue) / 100; // Asume que el largo viene en cm y lo convierte a metros
                    esBarraValida = true;
                }
            });
    
            if (esBarraValida) {
                pesoTotal += pesoActual * largoActual;
                largoTotal += largoActual;
                totalBarras += 1;
            }
        });
    
        console.log("Peso Total:", pesoTotal.toFixed(1));
        console.log("Largo Total:", largoTotal.toFixed(1));
        console.log("Total Barras:", totalBarras);
    
        // Actualizar el contexto con los nuevos valores
        this.context.updatePesoTotal(pesoTotal);
        this.context.updateLargoTotal(largoTotal);
        this.context.updateTotalBarras(totalBarras);
    };
    
   
 
    cargarConfiguracion = async () => {
        const url = `${API_BASE_URL}/api/configuracionViewer`;
        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            if (respuesta.ok) {
                const { configuracion } = resultado;
                // Actualiza el estado con el nombre del parámetro de fecha obtenido
                this.setState({ nombreParametroFecha: configuracion.variableTiempo || '' });
                this.setState({ nombreParametroBarra: configuracion.variableBarra|| '' });
                console.log("parametro fecha buscado");
                console.log( configuracion.variableBarra);
                console.log(configuracion.variableTiempo);
            } else {
                console.error('Configuración no encontrada:', resultado.mensaje);
            }
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
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
    obtenerIdsBarras = async () => {
        return new Promise(async (resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                return reject(new Error("El modelo del visualizador no está cargado."));
            }
    
            try {
                const { filtro1, filtro2, nombreParametroFecha } = this.state;
    
                // Utilizando BulkProperties para obtener las propiedades de todos los elementos
                this.viewer.model.getBulkProperties([], { propFilter: ['Category', filtro1, filtro2, 'RS Peso Lineal (kg/m)', 'Total Bar Length', 'Bar Diameter', nombreParametroFecha] }, (result) => {
                    let idsBarras = result.filter(element => 
                        element.properties.some(prop => 
                            prop.displayName === 'Category' && prop.displayValue === 'Revit Structural Rebar'
                        )
                    ).map(element => {
                        // Encuentra valores para los filtros, peso lineal, longitud total, diámetro de barra y fecha
                        const propFiltro1 = element.properties.find(prop => prop.displayName === filtro1)?.displayValue || '';
                        const propFiltro2 = element.properties.find(prop => prop.displayName === filtro2)?.displayValue || '';
                        const pesoLineal = element.properties.find(prop => prop.displayName === 'RS Peso Lineal (kg/m)')?.displayValue || '0';
                        const longitudTotal = element.properties.find(prop => prop.displayName === 'Total Bar Length')?.displayValue || '0';
                        const diametroBarra = element.properties.find(prop => prop.displayName === 'Bar Diameter')?.displayValue || '0';
                        const fecha = element.properties.find(prop => prop.displayName === nombreParametroFecha)?.displayValue || '';
    
                        return {
                            id: element.dbId,
                            [filtro1]: propFiltro1,
                            [filtro2]: propFiltro2,
                            pesoLineal: parseFloat(pesoLineal),
                            longitudTotal: parseFloat(longitudTotal),
                            diametroBarra: parseFloat(diametroBarra),
                            fecha
                        };
                    });
    
                    // Guarda los resultados en el estado o maneja como prefieras
                    this.setState({ idsBarras });
    
                    // Resolver la promesa con los IDs de barras encontrados
                    resolve(idsBarras);
                });
            } catch (error) {
                console.error("Error al obtener IDs de barras:", error);
                reject(error);
            }
        });
    };
    
    

    obtenerFiltros = async (urnBuscada) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("URN ANTES DE AXIOS");
                console.log(this.props);
    
                const response = await axios.get(`${API_BASE_URL}/api/filtros`);
                console.log("Respuesta Filtros:", response.data);
    
                let filtrado1 = response.data[0].filtro_1;
                let filtrado2 = response.data[0].filtro_2;
    
                // Actualiza el estado con los nuevos filtros y fierros.
                this.setState({ filtro1: filtrado1, filtro2: filtrado2, fierros: response.data[0].fierro }, async () => {
                    console.log("Filtros actualizados en el estado:", filtrado1, filtrado2);
    
                    // Después de actualizar el estado, procede con la consulta de filtros.
                    try {
                        const datosFiltro1 = await this.consultaFiltro([filtrado1]);
                        this.context.updateDatosFiltro1(datosFiltro1);
                        console.log("filtro datos 1",datosFiltro1);
                        const datosFiltro2 = await this.consultaFiltro([filtrado2]);
                        console.log("filtro datos 2",datosFiltro2);
                        this.context.updateDatosFiltro2(datosFiltro2);
    
                        // Una vez completado todo, resuelve la promesa.
                        resolve();
                    } catch (error) {
                        console.error("Error al consultar los filtros:", error);
                        reject(error);
                    }
                });
            } catch (error) {
                console.error("Error al obtener los filtros:", error);
                reject(error);
            }
        });
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
        this.cargarConfiguracion();
        this.initializeViewerRuntime(this.props.runtime || {}, this.props.token)
            .then(() => {
                this.setupViewer();
                this.context.registerAction('filtrar', this.filtrar);
                this.context.registerAction('cleanModel', this.cleanModel);
                this.context.registerAction('despliegaSavedVista', this.despliegaSavedVista);
                this.context.registerAction('obtenerIdsConFecha', this.obtenerIdsConFecha);
                this.context.registerAction('obtenerIdsSinFecha', this.obtenerIdsSinFecha);
                this.context.registerAction('buscaBarrasHormigon', this.buscaBarrasHormigon);
                this.context.registerAction('gestionarYpintarIds', this.pintarIdFecha);
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

    onModelLoaded = async () => {
        this.fetchAndProcessFiltros();
        this.obtenerIdsConFecha();
        await this.obtenerFiltros(this.props.urn).then(async () => {
            try {
                const idsBarras = await this.obtenerIdsBarras();
                console.log("IDs de barras obtenidos:", idsBarras);
            } catch (error) {
                console.error("Error al obtener IDs de barras:", error);
            }
        });
    };

    getIdManageFecha = () => {
        return new Promise(async (resolve, reject) => {
            
    
            try {
                const idsConFecha = await this.obtenerIdsConFecha();
                const idsSinFecha = await this.obtenerIdsSinFecha();
                this.setState({ idsConFecha, idsSinFecha }, () => {
                    resolve();
                });
            } catch (error) {
                console.error("Error al gestionar IDs con/sin fecha:", error);
                reject(error);
            }
        });
    }

    restaurarColoresOriginales = () => {
        if (this.viewer) {
            // Elimina todos los colores temáticos aplicados en el visor
            this.viewer.clearThemingColors(this.viewer.model);
            console.log("Colores restaurados a su estado original.");
        } else {
            console.error("El visor no está inicializado.");
        }
    };
    pintarIdFecha = async () => {
        await this.obtenerIdsConFecha();
        console.log("previo a pintar", this.state.idsConFecha);
    
        this.state.idsConFecha.forEach(objeto => {
            let color;
            // Inicializa las fechas de planificación e instalación
            const fechaInstalacion = objeto.fecha_instalacion ? moment(objeto.fecha_instalacion) : null;
            const fechaPlan = objeto.fecha_plan ? moment(objeto.fecha_plan) : null;
            const hoy = moment();
    
            // Determina el color basado en la lógica proporcionada
            if (fechaInstalacion) {
                // Si tiene fecha de instalación, pinta de azul
                color = new THREE.Vector4(0, 0, 1, 1);
            } else if (!fechaPlan) {
                // Si no tiene fecha_plan, pinta de gris
                color = new THREE.Vector4(0.3, 0.3, 0.3, 1);
            } else {
                // Si tiene fecha_plan, compara con la fecha actual
                const diferenciaDias = fechaPlan.diff(hoy, 'days');
    
                if (diferenciaDias < 0) {
                    // Si la fecha plan ya pasó, pinta de rojo
                    color = new THREE.Vector4(1, 0, 0, 1);
                } else if (diferenciaDias <= 7) {
                    // Si a la fecha plan le quedan 7 días o menos, pinta de anaranjado
                    color = new THREE.Vector4(1, 0.5, 0, 1);
                } else {
                    // Si a la fecha plan le queda más de una semana, pinta de amarillo
                    color = new THREE.Vector4(1, 1, 0, 1);
                }
            }
    
            // Aplica el color al objeto correspondiente
            this.viewer.setThemingColor(parseInt(objeto.id+'', 10), color, null, true);
        });
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
        this.context.actualizarResultadoFierros([]);
       this.restaurarColoresOriginales();
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

   

    obtenerIdsConFecha = () => {
        return new Promise(async (resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.error("El modelo del visualizador no está cargado.");
                reject("El modelo del visualizador no está cargado."); // Rechaza la promesa si el modelo no está cargado
                return;
            }
    
            const { urn } = this.props; // Asumiendo que la URN se pasa como prop
    
            try {
                // Primero, obtener todos los objetos de la base de datos para la URN dada
                const response = await axios.get(`${API_BASE_URL}/api/objetoProyectoPlan/${urn}`);
                const objetosDB = response.data;
                let idsObjetosDB = objetosDB.map(objeto => objeto.IdObjeto); // Extraer los IdObjeto para comparación
    
                // Inicializar las listas de objetos
                let objetosConFecha = [];
                let objetosSinFecha = [];
    
                // Obtener todas las propiedades del modelo
                this.viewer.model.getBulkProperties([], {}, (result) => {
                    result.forEach(element => {
                        // Verificar si el elemento actual está en la lista de objetos de la base de datos
                        if (idsObjetosDB.includes(element.dbId.toString())) {
                            // Si está en la base de datos, obtener los datos específicos de ese objeto
                            let objetoEncontrado = objetosDB.find(obj => obj.IdObjeto === element.dbId.toString());
                            objetosConFecha.push({
                                id: element.dbId,
                                fecha_plan: objetoEncontrado.fecha_plan,
                                fecha_instalacion: objetoEncontrado.fecha_instalacion,
                                datos: objetoEncontrado
                            });
                        } else {
                            // Si no está en la base de datos, agregar a objetosSinFecha
                            objetosSinFecha.push(element.dbId);
                        }
                    });
    
                    console.log("Objetos con fecha y datos:", objetosConFecha);
                    console.log("Objetos sin fecha:", objetosSinFecha);
                    // Usa setState y resuelve la promesa en el callback de setState para asegurar que se espera la actualización
                    this.setState({ idsConFecha: objetosConFecha, idsSinFecha: objetosSinFecha }, () => {
                        console.log("Actualización de estado completa");
                        resolve(); // Resuelve la promesa una vez que el estado se haya actualizado
                    });
                });
            } catch (error) {
                console.error("Error al consultar la base de datos:", error);
                reject(error); // Rechaza la promesa en caso de error
            }
        });
    };
    
    
    
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
        // Manejar el cambio de la cámara del visor 
    };

    buscaBarrasHormigon = ()=>{
        toast.info('Iniciando el proceso de cálculo, espere unos segundos');
        const seleccionActual = this.viewer.getSelection();
        this.calculaSeleccionHormigon(seleccionActual);

    }
    onViewerSelectionChange = (event) => {
        // Manejar el cambio de la selección del visor 
        const viewer = this.viewer;
        const dbId = event.dbIdArray[0]; // Obtiene el primer elemento seleccionado
        const seleccionActual = this.viewer.getSelection();
        
        if (this.state.procesandoSeleccion) {
            return;
          }
      
        if ( seleccionActual.length ==0) {
            console.log("No hay selección");
            this.context.actualizarResultadoFierros([]);
            this.context.updateSelectedObjectProps([]);
            return; // Sale de la función si no hay nada seleccionado
        }
        else{
          
      
            viewer.getProperties(dbId, (data) => {
          
                this.context.updateSelectedObjectProps(data);
                // Aquí puedes hacer algo más con las propiedades si lo necesitas
            }, (error) => {
                console.error("Error al obtener propiedades del elemento seleccionado:", error);
            });
         
        }   
        
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
