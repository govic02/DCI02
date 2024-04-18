import React,{useState,useEffect,useRef} from 'react';
import HeaderApp from './HeaderApp';
import DatosPerfil from './Perfil/DatosPerfil';
import Ediciones from './Perfil/Ediciones';
import Visualizaciones from './Perfil/Visualizaciones';
import Subidos from './Perfil/Subidos';
import ProyectosAsignados from './Perfil/ProyectosAsignados';
import DatosUsuario from './Perfil/DatosUsuario';
import ListadoProyectosAdministrador from './Perfil/ListadoProyectosAdministrador';
import { ProyectoProvider } from '../context/ProyectoContext';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
const Perfil = ({ onProyectoSeleccionado,onProyectoKeySeleccionado }) => {
    const [urnSelected, setUrnSelected] = useState('');
   
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState(null);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const { token: tokenContexto } = useAuth();
    const userId = localStorage.getItem('userId'); // ID del usuario
    const estiloPerfil = {
     
        overflowY: 'scroll', // Activa el desplazamiento vertical
        overflowX: 'hidden', // Activa el desplazamiento vertical
    };
    const handleProyectoSeleccionado = (proyectoKey, urn) => {
        setProyectoSeleccionado({ proyectoKey, urn });
    };
   //

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
            console.log("URN BUSCADA DESDE ESTADITICAS GENERAL",data.urn);
            console.log("URN BUSCADA DESDE ESTADITICAS GENERAL",data.proyectoKey);
            setProyectoKeySeleccionado(data.proyectoKey);
        } catch (error) {
           // console.error('Error al obtener el usuario-proyecto asignado:', error);
            // Asumiendo que tienes una función toast.error disponible para mostrar errores
        }
    };

    obtenerUsuarioProyecto();
}, []);

    return (
        <div style={estiloPerfil}>
               <HeaderApp proyectoKey={proyectoKeySeleccionado}/> {/* Instancia el componente HeaderApp */}
           <div class='row'>
                <div class='col-11'>
                        <DatosPerfil />
                </div>
                

           </div>
           <div class='row'>
                <div class='col-6'>
                   <ListadoProyectosAdministrador onProyectoSeleccionado={handleProyectoSeleccionado}
                        onProyectoKeySeleccionado={setProyectoKeySeleccionado}/>
                </div>
                <div class='col-6'>
                    <DatosUsuario />
                </div>

           </div>
            {/* Inserta gráficos o tablas de estadísticas aquí */}
        </div>
    );
};

export default Perfil;
