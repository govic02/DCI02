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
import { ProyectoContext } from '../../context/ProyectoContext'; // Asegúrate de que la ruta es correcta
import ErrorBoundary from '../..//ErrorBoundary';

const { Autodesk } = window;

class ViewerProyectos extends React.Component {
    static contextType = ProyectoContext;
    constructor(props) {
        super(props);
        this.state={
            idsConFecha: [], // Guarda los IDs con fecha
            idsSinFecha: [], // Guarda los IDs sin fecha
            nombreParametroFecha: '',
            nombreParametroBarra: '',
            nombreParametrolargo: '',
            nombreParametroPesoLineal: '',
            nombreParametroDiametro: '',
            nombreParametroNivel:'',
            filtro1: '',
            filtro2: '',
            idsBarraActual:[],
            cambioUrnCount: 0,
            cambioUrnTimes: [],
            bloquearCambios: false
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
                this.checkDataAndGenerateWeights();
                this.context.registerAction('generarTotalPesoPisos', this.generarTotalPesoPisos);
                this.context.registerAction('PesoPromedio', this.PesoPromedio);//PesoPromedioGeneral
                this.context.registerAction('PesoPromedioGeneral', this.PesoPromedioGeneral); // 
                this.context.registerAction('diametroPromedioGeneral', this.diametroPromedioGeneral);
                this.context.registerAction('porcentajePedidoTotal', this.porcentajePedidoTotal);
                this.context.registerAction("obtenerFiltrosOrden", this.obtenerFiltrosOrden);
            })
            .catch(err => console.log(err));

           
           
    }

    checkDataAndGenerateWeights = async () => {
        const urn = this.props.urn; //
        if (!urn) return; // Si no hay urn, no continuar
    
        try {
            console.log("ingreso ");
            const url = `${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`;
            const response = await fetch(url);
    
            if (!response.ok) throw new Error('Failed to fetch bar data');
    
            const result = await response.json();
    
            if (!result.detalles || result.detalles.length === 0) {
                // Si no hay detalles o están vacíos, ejecuta generarTotalPesoPisos
                console.log('No se encontraron detalles, generando pesos totales de pisos...');
                this.generarTotalPesoPisos();
            } else {
                console.log('Detalles recibidos:', result.detalles);
            }
        } catch (error) {
            console.log('Error checking data:', error);
            // Opcionalmente podrías intentar llamar a generarTotalPesoPisos incluso en caso de error
            this.generarTotalPesoPisos();
        }
    }
    getForgeToken = () => {
        const url = `${API_BASE_URL}/api/gettoken`;
        return fetch(url)
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
        this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container.current, { extensions: ['Autodesk.DocumentBrowser'] });
        this.viewer.start();
    
        this.viewer.loadExtension('HandleSelectionExtension');
        this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
            console.log("Geometría cargada");
            this.onModelLoaded();
        });
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
    
    componentDidUpdate(prevProps, prevState) {
       
        console.log("nueva urn a cargar");
        console.log(this.props.urn);
       
        if (this.viewer && (this.props.urn !== prevProps.urn || this.props.idUsuario !== prevProps.idUsuario || this.props.proyectoKey !== prevProps.proyectoKey)) {
          
            const now = Date.now();
            const newTimes = [...this.state.cambioUrnTimes, now].filter(time => now - time <= 6000);
            const cambioUrnCount = newTimes.length;
            this.setState({ cambioUrnTimes: newTimes, cambioUrnCount });

            if (cambioUrnCount > 4) {
                if (!this.state.bloquearCambios) {
                    alert("Por favor, espera que cargue la última selección antes de cambiar el proyecto.");
                    this.setState({ bloquearCambios: true });
                    if (this.alertTimeout) {
                        clearTimeout(this.alertTimeout);
                    }
                    this.alertTimeout = setTimeout(() => {
                        this.setState({ bloquearCambios: false });
                    }, 5000 - (now - newTimes[0]));
                }
                return;  // Detener la carga si se excede el número de cambios
            }
            try {
                this.viewer.tearDown(); // Desmonta el modelo actual
                this.viewer.finish(); // Finaliza y limpia el visor
                this.viewer = null; // Elimina la referencia al visor
                this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container.current);
              
                this.viewer.start();
                this.updateViewerState({})
                this.cargarConfiguracion();
                Autodesk.Viewing.Document.load(
                    'urn:' + this.props.urn,
                    (doc) => {
                        try {
                            // Intenta cargar el documento
                            this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()).then(() => {
                                console.log("Documento cargado correctamente");
                                this.onModelLoaded(); // Llama a onModelLoaded después de cargar el documento
                            });
                        } catch (error) {
                            // Captura errores durante la carga del documento
                            console.log("Error al cargar el documento:", error);
                            toast.info('Error al cargar el documento. Intenta nuevamente más tarde.');
                        }
                    },
                    (code, message, errors) => { 
                        console.log("no se pudo cargar debe traducir");
                        toast.info('No se pudo abrir, proceso de traducción del archivo iniciado');
                        console.log(code, message, errors);
                    }
                );
            } catch (error) {
                // Captura errores durante la carga de la URN
                console.log("Error al cargar la URN:", error);
                toast.info('Error al cargar. Verifica la URN e intenta nuevamente.');
            }
        }
        if (prevState.idsBarras !== this.state.idsBarras) {
            console.log("idsBarras ha cambiado, enviando a la base de datos...");
            this.guardarIdsBarras();
        }
    }
    
    cargarConfiguracion = async () => {
        console.log("busco configuración en viewer proyectos");
        const url = `${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`;
        console.log("URN CONSULTADA",this.props.urn);
        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            console.log("respuesta config",resultado);
            if (respuesta.ok) {
                
                // Actualiza el estado con el nombre del parámetro de fecha obtenido
                this.setState({ nombreParametroFecha: resultado.variableTiempo || '' });
                this.setState({ nombreParametroBarra: resultado.variableBarra|| '' });
                this.setState({ nombreParametroBarra: resultado.variableBarra|| '' });
                this.setState({ nombreParametrolargo: resultado.variableLargo|| '' });
                this.setState({ nombreParametroPesoLineal: resultado.variablePesoLineal|| '' });
                this.setState({ nombreParametroDiametro: resultado.variableDiametro|| '' });
                console.log("parametro fecha buscado");
                console.log( resultado.variableBarra);
                console.log(resultado.variableTiempo);
                
            } else {
                console.log('Configuración no encontrada:', resultado.mensaje);
            }
        } catch (error) {
            console.log('Error al cargar la configuración:', error);
        }
    };
   sumarPesosPorFiltro2 = (idsBarras) => {
        // Agrupar y sumar los pesos por el valor de filtro2 (ejemplo: AEC Piso)
        const sumaPesos = idsBarras.reduce((acumulador, barraActual) => {
            // Usar el valor de filtro2 como clave
            const clave = barraActual.nombreFiltro2; // Asume que filtro2 es una variable o constante que contiene la cadena 'AEC Piso'
          //  console.log("barra actual: ",barraActual.nombreFiltro2);
           // const pesoActual = barraActual.pesoLineal * barraActual.longitudTotal / 100; // Convertir longitud en metros y calcular peso
           const pesoActual = barraActual.pesoLineal * barraActual.longitudTotal; 
            if (!acumulador[clave]) {
                acumulador[clave] = 0; // Si no existe la clave, inicializarla en 0
            }
    
            acumulador[clave] += pesoActual; // Sumar el peso de la barra actual al total para este piso
            return acumulador;
        }, {});
        console.log("Suma por pisos parametro 2", sumaPesos);
        return sumaPesos;
    };
  // Asumiendo que obtenerIdsBarras y sumarPesosPorFiltro2 están definidas en el mismo ámbito
  sumarPesosPorDiametroEnPiso = async(idsBarras) => {
    const resultadosPorPiso = {};
    console.log("sumo pesos por diametro desde visualizador");
    idsBarras.forEach(barra => {
        const piso = barra.nombreFiltro2;
        const diametro = barra.diametroBarra;
        const nivel = barra.nivel;
        const peso = barra.pesoLineal * (barra.longitudTotal); // Asume que longitudTotal está en mm, convertido a m

        // Inicializa el objeto para el piso si aún no existe
        if (!resultadosPorPiso[piso]) {
            resultadosPorPiso[piso] = {};
        }

        // Inicializa el acumulador para el diámetro en el piso específico si aún no existe
        if (!resultadosPorPiso[piso][diametro]) {
            resultadosPorPiso[piso][diametro] = 0;
        }

        // Suma el peso al acumulador del diámetro en el piso específico
        resultadosPorPiso[piso][diametro] += peso;
    });

    // Opcionalmente, convertir los resultados en una estructura de arreglo para fácil manipulación o envío
    const resultadosArray = Object.entries(resultadosPorPiso).map(([piso, diametrosYpesos]) => {
        return {
            piso,
            diametros: Object.entries(diametrosYpesos).map(([diametro, pesoTotal,nivel]) => ({
                diametro,
                pesoTotal,
                nivel
            }))
        };
    });

    return resultadosArray;
};


   generarTotalPesoPisos = async () => {
    console.log("llaman a generador de pisos");
    try {
        const idsBarras = await this.obtenerIdsBarras();
        // Asumiendo que sumarPesosPorFiltro2 devuelve directamente el resultado,
        // sin necesidad de esperar una promesa.
        const resultado = await this.sumarPesosPorFiltro2(idsBarras);
        
        console.log("PESOS POR PISO", resultado); // Esto imprimirá un objeto con los totales de peso por cada valor de 'AEC Piso'

        
        // Preparar los datos para enviar
        const datosParaEnviar = {
            urn: this.props.urn, // Asegúrate de tener urn en el ámbito
            nombreFiltro2: this.state.filtro2, // Asegúrate de tener nombreFiltro2 en el ámbito
            pesosPorValor: Object.entries(resultado).map(([valor, sumaPeso]) => ({ valor, sumaPeso }))
        };
        console.log("datos para enviar pesos pisos",datosParaEnviar);

       
        // Enviar los datos al servidor
        const url = `${API_BASE_URL}/api/sumaTotalpiso`; // Asegúrate de que API_BASE_URL esté definido
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosParaEnviar),
        });

        if (!respuesta.ok) {
            throw new Error('Error al enviar datos al servidor');
        }

        const datosRespuesta = await respuesta.json();
        console.log('Datos guardados con éxito:', datosRespuesta);
        const diametroPiso = await this.sumarPesosPorDiametroEnPiso(idsBarras);
        console.log("diametros por piso",diametroPiso);
        const datosParaEnviarDiametros = {
            urn: this.props.urn,
            nombreFiltro2: this.state.filtro2,
            nivel:this.state.nombreParametroNivel,
            pesosPorPiso: diametroPiso, // Asegúrate de que esto sea una lista de { piso, diametros: [{ diametro, pesoTotal }] }
        };
        const urlDiametros = `${API_BASE_URL}/api/respuestasDiametros`; // Asegúrate de que API_BASE_URL esté definido
        try {
            const respuestaDiametros = await fetch(urlDiametros, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaEnviarDiametros), // Convertir todo el objeto a JSON
            });
        
            if (!respuesta.ok) throw new Error('Error al enviar datos al servidor para pesos por diámetro en piso');
        
           // console.log('Datos de pesos por diámetro en piso guardados con éxito:', await respuesta.json());
           // console.log("Datos desde server",respuestaDiametros);
        } catch (error) {
            console.log("Error al enviar total de peso por diámetro en piso:", error);
        }

        try {
            const datosParaInsertar = {
                urn: this.props.urn, 
                lista: idsBarras.map(barra => ({ 
                    nombreFiltro1: barra.nombreFiltro1, 
                    nombreFiltro2: barra.nombreFiltro2,
                    diametroBarra: barra.diametroBarra,
                    nivel: barra.nivel,
                    fecha: barra.fecha,
                    id: barra.id,
                    longitudTotal: barra.longitudTotal,
                    pesoLineal: barra.pesoLineal,
                }))
            };
            console.log("pre barras insertadas",datosParaInsertar);
            const urlBarras = `${API_BASE_URL}/api/barraurn`; 
            const barrasInsertadas = await axios.post(urlBarras, datosParaInsertar);
            console.log("PESOS POR diametro piso", diametroPiso);
            console.log("Barras insertadas",barrasInsertadas);
            this.guardarIdsBarras();
        }
        catch(error){
            console.log("error en envvío",error);
        }


      
       
    } catch (error) {
        console.log("Error generando total de peso por pisos:", error);
    }
};



