import React, { useState } from 'react';
import API_BASE_URL from '../config'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '../context/AuthContext';
const Login =({ onLoginSuccess }) => {
    const { setToken } = useAuth(); // Obtiene setToken del contexto
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // Función para manejar el login
    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();
            console.log(data);
            if (data.token) {
                console.log('Login exitoso:', data);
                setToken(data.token);
                // Aquí puedes almacenar el token en localStorage o en context para mantener la sesión del usuario
                localStorage.setItem('token', data.token);
                localStorage.setItem('tipo', data.userData.tipoUsuario);
                localStorage.setItem('username', data.userData.username);
                localStorage.setItem('userId', data.userData.userId);
                onLoginSuccess();
                // Redireccionar al usuario o actualizar el estado de la aplicación para reflejar que el usuario está logueado
            } else {
                console.log('Error en login:', data.error);
                setError('Los datos de usuario o contraseña son incorrectos.');
                // Manejar errores, por ejemplo, mostrando un mensaje al usuario
            }
        } catch (error) {
            setError('Ha ocurrido un error al intentar conectarse al servidor.');
            console.error('Error en la solicitud:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <img src="images/logo.png" alt="Logo" className="login-logo" />

                <div className="form-elements">
                    <label htmlFor="email">E-Mail</label>
                    <input
                        type="text"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="#">¿Olvidó su contraseña?</a>
                    <button onClick={handleLogin}>Login</button>
                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default Login;
