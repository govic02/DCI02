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
const workerCode = `
    self.onmessage = function(e) {
        const data = e.data;
        // Procesa los datos recibidos y responde
        self.postMessage({ result: 'Processed ' + data });
    };
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

try {
    worker.postMessage('largeData');
    worker.onmessage = function(event) {
        console.log('Mensaje recibido del worker:', event.data);
    };
} catch (e) {
    console.log('Failed to send data to worker:', e);
    // Implementa la lógica para manejar este error, como dividir los datos.
}
self.onerror = function (event) {
    console.log('Error en el worker:', event.message);
    return true; // Previene el error de ser propagado
};
window.onerror = function (message, source, lineno, colno, error) {
    console.log("Se capturó un error global:", message, source, lineno, colno, error);
    return true; // Previene la propagación del error
};
// Manejador de errores global
function handleError(error, url, lineNo, columnNo, errorObj) {
    console.log("Se capturó un error global:", error);
    // Retorna true para prevenir la propagación del error
    return true;
}
window.onunhandledrejection = function (event) {
    console.log("Unhandled rejection (promise):", event.promise, "reason:", event.reason);
    return true; // Previene la propagación y la consola del navegador mostrando el error
};

try {
    worker.postMessage(largeData);
  } catch (e) {
    console.log('Failed to send data to worker:', e);
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
