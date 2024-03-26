import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Tabs, Tab, Button,Modal,Form  } from 'react-bootstrap';
import './paleta.css';
import axios from 'axios';
import { ActionsContext } from '../../context/ActionContext';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';
const Paleta =  ({ urnBuscada })  => {

    const [showModal, setShowModal] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 60 }); // Posición inicial de la ventana
    const [dragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showEditDatesModal, setShowEditDatesModal] = useState(false);
    const [fechaPlan, setFechaPlan] = useState('');
    const [fechaInstalacion, setFechaInstalacion] = useState('');
    const { selectedObjectProps,resultadoFierros, seleccionActual,obtenerIdsConFecha, obtenerIdsSinFecha,buscaBarrasHormigon,cleanModel,gestionarYpintarIds} = useContext(ActionsContext); // Aquí usas useContext para acceder al contexto
    

  
    
    const estiloDelComponente = {
        width: '65px',
        height: '210px',
        position: 'absolute', // Cambiado de 'fixed' a 'absolute'
        left: '30px', // Ajustar el margen izquierdo
        
        top: '30%', // Ajusta según la ubicación deseada
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: '#DA291C', // Color de fondo actualizado
        borderRadius: '20px', // Bordes redondeados
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Sombra para el efecto flotante
    };

    const estiloFila = {
        flex: '1',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '8px' // Margen alrededor del SVG
    };

    const estiloSeparador = {
        height: '1px',
        backgroundColor: '#FF8B8B', // Color del separador
        width: '80%', // Ancho del separador
        alignSelf: 'center' // Alinea el separador al centro del contenedor
    };
    const modalStyle = {
        width: '350px',
        height: '450px',
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'lightgrey',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column', // Asegura que los elementos internos se apilen verticalmente
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '20px',
        overflow: 'auto', // Habilita el scroll si el contenido excede el tamaño
        padding: '10px' // Añade algo de padding alrededor del contenido
    };
    const handleBuscaBarrasClick = () => {
        toast.info('Iniciando el proceso de cálculo, espere unos segundos');
        buscaBarrasHormigon(); // Llama a la función del contexto
        
    };
    useEffect(() => {
        console.log("Fierros buscados desde paleta", resultadoFierros);
        console.log("Seleccion actual desde Paleta", seleccionActual);
    }, [resultadoFierros,seleccionActual]); // Dependencia del efecto
    
    //
    const handleObtenerIds = async () => {
        try {
           
        } catch (error) {
            console.error('Error al obtener los IDs:', error);
        }
    };
    const handleEditarFechasClick = async () => {
        let dbId = selectedObjectProps?.dbId; // ID por defecto
    
        // Condición para cambiar el ID a buscar
        if (resultadoFierros && resultadoFierros.length > 1 && seleccionActual && seleccionActual.length === 1) {
            dbId = seleccionActual[0]; // Usar el primer ID de seleccionActual
        }
    
        if (dbId && urnBuscada) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/objetos/${dbId}/${urnBuscada}`);
                const { fecha_plan, fecha_instalacion } = response.data;
                const fechaPlanFormatted = fecha_plan ? fecha_plan.split('T')[0] : '';
                const fechaInstalacionFormatted = fecha_instalacion ? fecha_instalacion.split('T')[0] : '';
                console.log("fecha recibida ",response.data);
                console.log("fecha recibida ",fechaPlanFormatted);
                console.log("fecha recibida instalacion ",fechaInstalacionFormatted);
                setFechaPlan(fechaPlanFormatted);
                setFechaInstalacion(fechaInstalacionFormatted);
                setShowEditDatesModal(true);
            } catch (error) {
                console.error('Error al obtener los datos del objeto:', error);
            }
        }
    };
    
    

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
          x: e.clientX - position.rel.x,
          y: e.clientY - position.rel.y
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const handleMouseUp = () => setIsDragging(false);


    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const toggleModal = () => {
        setShowModal(!showModal)
        handleObtenerIds();
       
    };
    const LimpiarProyecto = ()=>{
        cleanModel();
    }
    const pintarFechas=()=>{
        gestionarYpintarIds();
    }
    const handleGuardarClick = async () => {
        console.log("Guardando datos...");
        toast.success('Iniciado proceso de guardado. espere unos segundos.. será notificado al terminar');
        if (resultadoFierros && resultadoFierros.length > 0) {
            // Preparar el listado de objetos para el endpoint masivo
            const objetosParaGuardar = resultadoFierros.map(barra => ({
                urn: urnBuscada,
                IdObjeto: barra.id, // ID de la barra
                fecha_plan: fechaPlan,
                fecha_instalacion: fechaInstalacion,
                fecha_plan_modelo: '', // Puedes ajustar según sea necesario
                dateModificacion: new Date()
            }));
    
            try {
                const response = await axios.post(`${API_BASE_URL}/api/objetoProyectoPlanMasivo`, objetosParaGuardar);
                console.log('Datos guardados exitosamente:', response.data);
                toast.success('Datos guardados exitosamente');
                setShowEditDatesModal(false); // Cerrar el modal después de guardar
            } catch (error) {
                console.error('Error al guardar los datos masivamente:', error);
                toast.error('Error al guardar los datos masivamente.');
            }
        } else {
            // Proceder como antes si no hay elementos en resultadoFierros
            try {
                const response = await axios.post(`${API_BASE_URL}/api/objetoProyectoPlan`, {
                    urn: urnBuscada,
                    IdObjeto: selectedObjectProps.dbId,
                    fecha_plan: fechaPlan,
                    fecha_instalacion: fechaInstalacion,
                    fecha_plan_modelo: '',
                    dateModificacion: new Date()
                });
    
                console.log('Datos guardados exitosamente:', response.data);
                toast.success('Datos guardados exitosamente');
                setShowEditDatesModal(false); // Cerrar el modal después de guardar
            } catch (error) {
                console.error('Error al guardar los datos:', error);
                toast.error('Error al guardar los datos.');
            }
        }
    };
    
    return (
        <div style={estiloDelComponente}>
        
            <div style={estiloFila} onClick={pintarFechas}>
                <img src="images/paletaBrocha.svg" alt="Icono 1" />
            </div>
            <div style={estiloSeparador}></div>
            <div style={estiloFila} onClick={LimpiarProyecto}>
                <img src="images/paletaRefrescar.svg" alt="Icono 2" />
            </div>
            <div style={estiloSeparador}></div>
            <div style={estiloFila} onClick={toggleModal}>
                <img src="images/paletaFecha.svg" alt="Icono 3" />
            </div>
            {showModal && (
    <div style={modalStyle}>
        {resultadoFierros && resultadoFierros.length > 1 ? (
            <>
                <h4>Barras Incluidas en Selección</h4>
                <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #cccccc', borderRadius: '10px' }}>
                    {resultadoFierros.map((barra, index) => (
                        <Button key={index} variant="outline-primary" style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white', fontSize: '8pt', margin: '5px' }} onClick={() => console.log(`ID seleccionado: ${barra.id} - Peso: ${barra.pesoLineal}kg - Longitud: ${barra.longitudTotal}m - Diámetro: ${barra.diametroBarra}mm`)}>
                            ID: {barra.id} -  Peso: {(barra.pesoLineal * 1000).toFixed(2)}kg - Long: {(barra.longitudTotal / 100).toFixed(2)}m - Dm: {barra.diametroBarra}mm
                        </Button>
                    ))}
                </div>
            </>
        ) : (
            <>
                <h4>Propiedades</h4>
                <h8>dbId: {selectedObjectProps?.dbId}, Nombre: {selectedObjectProps?.name}</h8>
                <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #cccccc', borderRadius: '10px' }}>
                    {selectedObjectProps.properties?.map((prop, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                                <span className="fw-bold text-truncate" style={{ fontWeight: 'bold' }}>{prop.displayName}</span>
                                <span> | </span>
                                <span>{prop.displayValue}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
  {selectedObjectProps.properties && selectedObjectProps.properties.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          
                <button 
                    style={{ backgroundColor: '#DA291C', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '10PT', marginRight: '10px' }} 
                    onClick={handleEditarFechasClick}
                >
                    Editar Fechas
                </button>
           
            
            <button 
                style={{ backgroundColor: '#DA291C', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '10PT' }}
                onClick={handleBuscaBarrasClick}
            >
                Buscar Barras incluidas
            </button>
        </div> )}
    </div>
)}

            {dragging && (
                <div 
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="draggable-overlay"
                />
            )}
  <Modal show={showEditDatesModal} onHide={() => setShowEditDatesModal(false)} style={{ top: '350px', left: '650px', maxWidth: '500px', width: '100%', height: '600px' }}>
    <Modal.Header closeButton>
        <Modal.Title>{resultadoFierros && resultadoFierros.length > 0 ? "Información de Barras" : "Editar Fechas"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {resultadoFierros && resultadoFierros.length > 0 ? (
            <>
                <div>
                    <Form.Label>Cantidad de Barras afectadas: {resultadoFierros.length}</Form.Label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                       {resultadoFierros.map((barra, index) => (
                            <Button key={index} variant="outline-primary"style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white', fontSize: '8pt',margin:'5px' }} onClick={() => console.log(`ID seleccionado: ${barra.id}`)}>
                           ID: {barra.id} -  Peso: {(barra.pesoLineal * 1000).toFixed(2)}kg - Long: {(barra.longitudTotal / 100).toFixed(2)}m - Dm: {barra.diametroBarra}mm
                        </Button>
                        ))}
                    </div>
                </div>
                <Form>
                    <Form.Group className="mb-3" controlId="fechaPlan">
                        <Form.Label>Fecha Plan</Form.Label>
                        <Form.Control type="date" value={fechaPlan} onChange={e => setFechaPlan(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="fechaPlanModelo">
                        <Form.Label>Fecha instalación</Form.Label>
                        <Form.Control type="date" value={fechaInstalacion} onChange={e => setFechaInstalacion(e.target.value)} />
                    </Form.Group>
                </Form>
            </>
        ) : (
            <Form>
                {/* El contenido original del formulario para editar fechas */}
                <Form.Group className="mb-3" controlId="formNombreObjeto">
                    <Form.Label>Nombre del objeto</Form.Label>
                    <Form.Control type="text" placeholder={selectedObjectProps?.name} readOnly />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDbId">
                    <Form.Label>dbId</Form.Label>
                    <Form.Control type="text" placeholder={selectedObjectProps?.dbId?.toString()} readOnly />
                </Form.Group>
                <Form.Group className="mb-3" controlId="fechaPlan">
                    <Form.Label>Fecha Plan</Form.Label>
                    <Form.Control type="date" value={fechaPlan} onChange={e => setFechaPlan(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="fechaInstalacion">
                    <Form.Label>Fecha Instalación</Form.Label>
                    <Form.Control type="date" value={fechaInstalacion} onChange={e => setFechaInstalacion(e.target.value)} />
                </Form.Group>
            </Form>
        )}
    </Modal.Body>
    <Modal.Footer>
        <Button style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white' }} onClick={() => setShowEditDatesModal(false)}>Cerrar</Button>
        {resultadoFierros && resultadoFierros.length > 0 ? (
            <Button style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white' }} onClick={handleGuardarClick}>Guardar Cambios</Button>
        ) : (
            <Button style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white' }} onClick={handleGuardarClick}>Guardar</Button>
        )}
    </Modal.Footer>
</Modal>

        </div>
        
    );
};

export default Paleta;
