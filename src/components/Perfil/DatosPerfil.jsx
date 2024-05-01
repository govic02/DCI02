import React from 'react';

const DatosPerfil = ({ userName, companyName, imageUrl }) => {
    const tipo = localStorage.getItem('tipo'); // Tipo de usuario
    const userId = localStorage.getItem('userId'); // ID del usuario
    const username = localStorage.getItem('username');
    const fullname = localStorage.getItem('fullname');
    const cardStyle = {
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        border: '1px solid #ccc',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginLeft: '50px',
        marginTop:'50px'
    };

    const imageContainerStyle = {
        marginRight: '10px',
        with:'100px'
    };

    const imageStyle = {
        width: '130px',
        height: '130px',
        borderRadius: '50%',
    };

    const textStyle = {
        margin: '0',
        fontSize: '16px',
        fontWeight: 'bold',
        marginLeft: '15px'
    };
    const textBajada = {
        margin: '0',
        fontSize: '1em',
        marginLeft: '40px'
       
    };
    const iconStyle = {
        width: '20px', // Ajusta según sea necesario
        height: '20px', // Ajusta según sea necesario
        marginRight: '5px', // Espacio entre el icono y el texto,

    };

    return (
        <div style={cardStyle}>
            <div style={imageContainerStyle}>
                <img src={'images/fotoPerfil.png'} alt="Profile" style={imageStyle} />
            </div>
            <div>
                <div style={textStyle}>
                    <img src="images/perfilIcn.svg" alt="Icono Usuario" style={iconStyle} />
                    {fullname || 'Nombre de Usuario'}
                </div>
                <div style={textBajada}>{username || 'Usuario de Prueba'}</div>
                <div style={textStyle}>
                    <img src="images/perfilIcn.svg" alt="Icono Usuario" style={iconStyle} />
                    {userName || 'Rol'}
                </div>
                <div style={textBajada}>{tipo || 'Usuario de Prueba'}</div>
                <div style={textStyle}>
                    <img src="images/edificioIcn.svg" alt="Icono Empresa" style={iconStyle} />
                    {companyName || 'Empresa'}
                </div>
                <div style={textBajada}>{companyName || 'ICD'}</div>
            </div>
        </div>
    );
};

export default DatosPerfil;
