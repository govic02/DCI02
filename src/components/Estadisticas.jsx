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
        padding: '20px',
        height: 'calc(100vh - 64px)',
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
                            {/*  <GraficoPesosPorValor urn={urnSelected} /> */}
                           
                            <IndicadorPesoPromedio urn={urnSelected} />
                         
                            <GraficoPesosPisoDiametroBarras urn={urnSelected} />
                          
                            <GraficoLongitudPromedio urn={urnSelected} />
                            <GraficoPesosPromedio urn={urnSelected} />
                        </div>
                    )}
                    {activeSection === 'pedidos' && (
                        <div style={estiloEstadisticas}>
                            {/* Aquí puedes incluir todos los gráficos y componentes para la sección "Pedidos" */}
                            <IndicadorTotalPeso urn={urnSelected} />
                            <GraficoPedidosTotal urn={urnSelected} />
                            <GraficosPedidoDiametro urn={urnSelected} />
                            <MaestroFierros urn={urnSelected} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Estadisticas;
