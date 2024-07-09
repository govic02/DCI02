import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion, AccordionSummary, AccordionDetails, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Card, CardContent, Button, Tabs, Tab
  } from '@mui/material';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import API_BASE_URL from '../../config';
import { unparse,parse } from 'papaparse';

const MaestroFierros = ({ urn,proyecto }) => {
    const [pedidos, setPedidos] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
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
                        console.log("Detalle Pedidos",detalles);
                        return { ...pedido, detalles: detalles || [] };
                    }));
                   
                    const urlBarras = `${API_BASE_URL}/api/barraurn/${urn}`;
                    const responseBarras = await axios.get(urlBarras);
                    const allBars = await responseBarras.data; // Assuming the response data structure matches your needs
                    console.log("todas las barras",allBars);
                   
                   //const requestedIds = pedidos.flatMap(pedido => pedido.ids);
                    const requestedIds = pedidosConDetalles.flatMap(pedido => 
                        pedido.detalles.map(detalle => detalle.id.toString())
                    );
                    console.log("pedidos barras",requestedIds);

                    
                    const availableBars = allBars.detalles.filter(bar => !requestedIds.includes(bar.id.toString()));
                    console.log("todas las barras no pedidas",availableBars);

                    const pedidoNoPedidos = {
                        nombre_pedido: "No Pedidos",
                        fecha: new Date().toISOString().split('T')[0], // Fecha actual
                        pesos: availableBars.reduce((sum, bar) => sum + (parseFloat(bar.pesoLineal) * parseFloat(bar.longitudTotal)), 0).toFixed(2)
                        ,
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
        console.log("respuesta datos  barra detalles",response.data)
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
    console.log("pedidos con detalles Expand", newPedidos);
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
                    'Cantidad': barra.cantidad !== undefined ? barra.cantidad : barra.Quantity,
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
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
      };

    function formatNumber(value) {
     
        const num = parseFloat(value);
    
        // Verifica si 'num' es un número después de la conversión
        if (!isNaN(num)) {
            // Redondea a dos decimales si es diferente de cero, de lo contrario devuelve '0'
            return num !== 0 ? num.toFixed(2) : "0";
        } else {
            // Devuelve "0.00" si el valor original no es convertible a un número
            return "0.00";
        }
    }
      return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginBottom: '20px', textAlign: 'center' }}>
                    Maestro de Barras
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'left', gap: '5px', marginBottom: '20px' }}>
                    <Button onClick={handleDownloadAllPedidosCSV} variant="contained" style={{ backgroundColor: '#DA291C', color: 'white' }} >
                        Descargar CSV de Todos los Pedidos
                    </Button>
                    <Button onClick={handleDownloadAvailableBarsCSV} variant="contained"style={{ backgroundColor: '#DA291C', color: 'white' }} >
                        Descargar CSV Barras No Solicitadas
                    </Button>
                </div>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
                    <Tab label="Pedidos" />
                    <Tab label="Barras No Solicitadas" />
                </Tabs>
                {tabIndex === 0 && (
                    <div>
                       {pedidos.filter(p => p.nombre_pedido !== "No Pedidos").map((pedido, index) => (
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
                                    <TableCell>AngV</TableCell>
                                    <TableCell>AngV2</TableCell>
                                    <TableCell>AngV3</TableCell>
                                    <TableCell>R/cm</TableCell>
                                    <TableCell>Peso Kg</TableCell>
                                    <TableCell>ID Barra</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pedido.detalles.map((barra, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{barra.nombreFiltro1}</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>{barra.aecPiso}</TableCell>
                                            <TableCell>{barra.aecSecuenciaHormigonado}</TableCell>
                                            <TableCell>{barra.cantidad !== undefined ? barra.cantidad : barra.Quantity}</TableCell>
                                            <TableCell>{typeof barra.diametroBarra === 'number' ? barra.diametroBarra.toFixed(2) : "0.00"}</TableCell>
                                            <TableCell>{barra.aecForma}</TableCell>
                                            <TableCell>{typeof barra.longitudTotal === 'number' ? barra.longitudTotal.toFixed(2) : "0.00"}</TableCell>
                                            <TableCell>{barra.aecUsoBarra}</TableCell>
                                            <TableCell>{formatNumber(barra.a !== undefined ? barra.a : barra.A)}</TableCell>
                                            <TableCell>{formatNumber(barra.b !== undefined ? barra.b : barra.B)}</TableCell>
                                            <TableCell>{formatNumber(barra.c !== undefined ? barra.c : barra.C)}</TableCell>
                                            <TableCell>{formatNumber(barra.d !== undefined ? barra.d : barra.D)}</TableCell>
                                            <TableCell>{formatNumber(barra.e !== undefined ? barra.e : barra.E)}</TableCell>
                                            <TableCell>{formatNumber(barra.f !== undefined ? barra.f : barra.F)}</TableCell>
                                            <TableCell>{formatNumber(barra.g !== undefined ? barra.g : barra.G)}</TableCell>
                                            <TableCell>{formatNumber(barra.h !== undefined ? barra.h : barra.H)}</TableCell>
                                            <TableCell>{formatNumber(barra.i !== undefined ? barra.i : barra.I)}</TableCell>
                                            <TableCell>{formatNumber(barra.j !== undefined ? barra.j : barra.J)}</TableCell>
      
                                            <TableCell>''</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>{formatNumber(barra.r)}</TableCell>
                                            <TableCell>{typeof barra.pesoLineal === 'number' ? barra.pesoLineal.toFixed(2) : "0.00"}</TableCell>
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
                )}
{tabIndex === 1 && (
                    <div>
                        {pedidos.filter(p => p.nombre_pedido === "No Pedidos").map((pedido, index) => (
                            <Accordion key={index}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>
                                        <b>{pedido.nombre_pedido}</b> - {pedido.fecha} - {Number(pedido.pesos).toLocaleString('es-ES')} kg
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="detalles de barras no solicitadas">
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
                                                    <TableCell>AngV</TableCell>
                                                    <TableCell>AngV2</TableCell>
                                                    <TableCell>AngV3</TableCell>
                                                    <TableCell>R/cm</TableCell>
                                                    <TableCell>Peso Kg</TableCell>
                                                    <TableCell>ID Barra</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pedido.detalles.map((barra, idx) => (
                                                    <TableRow key={idx}>
                                                            <TableCell>{barra.nombreFiltro1}</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>{barra.aecPiso}</TableCell>
                                            <TableCell>{barra.aecSecuenciaHormigonado}</TableCell>
                                            <TableCell>{barra.cantidad}</TableCell>
                                            <TableCell>{typeof barra.diametroBarra === 'number' ? barra.diametroBarra.toFixed(2) : "0.00"}</TableCell>
                                            <TableCell>{barra.aecForma}</TableCell>
                                            <TableCell>{typeof barra.longitudTotal === 'number' ? barra.longitudTotal.toFixed(2) : "0.00"}</TableCell>
                                            <TableCell>{barra.aecUsoBarra}</TableCell>
                                            <TableCell>{formatNumber(barra.a)}</TableCell>
                                            <TableCell>{formatNumber(barra.b)}</TableCell>
                                            <TableCell>{formatNumber(barra.c)}</TableCell>
                                            <TableCell>{formatNumber(barra.d)}</TableCell>
                                            <TableCell>{formatNumber(barra.e)}</TableCell>
                                            <TableCell>{formatNumber(barra.f)}</TableCell>
                                            <TableCell>{formatNumber(barra.g)}</TableCell>
                                            <TableCell>{formatNumber(barra.h)}</TableCell>
                                            <TableCell>{formatNumber(barra.i)}</TableCell>
                                            <TableCell>{formatNumber(barra.j)}</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>''</TableCell>
                                            <TableCell>{formatNumber(barra.r)}</TableCell>
                                            <TableCell>{typeof barra.pesoLineal === 'number' ? barra.pesoLineal.toFixed(2) : "0.00"}</TableCell>
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
                )}
            </CardContent>
        </Card>
    );
};

export default MaestroFierros;
//   <Button onClick={handleDownloadCSV} variant="contained" color="primary" style={{ marginBottom: '20px' }}>
//Descargar CSV
//</Button>
