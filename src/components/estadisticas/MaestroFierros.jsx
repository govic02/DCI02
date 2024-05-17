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

const MaestroFierros = ({ urn,proyecto }) => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const url = `${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urn)}`;
                const response = await axios.get(url);
                if (response.status === 200) {
                    // Asigna la lista inicial de pedidos
                    const pedidosInicial = response.data;
                    // Carga los detalles para todos los pedidos
                    const pedidosConDetalles = await Promise.all(pedidosInicial.map(async pedido => {
                        const detalles = await fetchBarDetails(pedido);
                        return { ...pedido, detalles: detalles || [] };
                    }));
                    setPedidos(pedidosConDetalles);
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
        console.log("todos los detalles",detalles);
        newPedidos[index].detalles = detalles;
        console.log("pedidos con detalles",newPedidos);
        setPedidos(newPedidos);
    };

    const handleDownloadPedidoCSV = async (pedido) => {
        const csvData = pedido.detalles.map(barra => ({
            'EJE/VIGA/LOSA': barra.nombreFiltro1,
            'ELEM CONST': '', // No tiene correspondencia, va vacío
            'PISO': barra.aecPiso,
            'CICLO': barra.aecSecuenciaHormigonado,
            'Cantidad': barra.cantidad,
            'Ø mm': barra.diametroBarra,
            'Figura': barra.aecForma,
            'L/m': barra.longitudTotal,
            'Uso': barra.aecUsoBarra,
            'A/cm': barra.a,
            'B/cm': barra.b,
            'C/cm': barra.c,
            'D/cm': barra.d,
            'E/cm': barra.e,
            'F/cm': barra.f,
            'G/cm': barra.g,
            'H/cm': barra.h,
            'I/cm': barra.i, // Si no existe el campo 'i', se deja vacío
            'AngV': '',
            'AngV2': '',
            'AngV3': '',
            'J/cm': barra.j,
            'AngV': '', // No tiene correspondencia, se mantiene vacío
            'AngV2': '', // No tiene correspondencia, se mantiene vacío
            'AngV3': '', // No tiene correspondencia, se mantiene vacío
            'R/cm': barra.r,
            'Peso Kg': barra.pesoLineal,
            'Ids': barra.id
        }));
    
        const csvString = unparse(csvData, {
            quotes: true,
            skipEmptyLines: true
        });
    
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `detalles_${pedido.nombre_pedido}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    const handleDownloadAllPedidosCSV = async () => {
        // Asegurarse de que los detalles de todos los pedidos están cargados
        const pedidosConDetalles = await Promise.all(pedidos.map(async pedido => {
            if (!pedido.detalles || pedido.detalles.length === 0) {
                const detalles = await fetchBarDetails(pedido);
                return { ...pedido, detalles: detalles || [] };
            }
            return pedido;
        }));
    
        // Preparar los datos para el CSV de todos los pedidos
        const csvData = pedidosConDetalles.reduce((acc, pedido) => {
            if (pedido.detalles.length > 0) {
                const pedidoData = pedido.detalles.map(barra => ({
                    'EJE/VIGA/LOSA': barra.nombreFiltro1,
                    'ELEM CONST': '', // No tiene correspondencia, va vacío
                    'PISO': barra.aecPiso,
                    'CICLO': barra.aecSecuenciaHormigonado,
                    'Cantidad': barra.cantidad,
                    'Ø mm': barra.diametroBarra,
                    'Figura': barra.aecForma,
                    'L/m': barra.longitudTotal,
                    'Uso': barra.aecUsoBarra,
                    'A/cm': barra.a,
                    'B/cm': barra.b,
                    'C/cm': barra.c,
                    'D/cm': barra.d,
                    'E/cm': barra.e,
                    'F/cm': barra.f,
                    'G/cm': barra.g,
                    'H/cm': barra.h,
                    'I/cm': barra.i, // Si no existe el campo 'i', se deja vacío
                    'J/cm': barra.j,
                    'AngV': '',
                    'AngV2': '',
                    'AngV3': '',
                    'R/cm': barra.r,
                    'Peso Kg': barra.pesoLineal,
                    'Ids': barra.id
                }));
                acc = acc.concat(pedidoData);
            }
            return acc;
        }, []);
    
        // Convertir datos a CSV
        const csvString = unparse(csvData, {
            quotes: true,
            skipEmptyLines: true
        });
    
        // Crear Blob y descargar
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "todos_los_pedidos_detalles.csv";
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
                 <h4>  Maestro de Barras</h4>
                </Typography>
                <Button onClick={handleDownloadAllPedidosCSV} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
    Descargar CSV de Todos los Pedidos
</Button>
                <div>
                {pedidos.map((pedido, index) => (
    <Accordion key={index} onChange={() => handleExpand(index)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography><b>{pedido.nombre_pedido}</b> - {pedido.fecha} - {pedido.pesos} kg</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Button onClick={() => handleDownloadPedidoCSV(pedido)} variant="contained" color="primary">
                Descargar CSV del Pedido
            </Button>
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
                        {pedido.detalles.map((barra, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{barra.id}</TableCell>
                                <TableCell>{barra.diametroBarra}</TableCell>
                                <TableCell>{barra.longitudTotal}</TableCell>
                                <TableCell>{barra.pesoLineal}</TableCell>
                            </TableRow>
                        ))}
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
//   <Button onClick={handleDownloadCSV} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
//Descargar CSV
//</Button>