import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button,Modal,Form  } from 'react-bootstrap';
import Select from 'react-select';
import { useVisibility } from '../context/VisibilityContext';
import { useActions } from '../context/ActionContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faPlus, faHandPointer,faTrash } from '@fortawesome/free-solid-svg-icons';
import API_BASE_URL from '../config';
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
    const { updateIdentificadoresActuales } = useActions();
    const[esAdministradorEditor,setAdministradorEditor] = useState('');
    const handleOpenModalWithInfo = async (pedido) => {
        setModalInfo({ show: true, data: pedido });
        await cargarAdicionales(pedido._id); // Llama a cargarAdicionales aquí
    };

    
    const handleApplyFilterClick = () => {
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
            console.log("dbIds filtrados por ParticionHA:", idsFiltradosParticionHA);
            console.log("dbIds filtrados por Piso:", idsFiltradosPiso);
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
                console.log("dbIds repetidos en ambos:", idsRepetidos);

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
            console.log("Datos que se deben enviar");
            console.log(adicional);
            console.log(modalInfo.data._id);
            console.log(modalInfo);
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
                // Asumiendo que urnBuscada contiene la URN que quieres buscar
                const urn = urnBuscada; // Asegúrate de que esta variable contiene la URN correcta
                const url = API_BASE_URL+`/api/listPedidos?urn=${urn}`;
                
                const response = await axios.get(url);
                if (response.status === 200) {
                    console.log("PEDIDOS SERVER");
                    console.log(response.data);
                    setPedidos(response.data);
                }
            } catch (error) {
                console.error('Error al obtener la lista de pedidos:', error);
            }
        };
    
        fetchPedidos();
    }, [urnBuscada]); // Agrega urnBuscada a las dependencias de useEffect si es una prop o un estado
    const handleDeleteConfirmation = async (pedido) => {
        console.log("pedido borrar antes");
        console.log(pedido);
        const isConfirmed = window.confirm("En verdad desea borrar "+pedido.nombre_pedido);
        if (isConfirmed) {
            try {
                // Reemplaza 'tu-api-url' con la URL base de tu API
                const response = await axios.delete(API_BASE_URL+'/api/eliminarPedido', { data: { id: pedido._id } });
                console.log(response.data.mensaje);
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
        console.log(`Peso Total Desde Tab: ${pesoTotal}, Largo Total: ${largoTotal}, Total Barras: ${totalBarras}`);
    }, [pesoTotal, largoTotal, totalBarras]); // Dependencias para reaccionar a sus cambios
    const handCleanClick = () => {
        cleanModel();
        setSelectedParticionHA([]);
        
        setSelectedPiso([]);
        updatePesoTotal(0);
        updateLargoTotal(0);
        updateTotalBarras(0);
    }
    const fetchPedidosAct = async () => {
        try {
            const urn = urnBuscada;
            const url = API_BASE_URL+`/api/listPedidos?urn=${encodeURIComponent(urn)}`;
            
            const response = await axios.get(url);
            if (response.status === 200) {
                console.log("PEDIDOS SERVER");
                console.log(response.data);
                setPedidos(response.data);
            }
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
               console.log("Datos Filtro1 desde Tabs:", datosFiltro1);
             const opciones1 = Object.keys(datosFiltro1).map(key => ({
                value: key,
                label: key,
                isFixed: false
            }));
            setOpcionesParticionHA(opciones1);
        }
        if (datosFiltro2) {
            console.log("Datos Filtro2 desde Tabs:", datosFiltro2);
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
                console.log("URN BUSCADA 12");
                console.log(urnBuscada);
                
                if (urnBuscada) {
                    const response = await axios.get(API_BASE_URL+`/api/filtrosPorUrn/${urnBuscada}`);
                    console.log("Respuesta Filtros");
                    console.log(response.data);
                  
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
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleExecuteOrderClick = async () => {
        if (!pedidoNombre.trim()) {
            console.log("sin nombre");
            toast.error("Debe agregar un nombre al pedido");
            return;
        }
    
        console.log("Nombre del pedido:", pedidoNombre);
        // Suponiendo que tienes un estado o una forma de obtener los IDs seleccionados, 
        // aquí es donde mostrarías esos IDs. 
        // A modo de ejemplo, usaré un estado ficticio llamado selectedIds para esta demostración:
       
        console.log("Lista de IDs seleccionados:", selectedIds);
        const datosPedido = {
            ids: selectedIds,
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
                console.log("Pedido creado exitosamente", respuesta.data);
                toast.success("Pedido creado exitosamente");
                // Cerrar el modal y limpiar el formulario
                handleCloseModal();
                setPedidoNombre(''); // Resetear el nombre del pedido
                // Opcionalmente, limpiar otros estados si es necesario
                fetchPedidosAct();
            }
        } catch (error) {
            console.error("Error al crear el pedido", error);
            toast.error("Error al crear el pedido");
            // Mantener el modal abierto para permitir correcciones
        }
        handleCloseModal(); // Cierra el modal después de ejecutar las acciones necesarias
    };
    
    const borrarAdicional = async (idAdicional) => {
        try {
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
        width: '450px',
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
                            <label htmlFor="particionHA" style={labelStyle}>Valores para AEC partición HA</label>
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
                            <label htmlFor="piso" style={labelStyle}>Valores para AEC Piso</label>
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
                        {/* Columna 2 */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div>Largo Total</div>
                            <div style={{  color: '#DA291C' }}><strong>{largoTotal.toFixed(1)} Mts</strong></div> {/* Ejemplo de número, aquí iría el valor real */}
                            <hr style={{ backgroundColor: 'black', height: '2px' }} />
                        </div>
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
             {/* Ajusta el 32px según el tamaño de tu encabezado */}
            
             <div className="list-group" style={{ fontSize: '8pt' }}>
                {pedidos.map((pedido, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                            <span className="fw-bold text-truncate" style={{ fontWeight:'bold' }}>{pedido.nombre_pedido}</span>
                            <span> | </span>
                            <span>Largo Total:</span><span className="text-truncate" style={{ color: '#DA291C' }}> {pedido.largos} Mts</span>
                            <span> | </span>
                           <span>Peso Total:</span> <span className="text-truncate" style={{ color: '#DA291C',fontWeight:'bold' }}> {pedido.pesos} kg</span>
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
                    <p>Largo Total: <strong>{modalInfo.data.largos} Mts</strong> | Peso Total: <strong>{modalInfo.data.pesos} kg</strong></p>
                    <p>Estado: <span style={{ height: '15px', width: '15px', backgroundColor: '#DA291C', borderRadius: '50%', display: 'inline-block' }}></span></p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <input type="text" placeholder="Diámetro" value={adicional.diametro} onChange={e => setAdicional({ ...adicional, diametro: e.target.value })} style={{  width:'5px',margin: '0 5px', flex: 1 }} />
                        <input type="text" placeholder="Cantidad" value={adicional.cantidad} onChange={e => setAdicional({ ...adicional, cantidad: e.target.value })} style={{ width:'5px', margin: '0 5px', flex: 1 }} />
                        <input type="text" placeholder="Largo" value={adicional.largo} onChange={e => setAdicional({ ...adicional, largo: e.target.value })} style={{ width:'5px',margin: '0 5px', flex: 1 }} />
                     
                        {esAdministradorEditor && (
                        <Button onClick={agregarAdicional} style={{ margin: '0 5px',backgroundColor: '#DA291C',borderColor: '#DA291C' }}><FontAwesomeIcon icon={faPlus} /></Button>
                        )}
                    </div>
                    <br></br>
                    <ul className="list-group">
                    {Array.isArray(adicionales) && adicionales.map((adicional, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                                <span className="fw-bold">Diámetro:</span> <span style={{ color: '#DA291C'  }}>{adicional.diametro}&nbsp;MM</span>
                                <span> | </span>
                                <span className="fw-bold">Cantidad:</span> <span style={{ color: '#DA291C'  }}>{adicional.cantidad}</span>
                                <span> | </span>
                                <span className="fw-bold">Largo:</span> <span style={{ color: '#DA291C'  }}>{adicional.largo}&nbsp;Mtrs</span>
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
