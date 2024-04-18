import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ColumnaIzquierda from './ColumnaIzquierda';
import ColumnaDerecha from './ColumnaDerecha';
import Estadisticas from './Estadisticas'; // Asegúrate de importar tu nuevo componente de estadísticas
import Proyectos from './Proyectos'; 
import ConfiguracionVisualizador from './ConfiguracionVisualizador'; 
import Perfil from './Perfil'; 
import AdministracionCuentas from './AdministracionCuentas'; 
import Footer from './Footer';
import Login from './Login'; // Asegúrate de importar el componente Login
import './App.css';
import { VisibilityProvider } from '../context/VisibilityContext';
import { AuthProvider } from '../context/AuthContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = ({ token, urn ,data}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handleLogin = () => {
        // Aquí deberías implementar la lógica para establecer el token de autenticación
        console.log("Implementar la lógica de login aquí");
    };
    useEffect(() => {
        // Verificar si ya existe un token en localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            setIsLoggedIn(true);
         
        }
    }, []);
    if (!isLoggedIn) {
        return (<AuthProvider><Login onLoginSuccess={() => setIsLoggedIn(true)} /></AuthProvider>);
    }

    return (
        <Router>
            
                    <VisibilityProvider>
                    <AuthProvider>
                    <ToastContainer />
                        <div className="container-fluid">
                            <div className="row">
                                {/* Columna Izquierda */}
                                <div className={`col-${isCollapsed ? '1' : '2'}`}>
                                    <ColumnaIzquierda isCollapsed={isCollapsed} handleCollapse={() => setIsCollapsed(!isCollapsed)} />
                                </div>

                                {/* Contenido Principal */}
                                <div className={`col-${isCollapsed ? '11' : '10'}`}>
                                    <Routes>
                                        <Route path="/" element={<ColumnaDerecha isCollapsed={isCollapsed} token={token} urn={urn} />} />
                                        <Route path="/estadisticas" element={<Estadisticas />} />
                                        <Route path="/proyectos" element={<Proyectos token={token} urn={urn}/>} />
                                        <Route path="/AdministracionCuentas" element={<AdministracionCuentas />} />
                                        <Route path="/Perfil" element={<Perfil />} />
                                        <Route path="/ConfiguracionVisualizador" element={<ConfiguracionVisualizador />} />
                                    
                                        {/* Agrega más rutas según sea necesario */}
                                    </Routes>
                                </div>
                            </div>
                            <Footer />
                        </div>
                        </AuthProvider>
                    </VisibilityProvider>
            
        </Router>
    );
};

export default App;

