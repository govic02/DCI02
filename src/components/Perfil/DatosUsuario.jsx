import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DatosUsuario = () => {
  const [nombreCompleto, setNombreCompleto] = useState(localStorage.getItem('fullname') || '');
  const [email, setEmail] = useState(localStorage.getItem('username') || '');
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!nombreCompleto || !email || !contrasena || !repetirContrasena) {
      setMensajeError('Debe completar todos los campos');
    } else if (contrasena !== repetirContrasena) {
      setMensajeError('Las contraseñas deben coincidir');
    } else {
      setMensajeError('');
    }
  }, [nombreCompleto, email, contrasena, repetirContrasena]);

  const handleGuardar = async () => {
    if (!nombreCompleto || !email || !contrasena || !repetirContrasena) {
      setMensajeError('Debe completar todos los campos');
      return;
    } else if (contrasena !== repetirContrasena) {
      setMensajeError('Las contraseñas deben coincidir');
      return;
    }

    try {
      const datosActualizacion = {
        fullname: nombreCompleto,
        username: email,
        password: contrasena
      };

      const response = await axios.put(`${API_BASE_URL}/api/usuarios/${userId}`, datosActualizacion);
      console.log('Datos actualizados con éxito:', response.data);
      toast.success('Datos actualizados con éxito!');
      localStorage.setItem('fullname',nombreCompleto);
      setMensajeError('');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      setMensajeError('Error al actualizar los datos');
    }
  };

  return (
    <Card style={{ margin: '20px', padding: '20px', borderRadius: '20px' }}>
      <CardContent>
        <Typography variant="h5" style={{ marginBottom: '20px' }}>
          Datos de Usuario
        </Typography>
        <TextField
          label="Nombre Completo"
          variant="outlined"
          fullWidth
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px' }}
          disabled={!nombreCompleto || !contrasena || !repetirContrasena}
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <TextField
          label="Repetir Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          value={repetirContrasena}
          onChange={(e) => setRepetirContrasena(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        {mensajeError && (
          <Typography color="error" style={{ marginBottom: '10px' }}>
            {mensajeError}
          </Typography>
        )}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button
            variant="contained"
            style={{ backgroundColor: '#DA291C', color: 'white' }}
            onClick={handleGuardar}
            disabled={!nombreCompleto || !email || !contrasena || !repetirContrasena || contrasena !== repetirContrasena}
          >
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatosUsuario;
