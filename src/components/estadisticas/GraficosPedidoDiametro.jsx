import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import API_BASE_URL from '../../config';

// Registramos los componentes necesarios de ChartJS para un gráfico de barras apiladas
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficosPedidoDiametro = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: [],
        datasets: [],
    });
    const [loading, setLoading] = useState(true);
    const [sinDatos, setSinDatos] = useState(false);

    // Paleta de colores
    const coloresCalidos = [
        '#0000FF', // Azul 
        '#FFD700', // Amarillo Oro 
        '#32CD32', // Verde Lima Vivo 
        '#FF4500', // Naranja Rojo 
        '#1E90FF', // Azul Dodger 
        '#FF1493', // Rosa Profundo 
        '#00FF7F', // Verde Primavera 
        '#8A2BE2', // Azul Violeta 
        '#FF6347', // Rojo Tomate 
        '#00CED1', // Turquesa Oscuro 
        '#9400D3', // Violeta Oscuro 
        '#B22222', // Rojo Ladrillo 
    ];

    useEffect(() => {
        const fetchDatos = async () => {
            setLoading(true);
            try {
                const urlBarras = `${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`;
                const respuestaBarras = await axios.get(urlBarras);
                const barras = respuestaBarras.data.detalles;
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${encodeURIComponent(urn)}`;
                const respuestaPedidos = await axios.get(urlPedidos);
                const pedidos = respuestaPedidos.data;

                if (barras.length === 0 || pedidos.length === 0) {
                    setSinDatos(true);
                    setLoading(false);
                    return;
                }

                let pesosPorPedidoYDiametro = {};
                let diametrosSet = new Set();

                pedidos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                pedidos.forEach(pedido => {
                    if (!pesosPorPedidoYDiametro[pedido.nombre_pedido]) {
                        pesosPorPedidoYDiametro[pedido.nombre_pedido] = {};
                    }
                    pedido.ids.forEach(id => {
                        const barra = barras.find(barra => barra.id.toString() === id.toString());
                        if (barra) {
                            const diametroRedondeado = Math.round(barra.diametroBarra * 10) / 10; // Redondea a un decimal
                            diametrosSet.add(diametroRedondeado);
                            if (!pesosPorPedidoYDiametro[pedido.nombre_pedido][diametroRedondeado]) {
                                pesosPorPedidoYDiametro[pedido.nombre_pedido][diametroRedondeado] = 0;
                            }
                            pesosPorPedidoYDiametro[pedido.nombre_pedido][diametroRedondeado] += (parseFloat(barra.pesoLineal) * parseFloat(barra.longitudTotal));
                        } else {
                            console.log(`Barra con id ${id} no encontrada en la lista de barras.`);
                        }
                    });
                });

                const labels = Object.keys(pesosPorPedidoYDiametro);
                let datasets = [];
                let diametrosVistos = {};

                // Ordenamos los diámetros para mantener consistencia en el orden de los colores
                const diametrosOrdenados = Array.from(diametrosSet).sort((a, b) => a - b);

                // Inicializamos datasets para cada diámetro
                diametrosOrdenados.forEach((diametro, idx) => {
                    diametrosVistos[diametro] = coloresCalidos[idx % coloresCalidos.length];
                    datasets.push({
                        label: `Diámetro ${diametro}`,
                        data: [],
                        backgroundColor: diametrosVistos[diametro],
                        stack: 'Stack 0',
                        barThickness: 30, // Ancho fijo de la barra
                        maxBarThickness: 30, // Ancho máximo de la barra
                    });
                });

                // Rellenamos los datos para cada dataset
                labels.forEach(pedido => {
                    datasets.forEach(dataset => {
                        const diametro = parseFloat(dataset.label.replace('Diámetro ', ''));
                        const peso = pesosPorPedidoYDiametro[pedido][diametro] || 0;
                        dataset.data.push(peso);
                    });
                });

                setDatosGrafico({
                    labels,
                    datasets,
                });

                setSinDatos(labels.length === 0 || datasets.length === 0);
            } catch (error) {
                console.error("Error al obtener los datos para pedidos y barras:", error);
                setSinDatos(true);
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
    }, [urn]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                offset: false, // Alinea las barras al centro de la etiqueta
                ticks: {
                    autoSkip: false,
                    maxRotation: 50,
                    minRotation: 50
                },
                grid: {
                    display: false
                },
                categoryPercentage: 1.0, // Las barras ocupan todo el ancho de la categoría
                barPercentage: 1.0, // Las barras ocupan todo el ancho permitido
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
        height: '500px',
    };

    const cardContentStyle = {
        overflowX: 'none',
        height: '100%',
        overflowY:'none'
    };

    const chartContainerStyle = {
        position: 'relative',
        height: '100%',
        overflowY: 'hidden',
        minWidth: `${datosGrafico.labels.length * 50}px`, // Ajustamos el ancho mínimo según el número de etiquetas
    };

    return (
        <Card style={cardStyle}>
            <CardContent style={cardContentStyle}>
                <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
                    Distribución de Pesos por Diámetro en Pedidos
                </Typography>
                {loading ? (
                    <Typography variant="h6" component="h2" style={{ fontSize: 14, textAlign: 'center', marginTop: '20px' }}>
                        Cargando gráfico...
                    </Typography>
                ) : sinDatos ? (
                    <Typography variant="h6" component="h2" style={{ fontSize: 14, textAlign: 'center', marginTop: '20px' }}>
                        No hay datos para desplegar
                    </Typography>
                ) : (
                    <div style={chartContainerStyle}>
                        <Bar data={datosGrafico} options={options} />
                    </div>
                )}
            </CardContent>
           
        </Card>
        
    );
};

export default GraficosPedidoDiametro;
