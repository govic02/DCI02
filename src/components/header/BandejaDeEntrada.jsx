import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, Typography, TextField, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';  // Ícono +

const BandejaDeEntrada = ({ open, onClose }) => {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [isNewMessage, setIsNewMessage] = useState(false); // Estado para controlar la vista de nuevo mensaje
    const [newMessage, setNewMessage] = useState({
        destinatario: "",
        asunto: "",
        cuerpo: ""
    });

    // Datos de usuarios dummy
    const usuariosProyecto = [
        { id: 1, nombre: 'Usuario1' },
        { id: 2, nombre: 'Usuario2' }
    ];

    const mensajes = [
        { id: 1, asunto: 'Asunto proyecto', usuario: 'Usuario1' },
        { id: 2, asunto: 'Revisión Documento ', usuario: 'Usuario2' }
    ];

    const handleMessageSelect = (mensaje) => {
        setSelectedMessage(mensaje);
        setIsNewMessage(false);  // Desactiva la vista de nuevo mensaje
    };

    const handleMessageSend = () => {
        console.log("Enviar mensaje:", messageText);
        // Aquí implementar lógica para enviar el mensaje
        setMessageText("");
    };

    const handleNewMessage = () => {
        setIsNewMessage(true); // Activa la vista para nuevo mensaje
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
                                        color: mensaje === selectedMessage ? 'white' : 'inherit',
                                        '&:hover': {
                                            backgroundColor: '#DA291C',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <ListItemText primary={mensaje.asunto} secondary={mensaje.usuario} />
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
                                    SelectProps={{
                                        native: true,
                                    }}
                                    style={{ marginBottom: '10px' }}
                                >
                                    {usuariosProyecto.map((usuario) => (
                                        <option key={usuario.id} value={usuario.nombre}>
                                            {usuario.nombre}
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
                                <TextField
                                    fullWidth
                                    label="Mensaje"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    value={newMessage.cuerpo}
                                    onChange={(e) => setNewMessage({ ...newMessage, cuerpo: e.target.value })}
                                />
                                <Button variant="contained" color="primary" onClick={handleMessageSend} style={{ backgroundColor: '#DA291C', color: 'white',marginTop: '10px' }}>
                                    Enviar
                                </Button>
                            </>
                        ) : selectedMessage ? (
                            <>
                                <Typography variant="h6">{selectedMessage.asunto}</Typography>
                                <Typography variant="subtitle1">De: {selectedMessage.usuario}</Typography>
                                <Divider style={{ margin: '10px 0' }} />
                                <div style={{ flex: 1, overflow: 'auto', minHeight: '100px' }}>
                                    {/* Aquí iría el contenido de la conversación */}
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
                                <Button variant="contained" color="primary" onClick={handleMessageSend} style={{backgroundColor: '#DA291C', color: 'white', marginTop: '10px' }}>
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
