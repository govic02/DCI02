import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoPesosPisoDiametroBarras = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const url = `${API_BASE_URL}/api/respuestasDiametros/${urn}`;
                const response = await axios.get(url);
                const { pesosPorPiso } = response.data;
               
                pesosPorPiso.sort((a, b) => parseFloat(a.piso.replace(/\D/g, '')) - parseFloat(b.piso.replace(/\D/g, '')));

                const labels = pesosPorPiso.map(item => item.piso);
                const datasets = pesosPorPiso.reduce((acc, piso) => {
                    piso.diametros.forEach((diametro, index) => {
                        if (!acc[index]) {
                            acc[index] = {
                                label: `Diametro ${diametro.diametro} mm`,
                                data: new Array(pesosPorPiso.length).fill(0),
                                backgroundColor: getRandomColor(),
                                stack: 'Stack 0', // Añadir la propiedad de stack
                            };
                        }
                        const pisoIndex = labels.indexOf(piso.piso);
                        acc[index].data[pisoIndex] = diametro.pesoTotal;
                    });
                    return acc;
                }, []);

                setDatosGrafico({
                    labels,
                    datasets,
                });
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchDatos();
    }, [urn]);

    const options = {
        scales: {
            y: {
                stacked: true, // Habilitar el apilado en el eje Y
            },
            x: {
                stacked: true, // Habilitar el apilado en el eje X
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Distribución de Pesos por Diámetro en Cada Nivel'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                label: function(tooltipItem) {
                    let label = tooltipItem.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    label += `${tooltipItem.raw.toLocaleString()} kg`;
                    return label;
                },
                footer: function(tooltipItems) {
                    // Calcula el total sumando todos los pesos de los datasets en el índice del piso actual
                    let total = 0;
                    tooltipItems.forEach(tooltipItem => {
                        total += tooltipItem.raw;
                    });
                    return `Total: ${total.toLocaleString()} kg`;
                }
            }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    const cardStyle = {
        margin: '40px',
        borderRadius: '20px',
    };

    // Función para obtener colores aleatorios
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '10px' }}>
                    Distribución de Pesos por Diametro en Cada Nivel
                </Typography>
                <div style={{ height: '400px' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default GraficoPesosPisoDiametroBarras;
