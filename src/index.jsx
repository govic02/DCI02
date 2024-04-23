import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import ErrorBoundary from './ErrorBoundary'; // Asegúrate de tener la ruta correcta
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import API_BASE_URL from './config';

const root = ReactDOM.createRoot(document.getElementById('root'));

const RootComponent = () => {
    const [token, setToken] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/gettoken`)
            .then(response => response.json())
            .then(data => {
                setToken(data.token);
            })
            .catch(error => {
                console.error('Error fetching token:', error);
            });
    }, []);

    if (!token) {
        return <div>Loading...</div>;
    } else {
        return <App token={token} />;
    }
};
self.onerror = function (event) {
    console.error('Error en el worker:', event.message);
    return true; // Previene el error de ser propagado
};

// Manejador de errores global
function handleError(error, url, lineNo, columnNo, errorObj) {
    console.log("Se capturó un error global:", error);
    // Retorna true para prevenir la propagación del error
    return true;
}
window.onunhandledrejection = function (event) {
    console.error("Unhandled rejection (promise):", event.promise, "reason:", event.reason);
    return true; // Previene la propagación y la consola del navegador mostrando el error
};
try {
    worker.postMessage(largeData);
  } catch (e) {
    console.error('Failed to send data to worker:', e);
    // Implementa la lógica para manejar este error, como dividir los datos.
  }

// Configurar el manejador de errores antes de que la aplicación cargue
window.onerror = handleError;

// Envolver la aplicación en el ErrorBoundary
root.render(
    <ErrorBoundary>
        <RootComponent />
    </ErrorBoundary>
);
