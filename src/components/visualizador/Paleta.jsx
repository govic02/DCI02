import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Tabs, Tab, Button, Modal, Form } from 'react-bootstrap';
import './paleta.css';
import axios from 'axios';
import { ActionsContext } from '../../context/ActionContext';
import { useVisibility } from '../../context/VisibilityContext';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const Paleta = ({ urnBuscada }) => {
    const [showModal, setShowModal] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 60 });
    const [dragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showEditDatesModal, setShowEditDatesModal] = useState(false);
    const [fechaPlan, setFechaPlan] = useState('');
    const [fechaInstalacion, setFechaInstalacion] = useState('');
    const { selectedObjectProps, resultadoFierros, seleccionActual, obtenerIdsConFecha, obtenerIdsSinFecha, buscaBarrasHormigon, cleanModel, gestionarYpintarIds } = useContext(ActionsContext);
    const [esAdministradorEditor, setAdministradorEditor] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [colores, setColores] = useState([
        { color: '#0E31F3 ', descripcion: 'Ok Instalación' },
        { color: '#303031 ', descripcion: 'Sin fecha plan' },
        { color: '#FA1F05 ', descripcion: 'Fecha plan caducada' },
        { color: '#FC9E05 ', descripcion: 'Fecha plan < 7 días' },
        { color: '#FAF705 ', descripcion: 'Fecha plan >= 7 días' }
    ]);

    const estiloDelComponente = {
        width: '65px',
        height: '210px',
        position: 'absolute',
        left: '30px',
        top: '30%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: '#DA291C',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };

    const estiloFila = {
        flex: '1',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '8px'
    };

    const estiloSeparador = {
        height: '1px',
        backgroundColor: '#FF8B8B',
        width: '80%',
        alignSelf: 'center'
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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '20px',
        overflow: 'auto',
        padding: '10px'
    };

    const handleBuscaBarrasClick = () => {
        toast.info('Iniciando el proceso de cálculo, espere unos segundos');
        buscaBarrasHormigon();
    };

    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo');
        const esAdministradorEditor = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador' || tipoUsuario === 'Editor';
        setAdministradorEditor(esAdministradorEditor);
    }, [resultadoFierros, seleccionActual]);

    const handleObtenerIds = async () => {
        try {
            // Tu lógica aquí
        } catch (error) {
            console.error('Error al obtener los IDs:', error);
        }
    };

    const handleEditarFechasClick = async () => {
        let dbId = selectedObjectProps?.dbId;

        if (resultadoFierros && resultadoFierros.length > 1 && seleccionActual && seleccionActual.length === 1) {
            dbId = seleccionActual[0];
        }

        if (dbId && urnBuscada) {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/objetos/${dbId}/${urnBuscada}`);
                const { fecha_plan, fecha_instalacion } = response.data;
                const fechaPlanFormatted = fecha_plan ? fecha_plan.split('T')[0] : '';
                const fechaInstalacionFormatted = fecha_instalacion ? fecha_instalacion.split('T')[0] : '';
                setFechaPlan(fechaPlanFormatted);
                setFechaInstalacion(fechaInstalacionFormatted);
                setShowEditDatesModal(true);
            } catch (error) {
                console.error('Error al obtener los datos del objeto:', error);
            }
        }
    };

    useEffect(() => {
        const toggleVisibilityPaleta = () => {
            setIsVisible(prev => !prev);
        };

        window.addEventListener('toggleTabVisibilityPaleta', toggleVisibilityPaleta);

        return () => {
            window.removeEventListener('toggleTabVisibilityPaleta', toggleVisibilityPaleta);
        };
    }, []);

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
        setShowModal(!showModal);
        handleObtenerIds();
    };

    const LimpiarProyecto = () => {
        cleanModel();
    };

    const pintarFechas = () => {
        setColorModalVisible(true);
        gestionarYpintarIds();
    };

    const handleGuardarClick = async () => {
        toast.success('Iniciado proceso de guardado. espere unos segundos.. será notificado al terminar');
        if (resultadoFierros && resultadoFierros.length > 0) {
            const objetosParaGuardar = resultadoFierros.map(barra => ({
                urn: urnBuscada,
                IdObjeto: barra.id,
                fecha_plan: fechaPlan,
                fecha_instalacion: fechaInstalacion,
                fecha_plan_modelo: '',
                dateModificacion: new Date()
            }));

            try {
                const response = await axios.post(`${API_BASE_URL}/api/objetoProyectoPlanMasivo`, objetosParaGuardar);
                toast.success('Datos guardados exitosamente');
                setShowEditDatesModal(false);
            } catch (error) {
                console.error('Error al guardar los datos masivamente:', error);
                toast.error('Error al guardar los datos masivamente.');
            }
        } else {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/objetoProyectoPlan`, {
                    urn: urnBuscada,
                    IdObjeto: selectedObjectProps.dbId,
                    fecha_plan: fechaPlan,
                    fecha_instalacion: fechaInstalacion,
                    fecha_plan_modelo: '',
                    dateModificacion: new Date()
                });
                toast.success('Datos guardados exitosamente');
                setShowEditDatesModal(false);
            } catch (error) {
                console.error('Error al guardar los datos:', error);
                toast.error('Error al guardar los datos.');
            }
        }
    };

    const getFilteredProperties = () => {
        const category = selectedObjectProps?.properties?.find(prop => prop.displayName === 'Category')?.displayValue;
        if (!category) return [];
    
        let filteredProps = [];
    
        switch (category) {
            case 'Revit Walls':
            case 'Revit Floors':
            case 'Revit Structural Foundations':
                filteredProps = [
                    'Category', 'Base Constraint', 'Unconnected Height', 'Rebar Cover - Exterior Face', 'Rebar Cover - Interior Face',
                    'Rebar Cover - Other Faces', 'Length', 'Area', 'Volume', 'Comments', 'AEC Partición HA', 'AEC Piso',
                    'AEC Secuencia Hormigonado', 'Width', 'Structural Material'
                ];
                break;
            case 'Revit Structural Columns':
                filteredProps = ['Level', 'Structural Material'];
                break;
            case 'Revit Structural Framing':
                filteredProps = [
                    'Structural Material', 'Rebar Cover - Top Face', 'Rebar Cover - Bottom Face', 'Rebar Cover - Other Faces',
                    'Volume', 'Comments', 'AEC Partición HA', 'AEC Piso', 'b', 'h'
                ];
                break;
            default:
                filteredProps = [
                    'Material', 'Level', 'Structural', 'Building Story', 'Bar Diameter', 'Standard Bend Diameter', 'Standard Hook Bend Diameter',
                    'Stirrup/Tie Bend Diameter', 'Partition', 'Rebar Number', 'Schedule Mark', 'AEC Grupo', 'AEC Forma', 'AEC Peso Lineal',
                    'AEC Código Interno', 'AEC Bloquear barras', 'AEC Uso Barra', 'AEC Uso Barra (Bloquear)', 'AEC Cantidad', 'AEC Id',
                    'AEC Sub Uso Barra', 'AEC Uso Barra (Categoría)', 'View Visibility States', 'Geometry', 'Style', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'O', 'R',
                    'Bar Length', 'Total Bar Length', 'Reinforcement Volume', 'Quantity', 'Spacing', 'Shape', 'Shape Image', 'Hook At Start',
                    'Hook Rotation At Start', 'End Treatment At Start', 'Hook At End', 'Hook Rotation At End', 'End Treatment At End',
                    'Override Hook Lengths', 'Host Category', 'Host Mark', 'Stirrup/Tie Attachment'
                ];
        }
    
        return selectedObjectProps?.properties?.filter(prop => filteredProps.includes(prop.displayName)) || [];
    };
    

    return isVisible ? (
        <div style={estiloDelComponente}>
            {colorModalVisible && (
                <div style={{
                    position: 'fixed',
                    width: '200px',
                    left: '200px',
                    top: '300px',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 1001
                }}>
                    <h5>Mapa de Estados</h5>
                    <ul style={{ paddingLeft: '0', listStyleType: 'none', textAlign: 'left' }}>
                        {colores.map((item, index) => (
                            <li key={index} style={{
                                marginBottom: '5px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: item.color,
                                    marginRight: '5px'
                                }}></span>
                                <span style={{ color: 'black', fontSize: '12px' }}>{item.descripcion}</span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={() => setColorModalVisible(false)}
                        style={{
                            backgroundColor: '#DA291C',
                            color: 'white',
                            fontSize: '12px',
                            borderColor: '#DA291C'
                        }}
                    >
                        Cerrar
                    </Button>
                </div>
            )}
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
                    <button
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            border: 'none',
                            background: 'transparent',
                            color: 'black',
                            cursor: 'pointer',
                            fontSize: '24px'
                        }}
                        onClick={toggleModal}
                    >
                        &times;
                    </button>
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
                            {selectedObjectProps && selectedObjectProps.name ? (
                                <>
                                    <h4>Propiedades</h4>
                                    <h8>dbId: {selectedObjectProps.dbId}, Nombre: {selectedObjectProps.name}</h8>
                                    <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #cccccc', borderRadius: '10px' }}>
                                        {getFilteredProperties().map((prop, index) => (
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
                            ) : (
                                <div>
                                    <h5>No ha seleccionado ningún objeto</h5>
                                </div>
                            )}
                        </>
                    )}
                    {selectedObjectProps.properties && selectedObjectProps.properties.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            {esAdministradorEditor && (
                                <button
                                    style={{ backgroundColor: '#DA291C', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '10PT', marginRight: '10px' }}
                                    onClick={handleEditarFechasClick}
                                >
                                    Editar Fechas
                                </button>
                            )}
                            <button
                                style={{ backgroundColor: '#DA291C', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '10PT' }}
                                onClick={handleBuscaBarrasClick}
                            >
                                Buscar Barras incluidas
                            </button>
                        </div>
                    )}
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
                                        <Button key={index} variant="outline-primary" style={{ backgroundColor: '#DA291C', borderColor: '#DA291C', color: 'white', fontSize: '8pt', margin: '5px' }} onClick={() => console.log(`ID seleccionado: ${barra.id}`)}>
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
    ) : null;
    
};

export default Paleta;
