import React ,{useEffect,useState} from 'react';
import HeaderApp from './HeaderApp';
import BarraNuevaCuenta from './AdministracionCuentas/BarraNuevaCuenta';
import TablaUsuarios from './AdministracionCuentas/TablaUsuarios';
import axios from 'axios';
import API_BASE_URL from '../config';
const AdministracionCuentas = () => {
    const [usuarios, setUsuarios] = useState([]);
    const estiloAdministracionCuentas = {
     
        overflowY: 'scroll', // Activa el desplazamiento vertical
        overflowX: 'hidden', // Activa el desplazamiento vertical
        backgroundColor: '#D8D8D8',
        height:'100%'
    };

    const tipo = localStorage.getItem('tipo');
    
    const esAdministrador = tipo === 'Administrador' || tipo === 'administrador';

    const obtenerUsuarios = async () => {
        // Lógica para obtener los usuarios del servidor
        const response = await fetch(`${API_BASE_URL}/api/usuarios`);
        const usuarios = await response.json();
        setUsuarios(usuarios);
      };
    useEffect(() => {
        obtenerUsuarios();
      }, []);
    return (
        <div style={estiloAdministracionCuentas}>
        <HeaderApp /> {/* Instancia el componente HeaderApp */}
        {esAdministrador ? (
                <>
                    <div className='row'>
                        <div className='col-12'>
                            <BarraNuevaCuenta />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-12'>
                            <TablaUsuarios usuarios={usuarios} refrescarUsuarios={obtenerUsuarios} />
                        </div>
                    </div>
                </>
            ) : (
                <p>Ud no tiene permisos para ver esta sección</p>
            )}
     {/* Inserta gráficos o tablas de estadísticas aquí */}
 </div>
    );
};

export default AdministracionCuentas;
