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
                // Intenta obtener el orden predefinido desde el servidor
                const ordenNivelesResponse = await axios.get(`${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(urn)}`);
                let ordenNivelesData = ordenNivelesResponse.data.listaNiveles;
                
                // Comprueba si existe un orden predefinido y úsalo para ordenar los datos
                let usePredefinedOrder = false;
                let predefinedOrderMap = {};
    
                if (ordenNivelesData && ordenNivelesData.length > 0) {
                    ordenNivelesData.forEach((item, index) => {
                        predefinedOrderMap[item.nombre.trim()] = index; // Asegúrate de quitar espacios en blanco
                    });
                    usePredefinedOrder = true;
                }
    
                // Obtén los datos principales para el gráfico
                const response = await axios.get(`${API_BASE_URL}/api/respuestasDiametros/${urn}`);
                let { pesosPorPiso } = response.data;
    
                // Si existe un orden predefinido, ordena usando ese orden
                if (usePredefinedOrder) {
                    pesosPorPiso.sort((a, b) => predefinedOrderMap[a.piso.trim()] - predefinedOrderMap[b.piso.trim()]);
                } else {
                    // Lógica de ordenamiento predeterminada si no hay orden predefinido
                    pesosPorPiso.sort((a, b) => parseFloat(a.piso.replace(/\D/g, '')) - parseFloat(b.piso.replace(/\D/g, '')));
                }
    
                // Mapea las etiquetas y conjuntos de datos
                const labels = pesosPorPiso.map(item => item.piso);
                const datasets = pesosPorPiso.reduce((acc, piso) => {
                    piso.diametros.forEach((diametro, index) => {
                        if (!acc[index]) {
                            acc[index] = {
                                label: `Diámetro ${diametro.diametro} mm`,
                                data: new Array(pesosPorPiso.length).fill(0),
                                backgroundColor: getRandomColor(),
                                stack: 'Stack 0',
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
    }, [urn]); // Dependencia del efecto basada en la URN
    

    const options = {
        scales: {
            y: {
              stacked: true,
              ticks: {
                callback: function(value) {
                  return value + ' kg';
                }
              },
              title: {
                display: true,
                text: 'Peso (kg)'
              }
            },
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Piso'
              }
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
        // Define un arreglo con tus colores base
        const baseColors = ['#DA291C', '#DBD0CE', '#0A0A0A', '#155EF1', '#F19415'];
    
        // Selecciona un color base al azar
        const randomBaseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
    
        // Descomponer el color en componentes RGB
        let r = parseInt(randomBaseColor.substring(1, 3), 16);
        let g = parseInt(randomBaseColor.substring(3, 5), 16);
        let b = parseInt(randomBaseColor.substring(5, 7), 16);
    
        // Modificar ligeramente los componentes para variar el color
        // Cambiar el brillo por una pequeña cantidad aleatoria en un rango de -15 a 15
        const change = () => Math.floor(Math.random() * 31) - 15;
    
        r = Math.max(0, Math.min(255, r + change()));  // Asegúrate de que r esté entre 0 y 255
        g = Math.max(0, Math.min(255, g + change()));  // Asegúrate de que g esté entre 0 y 255
        b = Math.max(0, Math.min(255, b + change()));  // Asegúrate de que b esté entre 0 y 255
    
        // Convertir de vuelta a una cadena hexadecimal
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
    
        // Reconstruir el color en formato hexadecimal
        const newColor = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    
        return newColor;
    }
    

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '10px' }}>
                    Distribución de Pesos por Diametro en Cada Nivel
                </Typography>
                <div style={{ height: '310px' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default GraficoPesosPisoDiametroBarras;
