import RDImensajes from '../models/RDImensajes.js'; // Adjust the path as necessary

const crearConversacion = async (req, res) => {
    try {
        // Asegúrate de que el asunto también se incluya en el cuerpo de la solicitud.
        const nuevaConversacion = new RDImensajes({
            conversationId: req.body.conversationId,
            participants: req.body.participants,
            asunto: req.body.asunto, // 
            estado: req.body.estado || 'abierto' // Usa el estado enviado o, por defecto, 'abierto'
        });
        await nuevaConversacion.save();
        res.status(201).json(nuevaConversacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const agregarMensaje = async (req, res) => {
    try {
      
        const { conversationId, senderId, message } = req.body;
        const conversacion = await RDImensajes.findOne({ conversationId });
        console.log("mensaje recibido",conversationId);
        console.log("mensaje recibido",message);
        if (conversacion.estado === 'cerrado') {
            return res.status(400).json({ error: 'La conversación está cerrada' });
        }
        conversacion.messages.push({ senderId, message });
        await conversacion.save();
        res.status(200).json(conversacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarMensaje = async (req, res) => {
    try {
        const { conversationId, messageId } = req.params;
        const conversacion = await RDImensajes.findOneAndUpdate(
            { conversationId },
            { $pull: { messages: { _id: messageId } } },
            { new: true }
        );
        res.status(200).json(conversacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarConversacion = async (req, res) => {
    try {
        const { conversationId } = req.params;
        await RDImensajes.findOneAndDelete({ conversationId });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editarConversacion = async (req, res) => {
    try {
        const { conversationId, participants } = req.body;
        const conversacion = await RDImensajes.findOneAndUpdate(
            { conversationId },
            { participants },
            { new: true }
        );
        res.status(200).json(conversacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editarMensaje = async (req, res) => {
    try {
        const { conversationId, messageId, message } = req.body;
        const conversacion = await RDImensajes.findOne({ conversationId });
        const mensaje = conversacion.messages.id(messageId);
        if (mensaje) {
            mensaje.message = message;
            await conversacion.save();
            res.status(200).json(conversacion);
        } else {
            res.status(404).json({ error: 'Mensaje no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerConversacionesPorParticipante = async (req, res) => {
    try {
        const { participant } = req.params; // El participante se pasa como parámetro en la URL
        const conversaciones = await RDImensajes.find({ participants: participant });
        console.log("conversacinoes donde participa",conversaciones);
        if (!conversaciones.length) {
            return res.status(404).json({ error: 'No se encontraron conversaciones para el participante proporcionado.' });
        }
        res.status(200).json(conversaciones);
    } catch (error) {
        res.json({ respuesta:"sin mensajes" });
    }
};

const obtenerConversacionPorId = async (req, res) => {
    try {
        const { conversationId } = req.params; // El ID de la conversación se pasa como parámetro en la URL
        const conversacion = await RDImensajes.findOne({ conversationId });
        if (!conversacion) {
            return res.status(404).json({ error: 'Conversación no encontrada.' });
        }
        res.status(200).json(conversacion);
    } catch (error) {
        res.json({ respuesta:"sin mensajes" });
    }
};


export {
    crearConversacion,
    agregarMensaje,
    eliminarMensaje,
    eliminarConversacion,
    editarConversacion,
    editarMensaje,
    obtenerConversacionesPorParticipante,
    obtenerConversacionPorId
};
