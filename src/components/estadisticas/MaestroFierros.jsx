import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion, AccordionSummary, AccordionDetails, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Card, CardContent, Button
  } from '@mui/material';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import API_BASE_URL from '../../config';
import { unparse,parse } from 'papaparse';

const MaestroFierros = ({ urn }) => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const url = `${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urn)}`;
                const response = await axios.get(url);
                if (response.status === 200) {
                    setPedidos(response.data);
                    
                } else {
                    console.error(`Respuesta del servidor con estado: ${response.status}`);
                    setPedidos([]);
                }
            } catch (error) {
                console.error('Error al obtener la lista de pedidos:', error);
                setPedidos([]);
            }
        };
    
        fetchPedidos();
    }, [urn]);

    const fetchBarDetails = async (pedido) => {
        try {
            const url = `${API_BASE_URL}/api/barrasPorUrneIds/${urn}`;
            const response = await axios.post(url, { ids: pedido.ids });
            if (response.status === 200) {
                return response.data;
            } else {
                console.error('No se encontraron barras para los IDs proporcionados');
                return [];
            }
        } catch (error) {
            console.error('Error al obtener detalles de barras:', error);
            return [];
        }
    };

    const handleExpand = async (index) => {
        const newPedidos = [...pedidos];
        const detalles = await fetchBarDetails(newPedidos[index]);
        newPedidos[index].detalles = detalles;
        console.log();
        setPedidos(newPedidos);
    };



    const handleDownloadCSV = async () => {
        // Asegurarse de que los detalles de los pedidos estén cargados
        const pedidosConDetalles = await Promise.all(pedidos.map(async pedido => {
            const detalles = await fetchBarDetails(pedido);
            return { ...pedido, detalles: detalles || [] }; // Asegurarse de que detalles no es undefined
        }));
    
        // Preparar los datos para el CSV
        const csvData = pedidosConDetalles.reduce((acc, pedido) => {
            if (pedido.detalles.length > 0) {
                const pedidoData = pedido.detalles.map(barra => ({
                    'Pedido': pedido.nombre_pedido,
                    'Fecha': pedido.fecha,
                    'Peso Total Pedido': pedido.pesos,
                    'ID Barra': barra.id,
                    'Diámetro': barra.diametroBarra,
                    'Largo': barra.longitudTotal,
                    'Peso': barra.pesoLineal
                }));
                acc = acc.concat(pedidoData);
            }
            return acc;
        }, []);
    
        // Convertir datos a CSV
        const csvString = unparse(csvData);
    
        // Crear Blob y descargar
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "detalles_pedidos.csv";
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    
    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
    };

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginBottom: '20px', textAlign: 'center' }}>
                 <h4>  Maestro de Fierros</h4>
                </Typography>
                <Button onClick={handleDownloadCSV} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
                    Descargar CSV
                </Button>
                <div>
                {pedidos.map((pedido, index) => (
                    <Accordion key={index} onChange={() => handleExpand(index)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography><b>{pedido.nombre_pedido} </b> - {pedido.fecha} - {pedido.pesos} kg</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table aria-label="detalles del pedido">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID Barra</TableCell>
                                            <TableCell>Diametro</TableCell>
                                            <TableCell>Longitud Total</TableCell>
                                            <TableCell>Peso Lineal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pedido.detalles?.map((barra, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell component="th" scope="row">
                                                    {barra.id}
                                                </TableCell>
                                                <TableCell>{barra.diametroBarra}</TableCell>
                                                <TableCell>{barra.longitudTotal}</TableCell>
                                                <TableCell>{barra.pesoLineal}</TableCell>
                                            </TableRow>
                                        ))}
                                        {(!pedido.detalles || pedido.detalles.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4}>No hay detalles disponibles</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default MaestroFierros;
