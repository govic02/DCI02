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
    const [loading, setLoading] = useState(true); // Nuevo estado para manejar el cargado de datos
    const [sinDatos, setSinDatos] = useState(false); // Estado para manejar la ausencia de datos

    const generarColorAleatorio = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    };

    useEffect(() => {
        const fetchDatos = async () => {
            setLoading(true); // Indica que los datos están siendo cargados
            try {
                const urlBarras = `${API_BASE_URL}/api/barraurn/${encodeURIComponent(urn)}`;
                const respuestaBarras = await axios.get(urlBarras);
                const barras = respuestaBarras.data.detalles;
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${urn}`;
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
                            //diametrosSet.add(barra.diametroBarra);
                            if (!pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra]) {
                                pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] = 0;
                            }
                            pesosPorPedidoYDiametro[pedido.nombre_pedido][barra.diametroBarra] += (parseFloat(barra.pesoLineal) * parseFloat(barra.longitudTotal));
                        } else {
                            console.log(`Barra con id ${id} no encontrada en la lista de barras.`);
                        }
                    });
                });

                let labels = Object.keys(pesosPorPedidoYDiametro);
                let datasets = [];
                let diametrosVistos = {};
                const redondearDiametro = (diametro) => Math.round(diametro * 100) / 100;
                Object.keys(pesosPorPedidoYDiametro).forEach((pedido, idx) => {
                    Object.entries(pesosPorPedidoYDiametro[pedido]).forEach(([diametro, peso], i) => {
                        const diametroRedondeado = Math.round(diametro * 10) / 10; 
                        if (!diametrosVistos[diametroRedondeado]) {
                            diametrosVistos[diametroRedondeado] = generarColorAleatorio();
                        }
                        if (!datasets.some(dataset => dataset.label === `Diámetro ${diametroRedondeado}`)) {
                            datasets.push({
                                label: `Diámetro ${diametroRedondeado}`,
                                data: new Array(Object.keys(pesosPorPedidoYDiametro).length).fill(0),
                                backgroundColor: diametrosVistos[diametroRedondeado],
                                stack: 'Stack 0',
                                barThickness: 20
                            });
                        }
                        const datasetIndex = datasets.findIndex(dataset => dataset.label === `Diámetro ${diametroRedondeado}`);
                        datasets[datasetIndex].data[idx] = peso;
                    });
                });

                setDatosGrafico({
                    labels,
                    datasets,
                });
                setSinDatos(labels.length === 0 || datasets.length === 0);
                console.log("data set");
                console.log(datasets);
                console.log("data grafico");
                console.log(datosGrafico);
            } catch (error) {
                console.error("Error al obtener los datos para pedidos y barras:", error);
                setSinDatos(true);
            } finally {
                setLoading(false); // Indica que los datos han sido cargados o hubo un error
            }
        };

        fetchDatos();
    }, [urn]);

    const options = {
        responsive: true,
        scales: {
            
            x: {
                stacked: true,
                barThickness: 20,
                categoryPercentage: 1.0,
                offset: true,
                ticks: {
                    autoSkip: false,
                    maxRotation: 50,
                    minRotation: 50
                },
                grid: {
                    offset: false,
                    display: false
                }
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
        layout: {
            padding: {
                right: datosGrafico.labels.length > 20 ? 0 : Math.max(1120 - (datosGrafico.labels.length - 3) * 50, 0),
            }
        }
    };

    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
    };

    const cardContentStyle = {
        overflowX: 'auto',
    };

    return (
        <Card style={cardStyle}>
            <CardContent style={cardContentStyle}>
                <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
                    Distribución de Pesos por Diámetro en Pedidos
                </Typography>
                {loading ? (
                    <Typography variant="h6" component="h2" style={{ fontSize: 14, textAlign: 'center', marginTop: '20px' }}>
                        Cargando datos...
                    </Typography>
                ) : sinDatos || datosGrafico.labels.length === 0 || datosGrafico.datasets.length === 0 ? (
                    <Typography variant="h6" component="h2" style={{ fontSize: 14, textAlign: 'center', marginTop: '20px' }}>
                        Sin datos para calcular
                    </Typography>
                ) : (
                    <Bar data={datosGrafico} options={options} />
                )}
            </CardContent>
        </Card>
    );
    
};

export default GraficosPedidoDiametro;