diametroPromedioGeneral = async (urn) => {
    try {
        let totalDiametro = 0;
        let totalBarras = 0;
        const { idsBarras } = this.state;
        console.log("barras previo diametro general");
        if(idsBarras && idsBarras.length>0){
            idsBarras.forEach(barra => {
                const { diametroBarra } = barra;
                totalDiametro += diametroBarra;  // Suma acumulativa de todos los diámetros
                totalBarras++;  // Contador de barras
            });
    
            if (totalBarras > 0) {
                const diametroPromedio = totalDiametro / totalBarras;  // Calcula el diámetro promedio del proyecto
                console.log(`Diámetro promedio del proyecto: ${diametroPromedio} unidades`);
    
                // Realiza la llamada a la API para guardar el resultado
                const response = await fetch(`${API_BASE_URL}/api/diametroPromedioGeneral`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ urn, diametroPromedio })
                });
    
                if (!response.ok) {
                    console.log("Error en la inserción", response.statusText);
                    return;
                }
    
                const saveResult = await response.json();
                console.log('Saved project average diameter:', saveResult);
                return { diametroPromedioProyecto: diametroPromedio };
            } else {
                console.log("No hay barras para calcular el promedio");
                return { diametroPromedioProyecto: 0 };
            }
        }
        
    } catch (error) {
        console.log("Error al procesar los datos de las barras:", error);
        throw error;  // Re-lanza el error para manejarlo en la función que llama
    }
};

