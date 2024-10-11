import React from 'react';

const Footer = () => {
    const footerStyle = {
        position: 'fixed', // Fija el footer en la parte inferior
        bottom: 0,
        width: '105%', // Cambiado de 110% a 100%
        height: '50px',
        backgroundColor: '#14130F', // Color de fondo
        color: '#FFF', // Color del texto
        textAlign: 'center',
        zIndex: 1000, // Asegura que el footer se mantenga sobre otros elementos
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: -0.45,
        left: '-15px'
    };

    const divStyle = {
        height: '100%', // Ajusta la altura al 100% del footer
        display: 'flex',
        alignItems: 'center', // Alineación vertical
        justifyContent: 'center', // Alineación horizontal
        marginTop: '5px'
    };

    return (
        <footer style={footerStyle}>
            <div style={divStyle}>
                <p>Copyright &copy; {new Date().getFullYear()} ICD.  1.2.18</p>
                {/* Puedes agregar más contenido aquí, como enlaces o información adicional */}
            </div>
        </footer>
    );
};

export default Footer;
