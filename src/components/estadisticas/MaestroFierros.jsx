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
                   
                    const urlBarras = `${API_BASE_URL}/api/barraurn/${urn}`;
                    const responseBarras = await axios.get(urlBarras);
                    const allBars = responseBarras.data; // Assuming the response data structure matches your needs
                    console.log("todas las barras",allBars);
                    const requestedIds = pedidos.flatMap(pedido => pedido.ids);
                    const availableBars = allBars.detalles.filter(bar => !requestedIds.includes(bar.id.toString()));
                    console.log("todas las barras no pedidas",availableBars);

                    const pedidoNoPedidos = {
                        nombre_pedido: "No Pedidos",
                        fecha: new Date().toISOString().split('T')[0], // Fecha actual
                        pesos: availableBars.reduce((sum, bar) => sum + parseFloat(bar.pesoLineal), 0).toFixed(2),
                        detalles: availableBars,
                        estados: { estado: 'No Aplicable', color: 'grey' }
                    };
    
                    // Agrega el pedido "No Pedidos" al array de pedidos
                    setPedidos([...pedidosConDetalles, pedidoNoPedidos]);
               
                    // setPedidos(pedidosConDetalles);
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
    if (newPedidos[index].nombre_pedido === "No Pedidos") {
        console.log("Detalles de barras no pedidas:", newPedidos[index].detalles);
    } else {
        const detalles = await fetchBarDetails(newPedidos[index]);
        console.log("todos los detalles", detalles);
        newPedidos[index].detalles = detalles;
    }
    console.log("pedidos con detalles", newPedidos);
    setPedidos(newPedidos);
};
    const handleDownloadAvailableBarsCSV = async () => {
        try {
            const urlBarras = `${API_BASE_URL}/api/barraurn/${urn}`;
            const responseBarras = await axios.get(urlBarras);
            const allBars = responseBarras.data; // Assuming the response data structure matches your needs
            console.log("todas las barras",allBars);
            const requestedIds = pedidos.flatMap(pedido => pedido.ids);
            const availableBars = allBars.detalles.filter(bar => !requestedIds.includes(bar.id.toString()));
            console.log("todas las barras no pedidas",availableBars);
            const csvData = availableBars.map(bar => ({
                'EJE/VIGA/LOSA': bar.nombreFiltro1,
                'ELEM CONST': '',
                'PISO': bar.aecPiso,
                'CICLO': bar.aecSecuenciaHormigonado,
                'Cantidad': bar.cantidad,
                'Ø mm': bar.diametroBarra,
                'Figura': bar.aecForma,
                'L/m': bar.longitudTotal,
                'Uso': bar.aecUsoBarra,
                'A/cm': bar.a,
                'B/cm': bar.b,
                'C/cm': bar.c,
                'D/cm': bar.d,
                'E/cm': bar.e,
                'F/cm': bar.f,
                'G/cm': bar.g,
                'H/cm': bar.h,
                'I/cm': bar.i,
                'J/cm': bar.j,
                'AngV': '',
                'AngV2': '',
                'AngV3': '',
                'R/cm': bar.r,
                'Peso Kg': bar.pesoLineal,
                'Id': bar.id
            }));
    
            const csvString = unparse(csvData, {
                quotes: true,
                skipEmptyLines: true
            });
    
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = "disponibles_barras.csv";
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error al procesar barras disponibles para CSV:", error);
        }
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
    const statusColors = {
        'paquetizado': 'yellow',
        'espera_aprobacion': 'lightgreen',
        'rechazado': 'red',
        'aceptado': 'lime',
        'fabricacion': 'blue',
        'despacho': 'orange',
        'recepcionado': 'lightblue',
        'instalado': 'brown',
        'inspeccionado': 'darkgreen',
        'hormigonado': 'lightgreen'
    };
    const getLastStatus = (estados) => {
        if (!estados || Object.keys(estados).length === 0) {
            return { estado: 'paquetizado', color: 'yellow' }; // Estado predeterminado
        }
        let lastState = null;
        Object.entries(estados).forEach(([key, val]) => {
            if (!lastState || new Date(val.fecha) > new Date(lastState.fecha)) {
                lastState = { estado: key, color: statusColors[key], ...val };
            }
        });
        return lastState;
    };
    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginBottom: '20px', textAlign: 'center' }}>
                 <h4>  Maestro de Barras</h4>
                </Typography >
                <div style={{ display: 'flex', justifyContent: 'left', gap: '5px', marginBottom: '20px' }}>
    <Button onClick={handleDownloadAllPedidosCSV} variant="contained" color="primary">
        Descargar CSV de Todos los Pedidos
    </Button>
    <Button onClick={handleDownloadAvailableBarsCSV} variant="contained" color="primary">
        Descargar CSV Barras No Solicitadas
    </Button>
</div>
                <div>
                {pedidos.map((pedido, index) => (
    <Accordion key={index} onChange={() => handleExpand(index)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography >
        
            <b>{pedido.nombre_pedido}</b> - {pedido.fecha} - {pedido.pesos} kg - [ {getLastStatus(pedido.estados).estado}  <span style={{
                                                                                                                                display: 'inline-block',
                                                                                                                                height: '20px',
                                                                                                                                width: '20px',
                                                                                                                                backgroundColor: getLastStatus(pedido.estados).color,
                                                                                                                                borderRadius: '50%',
                                                                                                                                marginRight: '5px',
                                                                                                                                verticalAlign: 'middle'
                                                                                                                            }}></span>]
        </Typography>
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
                <TableCell>EJE/VIGA/LOSA</TableCell>
                <TableCell>PISO</TableCell>
                <TableCell>CICLO</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Figura</TableCell>
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
            </TableRow>
        </TableHead>
        <TableBody>
            {pedido.detalles.map((barra, idx) => (
                <TableRow key={idx}>
                    <TableCell>{barra.id}</TableCell>
                    <TableCell>{typeof barra.diametroBarra === 'number' ? barra.diametroBarra.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.longitudTotal === 'number' ? barra.longitudTotal.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.pesoLineal === 'number' ? barra.pesoLineal.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{barra.nombreFiltro1}</TableCell>
                    <TableCell>{barra.aecPiso}</TableCell>
                    <TableCell>{barra.aecSecuenciaHormigonado}</TableCell>
                    <TableCell>{barra.cantidad}</TableCell>
                    <TableCell>{barra.aecForma}</TableCell>
                    <TableCell>{barra.aecUsoBarra}</TableCell>
                    <TableCell>{typeof barra.a === 'number' ? barra.a.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.b === 'number' ? barra.b.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.c === 'number' ? barra.c.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.d === 'number' ? barra.d.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.e === 'number' ? barra.e.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.f === 'number' ? barra.f.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.g === 'number' ? barra.g.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.h === 'number' ? barra.h.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.i === 'number' ? barra.i.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.j === 'number' ? barra.j.toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{typeof barra.r === 'number' ? barra.r.toFixed(2) : "0.00"}</TableCell>
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