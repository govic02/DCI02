import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '../context/AuthContext';
import ModalComponent from './login/ModalComponent';

const Login = ({ onLoginSuccess }) => {
    const { setToken } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const sendEmail = async (email) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/send-mail`, { // Asegúrate de que la ruta sea correcta
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: email,
              subject: 'Registro de Inicio de Sesión',
              text: '<p>Estimado Usuario</p><p> Se ha registrado un ingreso a su cuenta en la platadorma ICD.</p>', // Agrega el mensaje que quieras
            }),
          });
          console.log("respuesta login email ok",response);
          if (response.ok) {
            console.log("email enviado correctamente");
          
          } else {
            setError('Failed to send email'); // Si la respuesta del backend no es OK, muestra un error
          }
        } catch (error) {
          setError('An error occurred while sending the email'); // Atrapa errores de red, etc.
        }
      };
    
    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();
            if (data.token) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('tipo', data.userData.tipoUsuario);
                localStorage.setItem('username', data.userData.username);
                localStorage.setItem('userId', data.userData.userId);
                localStorage.setItem('fullname', data.userData.fullname);
                sendEmail(data.userData.username);
                onLoginSuccess();
            } else {
                setError('Los datos de usuario o contraseña son incorrectos.');
            }
        } catch (error) {
            setError('Ha ocurrido un error al intentar conectarse al servidor.');
        }
    };

    const checkUserExists = async () => {
        if (!email) {
            setError('Por favor, ingrese un correo electrónico.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/usuarios/username/${encodeURIComponent(email)}`);
            if (response.ok) {
                handleForgotPassword();
                setError('Se ha enviado un correo electrónico con instrucciones para ingresar a su cuenta.');
            } else {
                setError('No existe un usuario asociado al correo electrónico escrito.');
            }
        } catch (error) {
            setError('Error al verificar el usuario.');
        }
    };

    const handleForgotPassword = async () => {
        try {
            const msje = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                    .header { color: #444; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                    .content { font-size: 16px; }
                    .footer { font-size: 14px; color: #777; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">Recuperación de Contraseña</div>
                <div class="content">
                    <p>Estimado usuario,</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Si no ha solicitado esto, por favor ignore este mensaje.</p>
                    <p>Para proceder con la recuperación de su contraseña, haga clic en el siguiente enlace:</p>
                    <p><a href="#">Restablecer Contraseña</a></p>
                </div>
                <div class="footer">
                    <p>Gracias,</p>
                    
                    <p>El Equipo de Soporte</p>
                </div>
            </body>
            </html>
        `;
            await fetch(`${API_BASE_URL}/api/send-mail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email, subject: 'Recuperación de Contraseña', text: msje }),
            });
            setShowModal(false);
        } catch (error) {
            console.error('Error sending forgot password email:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <img src="images/logo.png" alt="Logo" className="login-logo" />
                <div className="form-elements">
                    <label htmlFor="email">E-Mail</label>
                    <input type="text" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="password">Contraseña</label>
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <a href="#" onClick={() => checkUserExists()}>¿Olvidó su contraseña?</a>
                    <button onClick={handleLogin}>Login</button>
                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default Login;
