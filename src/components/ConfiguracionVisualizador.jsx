import React , { useEffect, useState, useRef } from 'react';
import HeaderApp from './HeaderApp';

import TabConfiguracion from './configuracionVisualizador/TabConfiguracion';
import API_BASE_URL from '../config';
const ConfiguracionVisualizador = () => {
    const [urnSelected, setUrnSelected] = useState('');
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const estiloConfiguracion = {
        backgroundColor: '#D8D8D8', // Color de fondo
        padding: '20px', // Agrega un poco de espacio alrededor del contenido
        height: 'calc(100vh - 64px)', // Altura total de la ventana menos la altura del HeaderApp
        overflowY: 'scroll', // Activa el desplazamiento vertical
    };
    const tipo = localStorage.getItem('tipo');
    useEffect(() => {
        const obtenerUsuarioProyecto = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/getUserProyectId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idUsuario: '10' })
                });
                const data = await response.json();
                setUrnSelected(data.urn);
            //  //console.log("URN BUSCADA DESDE ESTADITICAS GENERAL",data.urn);
                setProyectoKeySeleccionado(data.proyectoKey);
            } catch (error) {
               // console.error('Error al obtener el usuario-proyecto asignado:', error);
                // Asumiendo que tienes una función toast.error disponible para mostrar errores
            }
        };

        obtenerUsuarioProyecto();
    }, []);
    // Verifica si el tipo de usuario es Administrador
    const esAdministrador = tipo === 'Administrador' || tipo === 'administrador';
    return (
        <div>
            <HeaderApp proyectoKey={proyectoKeySeleccionado} /> {/* Instancia el componente HeaderApp */}
            <div style={estiloConfiguracion}>
                <div className='row'>
                    <div className='col-12'>
                    {esAdministrador ? (
                            <TabConfiguracion />
                        ) : (
                            <p>Ud no tiene permisos para ver esta sección</p>
                        )}
                    </div>
                </div>
                {/* A */}
               
            </div>
        </div>
    );
};

export default ConfiguracionVisualizador;
