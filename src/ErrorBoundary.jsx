import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Actualizar el estado para que el siguiente renderizado muestre la UI alternativa.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Puedes también registrar el error en un servicio de reporte de errores
        console.error("Error capturado en Error Boundary:", error, errorInfo);
    }

    render() {
      
        return this.props.children; 
    }
}

export default ErrorBoundary;
