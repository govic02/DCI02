import React, { useState } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useActions } from '../../context/ProyectoContext';
const AdministracionProyecto = () => {
    const [activeKey, setActiveKey] = useState('informacionGeneral');
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [descripcionProyecto, setDescripcionProyecto] = useState('');
    const { generarTotalPesoPisos } = useActions();
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
        width:'450px',
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
    const guardarDatosModelo =()=>{
        console.log('El nombre del proyecto es:');
        generarTotalPesoPisos();
    }
    return (
        <div style={tabStyle}>
            <Tabs defaultActiveKey="informacionGeneral" id="tab-administracion-proyecto" onSelect={onSelect} style={tabHeaderStyle}>
                <Tab eventKey="informacionGeneral" title={<span><img src={getTabImage('informacionGeneral')} alt="" />Proyecto</span>}>
                    <div style={tabContentStyle}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Proyecto</Form.Label>
                            <Form.Control type="text" value={nombreProyecto} onChange={(e) => setNombreProyecto(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción del Proyecto</Form.Label>
                            <Form.Control as="textarea" rows={3} value={descripcionProyecto} onChange={(e) => setDescripcionProyecto(e.target.value)} />
                        </Form.Group>
                        <Button style={botonEstilo}>TRANSFERIR DATOS</Button>
                        <p></p>   <Button onClick={guardarDatosModelo} style={{...botonEstilo, marginTop: '10px'}}>Mostrar Nombre del Proyecto</Button><p></p> <p></p><br></br>
                        
                    </div>
                </Tab>
                <Tab eventKey="configuracionAdicional" title={<span><img src={getTabImage('configuracionAdicional')} alt="" /> Usuarios</span>}>
                    <div style={tabContentStyle}>
                        {/* Aquí puedes agregar contenido adicional para la configuración del proyecto */}
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
};

export default AdministracionProyecto;
