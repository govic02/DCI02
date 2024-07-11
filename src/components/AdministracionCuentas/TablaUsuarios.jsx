import React, { useState, useMemo } from 'react';
import { useTable, usePagination } from 'react-table';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';
import API_BASE_URL from '../../config';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
const TablaUsuarios = ({ usuarios,refrescarUsuarios }) => {
    const [esModalEditarAbierto, setEsModalEditarAbierto] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);

    // Columnas de la tabla
    
    const columns = useMemo(() => [
        { Header: 'Username', accessor: 'username' },
        { Header: 'Nombre Completo', accessor: 'fullname' },
        { Header: 'Tipo de Usuario', accessor: 'tipoUsuario' },
        {
            Header: 'Acciones',
            accessor: 'acciones',
            Cell: ({ row }) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton onClick={() => editarUsuario(row.original)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => eliminarUsuario(row.original.idUsu)} color="secondary">
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ], []);
     const abrirModalEditar = (usuario) => {
        setUsuarioAEditar(usuario);
        setEsModalEditarAbierto(true);
      };
    
      const cerrarModalEditar = () => {
        setEsModalEditarAbierto(false);
      };

      const actualizarUsuario = async () => {
        if (!usuarioAEditar || !usuarioAEditar.idUsu) {
            console.error('Error: No se proporcionó un ID de usuario válido para actualizar');
            return;
        }
    
        try {
            // Preparar el cuerpo de la solicitud con los datos actualizados del usuario
            const datosActualizados = {
                fullname: usuarioAEditar.fullname,
                username: usuarioAEditar.username, // Este podría ser el campo de e-mail, asegúrate de tener el nombre correcto
                password: usuarioAEditar.password,
                tipoUsuario: usuarioAEditar.tipoUsuario,
            };
    
            // Realizar la solicitud PUT al servidor para actualizar el usuario
            const response = await fetch(`${API_BASE_URL}/api/usuarios/${usuarioAEditar.idUsu}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Incluir aquí cualquier header adicional, como un token de autenticación si es necesario
                },
                body: JSON.stringify(datosActualizados),
            });
    
            if (!response.ok) {
                throw new Error('No se pudo actualizar el usuario');
            }
    
            // Procesar la respuesta del servidor
            const usuarioActualizado = await response.json();
          //console.log('Usuario actualizado con éxito:', usuarioActualizado);
    
            // Actualizar la UI según sea necesario, por ejemplo, cerrando el modal y recargando la lista de usuarios
            cerrarModalEditar();
            // Aquí podrías recargar la lista de usuarios o actualizar el estado para reflejar los cambios
            alert('Usuario actualizado con éxito');
            refrescarUsuarios();
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            alert('Ocurrió un error al actualizar el usuario');
        }
    };
    
    // Filtrado de datos
    const datosFiltrados = useMemo(() => {
        if (!filtro) return usuarios;
        return usuarios.filter(item =>
            item.username.toLowerCase().includes(filtro.toLowerCase()) ||
            item.fullname.toLowerCase().includes(filtro.toLowerCase()) ||
            item.tipoUsuario.toLowerCase().includes(filtro.toLowerCase())
        );
    }, [filtro, usuarios]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
        setPageSize: setPageSizeReactTable,
        state: { pageIndex },
    } = useTable(
        { columns, data: datosFiltrados, initialState: { pageIndex: 0, pageSize } },
        usePagination
    );

    // Manejadores de eventos
    const handlePageSizeChange = (event) => {
        const newPageSize = Number(event.target.value);
        setPageSize(newPageSize);
        setPageSizeReactTable(newPageSize);
    };

    const editarUsuario = (usuario) => {
      //console.log('Editar usuario:', usuario);
        setUsuarioAEditar(usuario);
        setEsModalEditarAbierto(true);
    };

    const eliminarUsuario = async (idUsu) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/usuarios/${idUsu}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // Incluir aquí cualquier header adicional, como un token de autenticación si es necesario
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }
    
                // Aquí puedes actualizar el estado para reflejar que el usuario fue eliminado
                // Por ejemplo, podrías filtrar el usuario eliminado de la lista de usuarios
                // o recargar la lista desde el servidor
                alert('Usuario eliminado con éxito');
                refrescarUsuarios();
            } catch (error) {
                console.error('Error al eliminar el usuario:', error);
                alert('Ocurrió un error al eliminar el usuario');
            }
        }
    };
    

    // Estilos
    const cardStyle = {
        marginTop: '25px',
        marginLeft: '0px',
        marginRight: '0px',
        borderRadius: '20px',
    };

    const contenedor = {
        marginLeft: '30px',
        marginRight: '30px',
        height: '100%',
        marginBottom: '80px',
    };

    return (
        <div style={contenedor}>
            <Dialog open={esModalEditarAbierto} onClose={cerrarModalEditar}>
    <DialogTitle>Editar Usuario</DialogTitle>
    <DialogContent>
    <TextField
        autoFocus
        margin="dense"
        id="fullname"
        label="Nombre Completo"
        type="text"
        fullWidth
        variant="outlined"
        value={usuarioAEditar ? usuarioAEditar.fullname : ''}
        onChange={(e) => setUsuarioAEditar({...usuarioAEditar, fullname: e.target.value})}
    />
    <TextField
        margin="dense"
        id="username"
        label="E-Mail"
        type="email"
        fullWidth
        variant="outlined"
        value={usuarioAEditar ? usuarioAEditar.username : ''}
        onChange={(e) => setUsuarioAEditar({...usuarioAEditar, username: e.target.value})}
        disabled={true}
    />
    <TextField
        margin="dense"
        id="password"
        label="Contraseña"
        type="password"
        fullWidth
        variant="outlined"
        value={usuarioAEditar ? usuarioAEditar.password : ''}
        onChange={(e) => setUsuarioAEditar({...usuarioAEditar, password: e.target.value})}
    />
    <RadioGroup
        row
        value={usuarioAEditar ? usuarioAEditar.tipoUsuario : ''}
        onChange={(e) => setUsuarioAEditar({...usuarioAEditar, tipoUsuario: e.target.value})}
    >
        <FormControlLabel value="visualizador" control={<Radio />} label="Visualizador" />
        <FormControlLabel value="editor" control={<Radio />} label="Editor" />
        <FormControlLabel value="administrador" control={<Radio />} label="Administrador" />
    </RadioGroup>
</DialogContent>

    <DialogActions>
      <Button onClick={cerrarModalEditar}>Cancelar</Button>
      <Button onClick={actualizarUsuario}>Guardar Cambios</Button>
    </DialogActions>
  </Dialog>
            <div className="row justify-content-end mb-3">
                <div className="col-auto">
                    <TextField
                        label="Buscar"
                        variant="outlined"
                        value={filtro}
                        onChange={e => setFiltro(e.target.value)}
                    />
                </div>
            </div>
            <Card style={cardStyle}>
                <CardContent>
                    <table {...getTableProps()} className="table">
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <div>
                            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                Anterior
                            </Button>
                            <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                Siguiente
                            </Button>
                        </div>
                        <Typography>
                            Página {pageIndex + 1} de {Math.ceil(datosFiltrados.length / pageSize)}
                        </Typography>
                        <TextField
                            select
                            label="Filas por página"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            variant="outlined"
                            style={{ width: 'auto' }}
                        >
                            {[10, 20, 30, 40, 50].map(pageSizeOption => (
                                <MenuItem key={pageSizeOption} value={pageSizeOption}>
                                    {pageSizeOption}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TablaUsuarios;
