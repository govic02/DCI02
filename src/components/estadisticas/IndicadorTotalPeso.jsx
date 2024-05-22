import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2'; // Usamos Bar para ambos, vertical y horizontal
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

// Registramos los componentes necesarios de ChartJS para un gráfico de barras
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IndicadorTotalPeso = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: ['Peso Total del Proyecto', 'Peso Total de Pedidos'],
        datasets: []
    });
    const [pesoPorEstado, setPesoPorEstado] = useState({});
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
            return { estado: 'paquetizado', color: statusColors['paquetizado'] }; // Estado predeterminado
        }
        let lastState = null;
        Object.entries(estados).forEach(([key, val]) => {
            if (!lastState || new Date(val.fecha) > new Date(lastState.fecha)) {
                lastState = { estado: key, color: statusColors[key], ...val };
            }
        });
        return lastState;
    };
    const [pesoTotalProyecto, setPesoTotalProyecto] = useState(0);
    const [pesoTotalPedidos, setPesoTotalPedidos] = useState(0);
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const urlPesos = `${API_BASE_URL}/api/getPesovsPedidos/${urn}`;
                const responsePesos = await axios.get(urlPesos);
                const pesosTotales = responsePesos.data;
    
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${urn}`;
                const respuestaPedidos = await axios.get(urlPedidos);
                const pedidos = respuestaPedidos.data;
    
                let pesoPorEstado = Object.keys(statusColors).reduce((acc, estado) => {
                    acc[estado] = 0;
                    return acc;
                }, {});
    
                pedidos.forEach(pedido => {
                    const estadoActual = getLastStatus(pedido.estados).estado;
                    const pesoPedido = parseFloat(pedido.pesos);
                    if (!isNaN(pesoPedido) && estadoActual in pesoPorEstado) {
                        pesoPorEstado[estadoActual] += pesoPedido;
                    }
                });
    
                const estados = Object.keys(pesoPorEstado);
                const datasets = estados.map(estado => ({
                    label: estado.charAt(0).toUpperCase() + estado.slice(1),
                    data: [0, pesoPorEstado[estado]], // Segundo valor para alinear con la barra de peso total
                    backgroundColor: statusColors[estado],
                    stack: 'Stack 1'
                }));
    
                setDatosGrafico({
                    labels: ['Peso Total del Proyecto', 'Distribución del Peso de Pedidos'],
                    datasets: [
                        {
                            label: 'Peso Total del Proyecto',
                            data: [pesosTotales.pesoTotalProyecto, 0],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            stack: 'Stack 0',
                        },
                        ...datasets
                    ]
                });
    
                setPesoTotalProyecto(pesosTotales.pesoTotalProyecto);
                setPesoTotalPedidos(pedidos.reduce((sum, p) => sum + parseFloat(p.pesos), 0));
                setPesoPorEstado(pesoPorEstado);
    
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };
    
        fetchDatos();
    }, [urn]);
    
    
    
    const options = {
        indexAxis: 'y', 
        scales: {
            x: {
                stacked: true ,
                barThickness: 100 ,
                categoryPercentage: 0.1,
                barPercentage: 1 
                
            },
            y: {
                stacked: true
                
                
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            }
        }
    };
    
    
    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
        
    };

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '20px' }}>
                 Peso Total Proyecto vs Pedidos
                </Typography>
                <div style={{ height: '200px', width: '100%' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
    <Typography variant="body2" style={{ textAlign: 'center' }}>
        <b>Peso Total Proyecto:</b> {pesoTotalProyecto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
    </Typography>
    <Typography variant="body2" style={{ textAlign: 'center' }}>
        <b>Peso Total Pedidos:</b> {pesoTotalPedidos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
    </Typography>
</div>


            </CardContent>
        </Card>
    );
};

export default IndicadorTotalPeso;

/*****
 * 
 *     {Object.entries(pesoPorEstado).map(([estado, peso]) => (
                        <Typography variant="body2" key={estado}>
                            <b>Peso {estado.charAt(0).toUpperCase() + estado.slice(1)}:</b> {peso.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                        </Typography>
                    ))}
 * 
 */
