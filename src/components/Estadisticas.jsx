import React, { useEffect, useState } from 'react';
import { Button, Box } from '@mui/material';
import HeaderApp from './HeaderApp';
import IndicadorTotalPeso from './estadisticas/IndicadorTotalPeso';
import IndicadorPesoPromedio from './estadisticas/IndicadorPesoPromedio';
import GraficoPesosPorValor from './estadisticas/GraficoPesosPorValor';
import GraficoLineasPesosPorDiametro from './estadisticas/GraficoLineasPesosPorDiametro';
import GraficoPedidosTotal from './estadisticas/GraficoPedidosTotal';
import GraficosPedidoDiametro from './estadisticas/GraficosPedidoDiametro';
import GraficoLongitudPromedio from './estadisticas/GraficoLongitudPromedio';
import GraficoPesosPromedio from './estadisticas/GraficoPesosPromedio';
import GraficoDiametroPromedio from './estadisticas/GraficoDiametroPromedio';
//
import GraficoPesosPisoDiametroBarras from './estadisticas/GraficoPesosPisoDiametroBarras';
import MaestroFierros from './estadisticas/MaestroFierros';
import API_BASE_URL from '../config';

const Estadisticas = () => {
    const [activeSection, setActiveSection] = useState('general'); // 'general' or 'pedidos'
    const [urnSelected, setUrnSelected] = useState('');
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const userId = localStorage.getItem('userId');

    const estiloEstadisticas = {
        backgroundColor: '#D8D8D8',
      
        height: 'calc(90vh - 64px)',
        overflowY: 'scroll',
    };

    useEffect(() => {
        const obtenerUsuarioProyecto = async () => {
            try {
                
                const response = await fetch(`${API_BASE_URL}/api/getUserProyectId`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idUsuario: userId })
                });
                const data = await response.json();
                setUrnSelected(data[0]?.urn);
                setProyectoKeySeleccionado(data[0]?.proyectoKey);
            } catch (error) {
                console.error('Error al obtener el usuario-proyecto asignado:', error);
            }
        };
        obtenerUsuarioProyecto();
    }, []);

    return (
        <div>
            <HeaderApp proyectoKey={proyectoKeySeleccionado} />
            {urnSelected && (
                <div>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, p: 2 }}>
                    <Button
                            variant="contained"
                            sx={{ backgroundColor: '#DA291C', color: 'white' }}
                            onClick={() => setActiveSection('general')}
                            >
                            Proyecto General
                            </Button>
                            <Button
                            variant="contained"
                            sx={{ backgroundColor: '#DA291C', color: 'white' }}
                            onClick={() => setActiveSection('pedidos')}
                            >
                            Pedidos
                            </Button>

                    </Box>
                    
                    {activeSection === 'general' && (
                       
                        <div style={estiloEstadisticas}>
                            <IndicadorPesoPromedio urn={urnSelected} />
                            {/*  <GraficoPesosPorValor urn={urnSelected} /> */}
                            <div className="row">
                                <div className="col-md-6">
                                <GraficoPesosPisoDiametroBarras urn={urnSelected} />
                                </div>
                                <div className="col-md-6">
                                <GraficoLongitudPromedio urn={urnSelected} />
                                </div>
                                <div className="col-md-6">
                                <GraficoPesosPromedio urn={urnSelected} />
                                </div>
                                <div className="col-md-6">
                                <GraficoDiametroPromedio urn={urnSelected}/>
                                </div>
                            </div>
                            
                         
                            
                          
                            
                            
                        </div>
                    )}
                    {activeSection === 'pedidos' && (
                        <div style={estiloEstadisticas}>
                            {/* <GraficoPedidosTotal urn={urnSelected} /> 
                                 
                            */}
                            <IndicadorTotalPeso urn={urnSelected} />
                           
                            <GraficosPedidoDiametro urn={urnSelected} />
                            <br></br>  <br></br>  <br></br>
                           {/*<MaestroFierros urn={urnSelected}  proyecto={proyectoKeySeleccionado} /> */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Estadisticas;
