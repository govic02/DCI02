import React, { useEffect, useContext, useState, useCallback } from 'react';
import Select from 'react-select';
import { ActionsContext,useActions } from '../../context/ActionContext'; 
import { useVisibility } from '../../context/VisibilityContext';

import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faPlus, faHandPointer,faTrash } from '@fortawesome/free-solid-svg-icons';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
const AdministradorDeVistas = ({ tabsRef,identificadoresActual,refViewer2 , urnBuscada }) => {
    const { isVisible } = useVisibility();
    
    const [vistaSeleccionada, setVistaSeleccionada] = useState(null);
    const [topPosition, setTopPosition] = useState('55%');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [nombreVista, setNombreVista] = useState('');
    const [opcionesDeVistas, setOpcionesDeVistas] = useState([]);
    const abrirModal = () => setModalIsOpen(true);
    const cerrarModal = () => setModalIsOpen(false);
    const [modalEliminarIsOpen, setModalEliminarIsOpen] = useState(false);
    const[esAdministradorEditor,setAdministradorEditor] = useState('');
    const { despliegaSavedVista, identificadoresActuales } = useActions(); //  accedes a identificadoresActuales aquí
    const { seleccionActual } = useContext(ActionsContext);
    const urn = urnBuscada;
    
    const guardarVista = async () => {
        try {
            // Crear el objeto de datos de la vista
            console.log('Nombre de la vista:', nombreVista);
            console.log(identificadoresActuales);
            console.log(urn);
            console.log("selc actual",seleccionActual);
            if(identificadoresActuales.length >0 && identificadoresActuales){
                const nuevaVista = {
                    nombre: nombreVista,
                    ids: identificadoresActuales,
                    urn: urn
                };
        
                // Realizar la solicitud HTTP para guardar la vista
                const response = await axios.post(API_BASE_URL+'/api/vistasGuardadas', nuevaVista);
                if (response.status === 201) {
                    console.log('Vista guardada exitosamente:', response.data);
                    cargarVistasGuardadas();
                    // Aquí puedes realizar cualquier acción adicional después de guardar la vista, como cerrar el modal
                    cerrarModal(); // Cerrar el modal después de guardar
                } else {
                    console.error('Error al guardar la vista:', response.data);
                    // Aquí puedes manejar el caso de que ocurra un error al guardar la vista
                }
            }
            else{
                if(seleccionActual.length >0){
                    const nuevaVista = {
                        nombre: nombreVista,
                        ids: seleccionActual,
                        urn: urn
                    };
            
                    // Realizar la solicitud HTTP para guardar la vista
                    const response = await axios.post(API_BASE_URL+'/api/vistasGuardadas', nuevaVista);
                    if (response.status === 201) {
                        console.log('Vista guardada exitosamente:', response.data);
                        cargarVistasGuardadas();
                        // Aquí puedes realizar cualquier acción adicional después de guardar la vista, como cerrar el modal
                        cerrarModal(); // Cerrar el modal después de guardar
                    } else {
                        console.error('Error al guardar la vista:', response.data);
                        // Aquí puedes manejar el caso de que ocurra un error al guardar la vista
                    }
                }else{
                    console.log("sin identificadores");
                    toast.error(` No hay elementos seleccionados, debe seleccionar elementos usando los filtros, click izquierdo del mouse o shift+click izquierdo de mouse`);
                }
              
            }
    
            // Comprobar si la vista se guardó correctamente
            
        } catch (error) {
            console.error('Error al guardar la vista:', error);
            // Aquí puedes manejar el caso de que ocurra un error al realizar la solicitud HTTP
        }
    };
    const handleSelectChange = (selectedOption) => {
        // Elimina esta línea: const { handleSelectChange } = this.props;
        despliegaSavedVista(selectedOption.ids);
        identificadoresActual = selectedOption.ids;
        setVistaSeleccionada(selectedOption);
    };
    async function handleDeleteClick(idVS) {
        console.log("ID A BORRAR");
        console.log(idVS);
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta vista?");
        if (!confirmDelete) {
            return; // Detiene la función si el usuario cancela la acción
        }
    
        try {
            const response = await fetch(API_BASE_URL+`/api/vistasGuardadas/${idVS}`, {
                method: 'DELETE', // Método HTTP
            });
    
            if (!response.ok) {
                throw new Error('La vista guardada con ese ID no fue encontrada o ocurrió un error al eliminarla');
            }
    
            const result = await response.text(); // O `response.json()` si tu API devuelve un JSON
            console.log(result); // "Vista guardada eliminada"
            alert('Vista guardada eliminada correctamente');
            cargarVistasGuardadas();
            // Aquí podrías también actualizar el estado de tu componente para reflejar que la vista fue eliminada,
            // por ejemplo, eliminándola de la lista de vistas mostradas al usuario.
        } catch (error) {
            console.error("Error al eliminar la vista guardada:", error.message);
            alert("Ocurrió un error al eliminar la vista guardada.");
        }
    }
    
    const abrirModalEliminar = () => setModalEliminarIsOpen(true);
    const cerrarModalEliminar = () => setModalEliminarIsOpen(false);

    const cargarVistasGuardadas = async () => {
        try {
            const response = await axios.get(API_BASE_URL+`/api/vistasGuardadasPorUrn/${urn}`);
            const vistas = response.data.map(vista => ({
                value: vista._id,
                label: vista.nombre,
                ids: vista.ids
            }));
            setOpcionesDeVistas(vistas);
        } catch (error) {
            console.error('Error al cargar las vistas guardadas:', error);
        }
    };
    window.onunhandledrejection = function(event) {
        console.error('Unhandled Rejection:', event.reason);
        return true;
    };
    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo'); 
        const esAdministradorEditor = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador'|| tipoUsuario === 'Editor';
        setAdministradorEditor(esAdministradorEditor);
        cargarVistasGuardadas();
        // Otros efectos que necesiten ejecutarse en el montaje vendrían aquí
    }, [urn]); 

    const estiloDelComponente = {
        width: '450px',
        marginTop:'50px',
        zIndex: 1000,
        position: 'fixed',
        top: topPosition,
        right: '50px',
        backgroundColor: '#DA291C',
        padding: '10px',
        borderRadius: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        color: 'white'
    };

    const estiloCabecera = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        marginLeft: '8px', // Agrega un margen a la izquierda del texto
    };
    const estiloSelect = {
        marginLeft: '10px', // Agrega un margen a la izquierda del select
    };
    const estiloBoton = {
        border: '2px solid white', // Borde blanco
        borderRadius: '20px', // Hacerlo redondeado
        backgroundColor: '#DA291C', // Color de fondo rojo
        color: 'white', // Letras blancas
        cursor: 'pointer',
        padding: '5px 10px', // Agrega un poco de relleno para que se vea mejor
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    const modalStyle = {
        content: {
          position: 'fixed',
          top: '35%',
          left: '35%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          width: '450px',
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
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
      };

    const customSelectStyles = {
        option: (provided) => ({
            ...provided,
            color: 'black', // Color del texto negro
        }),
      
        control: (provided) => ({
            ...provided,
            border: '2px solid white', // Agrega un borde blanco
            borderRadius: '10px', // Redondea los bordes del select
            borderColor: '#DA291C', // Color del borde
           
            color: '#DA291C', // Color del texto,
            height: '50px', // Establecer el alto del control
            minHeight: '50px' // Establecer la altura mínima para asegurar que no sea menor
        }),
        valueContainer: (provided) => ({
            ...provided,
            color: 'white', // Texto blanco siempre
        }),
 
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: 'white', // Icono del indicador blanco siempre
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            borderRadius: '0 10px 10px 0', // Redondea los bordes de la zona de indicadores
            backgroundColor: '#DA291C', // Fondo rojo
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: '#DA291C', // Color del separador de indicadores
        }),
        // Puedes agregar más estilos personalizados según sea necesario
    };

    const estiloImagenBoton = {
        marginRight: '15px', // Espacio entre el icono y el texto,
        color: 'white'
    };

    
    return isVisible ?(
        <div style={estiloDelComponente}>
            <div style={estiloCabecera}>
                <span>Administrador de Vistas</span>

                {esAdministradorEditor && (
                <button  onClick={abrirModal} style={estiloBoton}>
                    <img src="images/masVista.svg" alt="Nueva Vista"   style={estiloImagenBoton}/> Guardar 
                </button>)}
                {esAdministradorEditor && (
                <button onClick={abrirModalEliminar} style={estiloBoton}>
                <FontAwesomeIcon icon={faTrash} style={estiloImagenBoton}/> Eliminar
                </button>)}
                

            </div>
            <Select
                options={opcionesDeVistas}
                value={vistaSeleccionada}
                onChange={handleSelectChange}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary25: 'rgba(255, 255, 255, 0.25)',
                        primary: 'white',
                    },
                })} styles={customSelectStyles}
            />  
           <Modal
    isOpen={modalEliminarIsOpen}
    onRequestClose={cerrarModalEliminar}
    style={modalStyle}
    contentLabel="Eliminar Vista"
    appElement={document.getElementById('root')}
