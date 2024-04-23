import Users from '../models/users.js';
import nodemailer from 'nodemailer';
// Obtener todos los usuarios

const transporter = nodemailer.createTransport({
    service: 'gmail', // Usa el servicio de Gmail, puedes cambiarlo por otro si prefieres
    auth: {
      user: '', // Tu dirección de correo electrónico
      pass: '', // Tu contraseña de correo electrónico o token de app
    },
  });
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Users.find({}, '-password');
        res.json(usuarios);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const obtenerUsuariosAdministradores = async (req, res) => {
  try {
    console.log("busco administradores");
      // Utilizamos una expresión regular para ignorar mayúsculas o minúsculas en la búsqueda
      const usuariosAdministradores = await Users.find(
          { tipoUsuario: /^administrador$/i }, 
          '-password' // Excluir la contraseña de los resultados
      );
      if (usuariosAdministradores.length === 0) {
          return res.status(404).send('No se encontraron usuarios administradores.');
      }
      console.log("Resultado administradores", usuariosAdministradores);
      res.json(usuariosAdministradores);
  } catch (error) {
      console.error("Error al obtener usuarios administradores:", error);
      res.status(500).send(error.message);
  }
};

// Obtener un usuario por idUsu
const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Users.findOne({ idUsu: req.params.idUsu });
        if (!usuario) {
            return res.status(404).send('El usuario con ese ID no fue encontrado');
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
// Obtener un usuario por username
const obtenerUsuarioPorUsername = async (req, res) => {
  try {
      const username = req.params.username; // Asumiendo que el username viene como parámetro de la URL
      const usuario = await Users.findOne({ username: username });
      if (!usuario) {
          return res.status(404).send('El usuario con ese username no fue encontrado');
      }
      res.json(usuario);
  } catch (error) {
      res.status(500).send(error.message);
  }
};

// Crear un nuevo usuario
const crearUsuario = async (req, res) => {
    try {
      console.log("Recibo datos");
      console.log(req.body);
  
      // Verificar si ya existe un usuario con el mismo email
      const usuarioExistente = await Users.findOne({ username: req.body.email });
      if (usuarioExistente) {
        console.log("ya existe");
        return res.status(400).send('Ya existe un usuario registrado con ese correo electrónico.');
      }
  
      const idUsu = Date.now();
      const nuevoUsuario = new Users({
        ...req.body,
        idUsu: idUsu,
      });
      await nuevoUsuario.save();
  
      // Prepara el mensaje de bienvenida
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: nuevoUsuario.email, 
        subject: 'Bienvenido a ICD',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #444;">¡Bienvenido a ICD, ${nuevoUsuario.fullname}!</h1>
                <p>Tu cuenta ha sido creada exitosamente.</p>
                <p><strong>Usuario:</strong> ${nuevoUsuario.username}</p>
                <div style="margin-top: 20px;">
                    <a href="https://icd.com/login" style="background-color: #0044cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Inicia sesión ahora</a>
                </div>
                <p style="margin-top: 30px; color: #777;">Gracias por unirte a nosotros.</p>
               
            </div>
        `
    };
  
      // Envía el correo electrónico
      /*
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar el correo:', error);
        } else {
          console.log('Correo enviado: ' + info.response);
        }
      });*/
      console.log("se creó");
      res.json(nuevoUsuario);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(400).send(error.message);
    }
  };
  
// Actualizar un usuario por idUsu
const actualizarUsuario = async (req, res) => {
  try {
      // Copia req.body para poder modificarlo sin afectar al original
      let datosActualizacion = { ...req.body };
      
      // Si la contraseña enviada está vacía, elimina esa propiedad del objeto de actualización
      if (!datosActualizacion.password || datosActualizacion.password.trim() === '') {
          delete datosActualizacion.password;
      }

      const usuario = await Users.findOneAndUpdate({ idUsu: req.params.idUsu }, datosActualizacion, { new: true, runValidators: true });

      if (!usuario) {
          return res.status(404).send('El usuario con ese ID no fue encontrado');
      }

      res.json(usuario);
  } catch (error) {
      res.status(400).send(error.message);
  }
};


// Eliminar un usuario por idUsu
const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Users.findOneAndDelete({ idUsu: req.params.idUsu });
        if (!usuario) {
            return res.status(404).send('El usuario con ese ID no fue encontrado');
        }
        res.send('Usuario eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export  {
    obtenerUsuarios,
    obtenerUsuario,
    obtenerUsuarioPorUsername,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    obtenerUsuariosAdministradores
};