PesoPromedioGeneral = async (urn) => {
    try {
        const { idsBarras } = this.state;
        console.log("Datos de barras actuales", idsBarras);
        let totalPesoProyecto = 0;
        let totalBarras = 0;

        if (idsBarras !== undefined) {
            idsBarras.forEach(barra => {
                const { pesoLineal, longitudTotal } = barra;
                const longitudEnMetros = longitudTotal ;
                const pesoTotal = pesoLineal * longitudEnMetros; // Calcula el peso total para la barra actual

                totalPesoProyecto += pesoTotal; // Suma acumulativa de todos los pesos
                totalBarras++; // Contador de barras
            });

            if (totalBarras > 0) {
                const pesoPromedioGeneral = totalPesoProyecto / totalBarras; // Calcula el peso promedio del proyecto
                console.log(`Peso promedio del proyecto: ${pesoPromedioGeneral} kg`);

                const response = await fetch(`${API_BASE_URL}/api/pesoPromedioGeneral`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ urn, pesoPromedioGeneral })
                });

                if (!response.ok) {
                    console.log("Error en la inserción", response.statusText);
                    return;
                }

                const saveResult = await response.json();
                console.log('Saved project average weight:', saveResult);
                return { pesoPromedioProyecto: pesoPromedioGeneral };
            } else {
                console.log("No hay barras para calcular el promedio");
                return { pesoPromedioProyecto: 0 };
            }
        }
    } catch (error) {
        console.log("Error al procesar los datos de las barras:", error);
        throw error; // Re-lanza el error para manejarlo en la función que llama
    }
};

