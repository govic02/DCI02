import React, { useEffect, useState, useRef } from 'react';
import GraficoPesosPorValor from './estadisticas/GraficoPesosPorValor';
import GraficoPesosPorDiametroEnPiso from './estadisticas/GraficoPesosPorDiametroEnPiso';
import GraficoLineasPesosPorDiametro from './estadisticas/GraficoLineasPesosPorDiametro';
import  GraficoPedidosTotal from './estadisticas/GraficoPedidosTotal';
import GraficosPedidoDiametro from './estadisticas/GraficosPedidoDiametro';
import GraficoLongitudPromedio from './estadisticas/GraficoLongitudPromedio';
import GraficoPesosPromedio from './estadisticas/GraficoPesosPromedio';
import GraficoPedidovsPedir from './estadisticas/GraficoPedidovsPedir';
// 
import HeaderApp from './HeaderApp';
import ControlEstadisticas from './estadisticas/ControlEstadisticas';
import API_BASE_URL from '../config'; 
import GraficoDiametroEquivalente from './estadisticas/GraficoDiametroEquivalente';

const Estadisticas = () => {
    const [urnSelected, setUrnSelected] = useState('');
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const userId = localStorage.getItem('userId'); // ID del usuario
    const tabsRef = useRef(null);

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
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idUsuario: userId  })
                });
                const data = await response.json();
                console.log("proyecto seleccionado en estadisticas",data[0]);
                setUrnSelected(data[0].urn);
            //    console.log("URN BUSCADA DESDE ESTADITICAS GENERAL",data.urn);
                setProyectoKeySeleccionado(data[0].proyectoKey);
            } catch (error) {
               // console.error('Error al obtener el usuario-proyecto asignado:', error);
                // Asumiendo que tienes una función toast.error disponible para mostrar errores
            }
        };

        obtenerUsuarioProyecto();
    }, []);

    return (
        <div>


            <HeaderApp proyectoKey={proyectoKeySeleccionado}/>
            {urnSelected && (
            <div style={estiloEstadisticas}>
                {/* Contenido y otros componentes */}
                <div className='row'>
                    <div className='col-6'>
                        <GraficoPesosPorValor urn={urnSelected} />
                    </div>
                    <div className='col-6'>
                        <GraficoLineasPesosPorDiametro urn={urnSelected} />
                    </div>
                    {/* Otros gráficos y componentes 
                         
                    */}
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <GraficoPedidosTotal urn={urnSelected} />
                    </div>
                    <div className='col-6'>
                        <GraficosPedidoDiametro urn={urnSelected} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <GraficoDiametroEquivalente urn={urnSelected} />
                    </div>
                    <div className='col-6'>
                    <GraficoLongitudPromedio urn={urnSelected} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <GraficoPesosPromedio urn={urnSelected} />
                    </div>
                    <div className='col-6'>
                    <GraficoPedidovsPedir urn={urnSelected} />
                    </div>
                </div>
                <br></br> <br></br>
                {/* Repite para más filas de gráficos si es necesario   
                    
                */}
            </div>
            )}

        </div>
    );
};

export default Estadisticas;
