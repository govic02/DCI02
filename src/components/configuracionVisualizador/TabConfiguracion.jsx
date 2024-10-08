import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Button } from 'react-bootstrap';
import API_BASE_URL from '../../config';
import Select from 'react-select';
import { useActions } from '../../context/ProyectoContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TabConfiguracion = (urn) => {
    const [activeKey, setActiveKey] = useState('filtrosVisuales');
    const [filtroVisual01, setFiltroVisual01] = useState('');
    const [filtroVisual02, setFiltroVisual02] = useState('');
    const [parametroBarras, setParametroBarras] = useState('');
    const [variableTiempo, setVariableTiempo] = useState('');
    const [variableNivel,setVariableNivel] = useState({ value: 'Level', label: 'Level' });
    const [variableLargo, setVariableLargo] = useState('');
    const [variablePesoLineal, setVariablePesoLineal] = useState('');
    const [variableDiametro, setvariableDiametro]= useState('');
    const [propiedades, setPropiedades] = useState([]);
    const actions = useActions(); 
    const onSelect = (k) => {
        setActiveKey(k);
    };

   


    const obtenerPropiedadesModelo = async () => {
        const url = `${API_BASE_URL}/api/obtenerPropiedadesModelo?urn=${encodeURIComponent(urn.urn)}`;
        try {
            const response = await fetch(url);
          //console.log("Respuesta propiedades", response);

            if (!response.ok) {
                throw new Error('Error al obtener las propiedades del modelo');
            }

            const data = await response.json();
          //console.log('Propiedades obtenidas con éxito:', data);
            return data.propiedades;
        } catch (error) {
          //console.log('Error al obtener las propiedades del modelo:', error);
            return [];
        }
    };
 
    useEffect(() => {

        
        const cargarConfiguracion = async () => {
          
            const url = `${API_BASE_URL}/api/configuracionViewer?urn=${encodeURIComponent(urn.urn)}`;
           //console.log("urn inicial", urn.urn);
          
            try {

                
                if(urn.urn != "" &&  urn.urn !== undefined ){
                    const respuesta = await fetch(url);
                const resultado = await respuesta.json();
              //console.log("respuesta configuracion",respuesta);
              
                if (respuesta.ok) {
                    // Actualiza el estado con los valores obtenidos
                    const { configuracion } = resultado;
                  //console.log("resultado previo a",resultado);
                    const propiedades = await obtenerPropiedadesModelo();
                   
                    setPropiedades(propiedades);
                    const opcionesPropiedades = propiedades.map(prop => ({ value: prop, label: prop }));
                    const findOption = (value) => opcionesPropiedades.find(option => option.value === value) || null;
                  //console.log("resultado filtro 01 ",resultado.filtro01);
                    setFiltroVisual01(findOption(resultado.filtro01));
                    setFiltroVisual02(findOption(resultado.filtro02));
                    setParametroBarras(findOption(resultado.variableBarra));
                    setVariableLargo(findOption(resultado.variableLargo));
                    setVariablePesoLineal(findOption(resultado.variablePesoLineal));
                    setVariableTiempo(findOption(resultado.variableTiempo));
                    setvariableDiametro(findOption(resultado.variableDiametro));
                   // setVariableNivel(findOption(resultado.variableNivel));
                    
                } else {
                    // Manejar la respuesta no exitosa (p.ej. configuración no encontrada)
                    console.error('Configuración no encontrada:', resultado.mensaje);
                    setFiltroVisual01(null);
                    setFiltroVisual02(null);
                    setParametroBarras(null);
                    setVariableLargo(null);
                    setVariablePesoLineal(null);
                    setVariableTiempo(null);
                    setvariableDiametro(null);
                    setVariableNivel(null);
                }

                }
                setPropiedades([]);
                const propiedades = await obtenerPropiedadesModelo();
                setPropiedades(propiedades);
              //console.log('Propiedades obtenidas en Tab:', propiedades);
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
      //console.log("URN A ASOCIACIÓN", urn);
      //console.log("valores ", filtroVisual01);
        const data = {
            urn: urn,
            filtro01: filtroVisual01?.value|| '',
            filtro02: filtroVisual02?.value|| '',
            variableBarra: parametroBarras?.value|| '',
            variableTiempo: variableTiempo?.value|| '' ,
            variableLargo: variableLargo?.value|| '',
            variablePesoLineal: variablePesoLineal?.value|| '',
            variableDiametro:variableDiametro?.value|| '',
            variableNivel: 'Level'
        };
    
        try {
          //console.log("inicio envio tab configuración");
          //console.log(data);
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
          //console.log(resultado);
          toast.success('Configuración guardada con éxito', { toastId: 'configuracionguardada' });
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
            toasterror('Error al guardar la configuración', { toastId: 'errorconfiguracion' });
           
        }
    };
    
    const handleSave = () => {
      //console.log("Valores guardados:");
      //console.log("Filtro Visual 01:", filtroVisual01);
      //console.log("Filtro Visual 02:", filtroVisual02);
      //console.log("Parámetro Barras:", parametroBarras);
      //console.log("Variable de Tiempo:", variableTiempo);
      //console.log("Variable de largo:", variableLargo);
      //console.log("Variable de Peso Lineal:", variablePesoLineal);
      //console.log("Variable de Nivel:", variableNivel);
 
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
  


    const gridContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
    };
    const opcionesPropiedades = (propiedades || []).map(prop => ({ value: prop, label: prop }));

    return (
        <div style={tabStyle}>
                          <div>
                       <div style={gridContainerStyle}>
                
         
                <Form.Group className="mb-3">
                    <Form.Label>Filtro Visual 01</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={filtroVisual01}
                        onChange={setFiltroVisual01}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Filtro Visual 02</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={filtroVisual02}
                        onChange={setFiltroVisual02}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Parámetro Barras</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={parametroBarras}
                        onChange={setParametroBarras}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Parámetro Largo</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={variableLargo}
                        onChange={setVariableLargo}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Parámetro Peso Lineal</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={variablePesoLineal}
                        onChange={setVariablePesoLineal}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Parámetro Diámetro</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={variableDiametro}
                        onChange={setvariableDiametro}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Variable de Tiempo</Form.Label>
                    <Select
                        options={opcionesPropiedades}
                        value={variableTiempo}
                        onChange={setVariableTiempo}
                    />
                </Form.Group>
                      
                     
                       </div>
                       
                    </div>
         
              {/* Botón Guardar */}
              <div className="mt-3">
              <Button style={buttonStyle} onClick={guardarConfiguracion}>Guardar</Button>

            </div>
            <br></br> <br></br>
        </div>
       
    );
};

export default TabConfiguracion;
