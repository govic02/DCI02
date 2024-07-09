import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

// Registramos los componentes necesarios de ChartJS para un gráfico de barras apiladas
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficosPedidoDiametro = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: [],
        datasets: [],
    });
    const [diametrosEncontrados, setDiametrosEncontrados] = useState([]);
    const generarColorAleatorio = () => {
        const r = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        const g = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        const b = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        return `rgb(${r},${g},${b})`;
    };
    const getLastStatus = (states) => {
        const estadoColores = {
            'paquetizado': '#FFFF00', 'espera_aprobacion': '#90EE90',
            'rechazado': '#FF0000', 'aceptado': '#00FF00',
            'fabricacion': '#0000FF', 'despacho': '#FFA500',
            'recepcionado': '#00FFFF', 'instalado': '#A52A2A',
            'inspeccionado': '#006400', 'hormigonado': '#90EE90'
        };
    
        if (!states) {
            return { estado: 'paquetizado', color: estadoColores['paquetizado'] };
        }
    
        let lastState = { fecha: new Date(0), estado: '', color: '' };
        for (let [estado, { fecha }] of Object.entries(states)) {
            if (new Date(fecha) > lastState.fecha) {
                lastState = { fecha: new Date(fecha), estado, color: estadoColores[estado] };
            }
        }
        return lastState;
    }
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const urlBarras = `${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`;
                const respuestaBarras = await axios.get(urlBarras);
                const barras = respuestaBarras.data.detalles;
                console.log("Barras desde servidor ",barras);
                console.log("total barras",respuestaBarras);
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${urn}`;
                const respuestaPedidos = await axios.get(urlPedidos);
                const pedidos = respuestaPedidos.data;
                
                // Preparar un objeto para almacenar el peso por diámetro en cada pedido
                let pesosPorPedidoYDiametro = {};
                let diametrosSet = new Set();
                let totalIdsPedidos = 0;
                let totalIdsEncontradas = 0;

                pedidos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                console.log("pedidos desde grafico pedidos", pedidos);
                pedidos.forEach(pedido => {
                    if (!pesosPorPedidoYDiametro[pedido.nombre_pedido]) {
                        pesosPorPedidoYDiametro[pedido.nombre_pedido] = {};
                    }
                    totalIdsPedidos += pedido.ids.length;
                    pedido.ids.forEach(id => {
                        const barra = barras.find(barra => barra.id.toString() === id.toString());
                        if (barra) {
                            //console.log("Barra : ",barra);
                            diametrosSet.add(barra.diametroBarra);
                            if (!pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra]) {
                                pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] = 0;
                            }
                            pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] += (parseFloat(barra.pesoLineal) * parseFloat(barra.longitudTotal));
                            totalIdsEncontradas++;
                        }
                        else {
                          //  console.log(`Barra con id ${id} no encontrada en la lista de barras.`);
                        }
                    });
                });
                console.log("pesos obtenidos",pesosPorPedidoYDiametro);
                setDiametrosEncontrados([...diametrosSet]);
                console.log("D ENCONTRADOS :",diametrosSet);
                console.log("Total IDs en pedidos:", totalIdsPedidos);
                console.log("Total IDs encontradas en barras:", totalIdsEncontradas);
                console.log("Barras ",barras);
                console.log("original", respuestaBarras);
                // Convertir los datos para el gráfico
                let labels = Object.keys(pesosPorPedidoYDiametro); // Nombres de pedidos como labels del eje X
                let datasets = [];
                let diametrosVistos = {};
                
                Object.keys(pesosPorPedidoYDiametro).forEach((pedido, idx) => {
                    Object.entries(pesosPorPedidoYDiametro[pedido]).forEach(([diametro, peso], i) => {
                        // Verificar si el diámetro ya tiene un color asignado
                     
                        if (!diametrosVistos[diametro]) {
                            diametrosVistos[diametro] = generarColorAleatorio(); // Asignar un color aleatorio
                        }
                        if (!datasets.some(dataset => dataset.label === `Diámetro ${diametro}`)) {
                            datasets.push({
                                label: `Diámetro ${diametro}`,
                                data: new Array(Object.keys(pesosPorPedidoYDiametro).length).fill(0),
                                backgroundColor: diametrosVistos[diametro], // Usar el color generado
                                stack: 'Stack 0',
                                barThickness: 20
                            });
                        }
                        const datasetIndex = datasets.findIndex(dataset => dataset.label === `Diámetro ${diametro}`);
                        datasets[datasetIndex].data[idx] = peso;
                    });
                });
                console.log("Diámetros encontrados:", Object.keys(diametrosVistos));
                setDatosGrafico({
                    labels,
                    datasets,
                });
    
            } catch (error) {
                console.error("Error al obtener los datos para pedidos y barras:", error);
            }
        };
    
        fetchDatos();
    }, [urn]);
    // Asegúrate de definir una lista de colores para utilizar en las barras
    const colores = ['#E04C41', '#737373', '#EE736A', '#41E0E0', '#E0E041'];
    const options = {
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Peso Total por Pedido'
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };
    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
    };

 
    const cardContentStyle = {
        
        overflowX: 'auto',  // Allows horizontal scrolling
        
    };
    const estadoColores = {
        'paquetizado': '#FFFF00', // amarillo
        'espera_aprobacion': '#90EE90', // verde claro
        'rechazado': '#FF0000', // rojo
        'aceptado': '#00FF00', // verde fosforescente
        'fabricacion': '#0000FF', // azul
        'despacho': '#FFA500', // anaranjado
        'recepcionado': '#00FFFF', // celeste
        'instalado': '#A52A2A', // cafe
        'inspeccionado': '#006400', // verde oscuro
        'hormigonado': '#90EE90' // verde claro
    };
    return (
        <Card style={cardStyle}>
            <CardContent  style={cardContentStyle}>
                <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
                    Distribución de Pesos por Diámetro en Pedidos
                </Typography>
                <Bar data={datosGrafico} options={options} />
            </CardContent>
        </Card>
    );
};

export default GraficosPedidoDiametro;
