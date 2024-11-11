import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion, AccordionSummary, AccordionDetails, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Card, CardContent, Button, Select, MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import API_BASE_URL from '../config';
import HeaderApp from './HeaderApp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { unparse } from 'papaparse';
import { useAuth } from '../context/AuthContext';

const estados = ['paquetizado', 'espera_aprobacion', 'rechazado', 'aceptado', 'fabricacion', 'despacho', 'recepcionado', 'instalado', 'inspeccionado', 'hormigonado'];

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [esAdministrador, setEsAdministrador] = useState(false);
    const [proyectoKeySeleccionado, setProyectoKeySeleccionado] = useState('');
    const [urnSelected, setUrnSelected] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [modalidad, setModalidad] = useState('Armacero');
    const userId = localStorage.getItem('userId');
    const { token: tokenContexto } = useAuth();

    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo');
        const esAdmin = tipoUsuario === 'Administrador' || tipoUsuario === 'administrador';
        setEsAdministrador(esAdmin);
    }, []);

    useEffect(() => {
        const obtenerUsuarioProyecto = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/getUserProyectId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenContexto}`
                    },
                    body: JSON.stringify({ idUsuario: userId })
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setUrnSelected(data[0].urn);
                        setProyectoKeySeleccionado(data[0].proyectoKey);
                    }
                }
            } catch (error) {
                toast.error('Error al obtener el proyecto asignado al usuario');
            }
        };

        obtenerUsuarioProyecto();
    }, [userId, tokenContexto]);

    useEffect(() => {
        if (urnSelected) {
            const fetchPedidos = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urnSelected)}`);
                    if (response.status === 200) {
                        const pedidosInicial = response.data;
                        const pedidosConDetalles = await Promise.all(pedidosInicial.map(async pedido => {
                            const detalles = await fetchBarDetails(pedido);
                            return { ...pedido, detalles: detalles || [] };
                        }));
                        setPedidos(pedidosConDetalles);
                    }
                } catch (error) {
                    setPedidos([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchPedidos();
        }
    }, [urnSelected]);

    const fetchBarDetails = async (pedido) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/barrasPorUrneIds/${urnSelected}`, { ids: pedido.ids });
            return response.status === 200 ? response.data : [];
        } catch {
            return [];
        }
    };

    const handleDownloadPedidoCSV = (pedido) => {
        const csvData = pedido.detalles.map(barra => ({
            'EJE/VIGA/LOSA': barra.nombreFiltro1,
            'ELEM CONST': '',
            'PISO': barra.aecPiso,
            'CICLO': barra.aecSecuenciaHormigonado,
            'Cantidad': barra.cantidad || barra.Quantity,
            'Ø mm': barra.diametroBarra?.toFixed(2) || "0.00",
            'Figura': barra.aecForma,
            'L/m': barra.longitudTotal ? (barra.longitudTotal / barra.cantidad).toFixed(2) : "0.00",
            'Uso': barra.aecUsoBarra,
            'A/cm': formatNumber(barra.a * 100),
            'B/cm': formatNumber(barra.b * 100),
            'C/cm': formatNumber(barra.c * 100),
            'D/cm': formatNumber(barra.d * 100),
            'E/cm': formatNumber(barra.e * 100),
            'F/cm': formatNumber(barra.f * 100),
            'G/cm': formatNumber(barra.g * 100),
            'H/cm': formatNumber(barra.h * 100),
            'I/cm': formatNumber(barra.i * 100),
            'J/cm': formatNumber(barra.j * 100),
            'R/cm': formatNumber(barra.r),
            'Peso Kg': barra.pesoLineal?.toFixed(2) || "0.00",
            'Id': barra.id,
        }));

        const csvString = unparse(csvData, { quotes: true });
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `pedido_${pedido.nombre_pedido}.csv`;
        link.click();
    };

    const formatNumber = (value) => (isNaN(value) ? "0.00" : parseFloat(value).toFixed(2));

    const getLatestState = (estados, estadosData) => {
        for (let i = estados.length - 1; i >= 0; i--) {
            const estado = estados[i];
            if (estadosData && estadosData[estado] && estadosData[estado].est === 'ok') {
                return estado.replace('_', ' ');
            }
        }
        return 'N/A';
    };

    return (
        <div>
            <HeaderApp proyectoKey={proyectoKeySeleccionado} urn={urnSelected} />
            <Card style={{ margin: '40px', borderRadius: '20px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                    <Typography variant="h5" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Lista de Pedidos
                    </Typography>
                    {loading ? (
                        <Typography variant="body1" style={{ textAlign: 'center' }}>
                            Buscando pedidos...
                        </Typography>
                    ) : pedidos.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {pedidos.map((pedido, index) => (
                                <Accordion
                                    key={index}
                                    onChange={(event, isExpanded) => setSelectedPedido(isExpanded ? pedido : null)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>
                                            <b>{pedido.nombre_pedido}</b> - {pedido.fecha} - {pedido.pesos} kg
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            <Select
                                                value={modalidad}
                                                onChange={(e) => setModalidad(e.target.value)}
                                                style={{ marginRight: '10px' }}
                                            >
                                                <MenuItem value="Armacero">Modalidad Armacero</MenuItem>
                                                <MenuItem value="ICDM">Modalidad ICDM</MenuItem>
                                            </Select>
                                            <Button onClick={() => handleDownloadPedidoCSV(pedido)} variant="contained" color="primary">
                                                Exportar Pedido
                                            </Button>
                                        </div>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>EJE/VIGA/LOSA</TableCell>
                                                        <TableCell>ELEM CONST</TableCell>
                                                        <TableCell>PISO</TableCell>
                                                        <TableCell>CICLO</TableCell>
                                                        <TableCell>Cantidad</TableCell>
                                                        <TableCell>Ø mm</TableCell>
                                                        <TableCell>Figura</TableCell>
                                                        <TableCell>L/m</TableCell>
                                                        <TableCell>Uso</TableCell>
                                                        <TableCell>A/cm</TableCell>
                                                        <TableCell>B/cm</TableCell>
                                                        <TableCell>C/cm</TableCell>
                                                        <TableCell>D/cm</TableCell>
                                                        <TableCell>E/cm</TableCell>
                                                        <TableCell>F/cm</TableCell>
                                                        <TableCell>G/cm</TableCell>
                                                        <TableCell>H/cm</TableCell>
                                                        <TableCell>I/cm</TableCell>
                                                        <TableCell>J/cm</TableCell>
                                                        <TableCell>R/cm</TableCell>
                                                        <TableCell>Peso Kg</TableCell>
                                                        <TableCell>ID</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {pedido.detalles.map((barra, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{barra.nombreFiltro1}</TableCell>
                                                            <TableCell>''</TableCell>
                                                            <TableCell>{barra.aecPiso}</TableCell>
                                                            <TableCell>{barra.aecSecuenciaHormigonado}</TableCell>
                                                            <TableCell>{barra.cantidad || barra.Quantity}</TableCell>
                                                            <TableCell>{barra.diametroBarra?.toFixed(2)}</TableCell>
                                                            <TableCell>{barra.aecForma}</TableCell>
                                                            <TableCell>{barra.longitudTotal}</TableCell>
                                                            <TableCell>{barra.aecUsoBarra}</TableCell>
                                                            <TableCell>{formatNumber(barra.a * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.b * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.c * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.d * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.e * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.f * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.g * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.h * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.i * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.j * 100)}</TableCell>
                                                            <TableCell>{formatNumber(barra.r)}</TableCell>
                                                            <TableCell>{barra.pesoLineal?.toFixed(2)}</TableCell>
                                                            <TableCell>{barra.id}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    ) : (
                        <Typography variant="body1" style={{ textAlign: 'center' }}>
                            No existen pedidos asociados.
                        </Typography>
                    )}
                    {selectedPedido && (
                        <Card style={{ marginTop: '20px' }}>
                            <CardContent>
                                <Typography variant="h6" style={{ marginBottom: '10px' }}>Historial de Pedido</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Estado</TableCell>
                                                <TableCell>Est</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Usuario</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {estados.map((estado) => {
                                                const estadoData = selectedPedido.estados && selectedPedido.estados[estado];
                                                return (
                                                    <TableRow key={estado}>
                                                        <TableCell>{estado.replace('_', ' ')}</TableCell>
                                                        <TableCell>
                                                            <span
                                                                style={{
                                                                    backgroundColor: estadoData && estadoData.est === 'ok' ? '#28a745' : '#dc3545',
                                                                    width: '15px',
                                                                    height: '15px',
                                                                    display: 'inline-block',
                                                                    borderRadius: '50%',
                                                                }}
                                                            ></span>
                                                        </TableCell>
                                                        <TableCell>{estadoData ? new Date(estadoData.fecha).toLocaleDateString("es-ES") : 'N/A'}</TableCell>
                                                        <TableCell>{estadoData ? estadoData.nombreUsuario : 'N/A'}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
            <ToastContainer />
        </div>
    );
};

export default Pedidos;
