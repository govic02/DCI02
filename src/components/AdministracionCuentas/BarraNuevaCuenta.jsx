import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import  {Modal, Box}  from '@mui/material';
import API_BASE_URL from '../../config';
const BarraNuevaCuenta = () => {
  const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [esFormularioValido, setEsFormularioValido] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};
  const titleStyle = {
    color: '#E30613', // Color rojo para el título "¡Iniciemos!"
    alignItems: 'center'
  };
  const imageStyle = {
    marginLeft: '20px', // Margen a la izquierda de 20px para la imagen
  };
  const buttonStyle = {
    borderRadius: '20px', // Bordes redondeados para el botón
    backgroundColor: '#E30613', // Color de fondo,
    marginLeft: '-85px'
  };

  const cardStyle = {
    margin: '4px 5px', // Margen de 4px arriba y abajo, 5px a los lados
    borderRadius: '20px'
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /\.(cl|com|org|net)$/.test(email);
  };
  useEffect(() => {
    setEsFormularioValido(
      nombre && validarEmail(email) && contrasena && tipoUsuario
    );
    if(esFormularioValido){
       setEmail(email);
    }
    
  }, [nombre, email, contrasena, tipoUsuario]);
const verificarUsuarioExistente = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/usuarios/username/${email}`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        setModalOpen(true);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};
const handleInputChange = (event, setter) => {
  const { value } = event.target;
  if (value.length <= 55) {
    setter(value);
    setMensajeError('');
  } else {
    setMensajeError('No se pueden añadir más de 55 caracteres');
  }
};
const crearCuenta = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  if (await verificarUsuarioExistente()) {
    return;
  }
  try {
    const usuario = {
      fullname: nombre,
      username: email, // Asume que el username es el email para este ejemplo
      password: contrasena,
      tipoUsuario: tipoUsuario,
    };
  //console.log("datos para ingresar",usuario);
    const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) {
      throw new Error('Algo salió mal al crear el usuario');
    }

    // Opcional: Redireccionar a otra ruta después de la creación exitosa
  //console.log("creación exitosa"); 
    window.location.reload();
  } catch (error) {
    console.error('Error al crear el usuario:', error);
  }
};
  return (
    <Card className="m-4" style={cardStyle}>
      <CardContent>
      <div className="row align-items-center mb-4">
          <div className="col d-flex justify-content-start align-items-center">
            <img src="images/administracionCuentasIcn.svg" alt="Admin Icon" style={imageStyle} />
            <Typography variant="subtitle1" style={{ marginLeft: '5px' }}>
              Admin de Cuentas
            </Typography>
          </div>
          <div className="col d-flex justify-content-center">
           
          </div>
        </div>
        <div className="row justify-content-center mb-4">
          <div className="col-auto">
          <Typography variant="h5" style={titleStyle}>
              ¡Iniciemos!
            </Typography>
            <Typography variant="subtitle1"  style={{ marginLeft: '-85px' }}>
              Ingrese los datos para crear una cuenta
            </Typography>
          </div>
        </div>
        <div className="row justify-content-center mb-4">
          <div className="col-auto">
            <TextField label="Nombre Completo" variant="outlined" className="me-2"  value={nombre}
                    onChange={(e) =>  handleInputChange(e, setNombre)}/>
          </div>
          <div className="col-auto">
            <TextField label="E-Mail" variant="outlined" className="me-2"   value={email}
                    onChange={(e) =>handleInputChange(e, setEmail)}/>
          </div>
          <div className="col-auto">
            <TextField label="Contraseña" variant="outlined" className="me-2"  type="password"
                    value={contrasena}
                    onChange={(e) => handleInputChange(e, setContrasena)} />
          </div>
          <div className="col-auto">
            <RadioGroup row value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
              <FormControlLabel value="visualizador" control={<Radio />} label="visualizador" />
              <FormControlLabel value="Editor" control={<Radio />} label="Editor" />
              <FormControlLabel value="Administrador" control={<Radio />} label="Administrador" />
            </RadioGroup>
          </div>
        </div>
        {mensajeError && (
          <Typography color="error" style={{ marginBottom: '10px' }}>
            {mensajeError}
          </Typography>
        )}
        <div className="row justify-content-center">
          <div className="col-auto">
            <Button variant="contained" style={buttonStyle}  disabled={!esFormularioValido || isSubmitting}  onClick={crearCuenta}>
            {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
            </Button>
          </div>
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Usuario Existente
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Ya existe un usuario con el mismo e-mail asignado.
            </Typography>
            <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
          </Box>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default BarraNuevaCuenta;
