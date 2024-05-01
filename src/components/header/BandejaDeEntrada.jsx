import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, Typography, TextField, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import API_BASE_URL from '../../config';

const BandejaDeEntrada = ({ open, onClose,urn }) => {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [isNewMessage, setIsNewMessage] = useState(false);
    const [usuariosProyecto, setUsuariosProyecto] = useState([]);
    const [envio,setEnvio] = useState([false]);
    const [newMessage, setNewMessage] = useState({
        destinatario: "",
        asunto: ""
    });
    
    const [mensajes, setMensajes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
   
    const cargarUsuarios = async () => {
        setIsLoading(true);
        setError('');
    
        try {
            const adminUsersResponse = await axios.get(`${API_BASE_URL}/api/usuariosAdministradores`);
            const projectUsersResponse = await axios.get(`${API_BASE_URL}/api/usuariosProyectoAsignado/${urn}`);
            console.log("usuarios admin",adminUsersResponse);
            const adminUsers = adminUsersResponse.data;
            const projectUserIds = projectUsersResponse.data.map(user => user.idUsuario);
            const projectUsers = await Promise.all(projectUserIds.map(async idUsuario => {
                const response = await axios.get(`${API_BASE_URL}/api/usuarios/${idUsuario}`);
                return response.data;
            }));
    
            const combinedUsers = [...new Set([...adminUsers, ...projectUsers])];
            console.log("USUARIOS ACTUALES PARA REMITIR",combinedUsers);
            setUsuariosProyecto(combinedUsers);
        } catch (error) {
            console.error('Error al cargar usuarios', error);
            setError('cargando usuarios');
        }
    
        setIsLoading(false);
    };
    useEffect(() => {
        cargarUsuarios();
    }, [urn]);
    useEffect(() => {
        const fetchConversations = async () => {
            if (!userId) return;
            setIsLoading(true);
    
            try {
                const response = await axios.get(`${API_BASE_URL}/api/conversaciones/participante/${userId}`);
                console.log("mensajes recibidos", response.data);
    
                const conversationsWithUsernames = await Promise.all(response.data.map(async conversation => {
                    // Mapear cada participant a su username, usando el API
                    const participantsWithUsernames = await Promise.all(conversation.participants.map(async participantId => {
                        try {
                            const userResponse = await axios.get(`${API_BASE_URL}/api/usuarios/${participantId}`);
                            return userResponse.data.username || participantId; // Usa el username si está disponible
                        } catch {
                            return participantId; // En caso de error, retorna el ID original
                        }
                    }));
    
                    // Retorna la conversación actualizada con usernames
                    return {
                        ...conversation,
                        participants: participantsWithUsernames
                    };
                }));
    
                setMensajes(conversationsWithUsernames.length > 0 ? conversationsWithUsernames : [{ id: 'dummy', asunto: 'Sin Mensajes', usuario: 'N/A' }]);
            } catch (error) {
                console.error('Error al cargar conversaciones', error);
                setError('Error al cargar conversaciones');
                setMensajes([{ }]);
            }
    
            setIsLoading(false);
        };
    
        fetchConversations();
    }, [userId,envio]);
    

    const handleMessageSelect = (mensaje) => {
        console.log("datos de mensaje seleccionado",mensaje);
        setSelectedMessage(mensaje);
        setIsNewMessage(false);
    };

    const handleMessageSend = async () => {
        if (!newMessage.destinatario || !newMessage.asunto) {
            setError('Todos los campos deben estar completos.');
            return;
        }
        setError('');
        try {
            const destinatarioId = usuariosProyecto.find(user => user.username === newMessage.destinatario)?.idUsu;
            const response = await axios.post(`${API_BASE_URL}/api/conversaciones`, {
                conversationId: new Date().getTime().toString(),  // Este ID debe ser generado correctamente para producción
                participants: [userId, destinatarioId],
                asunto: newMessage.asunto,
                messages: [{
                    senderId: userId,
                    message: newMessage.cuerpo,
                    timestamp: new Date()
                }],
                estado: 'abierto'
            });
            
            // Añade la nueva conversación al inicio del array de mensajes
            setMensajes(prevMensajes => [response.data, ...prevMensajes]);
            setIsNewMessage(false); // Opcional: Depende de si quieres limpiar el formulario
            setNewMessage({ destinatario: "", asunto: "", cuerpo: "" }); // Limpia el formulario
            // onClose(); No cierres el drawer
        } catch (error) {
            setError(`Error al enviar el mensaje: ${error.message}`);
        }
    };
    const fetchConversations = async () => {
        if (!userId) return;
        setIsLoading(true);
    
        try {
            mensajes = [];
            const response = await axios.get(`${API_BASE_URL}/api/conversaciones/participante/${userId}`);
            console.log("mensajes recibidos", response.data);
    
            const conversationsWithUsernames = await Promise.all(response.data.map(async conversation => {
                const participantsWithUsernames = await Promise.all(conversation.participants.map(async participantId => {
                    try {
                        const userResponse = await axios.get(`${API_BASE_URL}/api/usuarios/${participantId}`);
                        return userResponse.data.username || participantId;
                    } catch {
                        return participantId;
                    }
                }));
    
                return {
                    ...conversation,
                    participants: participantsWithUsernames
                };
            }));
    
            setMensajes(conversationsWithUsernames.length > 0 ? conversationsWithUsernames : [{ id: 'dummy', asunto: 'Sin Mensajes', usuario: 'N/A' }]);
        } catch (error) {
            console.error('Error al cargar conversaciones', error);
            setError('Error al cargar conversaciones');
            setMensajes([{ }]);
        }
    
        setIsLoading(false);
    };
    useEffect(() => {
        fetchConversations();
    }, [userId]);
    const handleAddMessageSend = async () => {
        if (!selectedMessage || !messageText.trim()) {
            console.log("No se seleccionó mensaje o el campo de mensaje está vacío.");
            return;  // Evita enviar si no hay mensaje seleccionado o el texto del mensaje está vacío
        }
        console.log("mensaje que se enviará", selectedMessage);
        const messageData = {
            conversationId: selectedMessage.conversationId, // Asegúrate de que cada conversación tiene un ID único
            senderId: userId, // ID del usuario que envía el mensaje
            message: messageText // El mensaje que se va a enviar
        };
    
        try {
            const response = await axios.post(`${API_BASE_URL}/api/conversaciones/mensajes`, messageData);
            if (response.status === 200) {
                console.log("Mensaje enviado con éxito:", response.data);
                // Solo actualiza los mensajes de la conversación seleccionada
                const updatedMessages = [...selectedMessage.messages, {
                    senderId: userId,
                    message: messageText,
                    timestamp: new Date().toISOString()
                }];
                // Encuentra el índice de la conversación actualizada en el estado general
                const index = mensajes.findIndex(m => m.conversationId === selectedMessage.conversationId);
                const updatedMensajes = [...mensajes];
                updatedMensajes[index] = {...updatedMensajes[index], messages: updatedMessages};
                
                setMensajes(updatedMensajes);
                setSelectedMessage({ ...selectedMessage, messages: updatedMessages });
                setMessageText(""); // Limpiar el campo de texto después de enviar
                setEnvio(true);
                //fetchConversations(); 
            } else {
                console.error("Error al enviar mensaje:", response.data);
            }
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        }
    };
    
    const handleNewMessage = () => {
        setIsNewMessage(true);
    };
    const reloadConversationUsernames = async (conversationId, updatedMensajes) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/conversaciones/${conversationId}`);
            const conversation = response.data;
    
            const participantsWithUsernames = await Promise.all(
                conversation.participants.map(async participantId => {
                    try {
                        const userResponse = await axios.get(`${API_BASE_URL}/api/usuarios/${participantId}`);
                        return userResponse.data.username || participantId;
                    } catch {
                        return participantId; // En caso de error, retorna el ID original
                    }
                })
            );
    
            // Encontrar y actualizar la conversación con nombres de usuario nuevos
            const index = updatedMensajes.findIndex(m => m.conversationId === conversationId);
            updatedMensajes[index] = {
                ...updatedMensajes[index],
                participants: participantsWithUsernames
            };
    
            // Actualizar el estado para reflejar los nombres de usuario actualizados
            setMensajes(updatedMensajes);
        } catch (error) {
            console.error("Error al recargar nombres de usuario para la conversación:", error);
        }
    };
    
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <div style={{ display: 'flex', width: '600px', height: '100%', flexDirection: 'column' }}>
                <div style={{ width: '100%', display: 'flex', flex: 1 }}>
                    <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
                        <Typography variant="h6" style={{ padding: '10px' }}>Bandeja de Entrada</Typography>
                        <IconButton onClick={handleNewMessage} style={{ color: 'white', backgroundColor: '#DA291C', margin: '10px' }}>
                            <AddIcon />
                        </IconButton>
                        <List>
                            {mensajes.map((mensaje) => (
                               <ListItem
                               button
                               key={mensaje.id}
                               onClick={() => handleMessageSelect(mensaje)}
                               style={{
                                   backgroundColor: mensaje === selectedMessage ? '#DA291C' : 'transparent',
                                   color: mensaje === selectedMessage ? 'white' : 'inherit'
                               }}
                           >
                               <ListItemText 
                                   primary={mensaje.asunto} 
                                   primaryTypographyProps={{
                                    style: { 
                                        fontWeight: 'bold',  // Opcional, si quieres resaltar el asunto
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }
                                }}
                                   secondary={mensaje.participants && mensaje.participants.length > 0 ? mensaje.participants.join(', ') : ''} 
                                   secondaryTypographyProps={{
                                       style: { 
                                           fontSize: 10,
                                           whiteSpace: 'nowrap',
                                           overflow: 'hidden',
                                           textOverflow: 'ellipsis'
                                       }
                                   }} 
                               />
                           </ListItem>
                            ))}
                        </List>
                    </div>
                    <div style={{ width: '70%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                        {isNewMessage ? (
                            <>
                                <TextField
                                    select
                                    fullWidth
                                    label="Destinatario"
                                    value={newMessage.destinatario}
                                    onChange={(e) => setNewMessage({ ...newMessage, destinatario: e.target.value })}
                                    SelectProps={{ native: true }}
                                    style={{ marginBottom: '10px' }}
                                ><option key={""} value={""}>
                                {""}
                            </option>
                                    {/* Asumiendo que aún quieres mostrar los usuarios a seleccionar */}
                                    {usuariosProyecto.map((usuario) => (
                                        <option key={usuario.id} value={usuario.username}>
                                            {usuario.username}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Asunto"
                                    variant="outlined"
                                    value={newMessage.asunto}
                                    onChange={(e) => setNewMessage({ ...newMessage, asunto: e.target.value })}
                                    style={{ marginBottom: '10px' }}
                                />
                                {error && <Typography color="error">{error}</Typography>}
                                <Button variant="contained" color="primary" onClick={handleMessageSend} style={{ backgroundColor: '#DA291C', color: 'white', marginTop: '10px' }}>
                                    Enviar
                                </Button>
                            </>
                        ) : selectedMessage ? (
                            <>
                                <Typography variant="h6">{selectedMessage.asunto}</Typography>
                                <Typography variant="subtitle1">Participantes:  {selectedMessage && selectedMessage.participants.join(', ')}</Typography>
                                <Divider style={{ margin: '10px 0' }} />
                                <div style={{ flex: 1, overflow: 'auto', minHeight: '100px' }}>
                                {selectedMessage.messages.map((msg, index) => {
        // Determinar si el mensaje fue enviado por el usuario actual
                                    const isSender = msg.senderId === userId;
                                    let senderName = isSender ? "Tú" : selectedMessage.participants.find(p => p !== userId);
                                    // Si el remitente no es el usuario actual, obtenemos su nombre apropiado
                                    if (!isSender) {
                                        const otherParticipant = usuariosProyecto.find(user => user.username.toString() === senderName);
                                        senderName = otherParticipant ? otherParticipant.nombre : "Desconocido"; // Asegura que otherParticipant exista
                                    }

                                    return (
                                        <div key={index} style={{
                                            background: isSender ? '#e0f7fa' : '#e0e0e0',
                                            margin: '5px',
                                            padding: '10px',
                                            borderRadius: '10px'
                                        }}>
                                            <Typography variant="caption" style={{ fontWeight: 'bold', color: isSender ? '#000' : '#DA291C' }}>
                                                {senderName}
                                            </Typography>
                                            <Typography style={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.message}
                                            </Typography>
                                        </div>
                                    );
                                })}
                                </div>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Escribe un mensaje..."
                                    multiline
                                    rows={4}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    style={{ marginTop: '10px' }}
                                />
                                <Button variant="contained" color="primary" onClick={handleAddMessageSend} style={{ backgroundColor: '#DA291C', color: 'white', marginTop: '10px' }}>
                                    Enviar
                                </Button>
                            </>
                        ) : (
                            <Typography>Selecciona un mensaje para ver la conversación o crea uno nuevo.</Typography>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default BandejaDeEntrada;