>
    <div style={{ position: 'relative', overflowY: 'auto', maxHeight: '250px' }}>
        <button 
            onClick={cerrarModalEliminar} 
            style={{
                position: 'absolute', 
                top: '0px', 
                right: '8px', 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer', 
                color: 'red', 
                fontSize: '24px'
            }}
        >
            &times; {/* Este es el símbolo de "X" */}
        </button>

        <h2>Eliminar Vista</h2>
        <div>
            {opcionesDeVistas.map(vista => (
                <div key={vista.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span>{vista.label}</span>
                    <button 
                        onClick={() => handleDeleteClick(vista.value)}
                        style={{ ...estiloBoton, backgroundColor: 'red' }}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>

                </div>
            ))}
        </div>
    </div>
</Modal>





            <Modal
              isOpen={modalIsOpen}
              onRequestClose={cerrarModal}
              style={modalStyle}
              contentLabel="Nueva Vista"
              appElement={document.getElementById('root')}
            >
              <h2>Nueva Vista</h2>
              <div style={{ margin: '20px 0' }}>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={nombreVista}
                  onChange={(e) => setNombreVista(e.target.value)}
                  style={{ display: 'block', width: '100%', padding: '10px', marginTop: '10px' }}
                />
              </div>
              <div style={{ display: 'flex', marginLeft:'25%', marginTop: '20px' }}>
                <button
                  onClick={guardarVista}
                  style={{ backgroundColor: '#DA291C', color: 'white', border: 'none',  borderRadius: '15px',padding: '10px 20px', cursor: 'pointer' }}
                >
                  Guardar
                </button>
                <button
                  onClick={cerrarModal}
                  style={{ backgroundColor: '#DA291C', color: 'white', marginLeft:'20px', borderRadius: '15px',border: 'none', padding: '10px 20px', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
              </div>
            </Modal>
            <div style={{ height: '35px' }}></div>

            
        </div>
    ):null;
};

export default AdministradorDeVistas;