PesoPromedio = async (urn) => {
    try {
      
        const { idsBarras } = this.state;
       // const detalles = await this.obtenerIdsBarras();
       // console.log("pesos promedio",detalles);
        console.log("PesoPromedio",this.state);
        console.log("supuestas barras",idsBarras);
        const resultados = {};
        if(idsBarras != undefined){
            idsBarras.forEach(barra => {
                const { nombreFiltro2, pesoLineal, longitudTotal } = barra;
                // Convertir longitud de milímetros a metros si es necesario
                //const longitudEnMetros = longitudTotal / 100;
                const longitudEnMetros = longitudTotal ;
                const pesoTotal = pesoLineal * longitudEnMetros;  // Aquí se calcula el peso total
    
                if (!resultados[nombreFiltro2]) {
                    resultados[nombreFiltro2] = { totalPeso: 0, count: 0 };
                }
                resultados[nombreFiltro2].totalPeso += pesoTotal;  // Suma el peso calculado
                resultados[nombreFiltro2].count++;
            });
    
            // Calcular el promedio de peso para cada nombreFiltro2
            const promedios = {};
            Object.keys(resultados).forEach(key => {
                const { totalPeso, count } = resultados[key];
                promedios[key] = totalPeso / count;  // Calcula el promedio de peso
            });
    
            console.log("Promedios de peso por nombreFiltro2:", promedios);
            const saveResponse = await fetch(`${API_BASE_URL}/api/crearPesoPromedio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urn:urn, pesos: promedios })
            });
    
            if (!saveResponse.ok) {
          console.log("respuesta desde inserción",saveResponse);
            }
    
            const saveResult = await saveResponse.json();
            console.log('Saved weight averages:', saveResult);
            return promedios;
        }
        // Agrupar y calcular el peso total multiplicando peso lineal por longitud total
        

    } catch (error) {
        console.log("Error fetching or processing bar data:", error);
        throw error; // Re-throw to handle it in the calling function
    }
};

porcentajePedidoTotal = async (urn) => {

    try {
        // Fetch bar data
        const { idsBarras } = this.state;
       // const barResponse = await fetch(`${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`);
        //if (!barResponse.ok) throw new Error('Failed to fetch bar data');
      
        //const barData = await barResponse.json();
        console.log("datos de barros desde Admin pr2",idsBarras);
        

        //const detalles = idsBarras.detalles;
        let pesoTotalProyecto = 0;
        idsBarras.forEach(barra => {
          //  const pesoTotalBarra = (barra.longitudTotal / 100) * barra.pesoLineal;
          const pesoTotalBarra = (barra.longitudTotal ) * barra.pesoLineal;
            pesoTotalProyecto += pesoTotalBarra;
        });

        // Fetch order data
        const orderResponse = await fetch(`${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urn)}`);
       // if (!orderResponse.ok) throw new Error('Failed to fetch order data');
       console.log("respuesta desde servidor ordenes pedidos",orderResponse);
       const pedidos = await orderResponse.json();
        console.log("pedidos asignados a proyecto",pedidos);
        let pesoTotalPedidos = 0;
        pedidos.forEach(pedido => {
            pesoTotalPedidos += parseFloat(pedido.pesos);
        });

        // Output results to the console
        console.log("Peso total del proyecto:", pesoTotalProyecto);
        console.log("Peso total de pedidos:", pesoTotalPedidos);
        const porcentaje = (pesoTotalPedidos / pesoTotalProyecto) * 100;
        console.log(`Porcentaje del peso de los pedidos sobre el total del proyecto: ${porcentaje.toFixed(2)}%`);

        const saveResponse = await fetch(`${API_BASE_URL}/api/crearPesovsPedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                urn,
                pesoTotalProyecto,
                pesoTotalPedidos
            })
        });

        if (!saveResponse.ok) throw new Error('Failed to save weight data');
        const saveResult = await saveResponse.json();
        console.log('Saved weight data:', saveResult);

    } catch (error) {
        console.log("Error in porcentajePedidoTotal:", error);
    }
};


   guardarIdsBarras = async () => {
        const { idsBarras } = this.state;
        const { urn } = this.props;
        console.log("objeto con barras",idsBarras);
        const batchSize = 1000; 
        const numBatches = Math.ceil(idsBarras.length / batchSize);
        toast.success('Inicio proceso de carga de barras');
        try {
            for (let i = 0; i < numBatches; i++) {
                const batch = idsBarras.slice(i * batchSize, (i + 1) * batchSize);
                const response = await fetch(`${API_BASE_URL}/api/barraurn`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        urn: urn,
                        lista: batch
                    })
                });
    
                if (!response.ok) {
                    throw new Error('Error al guardar los datos de barras');
                }
    
                const responseData = await response.json();
                console.log("Datos de barras guardados con éxito:", responseData);
                toast.success('Datos de barras guardados con éxito grupo '+i+'  de '+numBatches-1);
            }
        } catch (error) {
            console.log("Error al guardar los datos de barras:", error);
            toast.error('Error al guardar los datos de barras: ' + error.message);
        }
    }
    convertirLongitud (valor, unidades) {
        let largoActual = parseFloat(valor);
        if (isNaN(largoActual)) {
            return 0;
        }
      // console.log("Unidades recibidas", unidades);
    
        // Convertir de metros
        if (unidades.includes("autodesk.unit.unit:meters") && !unidades.includes("centimeters")) {
            return largoActual; // Asume que la longitud ya está en metros
        }
        // Convertir de pies
        if (unidades.includes("feet") || unidades.includes("usSurveyFeet")) {
            return largoActual * 30.48 * 0.01; // Convertir de pies a centímetros
        }
        // Convertir de centímetros
        if (unidades.includes("centimeters")) {
            return largoActual / 100; // Ya está en centímetros, ajusta según necesidad
        }
        // Convertir de milímetros
        if (unidades.includes("millimeters")) {
            return largoActual / 1000; // Convertir de milímetros a centímetros
        }
        // Convertir de pulgadas
        if (unidades.includes("inches")) {
            return largoActual * 2.54 * 0.01; // Convertir de pulgadas a centímetros
        }
        // Convertir de decímetros
        if (unidades.includes("decimeters")) {
            return largoActual * 0.1; // Convertir de decímetros a centímetros
        }
        // Convertir de metros a centímetros si se incluye ambas unidades
        if (unidades.includes("metersCentimeters")) {
            return largoActual / 100; // Asume que el largoActual está en centímetros si incluye "metersCentimeters"
        }
    
        // Devolver el valor sin convertir si las unidades no están especificadas o no coinciden con los casos esperados
        return largoActual;
    }
    
    obtenerIdsBarras = async () => {
        console.log("inicio busqueda de barras", this.state);
        console.log();
        await this.obtenerFiltros(this.props.urn);
        return new Promise(async (resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.log("El modelo del visualizador no está cargado.");
                resolve({}); 
                return;
            }
    
            try {
                const { filtro1, filtro2, nombreParametroFecha, nombreParametroBarra, nombreParametrolargo, nombreParametroPesoLineal, nombreParametroDiametro, nombreParametroNivel } = this.state;
                console.log("parametro nivel buscado ", nombreParametroNivel);
            
                this.viewer.model.getBulkProperties([], {
                    propFilter: [
                        'Category', filtro1, filtro2, nombreParametroPesoLineal, nombreParametrolargo, nombreParametroDiametro, nombreParametroFecha, nombreParametroNivel,
                        'Partición', 'Número de armadura', 'Imagen', 'Marca de tabla de planificación', 'Comentarios', 'Marca', 'AEC Grupo', 'AEC Forma', 'AEC Código Interno', 'AEC Bloquear barras','AEC Piso','AEC Secuencia Hormigonado', 'AEC Uso Barra', 'AEC Uso Barra (Bloquear)', 'AEC Cantidad', 'AEC Id', 'AEC Ubicación', 'AEC Sub Uso Barra', 'Fase de creación', 'Fase de derribo', 'Estados de visibilidad en vista', 'Geometría', 'Estilo', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J','I', 'K', 'O', 'R', 'Volumen de refuerzo', 'Regla de diseño', 'Cantidad','Quantity', 'Espaciado', 'Forma', 'Imagen de forma', 'Gancho al inicio', 'Rotación del gancho al inicio', 'Tratamiento de extremo al inicio', 'Gancho al final', 'Rotación del gancho al final', 'Tratamiento de extremo al final', 'Modificar longitudes de gancho', 'Categoría de anfitrión', 'Marca de anfitrión', 'Modificaciones de redondeo', 'Nombre de tipo', 'Material', 'Subcategoría', 'Diámetro de curvatura estándar', 'Diámetro de curvatura de gancho estándar', 'Diámetro de curvatura de estribo/tirante', 'Longitudes de gancho', 'Radio máximo de curvatura', 'Deformación', 'Imagen de tipo', 'Nota clave', 'Modelo', 'Fabricante', 'Comentarios de tipo', 'URL', 'Descripción', 'Descripción de montaje', 'Código de montaje', 'Marca de tipo', 'Costo'
                    ]
                }, (result) => {
                    let idsBarras = result.filter(element => 
                        element.properties.some(prop => 
                            prop.displayName === 'Category' && prop.displayValue === nombreParametroBarra
                        )
                    ).map(element => {
                        const valores = element.properties.reduce((acc, prop) => {
                            acc[prop.displayName] = prop.displayValue || '';
                            acc[prop.displayName + 'Units'] = prop.units || '';
                            return acc;
                        }, {});
                        const longitudTotal = this.convertirLongitud(valores[nombreParametrolargo], valores[nombreParametrolargo + 'Units']);
                       // console.log("Longitud Modificada",longitudTotal);
                        return {
                            id: element.dbId,
                            nombreFiltro1: valores[filtro1],
                            nombreFiltro2: valores[filtro2],
                            pesoLineal: parseFloat(valores[nombreParametroPesoLineal] || '0'),
                            longitudTotal: longitudTotal||'0',
                            diametroBarra: parseFloat(valores[nombreParametroDiametro] || '0'),
                            fecha: valores[nombreParametroFecha],
                            nivel: valores[nombreParametroNivel],
                            particion: valores['Partición'],
                            numeroArmadura: valores['Número de armadura'],
                            imagen: valores['Imagen'],
                            marcaTablaPlanificacion: valores['Marca de tabla de planificación'],
                            comentarios: valores['Comentarios'],
                            marca: valores['Marca'],
                            aecGrupo: valores['AEC Grupo'],
                            aecForma: valores['AEC Forma'],
                            aecCodigoInterno: valores['AEC Código Interno'],
                            aecBloquearBarras: valores['AEC Bloquear barras'],
                            aecUsoBarra: valores['AEC Uso Barra'],
                            aecUsoBarraBloquear: valores['AEC Uso Barra (Bloquear)'],
                            aecCantidad: parseFloat(valores['AEC Cantidad'] || '0'),
                            aecId: valores['AEC Id'],
                            aecPiso:valores['AEC Piso'],
                            aecSecuenciaHormigonado:valores['AEC Secuencia Hormigonado'],
                            aecUbicacion: valores['AEC Ubicación'],
                            aecSubUsoBarra: valores['AEC Sub Uso BarUso Barra'],
                            faseCreacion: valores['Fase de creación'],
                            faseDerribo: valores['Fase de derribo'],
                            estadosVisibilidadVista: valores['Estados de visibilidad en vista'],
                            geometria: valores['Geometría'],
                            estilo: valores['Estilo'],
                            a: valores['A'],
                            b: valores['B'],
                            c: valores['C'],
                            d: valores['D'],
                            e: valores['E'],
                            f: valores['F'],
                            g: valores['G'],
                            h: valores['H'],
                            j: valores['J'],
                            i: valores['I'],
                            k: valores['K'],
                            o: valores['O'],
                            r: valores['R'],
                            volumenRefuerzo: parseFloat(valores['Volumen de refuerzo'] || '0'),
                            reglaDiseno: valores['Regla de diseño'],
                            cantidad: parseFloat(valores['Cantidad'] || valores['Quantity'] || '0'),
                            espaciado: valores['Espaciado'],
                            forma: valores['Forma'],
                            imagenForma: valores['Imagen de forma'],
                            ganchoInicio: valores['Gancho al inicio'],
                            rotacionGanchoInicio: valores['Rotación del gancho al inicio'],
                            tratamientoExtremoInicio: valores['Tratamiento de extremo al inicio'],
                            ganchoFinal: valores['Gancho al final'],
                            rotacionGanchoFinal: valores['Rotación del gancho al final'],
                            tratamientoExtremoFinal: valores['Tratamiento de extremo al final'],
                            modificarLongitudesGancho: valores['Modificar longitudes de gancho'],
                            categoriaAnfitrion: valores['Categoría de anfitrión'],
                            marcaAnfitrion: valores['Marca de anfitrión'],
                            modificacionesRedondeo: valores['Modificaciones de redondeo'],
                            nombreTipo: valores['Nombre de tipo'],
                            material: valores['Material'],
                            subcategoria: valores['Subcategoría'],
                            diametroCurvaturaEstandar: parseFloat(valores['Diámetro de curvatura estándar'] || '0'),
                            diametroCurvaturaGanchoEstandar: parseFloat(valores['Diámetro de curvatura de gancho estándar'] || '0'),
                            diametroCurvaturaEstriboTirante: parseFloat(valores['Diámetro de curvatura de estribo/tirante'] || '0'),
                            longitudesGancho: valores['Longitudes de gancho'],
                            radioMaximoCurvatura: parseFloat(valores['Radio máximo de curvatura'] || '0'),
                            deformacion: valores['Deformación'],
                            imagenTipo: valores['Imagen de tipo'],
                            notaClave: valores['Nota clave'],
                            modelo: valores['Modelo'],
                            fabricante: valores['Fabricante'],
                            comentariosTipo: valores['Comentarios de tipo'],
                            url: valores['URL'],
                            descripcion: valores['Descripción'],
                            descripcionMontaje: valores['Descripción de montaje'],
                            codigoMontaje: valores['Código de montaje'],
                            marcaTipo: valores['Marca de tipo'],
                            costo: parseFloat(valores['Costo'] || '0')
                        };
                    });
            
                    // Guarda los resultados en el estado o maneja como prefieras
                    this.setState({ idsBarras });
                    console.log("Barras generadas con datos ", idsBarras);
                    resolve(idsBarras);
                });
            } catch (error) {
                console.log("Error al procesar los datos de Autodesk Forge", error);
               
                resolve({}); 
                return;
            }
            
            
        });
    };
    consultaFiltro = (filtros) => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.log("El modelo del visualizador no está cargado.");
                resolve({}); 
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
                console.log("error",error);
                resolve({}); 
                return;
            });
        });
    };
    obtenerPropiedadesModelo = () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.log("El modelo del visualizador no está cargado.");
                resolve([]);
                return;
            }
    
            this.viewer.model.getBulkProperties([], {}, (result) => {
                let propiedades = new Set();
    
                result.forEach(element => {
                    element.properties.forEach(prop => {
                        propiedades.add(prop.displayName);
                    });
                });
    
                console.log("Propiedades encontradas:");
                console.log(Array.from(propiedades)); // Muestra las propiedades por consola
    
                resolve(Array.from(propiedades));
            }, (error) => {
                console.log("Error al obtener las propiedades:", error);
                resolve([]);
                return;
            });
        });
    };
    obtenerFiltros = async (urnBuscada) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("URN ANTES DE AXIOS");
                console.log(this.props);
    
                const response = await axios.get(`${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`);
                console.log("Respuesta Filtros:", response.data);
    
                let filtrado1 = response.data.filtro01;
                let filtrado2 = response.data.filtro02;
    
                // Actualiza el estado con los nuevos filtros y fierros.
                this.setState({ filtro1: filtrado1,
                                filtro2: filtrado2, 
                                fierros: response.data.variableBarra,
                                nombreParametroBarra:response.data.variableBarra,
                                nombreParametroFecha:response.data.variableTiempo,
                                nombreParametrolargo:response.data.variableLargo, 
                                nombreParametroPesoLineal:response.data.variablePesoLineal,
                                nombreParametroDiametro: response.data.variableDiametro,
                                nombreParametroNivel : response.data.variableNivel
                            }, async () => {
                    console.log("Filtros actualizados en el estado:", filtrado1, filtrado2,response.data.variableBarra,response.data.variableTiempo,response.data.variableLargo,response.data.variablePesoLineal ,response.data.variableDiametro, response.data.variableNivel );
    
                    // Después de actualizar el estado, procede con la consulta de filtros.
                    try {
                        const datosFiltro1 = await this.consultaFiltro([filtrado1]);
                        //this.context.updateDatosFiltro1(datosFiltro1);
                        console.log("filtro datos 1",datosFiltro1);
                        const datosFiltro2 = await this.consultaFiltro([filtrado2]);
                        console.log("filtro datos 2",datosFiltro2);
                       // this.context.updateDatosFiltro2(datosFiltro2);
    
                        // Una vez completado todo, resuelve la promesa.
                        resolve();
                    } catch (error) {
                        console.log("Error al consultar los filtros:", error);
                       
                        resolve({}); 
                        return;
                    }
                });
            } catch (error) {
                console.log("Error al obtener los filtros:", error);
               
                resolve({}); 
                return;
            }
        });
    };

    obtenerFiltrosOrden = async (urnBuscada) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("URN ANTES DE AXIOS");
                console.log(this.props);
    
                const response = await axios.get(`${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(this.props.urn)}`);
                console.log("Respuesta Filtros:", response.data);
    
                let filtrado1 = response.data.filtro01;
                let filtrado2 = response.data.filtro02;
    
                // Actualiza el estado con los nuevos filtros y fierros.
                this.setState({ filtro1: filtrado1,
                                filtro2: filtrado2, 
                                fierros: response.data.variableBarra,
                                nombreParametroBarra:response.data.variableBarra,
                                nombreParametroFecha:response.data.variableTiempo,
                                nombreParametrolargo:response.data.variableLargo, 
                                nombreParametroPesoLineal:response.data.variablePesoLineal,
                                nombreParametroDiametro: response.data.variableDiametro,
                                nombreParametroNivel : response.data.variableNivel
                            }, async () => {
                    console.log("Filtros actualizados en el estado:", filtrado1, filtrado2,response.data.variableBarra,response.data.variableTiempo,response.data.variableLargo,response.data.variablePesoLineal ,response.data.variableDiametro, response.data.variableNivel );
    
                    // Después de actualizar el estado, procede con la consulta de filtros.
                    try {
                      
                        const datosFiltro2 = await this.consultaFiltro([filtrado2]);
                        console.log("filtro datos 2 para orden",datosFiltro2);
                       // this.context.updateDatosFiltro2(datosFiltro2);
    
                        // Una vez completado todo, resuelve la promesa.
                        resolve(datosFiltro2);
                    } catch (error) {
                        console.log("Error al consultar los filtros:", error);
                        
                        resolve({}); 
                        return;
                    }
                });
            } catch (error) {
                console.log("Error al obtener los filtros:", error);
                
                resolve({}); 
                return;
            }
        });
    };
    obtenerIdsConFecha = async () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.log("El modelo del visualizador no está cargado.");
                resolve({}); 
                return;
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
                    console.log("error",error);
                    resolve({}); 
                    return;
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
            console.log("Error al obtener IDs:", error);
            // A pesar del error, el flujo del programa continúa, evitando bloquear la pantalla.
        }
    }
    
    obtenerIdsSinFecha = async () => {
        return new Promise((resolve, reject) => {
            if (!this.viewer || !this.viewer.model) {
                console.log("El modelo del visualizador no está cargado.");
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
    
                console.log("IDS SIN FECHA:", idsSinFecha);
                resolve(idsSinFecha);
            }, (error) => {
                console.log("error", error);
                resolve({}); 
                return;
            });
        });
    };
    updateViewerState = (prevProps) => {
        if (this.props.urn && this.props.urn !== prevProps.urn) {
            Autodesk.Viewing.Document.load(
                'urn:' + this.props.urn,
                (doc) => {
                    this.viewer.tearDown(); // Limpia el visor actual
                    this.viewer.start(); // Reinicia el visor
                    this.viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry(), {
                        onLoadFinished: () => {
                            console.log("Modelo cargado correctamente");
                            this.updateViewerState({});
                            this.cargarConfiguracion();
                            this.onModelLoaded(); // Llama a onModelLoaded después de cargar el modelo
                        },


                        onLoadError: (errorCode, errorMessage, statusCode, statusText) => {
                            console.log("Error al cargar el modelo:", errorCode, errorMessage, statusCode, statusText);
                        }
                    });
                },
                (code, message, errors) => {
                    console.log("no se pudo cargar debe traducir");
                    toast.info('No se pudo abrir, proceso de traducción del archivo iniciado');
                    console.log(code, message, errors);
                }
            );
        }
    };

    onModelLoaded = async () => {
        console.log("modelo cargado, busco--2");
        try {
            console.log("modelo cargado, busco--");
            const propiedades = await this.obtenerPropiedadesModelo();
            console.log("Propiedades obtenidas para completar forms:", propiedades);
            // Espera a que ambas funciones asincrónicas se completen.
            const [idsConFecha, idsSinFecha] = await Promise.all([
              //  this.obtenerIdsConFecha(),
               /// this.obtenerIdsSinFecha()
            ]);
        
            // Actualiza el estado con los resultados obtenidos.
            //this.setState({ idsConFecha, idsSinFecha });
            
            this.cargarConfiguracion();
            await this.obtenerFiltros(this.props.urn).then(async () => {
                try {
                    console.log("proceso Id Barras Proyecto");
                    const idsBarras = await this.obtenerIdsBarras();
                    await  this.guardarIdsBarras();
                    if(!idsBarras.length ==0){
                        await this.generarTotalPesoPisos();
                        console.log("IDs2 de barras obtenidos:", idsBarras);
                        this.setState.idsBarraActual = idsBarras
                   
                    }
                    
                } catch (error) {
                    console.log("Error al obtener IDs de barras:", error);
                }
            });
        

        } catch (error) {
            console.log("Error al obtener IDs:", error);
        }
    };
    
    onViewerCameraChange = (event) => {
        // Manejar el cambio de la cámara del visor aquí si es necesario
    };

    onViewerSelectionChange = (event) => {
        // Manejar el cambio de la selección del visor aquí si es necesario
    };

    render() {
        return <div ref={this.container} style={{ position: 'relative', marginLeft: '5px', marginTop: '27px', width: '100%', height: '460px' }} />;
    }
}

ViewerProyectos.propTypes = {
    urn: PropTypes.string.isRequired,
    idUsuario: PropTypes.string, // Nueva prop idUsuario
    proyectoKey: PropTypes.string, // Nueva prop proyectoKey
    runtime: PropTypes.object
    
};

export default ViewerProyectos;
