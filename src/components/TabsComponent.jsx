import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button,Modal,Form  } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Select from 'react-select';
import { useVisibility } from '../context/VisibilityContext';
import { useActions } from '../context/ActionContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faPlus, faHandPointer,faTrash } from '@fortawesome/free-solid-svg-icons';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
const customStyles = {
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#DA291C',
        color: 'white',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'white',
    }),
};

const menuStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    overflowY: 'hidden'
};

  const estiloExpandido = {
      width: '100%',
  };
const TabComponent = ({ urnBuscada }) => {
    const { filtrar, cleanModel, datosFiltro1,datosFiltro2, pesoTotal, largoTotal, totalBarras,updatePesoTotal,updateLargoTotal,updateTotalBarras  } = useActions();
    const { isVisible } = useVisibility();
    const [activeKey, setActiveKey] = useState('filtrosVisuales');
    const [selectedParticionHA, setSelectedParticionHA] = useState([]);
    const [selectedPiso, setSelectedPiso] = useState([]);
    const [opcionesParticionHA, setOpcionesParticionHA] = useState([]);
    const [opcionesPiso, setOpcionesPiso] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pedidoNombre, setPedidoNombre] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [modalInfo, setModalInfo] = useState({ show: false, data: {} });
    const [adicional, setAdicional] = useState({ diametro: '', cantidad: '', largo: '' });
    const [adicionales, setAdicionales] = useState([]);
    const [selectedButtons, setSelectedButtons] = useState({});
    const { updateIdentificadoresActuales,filtrado1, 
        filtrado2, 
        updateFiltrado1, 
        updateFiltrado2 } = useActions();
    const[esAdministradorEditor,setAdministradorEditor] = useState('');
    const [showConfirmChange, setShowConfirmChange] = useState(false);
    const [pedidoActual, setPedidoActual]=useState([]);
    const estados = ['paquetizado', 'espera_aprobacion', 'rechazado', 'aceptado', 'fabricacion', 'despacho', 'recepcionado', 'instalado', 'inspeccionado', 'hormigonado'];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = localStorage.getItem('userId');
    const { logout } = useAuth();
    const [tokenVar, setToken] = useState(null);
    const { resultadoFierros } = useActions(); 
    const handleOpenModalWithInfo = async (pedido) => {
        setPedidoActual(pedido);
        setModalInfo({ show: true, data: pedido });
      //console.log("pedido a mostrar", pedido);
        await cargarAdicionales(pedido._id); // Llama a cargarAdicionales aquí
    };
    const permisos = {
        Constructor: ['paquetizado', 'espera_aprobacion', 'recepcionado', 'instalado', 'hormigonado'],
        Fabricante: ['paquetizar', 'fabricacion','aceptado', 'rechazado','fabricar', 'despacho'],
        ITO: ['inspeccionado'],
        Clientes: [],
        Invitado: []
    };
    const handleNextStateClick = () => {
      console.log("AQUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
        revisionPermisos ();
       
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
    const obtenerProximoEstado = (estadoActual) => {
        const index = estados.indexOf(estadoActual);
        return index !== -1 && index < estados.length - 1 ? estados[index + 1] : null;
    };
    const revisionPermisos = async () => {
        try {
            verificarUsuario();
            const respuesta = await fetch(`${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(urnBuscada)}`);
          //console.log("inicio revisión");
            if (!respuesta.ok) {
                throw new Error('Error al obtener usuarios asignados');
            }
            const usuariosAsignadosRespuesta = await respuesta.json();
    
            // Verificar si el usuario actual está en la lista de asignados
            const usuarioAsignado = usuariosAsignadosRespuesta.find(u => u.idUsuario === userId);
            if (!usuarioAsignado) {
                console.error('El usuario no está asignado a este proyecto.');
                toast.error('No tiene permisos para cambiar el estado de este pedido.');
                setShowConfirmChange(false); // Muestra la confirmación
                return;
            }
    
            // Mostrar por consola el tipo de usuario
          //console.log("Tipo de usuario asignado:", usuarioAsignado.tipoUsuario);
            if(usuarioAsignado.tipoUsuario != "" && usuarioAsignado.tipoUsuario != undefined){
                // aqui debe buscar  segun el tipo de usuario  si es posible hacer el cambio o no
                const tipoUsuario = usuarioAsignado.tipoUsuario;
                const permisosUsuario = permisos[tipoUsuario] || [];
                const currentEstados = pedidoActual.estados || {};
    
                // Encuentra el índice del estado actual más reciente basado en la lista 'estados'
                let estadoActualIndex = -1;
                for (let i = estados.length - 1; i >= 0; i--) {
                    if (currentEstados[estados[i]] && currentEstados[estados[i]].est === 'ok') {
                        estadoActualIndex = i;
                        break;
                    }
                }
            
              //console.log("Estado actual:", estadoActualIndex);
            
                // Determina el próximo estado si no es el último
                let nuevoEstado = 'paquetizado'; // Estado inicial por defecto si no hay ningún estado actual
                if (estadoActualIndex !== -1 && estadoActualIndex < estados.length - 1) {
                    nuevoEstado = estados[estadoActualIndex + 1];
                  //console.log("estado nuevo",nuevoEstado);
                    setShowConfirmChange(true); // Muestra la confirmación
                } else if (estadoActualIndex === estados.length - 1) {
                  //console.log("Ya está en el último estado posible.");
                    toast.info("Ya está en el último estado posible.");
                    return; // Retorna aquí si ya está en el último estado
                }
                

                if (nuevoEstado && permisosUsuario.includes(nuevoEstado)) {
                  //console.log(` El usuario puede cambiar al estado '${nuevoEstado}'.`);
                    setShowConfirmChange(true); // Muestra la confirmación
                } else {
                    toast.error(` No tiene permisos para cambiar al estado '${nuevoEstado}'.`);
                    setShowConfirmChange(false); // Muestra la confirmación
                    return;
                }

            }
            // Proceder con el cambio de estado
            //realizarCambioDeEstado(usuarioAsignado.tipoUsuario);
        } catch (error) {
            console.error("Error el usuario no tiene una asignación de tipo de usuario", error);
            toast.error("Error el usuario no tiene una asignación de tipo de usuario");
        }
    };
    
    const confirmStateChange = async () => {
        const username = localStorage.getItem('username');
        const currentEstados = pedidoActual.estados || {};
        verificarUsuario();
        // Encuentra el índice del estado actual más reciente basado en la lista 'estados'
        let estadoActualIndex = -1;
        for (let i = estados.length - 1; i >= 0; i--) {
            if (currentEstados[estados[i]] && currentEstados[estados[i]].est === 'ok') {
                estadoActualIndex = i;
                break;
            }
        }
    
      //console.log("Estado actual:", estadoActualIndex);
    
        // Determina el próximo estado si no es el último
        let nuevoEstado = 'paquetizado'; // Estado inicial por defecto si no hay ningún estado actual
        if (estadoActualIndex !== -1 && estadoActualIndex < estados.length - 1) {
            nuevoEstado = estados[estadoActualIndex + 1];
        } else if (estadoActualIndex === estados.length - 1) {
          //console.log("Ya está en el último estado posible.");
            return; // Retorna aquí si ya está en el último estado
        }
    
        const estadoData = {
            fecha: new Date().toISOString(),
            nombreUsuario: username,
            est: 'ok'
        };
    
        try {
            const response = await axios.post(`${API_BASE_URL}/api/actualizarEstadoPedido`, {
                pedidoId: modalInfo.data._id,
                nombreEstado: nuevoEstado,
                estadoData: estadoData,
                nombreUsuario: username
            });
    
            if (response.status === 200) {
                toast.success("Estado cambiado con éxito");
                setModalInfo(prevState => ({ ...prevState, show: false }));
                fetchPedidosAct();
                // Actualiza los estados en el modalInfo
                setModalInfo(prevState => ({
                    ...prevState,
                    data: {
                        ...prevState.data,
                        estados: {
                            ...prevState.data.estados,
                            [nuevoEstado]: estadoData
                        }
                    }
                }));
                setShowConfirmChange(false); // Ocultar la confirmación
            }
        } catch (error) {
            console.error("Error al cambiar el estado:", error);
            toast.error("Error al cambiar el estado");
        }
    };
    
    
    
    const handleApplyFilterClick = () => {
         fetchFilters();
        verificarUsuario();
        if (filtrar) {

           
            let idsFiltradosParticionHA = [];
            let idsFiltradosPiso = [];

            // Recolectar dbIds para selectedParticionHA
            selectedParticionHA.forEach(option => {
                if (datosFiltro1 && datosFiltro1[option.value]) {
                    idsFiltradosParticionHA = idsFiltradosParticionHA.concat(datosFiltro1[option.value].dbIds);
                }
            });

            // Recolectar dbIds para selectedPiso
            selectedPiso.forEach(option => {
                if (datosFiltro2 && datosFiltro2[option.value]) {
                    idsFiltradosPiso = idsFiltradosPiso.concat(datosFiltro2[option.value].dbIds);
                }
            });

            // Mostrar por consola los idsFiltrados separados por categoría
          //console.log("dbIds filtrados por ParticionHA:", idsFiltradosParticionHA);
          //console.log("dbIds filtrados por Piso:", idsFiltradosPiso);
            if( idsFiltradosPiso.length ==0 && idsFiltradosParticionHA.length>0){
                filtrar(idsFiltradosParticionHA);
                setSelectedIds(idsFiltradosParticionHA);
                updateIdentificadoresActuales(idsFiltradosParticionHA);
            }
            if( idsFiltradosPiso.length >0 && idsFiltradosParticionHA.length==0){
                filtrar(idsFiltradosPiso);
                setSelectedIds(idsFiltradosPiso);
                updateIdentificadoresActuales(idsFiltradosPiso);
            }
            if(idsFiltradosPiso.length >0 && idsFiltradosParticionHA.length>0){
                 // Encuentra los dbIds que se repiten en ambos arrays
                let idsRepetidos = idsFiltradosParticionHA.filter(id => idsFiltradosPiso.includes(id));

                // Mostrar por consola los ids que se repiten en ambos
              //console.log("dbIds repetidos en ambos:", idsRepetidos);

                // Si necesitas utilizar la función filtrar para aplicar estos filtros visualmente, hazlo aquí:
                // Por ejemplo, podrías querer filtrar visualmente solo los ids que se repiten
                filtrar(idsRepetidos);
                setSelectedIds(idsRepetidos);
                updateIdentificadoresActuales(idsRepetidos);
            }
           

           // filtrar(selectedParticionHA, selectedPiso);
        } else {
            console.error('La función filtrar no está disponible');
        }
    };

    const cargarAdicionales = async (pedidoId) => {
        verificarUsuario();
        try {
            const response = await axios.get(API_BASE_URL+`/api/getadicionalesPedido/${pedidoId}`);
            if (Array.isArray(response.data)) {
                setAdicionales(response.data);
            } else {
                console.error("No hay datos", response.data);
                setAdicionales([]);
            }
        } catch (error) {
            console.error("Error al cargar los adicionales:", error);
            setAdicionales([]);
        }
    };
    
    const agregarAdicional = async () => {
        if (!adicional.diametro || !adicional.cantidad || !adicional.largo) {
          alert("Por favor, complete todos los campos para el adicional.");
          return;
        }
      
        try {
          //console.log("Datos que se deben enviar");
          //console.log(adicional);
          //console.log(modalInfo.data._id);
          //console.log(modalInfo);
          // Envía el adicional al servidor, asumiendo que modalInfo.data._id es el ID del pedido actual
          await axios.post(API_BASE_URL+`/api/adicionalesPedido`, { ...adicional, pedidoId: modalInfo.data._id , urn:urnBuscada});
      
          // Llama a cargarAdicionales para actualizar la lista de adicionales
          await cargarAdicionales(modalInfo.data._id);
      
          // Limpia el formulario para un nuevo adicional
          setAdicional({ diametro: '', cantidad: '', largo: '' });
      
          toast.success("Adicional agregado con éxito");
        } catch (error) {
          console.error("Error al agregar el adicional:", error);
          toast.error("Error al agregar el adicional");
        }
      };
      
    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                verificarUsuario();
                // Asumiendo que urnBuscada contiene la URN que quieres buscar
                const urn = urnBuscada; // Asegúrate de que esta variable contiene la URN correcta
                const url = API_BASE_URL+`/api/listPedidos?urn=${urn}`;
              
                const response = await axios.get(url);
              //console.log("lista pedidos",response);
                if (response.status === 200) {
                  //console.log("PEDIDOS SERVER");
                  //console.log(response.data);
                    setPedidos(response.data);
                }
            } catch (error) {
                console.error('Error al obtener la lista de pedidos:', error);
            }
        };
    
        fetchPedidos();
    }, [urnBuscada]); // Agrega urnBuscada a las dependencias de useEffect si es una prop o un estado
    const handleDeleteConfirmation = async (pedido) => {
        verificarUsuario();
      //console.log("pedido borrar antes");
      //console.log(pedido);
        const isConfirmed = window.confirm("En verdad desea borrar "+pedido.nombre_pedido);
        if (isConfirmed) {
            try {
                // Reemplaza 'tu-api-url' con la URL base de tu API
                const response = await axios.delete(API_BASE_URL+'/api/eliminarPedido', { data: { id: pedido._id } });
              //console.log(response.data.mensaje);
                setModalInfo({ show: false, data: pedido });
                fetchPedidosAct();
                // Actualiza tu vista o estado aquí para reflejar que el pedido fue eliminado
                // Por ejemplo, puedes recargar los pedidos o eliminar este pedido del estado
            } catch (error) {
                console.error("Error al eliminar el pedido:", error.response ? error.response.data : error.message);
            }
            // Aquí puedes llamar a la función que maneja la lógica de borrado
        }
        // Si el usuario selecciona "No", simplemente se cierra la alerta y no se hace nada más.
    };
    useEffect(() => {
      //console.log(`Peso Total Desde Tab: ${pesoTotal}, Largo Total: ${largoTotal}, Total Barras: ${totalBarras}`);
    }, [pesoTotal, largoTotal, totalBarras]); // Dependencias para reaccionar a sus cambios
    const handCleanClick = () => {
        cleanModel();
        setSelectedParticionHA([]);
        
        setSelectedPiso([]);
        updatePesoTotal(0);
        updateLargoTotal(0);
        updateTotalBarras(0);
        setSelectedIds([]); // Limpia selectedIds
       
    }
    const fetchPedidosAct = async () => {
        try {
            verificarUsuario();
            const urn = urnBuscada;
            const url = API_BASE_URL+`/api/listPedidos?urn=${encodeURIComponent(urn)}`;
            
            const response = await axios.get(url);
            if (response.status === 200) {
              //console.log("PEDIDOS SERVER");
              //console.log(response.data);
                setPedidos(response.data);
            }else{ setPedidos([]);}
        } catch (error) {
            console.error('Error al obtener la lista de pedidos:', error);
        }
    };
    const viewPedido = (ids) => {
        const idsInt = ids.map(id => parseInt(id, 10)); // Convierte cada elemento a entero
        console.log("IDs del pedido:", idsInt);
        filtrar(idsInt);
        setSelectedIds(idsInt);
      };
      
    useEffect(() => {
        if (datosFiltro1) {
             //console.log("Datos Filtro1 desde Tabs:", datosFiltro1);
             const opciones1 = Object.keys(datosFiltro1).map(key => ({
                value: key,
                label: key,
                isFixed: false
            }));
            setOpcionesParticionHA(opciones1);
        }
        

        if (datosFiltro2) {
          //console.log("Datos Filtro2 desde Tabs:", datosFiltro2);
          const opciones2 = Object.keys(datosFiltro2).map(key => ({
             value: key,
             label: key,
             isFixed: false
         }));
         setOpcionesPiso(opciones2);
     } 

      }, [datosFiltro1,datosFiltro2]);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                verificarUsuario();
              //console.log(urnBuscada);
                
                if (urnBuscada) {
                    const response = await axios.get(API_BASE_URL+`/api/filtrosPorUrn/${urnBuscada}`);
                  //console.log("Respuesta Filtros");
                  //console.log(response.data);
                  
                    const filtros = response.data;
                    if (filtros.length >= 2) {
                        const opciones1 = Object.keys(filtros[1].filtros).map(key => ({
                            value: key,
                            label: key,
                            isFixed: false
                        }));
                        const opciones2 = Object.keys(filtros[0].filtros).map(key => ({
                            value: key,
                            label: key,
                            isFixed: false
                        }));
                        setOpcionesParticionHA(opciones1);
                        setOpcionesPiso(opciones2);
                    }
                }
            } catch (error) {
                console.error('Error al obtener los filtros:', error);
            }
        };

        fetchFiltros();
    }, [urnBuscada]);

    useEffect(() => {
        setActiveKey('filtrosVisuales');
    }, []);

    const onSelect = (k) => {
        setActiveKey(k);
    };
    const handleOpenModal = async() => {
        let idsRepetidos = [];
        let pedidosConRepetidos = new Set(); // Utilizamos un Set para evitar nombres duplicados
        verificarUsuario();
        try{
            
            await fetchPedidosAct();
             // Iteramos sobre cada pedido existente
             pedidos.forEach(pedido => {
            // Aseguramos que los IDs del pedido estén como números enteros
            const pedidoIdsNumerico = pedido.ids.map(id => parseInt(id, 10));
            // Filtramos los IDs seleccionados que están presentes en este pedido
            const repetidosEnPedido = selectedIds.filter(id => pedidoIdsNumerico.includes(id));
            if (repetidosEnPedido.length > 0) {
                idsRepetidos = idsRepetidos.concat(repetidosEnPedido); // Acumulamos todos los IDs repetidos
                pedidosConRepetidos.add(pedido.nombre_pedido); // Añadimos el nombre del pedido al conjunto de pedidos con repetidos
            }
        });
    
        if (idsRepetidos.length > 0) {
          //console.log("IDs repetidos encontrados:", idsRepetidos);
            const nombresPedidos = Array.from(pedidosConRepetidos).join(", "); // Convertimos el Set a Array y lo unimos en una cadena
            toast.error(`Hay elementos repetidos en los siguientes pedidos: ${nombresPedidos}`);
            viewPedido(idsRepetidos); // Visualiza los IDs repetidos
        } else {
            setShowModal(true); // Abre el modal solo si no hay IDs repetidos
        }
        }catch(error){

        }
       
    };
    
    const fetchBarDetails = async (pedido) => {
        try {
            verificarUsuario();
          //console.log("datos para consulta ",urnBuscada );
          //console.log("datos para consulta ",pedido );
            const url = `${API_BASE_URL}/api/barrasPorUrneIds/${urnBuscada}`;
            const response = await axios.post(url, { ids: pedido.ids });
          //console.log("respuesta datos  barra detalles",response.data)
            if (response.status === 200) {
                return response.data;
            } else {
                console.error('No se encontraron barras para los IDs proporcionados');
                return [];
            }
        } catch (error) {
            console.error('Error al obtener detalles de barras:', error);
            return [];
        }
    };
    
    const handleCloseModal = () => setShowModal(false);
    const handleExecuteOrderClick = async () => {
        verificarUsuario();

        try {
            const respuesta = await fetch(`${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(urnBuscada)}`);
            if (!respuesta.ok) {
                throw new Error('Error al obtener usuarios asignados');
            }
            const usuariosAsignadosRespuesta = await respuesta.json();
    
            const usuarioAsignado = usuariosAsignadosRespuesta.find(u => u.idUsuario === userId);
            if (!usuarioAsignado || usuarioAsignado.tipoUsuario !== 'Constructor') {
                toast.error('No tiene permisos para crear un pedido. Debe tener el rol de Constructor.');
                return;
            }
        } catch (error) {
            console.error('Error al verificar el rol del usuario:', error);
            toast.error('Error al verificar el rol del usuario. Inténtelo de nuevo.');
            return;
        }

        
        if (!pedidoNombre.trim()) {
          //console.log("sin nombre");
            toast.error("Debe agregar un nombre al pedido");
            return;
        }
        if (isSubmitting) {  // Verifica si ya se está procesando una solicitud
            return;
        }
        setIsSubmitting(true); 
      //console.log("Nombre del pedido:", pedidoNombre);
     
      const selectedIdsFromContext = resultadoFierros.map(fierro => fierro.id);
      console.log("Lista de IDs seleccionados:", selectedIds);
      console.log("Lista de IDs seleccionados2:", selectedIdsFromContext);
     
      let idsParaUsar = selectedIdsFromContext.length > 0 ? selectedIdsFromContext : selectedIds;
      if (idsParaUsar.length === 0) {
        toast.error("No hay IDs seleccionados para el pedido");
        setIsSubmitting(false);
        return;
    }
        const datosPedido = {
            ids:  idsParaUsar,
            fecha: new Date().toISOString().slice(0, 10), // Fecha actual en formato YYYY-MM-DD
            nombre_pedido: pedidoNombre,
            urn_actual: urnBuscada, // Asumiendo que urnBuscada es la URN actual del modelo
            pesos: `${pesoTotal.toFixed(1)}`, // Convertir a string si es necesario
            largos: `${largoTotal.toFixed(1)}` // Convertir a string si es necesario
            // Agrega cualquier otro dato necesario para tu pedido aquí
        };

       
        try {
            // Realizar la solicitud POST para crear el pedido
            const respuesta = await axios.post(API_BASE_URL+'/api/pedido', datosPedido);

            if (respuesta.status === 201) {
              //console.log("Pedido creado exitosamente", respuesta.data);
                toast.success("Pedido creado exitosamente");
                // Cerrar el modal y limpiar el formulario
                handleCloseModal();
                setPedidoNombre(''); // Resetear el nombre del pedido
                // Opcionalmente, limpiar otros estados si es necesario
                fetchPedidosAct();
                let email = localStorage.getItem('username');
                const detalles = await fetchBarDetails(respuesta.data.pedido); // Obtiene los detalles de las barras del pedido
              //console.log("Barras de pedido con detalles", detalles);
        
                // Agrega detalles adicionales para la generación del archivo CSV
                const pedidoInfo = {
                    barras:detalles,
                    nombrePedido: respuesta.data.pedido.nombre_pedido, // Supone que respuesta.data.pedido contiene 'nombre_pedido'
                    urn: respuesta.data.pedido.urn_actual // Supone que respuesta.data.pedido contiene 'urn_actual'
                };
                const respuestaCSV = await axios.post(`${API_BASE_URL}/api/pedidoCVS`, pedidoInfo);
       
                setSelectedIds([]); // Limpia selectedIds
                updateResultadoFierros([]); // Limpia resultadoFierros (en el contexto)
                const emailData = {
                    to: email, // Cambia esto por la dirección de correo a la que quieres enviar el mail
                    subject: 'Nuevo Pedido Creado',
                    text: `<p>Se ha creado un nuevo pedido con el nombre: ${pedidoNombre}</p>
                           <p>Peso Total: ${pesoTotal.toFixed(1)} kg</p>
                           <p>Longitud Total: ${largoTotal.toFixed(1)} mts</p>
                           <p>Puedes descargar el archivo del pedido desde el siguiente enlace: <a href="${respuestaCSV.data.fileUrl}">Descargar Pedido</a></p>`
                };

                await axios.post(`${API_BASE_URL}/api/send-mail`, emailData);
            }
            if (respuesta.status === 305) {
                toast.error("Pedido con elementos duplicados, no fue posible crearlo");
            }
        } catch (error) {
            console.error("Error al crear el pedido", error);
           // toast.error("Error al crear el pedido, vuelva a intentarlo");
            // Mantener el modal abierto para permitir correcciones
        }
        setIsSubmitting(false);
        handleCloseModal(); // Cierra el modal después de ejecutar las acciones necesarias
    };
    
    
    const borrarAdicional = async (idAdicional) => {
        try {
            verificarUsuario();
            // Realiza la petición DELETE al servidor para eliminar el adicional
            await axios.delete(API_BASE_URL+`/api/adicionalesPedido/eliminar/${idAdicional}`);
    
            // Recarga la lista de adicionales para el pedido actual
            await cargarAdicionales(modalInfo.data._id);
    
            toast.success("Adicional eliminado exitosamente");
        } catch (error) {
            console.error("Error al eliminar el adicional:", error.response ? error.response.data : error.message);
            toast.error("Error al eliminar el adicional");
        }
    };
    
    const getTabIcon = (key) => {
        if (key === 'filtrosVisuales') {
            return activeKey === 'filtrosVisuales' ? 'images/eyered.svg' : 'images/eyewhite.svg';
        } else if (key === 'barrasPedidos') {
            return activeKey === 'barrasPedidos' ? 'images/barrasred.svg' : 'images/barraswhite.svg';
        }
    };
    window.onunhandledrejection = function (event) {
        verificarUsuario();
        console.error("Unhandled rejection (promise):", event.promise, "reason:", event.reason);
        return true; // Previene la propagación y la consola del navegador mostrando el error
      };
      self.onerror = function (event) {
        console.error('Error en el worker:', event.message);
        return true; // Previene el error de ser propagado
    };
    try {
        verificarUsuario();
        worker.postMessage(largeData);
      } catch (e) {
        console.error('Failed to send data to worker:', e);
        // Implementa la lógica para manejar este error, como dividir los datos.
      }
    useEffect(() => {

        const tipoUsuario = localStorage.getItem('tipo'); 
        const esAdministradorEditor = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador'|| tipoUsuario === 'Editor';
        setAdministradorEditor(esAdministradorEditor);
 
        const cargarAdicionales = async () => {
          if(modalInfo.data._id) { // Asegúrate de que hay un pedido seleccionado
            try {
              const response = await axios.get(API_BASE_URL+`/api/getadicionalesPedido/${modalInfo.data._id}`);
              setAdicionales(response.data); // Asume que el endpoint devuelve un arreglo de adicionales
            } catch (error) {
              console.error("Error al cargar los adicionales:", error);
              setAdicionales([]); // Limpia los adicionales si hay un error
            }
          }
        };
      
        cargarAdicionales();
      }, [modalInfo.data._id]); // Este efecto se ejecuta cada vez que cambia el pedido seleccionado
      useEffect(() => {
        const verificarUsuarioYAsignaciones = async () => {
            try {
                const tipoUsuario = localStorage.getItem('tipo');
                const esAdminOEditor = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador' || tipoUsuario === 'Editor';

                const respuesta = await fetch(`${API_BASE_URL}/api/usuariosProyectoAsignado/${encodeURIComponent(urnBuscada)}`);
                if (!respuesta.ok) {
                    throw new Error('Error al obtener usuarios asignados');
                }
                const usuariosAsignadosRespuesta = await respuesta.json();

                const usuarioAsignado = usuariosAsignadosRespuesta.find(u => u.idUsuario === userId);
                if (usuarioAsignado && (esAdminOEditor || usuarioAsignado.tipoUsuario === 'Constructor')) {
                    setAdministradorEditor(true);
                } else {
                    setAdministradorEditor(false);
                }
            } catch (error) {
                console.error('Error al verificar usuario y asignaciones:', error);
            }
        };

        verificarUsuarioYAsignaciones();
    }, [modalInfo.data._id]);


     useEffect(() => {
        const fetchToken = async () => {
          try {
            
            const response = await fetch(`${API_BASE_URL}/api/gettoken`);
            const data = await response.json();
            setToken(data.token);
          //console.log("Ok token");
          } catch (error) {
            console.error('Error al obtener el token:', error);
          }
        };
    
        fetchToken();
      }, []);

      useEffect(() => {
        fetchFilters();
    }, [urnBuscada]);

    const getLatestState = (estados, estadosData) => {
        for (let i = estados.length - 1; i >= 0; i--) {
            const estado = estados[i];
            if (estadosData && estadosData[estado] && estadosData[estado].est === 'ok') {
                return estado.replace('_', ' '); // Reemplaza guiones bajos por espacios si es necesario
            }
        }
        return 'N/A'; // Retorna 'N/A' si no hay ningún estado actualizado
    };
      const fetchFilters = async () => {
        if (tokenVar) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/bucketsProyectos`, {
                    headers: {
                        Authorization: `${tokenVar}`
                    }
                });
                const data = await response.json();
              //console.log(data);
                if (data.length > 0) {
                  var data1 = data.sort((a, b) => a.objectKey.localeCompare(b.objectKey));
                  //console.log("listado de proyectos:", data1);
                    const proyectoEncontrado = data1.find(proyecto => proyecto.urn === urnBuscada);
                    if(!proyectoEncontrado){
                        alert("El proyecto fue borrado, cualquier cambio que realice no será guardado permanentemente");
                    }
                   
              }
    
            //  setProyectos(data); // Establece los proyectos ordenados en el estado
            } catch (error) {
                console.error('Error al buscar los filtros:', error);
            }
        }
    };
    const buttonStyle = {
        marginRight: '5px', 
        fontSize: '8pt', // ajustado a 8pt según tu requerimiento
        borderColor: '#DA291C',
        color: '#DA291C',
        backgroundColor: 'white',
      };
      
      const selectedButtonStyle = {
        ...buttonStyle,
        color: 'white',
        backgroundColor: '#DA291C',
      };
      
    const tabStyle = {
        position: 'fixed',
        top: '40%',
        right: '50px',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        width: '465px',
        height: '385px',
        overflow: 'auto',
        paddingBottom: '520px',
        overflowY: 'hidden'
    };
    const modalStyle = {
       
          position: 'block',
          width:'100px',
          top: '500px !important',
          left: '35% !important',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          width: '150px',
          height: '200px',
          overflow: 'auto',
          paddingBottom: '250px',
          overflowY: 'hidden',
          border: '1px solid #ccc',
          background: '#fff',
          borderRadius: '4px',
          outline: 'none',
          padding: '20px',
          border: '2px solid white', // Agrega un borde blanco
          borderRadius: '10px', // Redondea los bordes del select
       
       
      };

    const tabContentStyle = {
        backgroundColor: 'white',
        borderRadius: '0 20px 20px 20px',
        padding: '15px',
        height: '100%',
        overflowY: 'hidden'
    };

    const tabHeaderStyle = {
        borderRadius: '30px 30px 0 0',
    };

    const filasContenido = {
        marginTop: '15px'
    };

    const botonFiltroStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
    };

    const labelStyle = {
        marginBottom: '10px'
    };
    const buttonBaseStyle = {
        marginRight: '5px',
        fontSize: '8pt',
        borderColor: '#DA291C',
        backgroundColor: 'white',
        color: '#DA291C',
      };
      
      const buttonHoverActiveStyle = {
        backgroundColor: '#DA291C',
        color: 'white',
      };
      
    return isVisible ? (
        <div style={tabStyle}>
            <Tabs defaultActiveKey="filtrosVisuales" id="tab-component" onSelect={onSelect} style={tabHeaderStyle}>
                <Tab eventKey="filtrosVisuales" title={<span><img src={getTabIcon('filtrosVisuales')} alt="Icono Filtros Visuales" /> Filtros visuales</span>}>
                    <div style={tabContentStyle}>
                        <div className="filasContenido" style={filasContenido}>
                        <label htmlFor="particionHA" style={labelStyle}>
                                Valores Para {filtrado1 || 'Filtro 1'}
                            </label>
                            <Select
                                isMulti
                                options={opcionesParticionHA}
                                value={selectedParticionHA}
                                onChange={setSelectedParticionHA}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                styles={{ ...customStyles, ...menuStyles }}
                                menuPortalTarget={document.body}
                            />
                        </div>
                        <div className="filasContenido" style={filasContenido}>
                        <label htmlFor="piso" style={labelStyle}>
                                Valores para {filtrado2 || 'Filtro 2'}
                            </label>
                            <Select
                                isMulti
                                options={opcionesPiso}
                                value={selectedPiso}
                                onChange={setSelectedPiso}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                styles={{ ...customStyles, ...menuStyles }}
                                menuPortalTarget={document.body}
                            />
                        </div>
                        <div className="filasContenido boton-filtro" style={botonFiltroStyle}>
                            <Button onClick={handleApplyFilterClick} variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }}>
                                <img src='images/btnfiltrored.svg' alt="Icono Filtros Visuales" />
                                Filtrar
                            </Button>&nbsp;&nbsp;
                            <Button onClick={handCleanClick} variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }}>
                                <img src='images/btnfiltrored.svg' alt="Icono Filtros Visuales" />
                                Limpiar
                            </Button>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey="barrasPedidos" title={<span><img src={getTabIcon('barrasPedidos')} alt="Icono Barras y Pedidos" /> Barras & Pedidos</span>}>
                    <div style={tabContentStyle}>
                    <div style={{ display: 'flex', marginBottom: '0px' }}>
            {/* Columna 1 */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                            <div>Peso Total</div>
                            <div style={{  color: '#DA291C' }}><strong>{pesoTotal.toFixed(1)} kg</strong></div> {/* Ejemplo de número, aquí iría el valor real */}
                            <hr style={{ backgroundColor: 'black', height: '2px' }} />
                        </div>
                        {/* 
                        
                        Columna 2 */}
                        
                        {/* Columna 3 */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div>Total Barras</div>
                            <div style={{  color: '#DA291C' }}><strong>{totalBarras}</strong></div> {/* Ejemplo de número, aquí iría el valor real */}
                            <hr style={{ backgroundColor: 'black', height: '2px' }} />
                        </div>
            {/* Columna 4 con botón */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                        {esAdministradorEditor && (
                            <Button  onClick={handleOpenModal} variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }}>
                                Nuevo Pedido
                            </Button>)}
                        </div>
                  </div>
                  <div style={{  flexWrap: 'wrap', justifyContent: 'space-between' ,width:'100%'}}>
            {/* Cards de pedidos existentes */}
            
            
             <div className="list-group" style={{ 
    fontSize: '8pt', 
    maxHeight: pedidos.length > 5 ? '300px' : 'auto', // Establece una altura máxima cuando hay más de 5 elementos
    overflowY: pedidos.length > 5 ? 'scroll' : 'hidden' // Permite desplazamiento vertical sólo si hay más de 5 elementos
}}>
                {pedidos.map((pedido, index) => (
                    
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                            <span className="fw-bold text-truncate" style={{ fontWeight:'bold' }}>
                            {pedido.nombre_pedido.length > 9 ? pedido.nombre_pedido.substring(0,9) + '...' : pedido.nombre_pedido}
                            </span>
                            <span> | </span>
                            <span>Fecha:</span><span className="text-truncate" style={{ color: '#DA291C' }}> {pedido.fecha}</span>
                            <span> | </span>
                           <span>Peso Total:</span> <span className="text-truncate" style={{ color: '#DA291C',fontWeight:'bold' }}> {pedido.pesos} kg</span>
                           <span> | </span>
                           <span className="text-truncate">
                                {(() => {
                                    const estado = getLatestState(estados, pedido.estados);
                                    return estado.length > 8 ? estado.substring(0, 8) + '...' : estado;
                                })()}
                            </span>
                        </div>
                        <div>
                        <Button 
                            style={selectedButtons[`ver_${index}`] ? { ...selectedButtonStyle, borderRadius: '0.6rem 0 0 0.6rem' } : { ...buttonStyle, borderRadius: '0.6rem 0 0 0.6rem' }} 
                            onClick={() => handleOpenModalWithInfo(pedido)}
                        >
                            <FontAwesomeIcon icon={faEye} style={{ color: selectedButtons[`ver_${index}`] ? 'white' : '#DA291C' }} />
                        </Button>
                        <Button 
                            className={`buttonBase ${selectedButtons[`solicitar_${index}`] ? "buttonSelected" : ""}`}
                            onClick={() => { viewPedido(pedido.ids); setSelectedButtons({ ...selectedButtons, [`solicitar_${index}`]: !selectedButtons[`solicitar_${index}`] })}}
                            >
                            <FontAwesomeIcon icon={faHandPointer} className="icon" />
                            </Button>

                        </div>
                    </div>
                ))}
            </div>



              </div></div>
                </Tab>
            </Tabs>
            
            <Modal show={modalInfo.show} onHide={() => setModalInfo({ ...modalInfo, show: false })}      className="custom-modal-style" >
                <Modal.Header closeButton>
                    <Modal.Title>{modalInfo.data.nombre_pedido}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
               {/*Largo Total: <strong>{modalInfo.data.largos*100} cms</strong>*/}
                <p> Peso Total: <strong>{modalInfo.data.pesos} kg</strong></p>
                <p>Estado: <span style={{ height: '15px', width: '15px', backgroundColor: '#DA291C', borderRadius: '50%', display: 'inline-block' }}></span></p>
                
                {/* Añadiendo la tabla de estados con iconos circulares */}
                <div style={{ display: 'flex', alignItems: 'left', marginBottom: '10px' }}>
                        {!showConfirmChange && (
                                <Button variant="primary" onClick={handleNextStateClick} style={{ marginRight:'3px' }}>
                                    Pasar al siguiente estado
                                </Button>
                            )}
                            {modalInfo.data.url && (
                            <Button href={modalInfo.data.url} variant="primary" style={{ marginRight:'3px',marginBottom: '1px' }}>
                                Descargar CSV
                                
                            </Button>
                            )}
                </div>
                 
                            {/* Confirmación para el cambio de estado */}
                    {showConfirmChange && (
                        <>
                            <p>¿Está seguro de pasar al siguiente estado? Este cambio no es reversible.</p>
                            <Button variant="danger" onClick={confirmStateChange}>
                                Confirmar cambio de estado
                            </Button>
                        </>
                    )}

<Table striped bordered hover size="sm">
    <thead>
        <tr>
            <th>Estado</th>
            <th>Est</th>
            <th>Fecha</th>
            <th>Nombre de Usuario</th>
        </tr>
    </thead>
    <tbody>
        {estados.map((estado) => {
            const estadoData = modalInfo.data.estados && modalInfo.data.estados[estado];
            return (
                <tr key={estado}>
                    <td>{estado.replace('_', ' ')}</td>
                    <td>
                    <span className="status-indicator" style={{
                            backgroundColor: estadoData && estadoData.est === 'ok' ? '#28a745' : '#dc3545',
                            display: 'inline-block',
                            width: '15px',   // Ensuring the indicator has a size
                            height: '15px',
                            borderRadius: '50%'
                        }}></span>
                    </td>
                    <td>{estadoData ? new Date(estadoData.fecha).toLocaleDateString("es-ES") : 'N/A'}</td>
                    <td>{estadoData ? estadoData.nombreUsuario : 'N/A'}</td>
                </tr>
            );
        })}
    </tbody>
</Table>




    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <input type="text" placeholder="Diámetro" value={adicional.diametro} onChange={e => setAdicional({ ...adicional, diametro: e.target.value })} style={{ width:'5px', margin: '0 5px', flex: 1 }} />
        <input type="text" placeholder="Cantidad" value={adicional.cantidad} onChange={e => setAdicional({ ...adicional, cantidad: e.target.value })} style={{ width:'5px', margin: '0 5px', flex: 1 }} />
        <input type="text" placeholder="Largo" value={adicional.largo} onChange={e => setAdicional({ ...adicional, largo: e.target.value })} style={{ width:'5px', margin: '0 5px', flex: 1 }} />
        
        {esAdministradorEditor && (
        <Button onClick={agregarAdicional} style={{ margin: '0 5px',backgroundColor: '#DA291C',borderColor: '#DA291C' }}><FontAwesomeIcon icon={faPlus} /></Button>
        )}
    </div>
    <br />
    <ul className="list-group">
    {Array.isArray(adicionales) && adicionales.map((adicional, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
                <span className="fw-bold">Diámetro:</span> <span style={{ color: '#DA291C'  }}>{adicional.diametro}&nbsp;MM</span>
                <span> | </span>
                <span className="fw-bold">Cantidad:</span> <span style={{ color: '#DA291C'  }}>{adicional.cantidad}</span>
                <span> | </span>
                <span className="fw-bold">Largo:</span> <span style={{ color: '#DA291C'  }}>{adicional.largo}&nbsp;Cms</span>
            </div>
            {esAdministradorEditor && (
            <Button variant="outline-danger" onClick={() => borrarAdicional(adicional._id)}>
                <FontAwesomeIcon icon={faTrash} />
            </Button>)}
            </li>
        ))}
      </ul>
</Modal.Body>
                <Modal.Footer>
                {esAdministradorEditor && (
                <Button variant="outline-danger" className="modal-button" onClick={() => handleDeleteConfirmation(modalInfo.data)}>
                    Borrar
                </Button>)}
                {esAdministradorEditor && (
                <Button variant="outline-danger" className="modal-button" onClick={() => agregarAdicional()}>
                    Agregar nuevos elementos
                </Button>)}
                {esAdministradorEditor && (
                <Button variant="outline-danger" className="modal-button" onClick={() => setModalInfo({ ...modalInfo, show: false })}>
                    Cerrar
                </Button>)}
                </Modal.Footer>
            </Modal>
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Nuevo Pedido</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="pedidoNombre">
                            <Form.Label>Nombre del Pedido</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese el nombre del pedido"
                                value={pedidoNombre}
                                onChange={(e) => setPedidoNombre(e.target.value)}
                                maxLength={25}
                            />
                        </Form.Group>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <span>Kilos: <strong>{pesoTotal.toFixed(1)}</strong></span>
                            <span>Longitud total: <strong>{largoTotal.toFixed(1)} Mts</strong></span>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }} onClick={handleExecuteOrderClick}>
                        Ejecutar Pedido
                    </Button>
                    <Button variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }} onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
        
    ) : null;
};

export default TabComponent;
