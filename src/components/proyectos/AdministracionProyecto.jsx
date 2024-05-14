import React, { useState,useEffect } from 'react';
import { Tabs, Tab, Form, Button, Table, Alert } from 'react-bootstrap';
import TabConfiguracion from '../configuracionVisualizador/TabConfiguracion';
import ListaReordenable from './ListaReordenable';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useActions } from '../../context/ProyectoContext';
import API_BASE_URL from '../../config';
const AdministracionProyecto = (proyectoKey,urn) => {
    const [activeKey, setActiveKey] = useState('informacionGeneral');
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [descripcionProyecto, setDescripcionProyecto] = useState('');
    const actions = useActions();
    const [usuariosNoAdmin, setUsuariosNoAdmin] = useState([]);
    const [usuariosAsignados, setUsuariosAsignados] = useState([]);
    const [usuariosAsignadosProyecto, setUsuariosAsignadosProyecto] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
    const [barrasActual,setBarras] =  useState([]);
    const [tickets, setTickets] = useState({});
    const [proyectos, setProyectos] = useState([]);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState({});
    const [niveles, setNiveles] = useState([ ]);


      const handleReorder = (newOrder) => {
        console.log('Nuevo orden de proyectos:', newOrder);
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
        height: '485px',
        width:'100%',
        overflow: 'auto'
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
        marginTop: '25px', // Espacio adicional debajo del botón
        display: 'block', // Hace que el botón sea un bloque
        marginLeft: 'auto', // Margen automático a la izquierda
        marginRight: '35px', // Margen automático a la derecha
        marginBotom: '35px',
        paddingBotom: '35px'
    };
    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`);
                const proyectos = await response.json();
                if (proyectos.length > 0) {
                    // Asegúrate de que cada proyecto tenga una 'urn' y un 'nombre'
                    setProyectos(proyectos.map(proj => ({
                        urn: proj.urn,
                        nombre: proj.objectKey
                    })));
                }
            } catch (error) {
                console.error('Error al obtener la lista de proyectos:', error);
                toast.error('Error al cargar proyectos');
            }
        };
    
        fetchProyectos();
    }, []);
    

    const handleSelectProject = (e) => {
        const seleccionado = proyectos.find(proyecto => proyecto.urn === e.target.value);
        if (seleccionado) {
            setProyectoSeleccionado(seleccionado);
        } else {
            setProyectoSeleccionado({});
        }
    };
    
    const transferirDatos = async () => {
        // Asegúrate de que no se está intentando transferir a la misma URN
         
         if ( !proyectoSeleccionado ) {
            toast.error("Debe seleccionar un proyecto al cual transferir los datos");
            return;
        }

        const confirmacion = window.confirm(`Está realmente seguro que desea transferir los datos desde  ${proyectoKey.proyectoKey} al proyecto ${proyectoSeleccionado.nombre}?`);
        if (!confirmacion) {
                return;
        }
        if (proyectoKey.urn === proyectoSeleccionado.urn) {
            toast.error("No puede transferir los datos de un proyecto al mismo.");
            return;
        }
      
    
        try {
            console.log('Iniciando la transferencia de datos del modelo...');
            toast.info("Iniciando la transferencia de datos...");
            // Llamada a la API para transferir pedidos
            const responsePedidos = await fetch(`${API_BASE_URL}/api/transfierePedido`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn
                })
            });
    
            const dataPedidos = await responsePedidos.json();
            console.log('Respuesta de transferencia de pedidos:', dataPedidos);
            toast.success("Pedidos  Transferidos.");
            // Llamada a la API para transferir adicionales de pedidos
            const responseAdicionales = await fetch(`${API_BASE_URL}/api/transfiereAdicionalesPedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn
                })
            });
    
            const dataAdicionales = await responseAdicionales.json();
            console.log('Respuesta de transferencia de adicionales de pedidos:', dataAdicionales);
            toast.success("Pedidos Adicionales Transferidos.");
            // Notificar al usuario que la transferencia fue exitosa


            const responseVistas = await fetch(`${API_BASE_URL}/api/transfiereVistas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn
                })
            });
    
            const dataVistas = await responseVistas.json();
            console.log('Respuesta de transferencia de vistas guardadas:', dataVistas);
            toast.success("Vistas Guardadas Transferidas.");
            const responseObjectProyectoPlan = await fetch(`${API_BASE_URL}/api/transfiereObjetoProyectoPlan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn
                })
            });
    
            const dataObjetoProyectoPlan = await responseObjectProyectoPlan.json();
            console.log('Respuesta de transferencia de objeto proyecto plan:', dataObjetoProyectoPlan);
            toast.success("Objetos de Proyecto Plan Transferidos.");

            const responseUsuarioProyectoPerfil = await fetch(`${API_BASE_URL}/api/transferirUsuarioProyectoPerfil`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    URNconsulta: proyectoKey.urn,
                    URNreemplazo: proyectoSeleccionado.urn
                })
            });
    
            const dataUsuarioProyectoPerfil = await responseUsuarioProyectoPerfil.json();
            console.log('Respuesta de transferencia de usuario proyecto perfil:', dataUsuarioProyectoPerfil);
            if(dataUsuarioProyectoPerfil.message) {
                toast.success(dataUsuarioProyectoPerfil.message);
            }

            toast.success("Los datos del proyecto han sido transferidos correctamente.");
    
        } catch (error) {
            console.error('Error al transferir datos del modelo:', error);
            toast.error('Error al transferir datos del modelo.');
        }
    };
    
    useEffect(() => {
        const obtenerUsuarios = async () => {
            const respuesta = await fetch(`${API_BASE_URL}/api/usuarios`);
            const usuarios = await respuesta.json();
            
            const usuariosNoAdmin = usuarios.filter(usuario => usuario.tipoUsuario.toLowerCase() !== "administrador");
            console.log("listado de usuarios",usuariosNoAdmin);
            setUsuariosNoAdmin(usuariosNoAdmin);
    
            // Establece el usuario seleccionado inicialmente al primer usuario no administrador
            if (usuariosNoAdmin.length > 0) {
                setUsuarioSeleccionado(usuariosNoAdmin[0].idUsu);
            }
    
            const usuariosAsignados = usuarios.filter(usuario => usuario.asignadoAlProyecto);
            setUsuariosAsignados(usuariosAsignados);
        };
    
        obtenerUsuarios();
    }, []);

    const obtenerUsuariosAsignados = async () => {
        try {
            const respuesta = await fetch(`${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(proyectoKey.urn)}`);
             console.log("respuesta usuarios urn"+proyectoKey.urn,respuesta);
             if (!respuesta.ok) {
                throw new Error('Error al obtener usuarios asignados');
            }
            
            const usuariosAsignadosRespuesta = await respuesta.json();
            console.log("respuesta usuarios urn asignados", usuariosAsignadosRespuesta);
    
            const usuariosDetallados = await Promise.all(
                usuariosAsignadosRespuesta.map(async (usuario) => {
                    const resp = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.idUsuario}`);
                    if(!resp.ok) {
                        throw new Error('Error al obtener detalles del usuario');
                    }
                    const userData = await resp.json();
                    return {
                        idUsu: usuario.idUsuario,
                        fullname: userData.fullname,
                        username: userData.username,
                    };
                })
            );
            setUsuariosAsignadosProyecto(usuariosDetallados);
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
            posicion: index + 1      // La posición podría ser el índice en el arreglo + 1
        }));
    
        try {
            let urn = proyectoKey.urn;
            const response = await fetch(`${API_BASE_URL}/api/ordenNiveles`, {
                method: 'POST',   // Utiliza POST para enviar los datos
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urn, listaNiveles })  // Enviar la URN y los niveles formateados
            });
            console.log("respuesta intento consulta",response);
            if (!response.ok) {
                throw new Error('Error al guardar los niveles');
            }
    
            const responseData = await response.json();
            console.log('Orden de niveles guardado:', responseData);
            alert('Orden de niveles actualizado correctamente.');
        } catch (error) {
            console.error('Error al guardar orden de niveles:', error);
            alert('Error al guardar los niveles.');
        }
    };
    
    const buscarOrdenNiveles = async() =>{
        console.log("intento  guardar orden actual");
        try {
            const ordenNivelesResponse = await fetch(`${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(proyectoKey.urn)}`);
            console.log("respuesta ordenes niveles",ordenNivelesResponse);
            const ordenNivelesData = await ordenNivelesResponse.json();
            console.log("datos respuessta server orden niveles",ordenNivelesData);
          
            if(ordenNivelesData.mensaje == "sin registros"){
                let filtrosOrdenes = await actions.obtenerFiltrosOrden(proyectoKey.urn);
                 console.log("filtros para ordenar", filtrosOrdenes);

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
                    content: ` ${key}` // Usa el valor de key original para el content
                }));

                console.log("Nuevos niveles:", nivelesActualizados);
                setNiveles(nivelesActualizados);
            }
            else{
                
                console.log("filtros para ordenar", ordenNivelesData);
    
                // Cargar los filtros directamente sin ordenar
                const nivelesActualizados = ordenNivelesData.listaNiveles.map((filtro, index) => ({
                    id: `p${index}`,
                    content: filtro.nombre // Asumiendo que los filtros vienen como un array de objetos
                }));
    
                console.log("Nuevos niveles después de obtener filtros:", nivelesActualizados);
                setNiveles(nivelesActualizados);
                
            
            }
        } catch (error) {
            console.error('Error al obtener niveles o detalles de barras:', error);
          //  toast.error('Error al cargar datos de niveles o barras');
        }
    }
    const DiametroEquivalenteLargosIguales = async (urn) => {
        try {
            // Llamada a la API para obtener datos
            const response = await fetch(`${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`);
            if (!response.ok) throw new Error('Error al obtener datos de barras');
            
            const barras = await response.json();
            console.log("barras recibidas", barras);
            const resultado = {};
            if (!barras.detalles || !Array.isArray(barras.detalles)) {
                throw new Error('Datos de barras no están en el formato esperado o están vacíos');
            }
    
            // Agrupar por nombreFiltro2
            barras.detalles.forEach(barra => {
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
                        sumatoriaDiametrosCuadradoPorLargo: 0
                    };
                }
    
                resultado[claveFiltro2][claveLongitud].sumatoriaLargos += barra.longitudTotal;
                resultado[claveFiltro2][claveLongitud].sumatoriaDiametrosCuadradoPorLargo += (barra.diametroBarra ** 2) * barra.longitudTotal;
            });
    
            // Calcular el diámetro equivalente para cada grupo
            Object.keys(resultado).forEach(filtro2 => {
                Object.keys(resultado[filtro2]).forEach(grupo => {
                    const datosGrupo = resultado[filtro2][grupo];
                    const diametroEquivalente = Math.sqrt(datosGrupo.sumatoriaDiametrosCuadradoPorLargo / datosGrupo.sumatoriaLargos);
                    resultado[filtro2][grupo].diametroEquivalente = diametroEquivalente;
                });
            });
    
            console.log("Resultado final de Diametro Equivalente:", resultado);
            await fetch(`${API_BASE_URL}/api/diametroequivalente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urn, filtros2: resultado })
            });
    
            console.log("Resultado final de Diametro Equivalente:", resultado);
            return resultado;
           
        } catch (error) {
            console.error("Error en DiametroEquivalenteLargosIguales:", error);
            toast.error('Error al procesar los datos de diámetros equivalentes');
        }
    };
    
    const LongitudPromedio = async (urn) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bar data');
            }
    
            const data = await response.json();
            if (!data || !data.detalles || data.detalles.length === 0) {
                console.log("No hay detalles disponibles para calcular el promedio.");
                return {}; // Retornar un objeto vacío si no hay datos
            }
           
            const detalles = data.detalles;
            const resultados = {};
    
            // Agrupar y calcular longitud promedio por nombreFiltro2
            detalles.forEach(barra => {
                const { nombreFiltro2, longitudTotal } = barra;
                if (!resultados[nombreFiltro2]) {
                    resultados[nombreFiltro2] = { totalLongitud: 0, count: 0 };
                }
                resultados[nombreFiltro2].totalLongitud += longitudTotal;
                resultados[nombreFiltro2].count++;
            });
    
            // Calcular el promedio y guardar en un nuevo objeto
            const promedios = {};
            Object.keys(resultados).forEach(key => {
                const { totalLongitud, count } = resultados[key];
                promedios[key] = totalLongitud / count;
            });
    
            console.log("Promedios de longitud por nombreFiltro2:", promedios);
            const saveResponse = await fetch(`${API_BASE_URL}/api/crearLongitudPromedio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urn, longitudes: promedios })
            });
    
            if (!saveResponse.ok) {
                throw new Error('Failed to save length averages');
            }
    
            const saveResult = await saveResponse.json();
            console.log('Saved length averages:', saveResult);
            return promedios;
    
        } catch (error) {
            console.error("Error fetching or processing bar data:", error);
            return null; // Retornar null o manejar el error según corresponda en la función que llama
        }
    };
    
    
    
   
   
    
  
    const guardarDatosModelo = async () => {
        console.log('El nombre del proyecto es:');

        const val = await actions.generarTotalPesoPisos(proyectoKey.urn);
        console.log("resultado generar TotalPisos", val);
        setTickets(prev => ({ ...prev, "Peso por Piso": "Completado" }));
        
        await actions.porcentajePedidoTotal(proyectoKey.urn);
        setTickets(prev => ({ ...prev, "Porcentaje Pedidos": "Completado" }));
        
        await actions.PesoPromedio(proyectoKey.urn);
        setTickets(prev => ({ ...prev, "Pesos Promedio": "Completado" }));

        await actions.PesoPromedioGeneral(proyectoKey.urn);
        setTickets(prev => ({ ...prev, "Pesos Promedio General": "Completado" }));


        await actions.diametroPromedioGeneral(proyectoKey.urn);
        setTickets(prev => ({ ...prev, "diametro Promedio barras General": "Completado" }));
        //
        const promediosLongitud = await LongitudPromedio(proyectoKey.urn);
        console.log("Promedios de longitud por nombreFiltro2:", promediosLongitud);

        setTickets(prev => ({ ...prev, "Longitud Promedio": "Completado" }));
        
        const resultadoDiametro = await DiametroEquivalenteLargosIguales(proyectoKey.urn);
        console.log("Resultados de Diametro Equivalente por Largos Iguales:", resultadoDiametro);
        setTickets(prev => ({ ...prev, "Diametro Equivalente": "Completado" }));
    };

    const asignarUsuarioAProyecto = (e) => {
        setUsuarioSeleccionado(e.target.value);
    };
    const desasociarUsuario = async (idUsuario) => {
        try {
            const confirmado = window.confirm("¿Estás seguro de que deseas quitar este usuario del proyecto?");
            if (!confirmado) {
                return;
            }
    
            const respuesta = await fetch(`${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(proyectoKey.urn)}/${idUsuario}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Aquí puedes añadir headers adicionales, como tokens de autenticación si es necesario
                },
            });
    
            if (!respuesta.ok) {
                throw new Error('No se pudo desasociar el usuario del proyecto');
            }
    
            toast.success('Usuario desasociado con éxito');
            
            
            setUsuariosAsignadosProyecto(usuariosAsignadosProyecto.filter(usuario => usuario.idUsu !== idUsuario));
        } catch (error) {
            console.error('Error al desasociar el usuario del proyecto:', error);
            toast.error('Ocurrió un error al desasociar el usuario del proyecto');
        }
    };
    
    const agregarUsuario = async () => {
        if (!usuarioSeleccionado) {
            toast.error("Seleccione un usuario antes de agregar.");
            return;
        }
        const usuarioSeleccionadoId = Number(usuarioSeleccionado);
        console.log("el usuario seleccionado (convertido a número si necesario)", usuarioSeleccionadoId);
    
        const usuarioEncontrado = usuariosNoAdmin.find(usuario => Number(usuario.idUsu) === usuarioSeleccionadoId);
        if (!usuarioEncontrado) {
            toast.error("Usuario no encontrado.");
            return;
        }
    
    
        console.log("Usuario seleccionado para agregar al proyecto:", usuarioEncontrado);
        // Asegúrate de tener acceso a proyectoKey de alguna manera, aquí asumo que es un estado o prop
        console.log("urn", proyectoKey.urn);
    
        try {
            const payload = {
                idUsuario: usuarioEncontrado.idUsu, 
                urn: proyectoKey.urn, // aquí usas la urn desde proyectoKey
                proyectoKey: proyectoKey.proyectoKey // si necesitas el proyectoKey completo
                // Asegúrate de incluir cualquier otro dato necesario que tu backend requiera
            };
            console.log("datos enviados",payload);
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
            console.log('Usuario asignado con éxito:', usuarioProyectoAsignado);
            toast.success('Usuario asignado con éxito');
            obtenerUsuariosAsignados();
            // Aquí puedes realizar cualquier actualización en la UI necesaria,
            // como actualizar la lista de usuarios asignados
        } catch (error) {
            console.error('Error al asignar el usuario al proyecto:', error);
            toast.error('Ocurrió un error al asignar el usuario al proyecto');
        }
    };
    
    
    return (
        <div style={tabStyle}>
            <Tabs defaultActiveKey="informacionGeneral" id="tab-administracion-proyecto" onSelect={onSelect} style={tabHeaderStyle}>
                <Tab eventKey="informacionGeneral" title={<span><img src={getTabImage('informacionGeneral')} alt="" />Proyecto</span>}>
                    <div style={tabContentStyle}>
                    <TabConfiguracion urn={proyectoKey.urn} />
                    <Form.Label>Proyecto al cual se transferirán los datos</Form.Label>
                    <Form.Control as="select" value={proyectoSeleccionado.urn || ''} onChange={handleSelectProject}>
                        <option value="">Seleccione un proyecto...</option>
                        {proyectos.map((proyecto) => (
                            <option key={proyecto.urn} value={proyecto.urn}>
                                {proyecto.nombre} 
                            </option>
                        ))}
                    </Form.Control>
                        <Button style={botonEstilo} onClick={transferirDatos}>Transferir Datos</Button>

                        <p></p>  
                         <Button onClick={guardarDatosModelo} style={{...botonEstilo, marginTop: '10px'}}>Calcular  Estadísticas</Button><p></p> <p></p><br></br>
                         {Object.entries(tickets).map(([task, status]) => (
                            <Alert key={task} variant="success">
                                {task}: {status}
                            </Alert>
                        ))}
                    </div>
                </Tab>
                <Tab eventKey="configuracionAdicional" title={<span><img src={getTabImage('configuracionAdicional')} alt="" /> Usuarios</span>}>
                    <div style={tabContentStyle}>
                        <Form.Group className="mb-3">
                            <Form.Label>Asignación de Usuarios a Proyecto</Form.Label>
                            <Form.Control as="select" value={usuarioSeleccionado} onChange={asignarUsuarioAProyecto}>
                                {usuariosNoAdmin.map(usuario => (
                                    <option key={usuario.idUsu} value={usuario.idUsu}>
                                        {usuario.fullname} / {usuario.username}
                                    </option>
                                ))}
                            </Form.Control>
                            <Button style={{...botonEstilo, marginTop: '10px'}} onClick={agregarUsuario}>Agregar Usuario </Button>
                        </Form.Group>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosAsignadosProyecto.map(usuario => (
                                    <tr key={usuario.idUsu}>
                                        <td>{usuario.fullname}/{usuario.username}</td>
                                        <td>
                                            <Button variant="danger" onClick={() => desasociarUsuario(usuario.idUsu)}>
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Button 
                    onClick={buscarOrdenNiveles} 
                    style={{ 
                        backgroundColor: '#DA291C',
                        borderRadius: '10px',
                        color: 'white',
                        marginRight: '5px'
                    }}>
                    Buscar Orden Actual
                </Button>
                <Button 
                    onClick={guardarOrdenNiveles} 
                    style={{ 
                        backgroundColor: '#DA291C',
                        borderRadius: '10px',
                        color: 'white'
                    }}>
                    Guardar Niveles con Orden Actual
                </Button>
                </div>
                 <ListaReordenable items={niveles} onReorder={handleReorder} />
                </div>
                   
                </Tab>
                <Tabs defaultActiveKey="informacionGeneral" id="tab-administracion-proyecto">
     
      
                </Tabs>
            </Tabs>
        </div>
    );
};

export default AdministracionProyecto;
