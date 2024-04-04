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
    const generarColorAleatorio = () => {
        const r = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        const g = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        const b = Math.floor(Math.random() * 256); // Valor aleatorio entre 0 y 255
        return `rgb(${r},${g},${b})`;
    };
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const urlBarras = `${API_BASE_URL}/api/barraurn/${urn}`;
                const respuestaBarras = await axios.get(urlBarras);
                const barras = respuestaBarras.data.detalles;
    
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${urn}`;
                const respuestaPedidos = await axios.get(urlPedidos);
                const pedidos = respuestaPedidos.data;
    
                // Preparar un objeto para almacenar el peso por diámetro en cada pedido
                let pesosPorPedidoYDiametro = {};
    
                pedidos.forEach(pedido => {
                    if (!pesosPorPedidoYDiametro[pedido.nombre_pedido]) {
                        pesosPorPedidoYDiametro[pedido.nombre_pedido] = {};
                    }
    
                    pedido.ids.forEach(id => {
                        const barra = barras.find(barra => barra.id.toString() === id);
                        if (barra) {
                            if (!pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra]) {
                                pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] = 0;
                            }
                            pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] += barra.pesoLineal;
                        }
                    });
                });
    
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
                            });
                        }
                        const datasetIndex = datasets.findIndex(dataset => dataset.label === `Diámetro ${diametro}`);
                        datasets[datasetIndex].data[idx] = peso;
                    });
                });
    
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

 

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
                    Distribución de Pesos por Diámetro en Pedidos
                </Typography>
                <Bar data={datosGrafico} options={options} />
            </CardContent>
        </Card>
    );
};

export default GraficosPedidoDiametro;
