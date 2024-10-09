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
                console.log("Nombre del pedido buscado "+proyecto);
                console.log("Nombre del pedido buscado "+urn);
                const url = `${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urn)}`;
                const response = await axios.get(url);
                if (response.status === 200) {
                    
                    const pedidosInicial = response.data;
                  
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
      //console.log("Detalles de barras no pedidas:", newPedidos[index].detalles);
    } else {
        const detalles = await fetchBarDetails(newPedidos[index]);
      //console.log("todos los detalles", detalles);
        newPedidos[index].detalles = detalles;
    }
  //console.log("pedidos con detalles Expand", newPedidos);
    setPedidos(newPedidos);
};
    const handleDownloadAvailableBarsCSV = async () => {
        try {
            const urlBarras = `${API_BASE_URL}/api/barraurn/${urn}`;
            const responseBarras = await axios.get(urlBarras);
            const allBars = responseBarras.data; // Assuming the response data structure matches your needs
          //console.log("todas las barras",allBars);
            const requestedIds = pedidos.flatMap(pedido => pedido.ids);
            const availableBars = allBars.detalles.filter(bar => !requestedIds.includes(bar.id.toString()));
          //console.log("todas las barras no pedidas",availableBars);
          const csvData = availableBars.map(bar => ({
            'EJE/VIGA/LOSA': bar.nombreFiltro1,
            'ELEM CONST': '',
            'PISO': bar.aecPiso,
            'CICLO': bar.aecSecuenciaHormigonado,
            'Cantidad': bar.cantidad,
            'Ø mm': typeof bar.diametroBarra === 'number' ? bar.diametroBarra.toFixed(2) : "0.00",
            'Figura': bar.aecForma,
            'L/m': (() => {
                const cantidad = bar.cantidad;
                const longitudTotal = bar.longitudTotal;
                if (typeof longitudTotal === 'number' && cantidad && cantidad !== 0) {
                    return (longitudTotal / cantidad).toFixed(2);
                }
                return "0.00";
            })(),
            'Uso': bar.aecUsoBarra,
            'A/cm': formatNumber(bar.a * 100),
            'B/cm': formatNumber(bar.b * 100),
            'C/cm': formatNumber(bar.c * 100),
            'D/cm': formatNumber(bar.d * 100),
            'E/cm': formatNumber(bar.e * 100),
            'F/cm': formatNumber(bar.f * 100),
            'G/cm': formatNumber(bar.g * 100),
            'H/cm': formatNumber(bar.h * 100),
            'I/cm': formatNumber(bar.i * 100),
            'J/cm': formatNumber(bar.j * 100),
            'AngV': '',
            'AngV2': '',
            'AngV3': '',
            'R/cm': formatNumber(bar.r),
            'Peso Kg': typeof bar.pesoLineal === 'number' ? bar.pesoLineal.toFixed(2) : "0.00",
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
            'Cantidad': barra.cantidad !== undefined ? barra.cantidad : barra.Quantity,
            'Ø mm': typeof barra.diametroBarra === 'number' ? barra.diametroBarra.toFixed(2) : "0.00",
            'Figura': barra.aecForma,
            'L/m': (() => {
                const cantidad = barra.cantidad !== undefined ? barra.cantidad : barra.Quantity;
                const longitudTotal = barra.longitudTotal;
                if (typeof longitudTotal === 'number' && cantidad && cantidad !== 0) {
                    return (longitudTotal / cantidad).toFixed(2);
                }
                return "0.00";
            })(),
            'Uso': barra.aecUsoBarra,
            'A/cm': formatNumber(barra.a !== undefined ? barra.a * 100 : barra.A * 100),
            'B/cm': formatNumber(barra.b !== undefined ? barra.b * 100 : barra.B * 100),
            'C/cm': formatNumber(barra.c !== undefined ? barra.c * 100 : barra.C * 100),
            'D/cm': formatNumber(barra.d !== undefined ? barra.d * 100 : barra.D * 100),
            'E/cm': formatNumber(barra.e !== undefined ? barra.e * 100 : barra.E * 100),
            'F/cm': formatNumber(barra.f !== undefined ? barra.f * 100 : barra.F * 100),
            'G/cm': formatNumber(barra.g !== undefined ? barra.g * 100 : barra.G * 100),
            'H/cm': formatNumber(barra.h !== undefined ? barra.h * 100 : barra.H * 100),
            'I/cm': formatNumber(barra.i !== undefined ? barra.i * 100 : barra.I * 100),
            'J/cm': formatNumber(barra.j !== undefined ? barra.j * 100 : barra.J * 100),
            'AngV': '', // No tiene correspondencia, se deja vacío
            'AngV2': '', // No tiene correspondencia, se deja vacío
            'AngV3': '', // No tiene correspondencia, se deja vacío
            'R/cm': formatNumber(barra.r),
            'Peso Kg': typeof barra.pesoLineal === 'number' ? barra.pesoLineal.toFixed(2) : "0.00",
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
                    'A/cm': barra.a*100,
                    'B/cm': barra.b*100,
                    'C/cm': barra.c*100,
                    'D/cm': barra.d*100,
                    'E/cm': barra.e*100,
                    'F/cm': barra.f*100,
                    'G/cm': barra.g*100,
                    'H/cm': barra.h*100,
                    'I/cm': barra.i*100, // Si no existe el campo 'i', se deja vacío
                    'J/cm': barra.j*100,
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
                                    <TableCell>Long Total</TableCell>
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
                                            <TableCell>
                                                        {(() => {
                                                            const cantidad = barra.cantidad !== undefined ? barra.cantidad : barra.Quantity;
                                                            const longitudTotal = barra.longitudTotal;
                                                            if (typeof longitudTotal === 'number' && cantidad && cantidad !== 0) {
                                                                return (longitudTotal / cantidad).toFixed(2);
                                                            }
                                                            return "0.00";
                                                        })()}
                                           </TableCell>
                                            <TableCell>{barra.aecUsoBarra}</TableCell>
                                            <TableCell>{formatNumber(barra.a !== undefined ? barra.a*100 : barra.A*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.b !== undefined ? barra.b*100 : barra.B*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.c !== undefined ? barra.c*100 : barra.C*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.d !== undefined ? barra.d*100 : barra.D*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.e !== undefined ? barra.e*100 : barra.E*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.f !== undefined ? barra.f*100 : barra.F*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.g !== undefined ? barra.g*100 : barra.G*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.h !== undefined ? barra.h*100 : barra.H*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.i !== undefined ? barra.i*100 : barra.I*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.j !== undefined ? barra.j*100 : barra.J*100)}</TableCell>
      
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
                                        <b>{pedido.nombre_pedido}</b> - {pedido.fecha} 
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
                                                    <TableCell>Long Total</TableCell>
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
                                            <TableCell>
                                                {(() => {
                                                    const cantidad = barra.cantidad !== undefined ? barra.cantidad : barra.Quantity;
                                                    const longitudTotal = barra.longitudTotal;
                                                    if (typeof longitudTotal === 'number' && cantidad && cantidad !== 0) {
                                                        return (longitudTotal / cantidad).toFixed(2);
                                                    }
                                                    return "0.00";
                                                })()}
                                            </TableCell>
                                            <TableCell>{barra.aecUsoBarra}</TableCell>
                                            <TableCell>{formatNumber(barra.a*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.b*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.c*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.d*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.e*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.f*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.g*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.h*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.i*100)}</TableCell>
                                            <TableCell>{formatNumber(barra.j*100)}</TableCell>
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
