import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { ActionsContext } from '../context/ActionContext';
import { buscaKeys, transformJsonToArray, consulta_filtro,consulta_filtro2 } from '../utils/ViewerUtils';
import axios from 'axios';
import API_BASE_URL from '../config';
import moment from 'moment'; 
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            identificadoresActuales: [],
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
            nombreParametrolargo: '',
            nombreParametroPesoLineal: '',
            nombreParametroDiametro: '',
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
              //console.log("Barras que intersectan con la selección:", resultado_fierros);
            } else {
                toast.warn('No se encontraron barras que intersectan con la selección.');
              //console.log("No se encontraron barras que intersectan con la selección.");
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
        const {  nombreParametroPesoLineal,  nombreParametrolargo} = this.state;
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
                if (prop.attributeName === nombreParametroPesoLineal && parseFloat(prop.displayValue) > 0) {
                     if (prop.units) {
                         if (prop.units.includes("kilograms") || prop.units.includes("kilos") || prop.units.includes("kilogramos")) {
                         //console.log("peso actual Kilos",prop.displayValue);
                            pesoActual = parseFloat(prop.displayValue); // No se necesita conversión
                         } else if (prop.units.includes("pounds") || prop.units.includes("libras")) {
                          //console.log("peso actual libras",prop.displayValue);
                             pesoActual = parseFloat(prop.displayValue) * 1.48816394; // libras x pie ==> kg por mtr
                         }
                     } else {
                         // Si no hay información de unidades, asumimos que está en kilogramos por defecto
                         pesoActual = parseFloat(prop.displayValue);
                     }
                    esBarraValida = true; // Se encontró peso, marcamos como válida
                } else if (prop.attributeName === nombreParametrolargo && parseFloat(prop.displayValue) > 0) {
                  
                    if (prop.units) {
                        if (prop.units.includes("autodesk.unit.unit:meters")) {
                          //console.log("tipo de unidad metros");
                            largoActual = parseFloat(prop.displayValue) ; // *100 Convertir de metros a centímetros
                        } else if (prop.units.includes("feet-")) {
                          //console.log("encuentro pies");
                          //console.log("tipo de unidad pies");
                            largoActual = parseFloat(prop.displayValue) * 30.48 *(0.01); // 
                        } else if (prop.units.includes("centimeters")) {
                          //console.log("tipo de unidad centimetros");
                            largoActual = parseFloat(prop.displayValue) / 100; //
                        }
                        else if (prop.units.includes("millimeters")) {
                          //console.log("tipo de unidad milimetros");
                            largoActual = parseFloat(prop.displayValue) /1000; //  milimetros a cm
                        }
                        else if (prop.units.includes("inches")) {
                          //console.log("tipo de unidad pulgadas");
                          //console.log("inches");
                            largoActual = parseFloat(prop.displayValue) *2.54 * (0.01); // 
                        }
                        else if (prop.units.includes("feetFractionalInches")) {
                          //console.log("tipo de unidad pies fraccionados pulgadas");
                          
                            largoActual = parseFloat(prop.displayValue) *30.48 * (0.01); //
                          //console.log("feetFractionalInches",prop.displayValue);
                          //console.log("feetFractionalInches",largoActual);
                        }
                        else if (prop.units.includes("fractionalInches")) {
                          //console.log("tipo de unidad  pulgadas fraccionadas");
                           
                            largoActual = parseFloat(prop.displayValue) *2.54 * (0.01); //
                          //console.log(largoActual+"  "+prop.displayValue);
                          //console.log("fractionalInches actual",largoActual);
                        }
                        else if (prop.units.includes("decimeters")) {
                          //console.log("tipo de unidad decimetros");
                          //console.log("decimeters");
                            largoActual = parseFloat(prop.displayValue) *0.1 ; //
                        }
                        else if (prop.units.includes("metersCentimeters")) {
                          //console.log("tipo de unidad metros centimetros");
                          //console.log("metersCentimeters");
                            largoActual = (parseFloat(prop.displayValue)) /100 ; //
                        }
                        else if (prop.units.includes("usSurveyFeet")) {
                          //console.log("tipo de unidad US Survey pie");
                          //console.log("usSurveyFeet");
                            largoActual = (parseFloat(prop.displayValue)) *30.48 *(0.01); //
                        }//
                    } else {
                       
                        largoActual = parseFloat(prop.displayValue);
                    }
                 //  largoActual = parseFloat(prop.displayValue) / 100; // Conversión si es necesario
                    esBarraValida = true; // Se encontró largo, marcamos como válida
                }
            });
    
            if (esBarraValida) {
                pesoTotal += pesoActual *(largoActual);
                largoTotal += largoActual;
                totalBarras += 1;
            }
        });
    
      //console.log("Peso Total:", pesoTotal.toFixed(1));
      //console.log("Largo Total:", largoTotal.toFixed(1));
      //console.log("Total Barras:", totalBarras);
    
        // Actualizar el contexto con los nuevos valores
        this.context.updatePesoTotal(pesoTotal);
        this.context.updateLargoTotal(largoTotal);
        this.context.updateTotalBarras(totalBarras);
    };
    
   
 
    cargarConfiguracion = async () => {
         const url = `${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`;
       //console.log("URN CONSULTADA",this.props.urn);
        try {
            const respuesta = await fetch(url);
           
            const resultado = await respuesta.json();
          //console.log("respuesta config",resultado);
            if (resultado.urn !== "") {
               // const { configuracion } = resultado;
              ////console.log("RESULTADO CONFIG",configuracion);
                // Actualiza el estado con el nombre del parámetro de fecha obtenido
                this.setState({ nombreParametroFecha: resultado.variableTiempo || '' });
                this.setState({ nombreParametroBarra: resultado.variableBarra|| '' });
                this.setState({ nombreParametrolargo: resultado.variableLargo|| '' });
                this.setState({ nombreParametroPesoLineal: resultado.variablePesoLineal|| '' });
                this.setState({ nombreParametroDiametro: resultado.variableDiametro|| '' });
              //console.log("parametro fecha buscado");
              //console.log( resultado.variableBarra);
              //console.log(resultado.variableTiempo);
              //console.log( resultado.variablePesoLineal);
              //console.log(resultado.variableDiametro);
              //console.log(resultado.variableLargo);

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
              //console.log("Error El modelo del visualizador no está cargado.");
                resolve({});
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
              //console.log("Resultado obtenido:");
              //console.log(data); // Muestra el resultado por consola
                resolve(data);
                resolve(data);
            }, (error) => {
              //console.log(error);
              
                resolve({}); 
                return;
            });
        });
    };
    obtenerIdsBarras = async () => {
        return new Promise(async (resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
              //console.log("El modelo del visualizador no está cargado.");
                resolve({}); 
                return;;
            }
    
            try {
                const { filtro1, filtro2, nombreParametroFecha , nombreParametroBarra, nombreParametroPesoLineal, nombreParametroDiametro, nombreParametrolargo} = this.state;
    
                // Utilizando BulkProperties para obtener las propiedades de todos los elementos
                this.viewer.model.getBulkProperties([], { propFilter: ['Category', filtro1, filtro2, nombreParametroPesoLineal, nombreParametrolargo, nombreParametroDiametro, nombreParametroFecha] }, (result) => {
                    let idsBarras = result.filter(element => 
                        element.properties.some(prop => 
                            prop.displayName === 'Category' && prop.displayValue === nombreParametroBarra
                        )
                    ).map(element => {
                        // Encuentra valores para los filtros, peso lineal, longitud total, diámetro de barra y fecha
                        const propFiltro1 = element.properties.find(prop => prop.displayName === filtro1)?.displayValue || '';
                        const propFiltro2 = element.properties.find(prop => prop.displayName === filtro2)?.displayValue || '';
                        let  pesoLineal = element.properties.find(prop => prop.attributeName === nombreParametroPesoLineal)?.displayValue || '0';
                        let longitudTotal = element.properties.find(prop => prop.attributeName === nombreParametrolargo)?.displayValue || '0';
                        const diametroBarra = element.properties.find(prop => prop.attributeName === nombreParametroDiametro)?.displayValue || '0';
                        const fecha = element.properties.find(prop => prop.displayName === nombreParametroFecha)?.displayValue || '';
                        
                        const propPeso = element.properties.find(prop => prop.attributeName === nombreParametroPesoLineal);
                        if (propPeso) {
                            pesoLineal = parseFloat(propPeso.displayValue || '0');
                            if (propPeso.units) {
                                if (propPeso.units.includes("kilograms") || propPeso.units.includes("kilos") || propPeso.units.includes("kilogramos")) {
                                  //console.log("Peso actual Kilos", propPeso.displayValue);
                                } else if (propPeso.units.includes("pounds") || propPeso.units.includes("libras")) {
                                  //console.log("Peso actual libras", propPeso.displayValue);
                                    pesoLineal = pesoLineal * 0.453592; // Convertir de libras a kilogramos
                                }
                            }
                        }
                        const propLargo = element.properties.find(prop => prop.attributeName === nombreParametrolargo);
                        if (propLargo && parseFloat(propLargo.displayValue) > 0) {
                            longitudTotal = parseFloat(propLargo.displayValue);
                            if (propLargo.units) {
                                if (propLargo.units.includes("autodesk.unit.unit:meters")) {
                                    longitudTotal = longitudTotal * 100; // Convertir de metros a centímetros
                                } else if (propLargo.units.includes("feet")) {
                                    longitudTotal = longitudTotal * 30.48; // Convertir de pies a centímetros
                                } else if (propLargo.units.includes("centimeters")) {
                                    longitudTotal = longitudTotal; // Ya está en centímetros
                                } else if (propLargo.units.includes("millimeters")) {
                                    longitudTotal = longitudTotal / 10; // Convertir de milímetros a centímetros
                                } else if (propLargo.units.includes("inches")) {
                                    longitudTotal = longitudTotal * 2.54; // Convertir de pulgadas a centímetros
                                } else if (propLargo.units.includes("usSurveyFeet")) {
                                    longitudTotal = longitudTotal * 30.48006096; // Convertir de US Survey Feet a centímetros
                                } // Añadir otras conversiones si es necesario
                            }
                        }
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
                  //console.log("estas son las barras",idsBarras);
                    // Resolver la promesa con los IDs de barras encontrados
                    resolve(idsBarras);
                });
            } catch (error) {
                console.error("Error al obtener IDs de barras:", error);
               
                resolve({}); 
                return;
            }
        });
    };
    
    

    obtenerFiltros = async (urnBuscada) => {
        try {
          //console.log("URN antes de AXIOS:", urnBuscada);
           // const response = await axios.get(`${API_BASE_URL}/api/filtros`);
           //api/configuracionViewer  const url = `${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`;
           const response = await axios.get(`${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`);
         //console.log("Respuesta Filtros:", response.data);
    
            const filtrado1 = response.data.filtro01;
            const filtrado2 = response.data.filtro02;
    
            // Actualiza el estado con los nuevos filtros y fierros.
            await this.setStateAsync({ filtro1: filtrado1, filtro2: filtrado2, fierros: response.data.variableBarra });
    
          //console.log("Filtros actualizados en el estado:", filtrado1, filtrado2);
    
            // Consulta de filtros después de actualizar el estado
            const datosFiltro1 = await this.consultaFiltro([filtrado1]);
            const datosFiltro2 = await this.consultaFiltro([filtrado2]);
    
            this.context.updateDatosFiltro1(datosFiltro1);
            this.context.updateDatosFiltro2(datosFiltro2);
    
          //console.log("filtro datos 1", datosFiltro1);
          //console.log("filtro datos 2", datosFiltro2);
        } catch (error) {
            console.error("Error en obtenerFiltros:", error);
           // throw error;  
        }
    };
    
    // Función auxiliar para convertir setState en una función que retorna una promesa
    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve);
        });
    }
    
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
                this.context.registerAction('obtenerIdsConFecha', this.obtenerIdsConFecha);
                this.context.registerAction('obtenerIdsSinFecha', this.obtenerIdsSinFecha);
                this.context.registerAction('buscaBarrasHormigon', this.buscaBarrasHormigon);
                this.context.registerAction('gestionarYpintarIds', this.pintarIdFecha);
                
            })
            .catch(err => console.error(err));
    }
    
    setupViewer = () => {
        this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container.current, { extensions: ['Autodesk.DocumentBrowser', 'HandleSelectionExtension'] });
        this.viewer.start();
      //console.log("iniciar!!!");
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
        this.cargarConfiguracion();
        await this.obtenerFiltros(this.props.urn).then(async () => {
            try {
                const idsBarras = await this.obtenerIdsBarras();
              //console.log("IDs de barras obtenidos:", idsBarras);
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
               
                resolve({}); 
                return;
            }
        });
    }

    restaurarColoresOriginales = () => {
        if (this.viewer) {
            // Elimina todos los colores temáticos aplicados en el visor
            this.viewer.clearThemingColors(this.viewer.model);
          //console.log("Colores restaurados a su estado original.");
        } else {
            console.error("El visor no está inicializado.");
        }
    };
    pintarIdFecha = async () => {
        await this.obtenerIdsConFecha();
      //console.log("previo a pintar", this.state.idsConFecha);
    
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
        if (this.viewer) {
          //console.log("limpio visor");
            this.viewer.isolate([]);
            this.props.guardarIdentificadores([]);
            this.viewer.fitToView(this.viewer.model);
            this.context.actualizarResultadoFierros([]);
        this.restaurarColoresOriginales();
        }
        
    }

    filtrar =  async (identificadores) => {
       this.viewer.isolate(identificadores);
       const {  nombreParametroPesoLineal, nombreParametrolargo} = this.state;
     //console.log("Muestro ids filtrar",identificadores);
       const { fierros } = this.state;

     //console.log("Valor de fierros:", fierros);

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
           let cantidadActual = 0;
           result.properties.forEach(prop => {
            console.log(prop);
               if (prop.attributeName === nombreParametroPesoLineal && parseFloat(prop.displayValue) > 0) {
                    if (prop.units) {
                        if (prop.units.includes("kilograms") || prop.units.includes("kilos") || prop.units.includes("kilogramos")) {
                         console.log("peso actual Kilos",prop.displayValue);
                            pesoActual = parseFloat(prop.displayValue); // No se necesita conversión
                        } else if (prop.units.includes("pounds") || prop.units.includes("libras")) {
                          console.log("peso actual libras",prop.displayValue);
                            pesoActual = parseFloat(prop.displayValue) * 1.48816394; // libras x pie ==> kg por mtr
                        }
                    } else {
                        // Si no hay información de unidades, asumimos que está en kilogramos por defecto
                        pesoActual = parseFloat(prop.displayValue);
                    }
                   esBarraValida = true; // Se encontró peso, marcamos como válida
                   console.log("parametro largo "+nombreParametrolargo);
                   console.log("condición "+prop.displayValue);
                   
               } else if ((prop.attributeName === nombreParametrolargo)||(prop.displayName === nombreParametrolargo) && parseFloat(prop.displayValue) > 0) {
                 console.log("prop units "+prop.units);
                    if (prop.units) {
                        if (prop.units.includes("autodesk.unit.unit:meters")) {
                          console.log("tipo de unidad metros");
                            largoActual = parseFloat(prop.displayValue) ; // *100 Convertir de metros a centímetros
                        } else if (prop.units.includes("feet-")) {
                          console.log("encuentro pies");
                          console.log("tipo de unidad pies");
                            largoActual = parseFloat(prop.displayValue) * 30.48 *(0.01); // 
                        } else if (prop.units.includes("centimeters")) {
                          console.log("tipo de unidad centimetros");
                            largoActual = parseFloat(prop.displayValue) / 100; //
                        }
                        else if (prop.units.includes("millimeters")) {
                          console.log("tipo de unidad milimetros");
                            largoActual = parseFloat(prop.displayValue) /1000; //  milimetros a cm
                        }
                        else if (prop.units.includes("inches")) {
                          console.log("tipo de unidad pulgadas");
                          console.log("inches");
                            largoActual = parseFloat(prop.displayValue) *2.54 * (0.01); // 
                        }
                        else if (prop.units.includes("feetFractionalInches")) {
                          console.log("tipo de unidad pies fraccionados pulgadas");
                          
                            largoActual = parseFloat(prop.displayValue) *30.48 * (0.01); //
                          console.log("feetFractionalInches",prop.displayValue);
                          console.log("feetFractionalInches",largoActual);
                        }
                        else if (prop.units.includes("fractionalInches")) {
                          console.log("tipo de unidad  pulgadas fraccionadas");
                           
                            largoActual = parseFloat(prop.displayValue) *2.54 * (0.01); //
                          console.log(largoActual+"  "+prop.displayValue);
                          console.log("fractionalInches actual",largoActual);
                        }
                        else if (prop.units.includes("decimeters")) {
                          console.log("tipo de unidad decimetros");
                          console.log("decimeters");
                            largoActual = parseFloat(prop.displayValue) *0.1 ; //
                        }
                        else if (prop.units.includes("metersCentimeters")) {
                          console.log("tipo de unidad metros centimetros");
                          console.log("metersCentimeters");
                            largoActual = (parseFloat(prop.displayValue)) /100 ; //
                        }
                        else if (prop.units.includes("usSurveyFeet")) {
                          console.log("tipo de unidad US Survey pie");
                          console.log("usSurveyFeet");
                            largoActual = (parseFloat(prop.displayValue)) *30.48006096 *(0.01); //
                        }//
                    } else {
                       
                        largoActual = parseFloat(prop.displayValue);
                    }
                //  largoActual = parseFloat(prop.displayValue) / 100; // Conversión si es necesario
                   esBarraValida = true; // Se encontró largo, marcamos como válida
               }else if (prop.attributeName === 'Quantity' && parseFloat(prop.displayValue) > 0) {
                  cantidadActual = parseFloat(prop.displayValue);
               }
           });
           
           if (esBarraValida) {
               // Solo acumula y cuenta si es una barra válida
               pesoTotal += pesoActual * (largoActual);
               largoTotal += (largoActual);
              // totalBarras += 1; // Incrementamos el contador de barras válidas
               totalBarras +=cantidadActual;
           }
       });
   
      //console.log("Peso Total:", pesoTotal.toFixed(1));
      //console.log("Largo Total:", largoTotal.toFixed(1));
      //console.log("Total Barras:", totalBarras);
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
                
                resolve({}); 
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
    
                  //console.log("Objetos con fecha y datos:", objetosConFecha);
                  //console.log("Objetos sin fecha:", objetosSinFecha);
                    // Usa setState y resuelve la promesa en el callback de setState para asegurar que se espera la actualización
                    this.setState({ idsConFecha: objetosConFecha, idsSinFecha: objetosSinFecha }, () => {
                      //console.log("Actualización de estado completa");
                        resolve(); // Resuelve la promesa una vez que el estado se haya actualizado
                    });
                });
            } catch (error) {
                console.error("Error al consultar la base de datos:", error);
             
                resolve({}); 
                return;
            }
        });
    };
    
    
    
    obtenerIdsSinFecha = async () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
              //console.log("El modelo del visualizador no está cargado.");
                resolve({}); 
                return;
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
    
              //console.log("IDS SIN FECHA:", idsSinFecha);
                resolve(idsSinFecha);
            }, (error) => {
              //console.log("error",error);
                resolve({}); 
                return;
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
        const {  nombreParametroPesoLineal,  nombreParametrolargo} = this.state;
        const viewer = this.viewer;
        const dbId = event.dbIdArray[0]; // Obtiene el primer elemento seleccionado
        const seleccionActual = this.viewer.getSelection();
        this.context.actualizarSeleccionActual(seleccionActual);
      //console.log("SELECCIONO ELEMENTO");
      //console.log(nombreParametroPesoLineal,  nombreParametrolargo);
      //console.log(event.dbIdArray);
      //console.log(seleccionActual);
        if (this.state.procesandoSeleccion) {
            return;
          }
      
        if ( seleccionActual.length ==0) {
          //console.log("No hay selección");
            this.context.actualizarResultadoFierros([]);
            this.context.updateSelectedObjectProps([]);
            return; // Sale de la función si no hay nada seleccionado
        }
        else{
          
      
            viewer.getProperties(dbId, (data) => {
             //console.log("data seleccion", data);
               const convertirYRedondear = (valor, factor) => {
                return parseFloat((valor * factor).toFixed(2));
              };
                data.properties.forEach(prop => {
                    let valorOriginal = parseFloat(prop.displayValue);

                    if (prop.attributeName === nombreParametroPesoLineal) {
                        if (prop.units && (prop.units.includes("pounds") || prop.units.includes("libras"))) {
                            let valorConvertido = valorOriginal * 1.48816394; // Conversión de libras a kg/m
                            valorConvertido =  parseFloat(( valorConvertido).toFixed(2));
                            prop.displayValue = valorConvertido.toString() + 'kg';
                            if (prop.value) {
                                prop.value = valorConvertido; // Asegurarse de actualizar el campo value si existe
                            }
                        }else{
                            prop.displayValue =  prop.displayValue+' kg'
                        }
                    } else  if (prop.units) {
                        let conversionFactor = 1; // Factor de conversión por defecto

                        if (prop.units.includes("feet-") || prop.units.includes("usSurveyFeet") || prop.units.includes("feetFractionalInches")) {
                            conversionFactor = 30.48;
                        } else if (prop.units.includes("centimeters")) {
                            conversionFactor = 1;
                        } else if (prop.units.includes("millimeters")) {
                            conversionFactor = 0.1;
                        } else if (prop.units.includes("inches")) {
                          //console.log("ENCUENTRO EN VISUALIZADOR INCHES FRACC");
                            conversionFactor = 2.54
                        } else if (prop.units.includes("decimeters")) {
                            conversionFactor = 10;
                        } else if (prop.units.includes("metersCentimeters")) {
                            conversionFactor =  100;
                        }else if (prop.units.includes("autodesk.unit.unit:meters")) {
                            conversionFactor = 100;
                        }

                        let valorConvertido = convertirYRedondear(valorOriginal, conversionFactor);
                        prop.displayValue = valorConvertido.toString() + ' cm';

                        if (prop.value) {
                            prop.value = valorConvertido; // Actualizar el campo value si existe
                        }
                    }
                });
                this.context.updateSelectedObjectProps(data);
             //console.log("elemento seleccionado",data);
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
