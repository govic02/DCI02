import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const ModalComponent = ({ show, handleClose, handleForgotPassword, setEmail, email }) => {
    const [localEmail, setLocalEmail] = useState(email);

    // Estilos personalizados
    const buttonStyle = {
        backgroundColor: '#DA291C', // Rojo específico
        color: 'white'
    };

    const labelStyle = {
        display: 'block', // Asegura que el label esté sobre el input
        marginBottom: '5px' // Espacio entre el label y el input
    };

    const modalBodyStyle = {
        paddingBottom: '20px' // Añade algo de padding al fondo del modal para que no se vea apretado
    };

    return (
        <Modal show={show} onHide={handleClose} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>Recuperar Contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body style={modalBodyStyle}>
                <label style={labelStyle}>Correo de usuario:</label>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    style={{ width: '100%' }} // Asegura que el input ocupe todo el ancho del modal
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button style={buttonStyle} onClick={() => {
                    setEmail(localEmail);
                    handleForgotPassword();
                }}>
                    Recuperar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalComponent;
