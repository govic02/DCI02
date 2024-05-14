import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import API_BASE_URL from '../../config';
const TabConfiguracion = (urn) => {
    const [activeKey, setActiveKey] = useState('filtrosVisuales');
    const [filtroVisual01, setFiltroVisual01] = useState('');
    const [filtroVisual02, setFiltroVisual02] = useState('');
    const [parametroBarras, setParametroBarras] = useState('');
    const [variableTiempo, setVariableTiempo] = useState('');
    const [variableNivel,setVariableNivel] = useState('');
    const [variableLargo, setVariableLargo] = useState('');
    const [variablePesoLineal, setVariablePesoLineal] = useState('');
    const [variableDiametro, setvariableDiametro]= useState('');
    const onSelect = (k) => {
        setActiveKey(k);
    };

    useEffect(() => {
        const cargarConfiguracion = async () => {
            const url = `${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(urn.urn)}`;
          console.log("urn inicial", urn.urn);
            try {
                if(urn.urn != "" &&  urn.urn !== undefined ){
                    const respuesta = await fetch(url);
                const resultado = await respuesta.json();
                console.log("respuesta configuracion",respuesta);
                console.log("res",resultado);
                if (respuesta.ok) {
                    // Actualiza el estado con los valores obtenidos
                    const { configuracion } = resultado;
                    console.log("configuracion",configuracion);
                    setFiltroVisual01(resultado.filtro01 || '');
                    setFiltroVisual02(resultado.filtro02 || '');
                    setParametroBarras(resultado.variableBarra || '');
                    setVariableLargo(resultado.variableLargo || '');
                    setVariablePesoLineal(resultado.variablePesoLineal || '');
                    setVariableTiempo(resultado.variableTiempo || '');
                    setvariableDiametro(resultado.variableDiametro || '');
                    setVariableNivel(resultado.variableNivel || '');
                    
                } else {
                    // Manejar la respuesta no exitosa (p.ej. configuración no encontrada)
                    console.error('Configuración no encontrada:', resultado.mensaje);
                    setFiltroVisual01('');
                    setFiltroVisual02('');
                    setParametroBarras('');
                    setVariableLargo('');
                    setVariablePesoLineal('');
                    setVariableTiempo('');
                    setvariableDiametro('');
                    setVariableNivel('');
                }

                }
                
            } catch (error) {
                console.error('Error al cargar la configuración:', error);
            }
        };

        cargarConfiguracion();
    }, [urn.urn]); // El arreglo vacío indica que este efecto se ejecuta una sola vez, al montar el componente

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
        console.log("URN A ASOCIACIÓN", urn);
        const data = {
            urn: urn,
            filtro01: filtroVisual01,
            filtro02: filtroVisual02,
            variableBarra: parametroBarras,
            variableTiempo: variableTiempo ,
            variableLargo: variableLargo,
            variablePesoLineal: variablePesoLineal,
            variableDiametro:variableDiametro,
            variableNivel:variableNivel
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
        console.log("Variable de largo:", variableLargo);
        console.log("Variable de Peso Lineal:", variablePesoLineal);
        console.log("Variable de Nivel:", variableNivel);
 
    };
    const tabStyle = {
        marginTop: '50px',
        marginLeft: '30px',
        marginRight: '30px',
    
        
        
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
                        <Form.Group className="mb-3">
                            <Form.Label>Parámetro Largo</Form.Label>
                            <Form.Control type="text" value={variableLargo} onChange={(e) => setVariableLargo(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Parámetro peso Lineal</Form.Label>
                            <Form.Control type="text" value={variablePesoLineal} onChange={(e) => setVariablePesoLineal(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Parámetro Diametro</Form.Label>
                            <Form.Control type="text" value={variableDiametro} onChange={(e) => setvariableDiametro(e.target.value)} />
                        </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Variable de Tiempo</Form.Label>
                            <Form.Control type="text" value={variableTiempo} onChange={(e) => setVariableTiempo(e.target.value)} />
                        </Form.Group>
                      
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
