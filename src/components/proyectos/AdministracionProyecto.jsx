import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, Tab, Form, Button, Table, Alert } from 'react-bootstrap';
import TabConfiguracion from '../configuracionVisualizador/TabConfiguracion';
import ListaReordenable from './ListaReordenable';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useActions } from '../../context/ProyectoContext';
import API_BASE_URL from '../../config';

const AdministracionProyecto = (proyectoKey, urn) => {
    const [activeKey, setActiveKey] = useState('informacionGeneral');
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [descripcionProyecto, setDescripcionProyecto] = useState('');
    const actions = useActions();
    const [usuariosNoAdmin, setUsuariosNoAdmin] = useState([]);
    const [usuariosAsignados, setUsuariosAsignados] = useState([]);
    const [usuariosAsignadosProyecto, setUsuariosAsignadosProyecto] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [barrasActual, setBarras] = useState([]);
    const [tickets, setTickets] = useState({});
    const [proyectos, setProyectos] = useState([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState({});
    const [niveles, setNiveles] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [dataStatus, setDataStatus] = useState({
        hasPesoPromedioGeneral: false,
        hasDiametroPromedioGeneral: false,
        hasPesoTotalProyecto: false,
        hasRespuestasDiametros: false,
        hasLongitudPromedioNivel: false
        // Puedes añadir más indicadores aquí si es necesario
    });

    const datosGenerados = Object.values(dataStatus).filter(Boolean).length;
    const handleReorder = (newOrder) => {
        setNiveles(newOrder);
    };

    const onSelect = (k) => {
        setActiveKey(k);
    };

    const getTabImage = (key) => {
        return activeKey === key ? `images/adminProyectoIcn.svg` : `images/adminProyectoIcn.svg`;
    };

    const tabStyle = {
        marginTop: '20px',
        marginLeft: '20px',
        height: '100%',
        width: '100%',
        overflow: 'auto',
    };

    const tabContentStyle = {
        backgroundColor: 'white',
        borderRadius: '0 20px 20px 20px',
        padding: '15px',
        height: '100%',
        overflowY: 'auto',
    };

    const tabHeaderStyle = {
        borderRadius: '30px 30px 0 0',
    };

    const botonEstilo = {
        backgroundColor: '#DA291C',
        borderRadius: '10px',
        color: 'white',
        marginTop: '25px',
        display: 'block',
        marginRight: '5px',
        marginBotom: '35px',
        paddingBotom: '35px',
    };

    const hasDataInResponse = (response, dataKey, expectedType) => {
        return (
          response.status === 'fulfilled' &&
          response.value &&
          response.value.data &&
          response.value.data[dataKey] != null &&
          (expectedType ? typeof response.value.data[dataKey] === expectedType : true)
        );
      };
      const hasArrayDataInResponse = (response, dataKey) => {
        return (
          response.status === 'fulfilled' &&
          response.value &&
          response.value.data &&
          Array.isArray(response.value.data[dataKey]) &&
          response.value.data[dataKey].length > 0
        );
      };
      useEffect(() => {
        const urn = proyectoKey.urn;
        if (!urn) {
          // Si urn es null o undefined, no ejecutamos checkAllData
          return;
        }
      
        const checkAllData = async () => {
          try {
            console.log("datos de urn:", urn);
      
            // Realizamos todas las llamadas a la API en paralelo
            const results = await Promise.allSettled([
              axios.get(`${API_BASE_URL}/api/pesoPromedioGeneral/${encodeURIComponent(urn)}`),
              axios.get(`${API_BASE_URL}/api/diametroPromedioGeneral/${encodeURIComponent(urn)}`),
              axios.get(`${API_BASE_URL}/api/getPesovsPedidos/${encodeURIComponent(urn)}`),
              axios.get(`${API_BASE_URL}/api/respuestasDiametros/${encodeURIComponent(urn)}`),
              axios.get(`${API_BASE_URL}/api/getLongitudPromedio/${encodeURIComponent(urn)}`),
              axios.get(`${API_BASE_URL}/api/getPesoPromedio/${encodeURIComponent(urn)}`) // Nueva llamada a la API
            ]);
      
            console.log("Resultados obtenidos:", results);
      
            // Funciones auxiliares para verificar si hay datos en las respuestas
            const hasDataInResponse = (response, dataKey, expectedType) => {
              return (
                response.status === 'fulfilled' &&
                response.value &&
                response.value.data &&
                response.value.data[dataKey] != null &&
                (expectedType ? typeof response.value.data[dataKey] === expectedType : true)
              );
            };
      
            const hasArrayDataInResponse = (response, dataKey) => {
              return (
                response.status === 'fulfilled' &&
                response.value &&
                response.value.data &&
                Array.isArray(response.value.data[dataKey]) &&
                response.value.data[dataKey].length > 0
              );
            };
      
            // Verificar si hay datos antes de actualizar el estado
            const hasPesoPromedioGeneral = hasDataInResponse(results[0], 'pesoPromedioGeneral', 'number');
            const hasDiametroPromedioGeneral = hasDataInResponse(results[1], 'diametroPromedio', 'number');
            const hasPesoTotalProyecto = hasDataInResponse(results[2], 'pesoTotalProyecto', 'number');
            const hasRespuestasDiametros = hasArrayDataInResponse(results[3], 'pesosPorPiso');
            const hasLongitudPromedioNivel = hasDataInResponse(results[4], 'longitudes', 'object');
            const hasPesoPromedioPisos = hasArrayDataInResponse(results[5], 'pesos'); // Nueva verificación
      
            // Ahora actualizamos el estado con los valores obtenidos
            setDataStatus({
              hasPesoPromedioGeneral,
              hasDiametroPromedioGeneral,
              hasPesoTotalProyecto,
              hasRespuestasDiametros,
              hasLongitudPromedioNivel,
              hasPesoPromedioPisos // Nueva variable de estado
            });
      
            // Mostrar los resultados en la consola
          //  console.log('Peso Promedio General:', hasPesoPromedioGeneral ? 'datos disponibles' : 'sin datos');
          //  console.log('Diámetro Promedio General:', hasDiametroPromedioGeneral ? 'datos disponibles' : 'sin datos');
          //  console.log('Peso Total del Proyecto:', hasPesoTotalProyecto ? 'datos disponibles' : 'sin datos');
         //   console.log('Respuestas Diámetros (Pesos Pisos Diámetro):', hasRespuestasDiametros ? 'datos disponibles' : 'sin datos');
         //   console.log('Longitud Promedio Nivel:', hasLongitudPromedioNivel ? 'datos disponibles' : 'sin datos');
         //   console.log('Pesos Promedio Pisos:', hasPesoPromedioPisos ? 'datos disponibles' : 'sin datos'); // Nuevo log
          } catch (error) {
            // En caso de error, establecemos los indicadores a false y mostramos el error
            console.error('Error al verificar los datos:', error);
      
            setDataStatus({
              hasPesoPromedioGeneral: false,
              hasDiametroPromedioGeneral: false,
              hasPesoTotalProyecto: false,
              hasRespuestasDiametros: false,
              hasLongitudPromedioNivel: false,
              hasPesoPromedioPisos: false // Nueva variable de estado
            });
          }
        };
      
        checkAllData();
      }, [proyectoKey.urn]);
      
    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`);
                const proyectos = await response.json();
                if (proyectos.length > 0) {
                    // Asegúrate de que cada proyecto tenga una 'urn' y un 'nombre'
                    setProyectos(
                        proyectos.map((proj) => ({
                            urn: proj.urn,
                            nombre: proj.objectKey,
                        }))
                    );
                }
            } catch (error) {
                console.error('Error al obtener la lista de proyectos:', error);
                toast.error('Error al cargar proyectos');
            }
        };

        fetchProyectos();
    }, []);

    const handleSelectProject = (e) => {
        const seleccionado = proyectos.find((proyecto) => proyecto.urn === e.target.value);
        if (seleccionado) {
            setProyectoSeleccionado(seleccionado);
        } else {
            setProyectoSeleccionado({});
        }
    };

    const transferirDatos = async () => {
        // Asegúrate de que no se está intentando transferir a la misma URN

        if (!proyectoSeleccionado) {
            toast.error('Debe seleccionar un proyecto al cual transferir los datos');
            return;
        }

        const confirmacion = window.confirm(
            `Está realmente seguro que desea transferir los datos desde  ${proyectoKey.proyectoKey} al proyecto ${proyectoSeleccionado.nombre}?`
        );
        if (!confirmacion) {
            return;
        }
        if (proyectoKey.urn === proyectoSeleccionado.urn) {
            toast.error('No puede transferir los datos de un proyecto al mismo.');
            return;
        }

        try {
            //console.log('Iniciando la transferencia de datos del modelo...');
            toast.info('Iniciando la transferencia de datos...');
            // Llamada a la API para transferir pedidos
            const responsePedidos = await fetch(`${API_BASE_URL}/api/transfierePedido`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn,
                }),
            });

            const dataPedidos = await responsePedidos.json();
            //console.log('Respuesta de transferencia de pedidos:', dataPedidos);
            toast.success('Pedidos  Transferidos.');
            // Llamada a la API para transferir adicionales de pedidos
            const responseAdicionales = await fetch(`${API_BASE_URL}/api/transfiereAdicionalesPedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn,
                }),
            });

            const dataAdicionales = await responseAdicionales.json();
            //console.log('Respuesta de transferencia de adicionales de pedidos:', dataAdicionales);
            toast.success('Pedidos Adicionales Transferidos.');
            // Notificar al usuario que la transferencia fue exitosa

            const responseVistas = await fetch(`${API_BASE_URL}/api/transfiereVistas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn,
                }),
            });

            const dataVistas = await responseVistas.json();
            //console.log('Respuesta de transferencia de vistas guardadas:', dataVistas);
            toast.success('Vistas Guardadas Transferidas.');
            const responseObjectProyectoPlan = await fetch(`${API_BASE_URL}/api/transfiereObjetoProyectoPlan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn,
                }),
            });

            const dataObjetoProyectoPlan = await responseObjectProyectoPlan.json();
            //console.log('Respuesta de transferencia de objeto proyecto plan:', dataObjetoProyectoPlan);
            toast.success('Objetos de Proyecto Plan Transferidos.');

            const responseUsuarioProyectoPerfil = await fetch(
                `${API_BASE_URL}/api/transferirUsuarioProyectoPerfil`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        URNconsulta: proyectoKey.urn,
                        URNreemplazo: proyectoSeleccionado.urn,
                    }),
                }
            );

            const dataUsuarioProyectoPerfil = await responseUsuarioProyectoPerfil.json();
            //console.log('Respuesta de transferencia de usuario proyecto perfil:', dataUsuarioProyectoPerfil);
            if (dataUsuarioProyectoPerfil.message) {
                toast.success(dataUsuarioProyectoPerfil.message);
            }

            toast.success('Los datos del proyecto han sido transferidos correctamente.');
        } catch (error) {
            console.error('Error al transferir datos del modelo:', error);
            toast.error('Error al transferir datos del modelo.');
        }
    };

    useEffect(() => {
        const obtenerUsuarios = async () => {
            const respuesta = await fetch(`${API_BASE_URL}/api/usuarios`);
            const usuarios = await respuesta.json();

            const usuariosNoAdmin = usuarios; //.filter(usuario => usuario.tipoUsuario.toLowerCase() !== "administrador");
            //console.log("listado de usuarios",usuariosNoAdmin);
            setUsuariosNoAdmin(usuariosNoAdmin);

            // Establece el usuario seleccionado inicialmente al primer usuario no administrador
            if (usuariosNoAdmin.length > 0) {
                setUsuarioSeleccionado(usuariosNoAdmin[0].idUsu);
            }

            const usuariosAsignados = usuarios.filter((usuario) => usuario.asignadoAlProyecto);
            setUsuariosAsignados(usuariosAsignados);
        };

        obtenerUsuarios();
    }, []);

    const obtenerUsuariosAsignados = async () => {
        try {
            const respuesta = await fetch(
                `${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(proyectoKey.urn)}`
            );
            //console.log("Respuesta usuarios urn" + proyectoKey.urn, respuesta);
            if (!respuesta.ok) {
                throw new Error('Error al obtener usuarios asignados');
            }

            const usuariosAsignadosRespuesta = await respuesta.json();
            //console.log("Respuesta usuarios urn asignados", usuariosAsignadosRespuesta);

            const usuariosDetallados = await Promise.all(
                usuariosAsignadosRespuesta.map(async (usuario) => {
                    try {
                        const resp = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.idUsuario}`);
                        //console.log("Respuesta consulta Id usuario", resp);

                        if (!resp.ok) {
                            //console.log('Error al obtener detalles del usuario con ID:', usuario.idUsuario);
                            return null; // Retornar null o un objeto especial para indicar el fallo
                        }

                        const userData = await resp.json();
                        //console.log("Datos de usuario con asignación", userData);
                        return {
                            idUsu: usuario.idUsuario,
                            fullname: userData.fullname,
                            username: userData.username,
                            tipoUsuario: usuario.tipoUsuario || '',
                        };
                    } catch (error) {
                        console.error(
                            'Error en la consulta de detalles para el usuario:',
                            usuario.idUsuario,
                            error
                        );
                        return null; // Manejar el error pero permitir que el proceso continúe
                    }
                })
            );

            // Filtrar resultados nulos y errores
            const usuariosFiltrados = usuariosDetallados.filter((usuario) => usuario !== null);
            //console.log("Usuarios para asignación", usuariosFiltrados);
            setUsuariosAsignadosProyecto(usuariosFiltrados);
        } catch (error) {
            console.error('Error al obtener usuarios asignados:', error);
            // toast.error('Ocurrió un error al obtener usuarios asignados');
        }
    };

    useEffect(() => {
        obtenerUsuariosAsignados();

        setNiveles(['']);
    }, [proyectoKey.urn]); // Se ejecuta al montar y cuando cambia el urn del proyecto seleccionado

    const guardarOrdenNiveles = async () => {
        const listaNiveles = niveles.map((nivel, index) => ({
            nombre: nivel.content, // Asumiendo que 'content' corresponde al nombre del nivel
            posicion: index + 1, // La posición podría ser el índice en el arreglo + 1
        }));

        try {
            let urn = proyectoKey.urn;
            const response = await fetch(`${API_BASE_URL}/api/ordenNiveles`, {
                method: 'POST', // Utiliza POST para enviar los datos
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urn, listaNiveles }), // Enviar la URN y los niveles formateados
            });
            //console.log("respuesta intento consulta",response);
            if (!response.ok) {
                throw new Error('Error al guardar los niveles');
            }

            const responseData = await response.json();
            //console.log('Orden de niveles guardado:', responseData);
            alert('Orden de niveles actualizado correctamente.');
        } catch (error) {
            console.error('Error al guardar orden de niveles:', error);
            alert('Error al guardar los niveles.');
        }
    };

    const buscarOrdenNiveles = async () => {
        //console.log("intento  guardar orden actual");
        try {
            const ordenNivelesResponse = await fetch(
                `${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(proyectoKey.urn)}`
            );
            //console.log("respuesta ordenes niveles",ordenNivelesResponse);
            const ordenNivelesData = await ordenNivelesResponse.json();
            //console.log("datos respuessta server orden niveles",ordenNivelesData);

            if (ordenNivelesData.mensaje == 'sin registros') {
                let filtrosOrdenes = await actions.obtenerFiltrosOrden(proyectoKey.urn);
                //console.log("filtros para ordenar", filtrosOrdenes);

                const orderedKeys = Object.keys(filtrosOrdenes).sort((a, b) => {
                    // Verificar si ambas claves son numéricas
                    const isNumA = !isNaN(a);
                    const isNumB = !isNaN(b);
                    if (isNumA && isNumB) {
                        // Orden numérico si ambas claves son números
                        return parseInt(a, 10) - parseInt(b, 10);
                    } else if (!isNumA && !isNumB) {
                        // Orden alfabético si ninguna de las claves es un número
                        return a.localeCompare(b);
                    } else {
                        // Asegurarse de que los números vengan primero
                        return isNumA ? -1 : 1;
                    }
                });

                // Transformar los filtros en la forma deseada
                const nivelesActualizados = orderedKeys.map((key, index) => ({
                    id: `p${index}`, // Usar el índice como parte del id para evitar problemas con llaves duplicadas
                    content: ` ${key}`, // Usa el valor de key original para el content
                }));

                //console.log("Nuevos niveles:", nivelesActualizados);
                setNiveles(nivelesActualizados);
            } else {
                //console.log("filtros para ordenar", ordenNivelesData);

                // Cargar los filtros directamente sin ordenar
                const nivelesActualizados = ordenNivelesData.listaNiveles.map((filtro, index) => ({
                    id: `p${index}`,
                    content: filtro.nombre, // Asumiendo que los filtros vienen como un array de objetos
                }));

                //console.log("Nuevos niveles después de obtener filtros:", nivelesActualizados);
                setNiveles(nivelesActualizados);
            }
        } catch (error) {
            console.error('Error al obtener niveles o detalles de barras:', error);
            //  toast.error('Error al cargar datos de niveles o barras');
        }
    };

    const DiametroEquivalenteLargosIguales = async (urn) => {
        try {
            // Llamada a la API para obtener datos
            const response = await fetch(`${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`);
            if (!response.ok) throw new Error('Error al obtener datos de barras');

            const barras = await response.json();
            //console.log("barras recibidas", barras);
            const resultado = {};
            if (!barras.detalles || !Array.isArray(barras.detalles)) {
                throw new Error('Datos de barras no están en el formato esperado o están vacíos');
            }

            // Agrupar por nombreFiltro2
            barras.detalles.forEach((barra) => {
                const claveFiltro2 = barra.nombreFiltro2;
                if (!resultado[claveFiltro2]) {
                    resultado[claveFiltro2] = {};
                }

                // Subgrupos por longitudTotal (en metros)
                const longitudEnMetros = barra.longitudTotal / 100;
                const claveLongitud = `${longitudEnMetros}`;
                if (!resultado[claveFiltro2][claveLongitud]) {
                    resultado[claveFiltro2][claveLongitud] = {
                        sumatoriaLargos: 0,
                        sumatoriaDiametrosCuadradoPorLargo: 0,
                    };
                }

                resultado[claveFiltro2][claveLongitud].sumatoriaLargos += barra.longitudTotal;
                resultado[claveFiltro2][claveLongitud].sumatoriaDiametrosCuadradoPorLargo +=
                    barra.diametroBarra ** 2 * barra.longitudTotal;
            });

            // Calcular el diámetro equivalente para cada grupo
            Object.keys(resultado).forEach((filtro2) => {
                Object.keys(resultado[filtro2]).forEach((grupo) => {
                    const datosGrupo = resultado[filtro2][grupo];
                    const diametroEquivalente = Math.sqrt(
                        datosGrupo.sumatoriaDiametrosCuadradoPorLargo / datosGrupo.sumatoriaLargos
                    );
                    resultado[filtro2][grupo].diametroEquivalente = diametroEquivalente;
                });
            });

            //console.log("Resultado final de Diametro Equivalente:", resultado);
            await fetch(`${API_BASE_URL}/api/diametroequivalente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urn, filtros2: resultado }),
            });

            //console.log("Resultado final de Diametro Equivalente:", resultado);
            return resultado;
        } catch (error) {
            console.error('Error en DiametroEquivalenteLargosIguales:', error);
            toast.error('Error al procesar los datos de diámetros equivalentes');
        }
    };

    const LongitudPromedio = async (urn) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`);
            if (!response.ok) {
                throw new Error('Error al obtener los datos de las barras');
            }
    
            const data = await response.json();
            console.log('Datos para longitudes:', data);
            if (!data || !data.detalles || data.detalles.length === 0) {
                return {}; // Retornar un objeto vacío si no hay datos
            }
    
            const detalles = data.detalles;
            const resultados = {};
    
            // Agrupar y calcular longitud promedio por nombreFiltro2
            detalles.forEach((barra) => {
                const { nombreFiltro2, longitudTotal, cantidad } = barra;
    
                // Asegurarse de que longitudTotal y cantidad sean números válidos
                const longitudTotalNum = parseFloat(longitudTotal);
                const cantidadNum = parseFloat(cantidad);
    
                if (isNaN(longitudTotalNum) || isNaN(cantidadNum)) {
                 //    console.warn(`Datos inválidos para la barra: ${JSON.stringify(barra)}`);
                    return; // Omitir este elemento
                }
    
                if (!resultados[nombreFiltro2]) {
                    resultados[nombreFiltro2] = { totalLongitud: 0, count: 0 };
                }
                resultados[nombreFiltro2].totalLongitud += longitudTotalNum;
                resultados[nombreFiltro2].count += cantidadNum;
            });
    
            // Calcular el promedio y guardar en un nuevo objeto
            const promedios = {};
            Object.keys(resultados).forEach((key) => {
                const { totalLongitud, count } = resultados[key];
               //  console.log('Valores para cálculo de longitud promedio:', totalLongitud, count);
    
                if (isNaN(totalLongitud) || isNaN(count) || count === 0) {
                    console.warn(`No se puede calcular el promedio para ${key}: totalLongitud o count inválidos`);
                    promedios[key] = null; // O manejar según corresponda
                } else {
                    promedios[key] = totalLongitud / count;
                }
               //  console.log(`Promedio para ${key}: ${promedios[key]}`);
            });
    
            const saveResponse = await fetch(`${API_BASE_URL}/api/crearLongitudPromedio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urn, longitudes: promedios }),
            });
    
            if (!saveResponse.ok) {
                throw new Error('Error al guardar los promedios de longitud');
            }
    
            const saveResult = await saveResponse.json();
           // console.log('Promedios de longitud guardados:', saveResult);
            return promedios;
        } catch (error) {
            console.error('Error al obtener o procesar los datos de las barras:', error);
            return null;
        }
    };

    const guardarDatosModelo = async () => {
        //console.log('El nombre del proyecto es:');
        toast.info('Inicio de proceso de Cálculo de datos estadísticos del proyecto, el proceso puuede tomar algunos minutos...');
        const val = await actions.generarTotalPesoPisos(proyectoKey.urn);
        //console.log("resultado generar TotalPisos", val);
        setTickets((prev) => ({ ...prev, 'Peso por Piso': 'Completado' }));
        toast.info('1 de 6 completado', { toastId: 'estadisticagenerales' });
        await actions.porcentajePedidoTotal(proyectoKey.urn);
        setTickets((prev) => ({ ...prev, 'Porcentaje Pedidos': 'Completado' }));
        toast.info('2 de 6 completado', { toastId: 'estadisticagenerales' });
        await actions.PesoPromedio(proyectoKey.urn);
        setTickets((prev) => ({ ...prev, 'Pesos Promedio': 'Completado' }));
        toast.info('3 de 6 completado', { toastId: 'estadisticagenerales' });
        await actions.PesoPromedioGeneral(proyectoKey.urn);
        setTickets((prev) => ({ ...prev, 'Pesos Promedio General': 'Completado' }));
        toast.info('4 de 6 completado', { toastId: 'estadisticagenerales' });
        await actions.diametroPromedioGeneral(proyectoKey.urn);
        setTickets((prev) => ({ ...prev, 'diametro Promedio barras General': 'Completado' }));
        toast.info('5 de 6 completado', { toastId: 'estadisticagenerales' });
        const promediosLongitud = await LongitudPromedio(proyectoKey.urn);
        console.log("Promedios de longitud por nombreFiltro2:", promediosLongitud);
        toast.info('6 de 6 completado, proceso terminado', { toastId: 'estadisticagenerales' });
        setTickets((prev) => ({ ...prev, 'Longitud Promedio': 'Completado' }));

        const resultadoDiametro = await DiametroEquivalenteLargosIguales(proyectoKey.urn);
        //console.log("Resultados de Diametro Equivalente por Largos Iguales:", resultadoDiametro);
        setTickets((prev) => ({ ...prev, 'Diametro Equivalente': 'Completado' }));
    };

    const asignarUsuarioAProyecto = (e) => {
        setUsuarioSeleccionado(e.target.value);
    };

    const desasociarUsuario = async (idUsuario) => {
        try {
            const confirmado = window.confirm(
                '¿Estás seguro de que deseas quitar este usuario del proyecto?'
            );
            if (!confirmado) {
                return;
            }

            const respuesta = await fetch(
                `${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(
                    proyectoKey.urn
                )}/${idUsuario}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // Aquí puedes añadir headers adicionales, como tokens de autenticación si es necesario
                    },
                }
            );

            if (!respuesta.ok) {
                throw new Error('No se pudo desasociar el usuario del proyecto');
            }

            toast.success('Usuario desasociado con éxito');

            setUsuariosAsignadosProyecto(
                usuariosAsignadosProyecto.filter((usuario) => usuario.idUsu !== idUsuario)
            );
        } catch (error) {
            console.error('Error al desasociar el usuario del proyecto:', error);
            toast.error('Ocurrió un error al desasociar el usuario del proyecto');
        }
    };

    const agregarUsuario = async () => {
        if (isAddingUser) return;
        if (!usuarioSeleccionado || tipoUsuario === '' || tipoUsuario === '-1') {
            toast.error('Seleccione un usuario y tipo de usuario antes de agregar.');
            return;
        }
        const usuarioSeleccionadoId = Number(usuarioSeleccionado);
        console.log('el usuario seleccionado (convertido a número si necesario)', usuarioSeleccionadoId);

        const usuarioEncontrado = usuariosNoAdmin.find(
            (usuario) => Number(usuario.idUsu) === usuarioSeleccionadoId
        );
        if (!usuarioEncontrado) {
            toast.error('Usuario no encontrado.');
            return;
        }

        setIsAddingUser(true);
        try {
            const payload = {
                idUsuario: usuarioEncontrado.idUsu,
                urn: proyectoKey.urn, //
                proyectoKey: proyectoKey.proyectoKey,
                tipoUsuario: tipoUsuario, //
            };
            //console.log("datos enviados",payload);
            // Llamada a la API para asignar el usuario al proyecto
            const respuesta = await fetch(`${API_BASE_URL}/api/asignarUsuarioProyecto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Incluye cualquier otro header necesario, como tokens de autenticación
                },
                body: JSON.stringify(payload),
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo asignar el usuario al proyecto');
            }

            const usuarioProyectoAsignado = await respuesta.json();
            //console.log('Usuario asignado con éxito:', usuarioProyectoAsignado);
            toast.success('Usuario asignado con éxito');
            obtenerUsuariosAsignados();
            // Reset the form
            setUsuarioSeleccionado('');
            setTipoUsuario('');
        } catch (error) {
            console.error('Error al asignar el usuario al proyecto:', error);
            toast.error('Ocurrió un error al asignar el usuario al proyecto');
        } finally {
            setIsAddingUser(false);
        }
    };

    return (
        <div style={tabStyle}>
            <Tabs
                defaultActiveKey="informacionGeneral"
                id="tab-administracion-proyecto"
                onSelect={onSelect}
                style={tabHeaderStyle}
            >
                <Tab
                    eventKey="informacionGeneral"
                    title={
                        <span>
                            <img src={getTabImage('informacionGeneral')} alt="" />
                            Proyecto
                        </span>
                    }
                >
                    <div style={tabContentStyle}>
                        <TabConfiguracion urn={proyectoKey.urn} />
                        <div style={{ marginLeft: '40px' }}>
                            <div className="row">
                                <div className="col-4">
                                    <Form.Label>
                                        Proyecto al cual se transferirán los datos
                                    </Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={proyectoSeleccionado.urn || ''}
                                        onChange={handleSelectProject}
                                    >
                                        <option value="">Seleccione un proyecto...</option>
                                        {proyectos.map((proyecto) => (
                                            <option key={proyecto.urn} value={proyecto.urn}>
                                                {proyecto.nombre}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </div>

                                <div className="col-4">
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            marginLeft: '50px',
                                        }}
                                    >
                                        <Form.Label>
                                            Extracción de Información / Cálculo Estadísticas
                                        </Form.Label>

                                        <Button
                                            onClick={guardarDatosModelo}
                                            style={{ ...botonEstilo, marginTop: '10px' }}
                                        >
                                            Extraer Información
                                        </Button>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold' }}>
                                            {`${datosGenerados} de 6 indicadores generados`}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-4"></div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <Button style={botonEstilo} onClick={transferirDatos}>
                                        Transferir Datos
                                    </Button>
                                </div>
                                <div className="col-4"></div>
                                <div className="col-4"></div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    {Object.entries(tickets).map(([task, status]) => (
                                        <Alert key={task} variant="success">
                                            {task}: {status}
                                        </Alert>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab
                    eventKey="configuracionAdicional"
                    title={
                        <span>
                            <img src={getTabImage('configuracionAdicional')} alt="" /> Usuarios
                        </span>
                    }
                >
                    <div style={tabContentStyle}>
                        <Form.Group className="mb-3">
                            <Form.Label>Asignación de Usuarios a Proyecto</Form.Label>
                            <Form.Control
                                as="select"
                                value={usuarioSeleccionado}
                                onChange={asignarUsuarioAProyecto}
                                disabled={isAddingUser}
                            >
                                <option value="">Seleccione un usuario...</option>
                                {usuariosNoAdmin.map((usuario) => (
                                    <option key={usuario.idUsu} value={usuario.idUsu}>
                                        {usuario.fullname} / {usuario.username}
                                    </option>
                                ))}
                            </Form.Control>
                            <Form.Control
                                as="select"
                                value={tipoUsuario}
                                onChange={(e) => setTipoUsuario(e.target.value)}
                                disabled={isAddingUser}
                            >
                                <option value="-1">Seleccione un tipo...</option>
                                <option value="Constructor">Constructor</option>
                                <option value="Fabricante">Fabricante</option>
                                <option value="ITO">ITO</option>
                                <option value="Cliente">Cliente</option>
                                <option value="Invitado">Invitado</option>
                            </Form.Control>
                            <Button
                                style={{ ...botonEstilo, marginTop: '10px' }}
                                onClick={agregarUsuario}
                                disabled={isAddingUser}
                            >
                                {isAddingUser ? 'Agregando...' : 'Agregar Usuario'}
                            </Button>
                        </Form.Group>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosAsignadosProyecto.map((usuario) => (
                                    <tr key={usuario.idUsu}>
                                        <td>
                                            {usuario.fullname}/{usuario.username}
                                        </td>
                                        <td>
                                            {usuario.tipoUsuario ? usuario.tipoUsuario : 'No asignado'}
                                        </td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                onClick={() => desasociarUsuario(usuario.idUsu)}
                                            >
                                                Quitar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Tab>
                <Tab eventKey="listaReordenable" title="Orden de Niveles">
                    <div style={tabContentStyle}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}
                        >
                            <Button
                                onClick={buscarOrdenNiveles}
                                style={{
                                    backgroundColor: '#DA291C',
                                    borderRadius: '10px',
                                    color: 'white',
                                    marginRight: '5px',
                                }}
                            >
                                Buscar Orden Actual
                            </Button>
                            <Button
                                onClick={guardarOrdenNiveles}
                                style={{
                                    backgroundColor: '#DA291C',
                                    borderRadius: '10px',
                                    color: 'white',
                                }}
                            >
                                Guardar Niveles con Orden Actual
                            </Button>
                        </div>
                        <ListaReordenable items={niveles} onReorder={handleReorder} />
                    </div>
                </Tab>
                <Tab eventKey="maestroFierros" title="Maestro de Fierros">
                    <div style={tabContentStyle}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}
                        ></div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default AdministracionProyecto;
