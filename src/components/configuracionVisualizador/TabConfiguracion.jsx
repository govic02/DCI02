import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import API_BASE_URL from '../../config';
const TabConfiguracion = () => {
    const [activeKey, setActiveKey] = useState('filtrosVisuales');
    const [filtroVisual01, setFiltroVisual01] = useState('');
    const [filtroVisual02, setFiltroVisual02] = useState('');
    const [parametroBarras, setParametroBarras] = useState('');
    const [variableTiempo, setVariableTiempo] = useState('');
    const onSelect = (k) => {
        setActiveKey(k);
    };

    useEffect(() => {
        const cargarConfiguracion = async () => {
            const url = `${API_BASE_URL}/api/configuracionViewer`;
            try {
                const respuesta = await fetch(url);
                const resultado = await respuesta.json();
                if (respuesta.ok) {
                    // Actualiza el estado con los valores obtenidos
                    const { configuracion } = resultado;
                    setFiltroVisual01(configuracion.filtro01 || '');
                    setFiltroVisual02(configuracion.filtro02 || '');
                    setParametroBarras(configuracion.variableBarra || '');
                    setVariableTiempo(configuracion.variableTiempo || '');

                    
                } else {
                    // Manejar la respuesta no exitosa (p.ej. configuración no encontrada)
                    console.error('Configuración no encontrada:', resultado.mensaje);
                }
            } catch (error) {
                console.error('Error al cargar la configuración:', error);
            }
        };

        cargarConfiguracion();
    }, []); // El arreglo vacío indica que este efecto se ejecuta una sola vez, al montar el componente

    const getTabImage = (key) => {
        if (key === 'filtrosVisuales') {
            return activeKey === 'filtrosVisuales' ? 'images/filtroVisualIcn.svg' : 'images/filtroVisualIcn.svg';
        } else if (key === 'variablesTiempo') {
            return activeKey === 'variablesTiempo' ? 'images/variableTiempoIcn.svg' : 'images/variableTiempoIcn.svg';
        }
    };
    ///api/setFiltros
    const guardarConfiguracion = async () => {
        const url = API_BASE_URL+'/api/configuracionViewer'; // Asegúrate de usar la URL correcta
        const data = {
            urn: "URN",
            filtro01: filtroVisual01,
            filtro02: filtroVisual02,
            variableBarra: parametroBarras,
            variableTiempo: variableTiempo 
        };
    
        try {
            console.log("inicio envio tab configuración");
            console.log(data);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
    
            const resultado = await response.json();
            console.log(resultado);
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
        }
    };
    
    const handleSave = () => {
        console.log("Valores guardados:");
        console.log("Filtro Visual 01:", filtroVisual01);
        console.log("Filtro Visual 02:", filtroVisual02);
        console.log("Parámetro Barras:", parametroBarras);
        console.log("Variable de Tiempo:", variableTiempo);
 
    };
    const tabStyle = {
        marginTop: '50px',
        marginLeft: '30px',
        marginRight: '30px',
        height: '385px',
        overflow: 'auto'
    };

    const buttonStyle = {
        backgroundColor: '#DA291C',
        borderColor: '#DA291C',
        color: 'white',
    }
    const tabContentStyle = {
        backgroundColor: 'white',
        borderRadius: '0 20px 20px 20px',
        padding: '15px',
        height: '100%',
        overflowY: 'auto',
        fontWeight: 'bold'
    };

    const tabHeaderStyle = {
        borderRadius: '30px 30px 0 0',
    };

    return (
        <div style={tabStyle}>
            <Tabs defaultActiveKey="filtrosVisuales" id="tab-configuracion" onSelect={onSelect} style={tabHeaderStyle}>
                <Tab eventKey="filtrosVisuales" title={<span><img src={getTabImage('filtrosVisuales')} alt="Filtros Visuales" /> Filtros Visuales</span>}>
                    <div style={tabContentStyle}>
                        <Form.Group className="mb-3">
                            <Form.Label>Filtro Visual 01</Form.Label>
                            <Form.Control type="text" value={filtroVisual01} onChange={(e) => setFiltroVisual01(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Filtro Visual 02</Form.Label>
                            <Form.Control type="text" value={filtroVisual02} onChange={(e) => setFiltroVisual02(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Parámetro Barras</Form.Label>
                            <Form.Control type="text" value={parametroBarras} onChange={(e) => setParametroBarras(e.target.value)} />
                        </Form.Group>
                        <Button style={buttonStyle} onClick={guardarConfiguracion}>Guardar</Button>
                    </div>
                </Tab>
                <Tab eventKey="variablesTiempo" title={<span><img src={getTabImage('variablesTiempo')}  /> Variables de Tiempo</span>}>
                    <div style={tabContentStyle}>
                    <Form.Group className="mb-3">
                            <Form.Label>Variable de Tiempo</Form.Label>
                            <Form.Control type="text" value={variableTiempo} onChange={(e) => setVariableTiempo(e.target.value)} />
                        </Form.Group>
                        {/* Aquí puedes agregar el contenido de la pestaña "Variables de Tiempo" */}
                        <Button style={buttonStyle} onClick={guardarConfiguracion}>Guardar</Button>
                    </div>
                </Tab>
            </Tabs>
              {/* Botón Guardar */}
              <div className="mt-3">
               
            </div>
        </div>
    );
};

export default TabConfiguracion;
