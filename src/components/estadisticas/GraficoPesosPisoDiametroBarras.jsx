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
    const [loading, setLoading] = useState(true); // Estado de carga
    const [sinDatos, setSinDatos] = useState(false); // Estado para indicar si no hay datos

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
                console.log("urn desde diametro pesos diametro");
                console.log(urn);

                // Verificar si hay datos
                if (!pesosPorPiso || pesosPorPiso.length === 0) {
                    setSinDatos(true);
                    setLoading(false);
                    return;
                }

                // Si existe un orden predefinido, ordena usando ese orden
                if (usePredefinedOrder) {
                    pesosPorPiso.sort((a, b) => predefinedOrderMap[a.piso.trim()] - predefinedOrderMap[b.piso.trim()]);
                } else {
                    // Lógica de ordenamiento predeterminada si no hay orden predefinido
                    pesosPorPiso.sort((a, b) => parseFloat(a.piso.replace(/\D/g, '')) - parseFloat(b.piso.replace(/\D/g, '')));
                }
    
                // Mapea las etiquetas y conjuntos de datos
                const labels = pesosPorPiso.map(item => item.piso);
                const datasetsMap = {};
                const diameterKeysSet = new Set();

                pesosPorPiso.forEach((piso, pisoIndex) => {
                    piso.diametros.forEach((diametro) => {
                        // Formatear el diámetro
                        let diameterValue = parseFloat(diametro.diametro);
                        let formattedDiameter = Number.isInteger(diameterValue) ? diameterValue : diameterValue.toFixed(1);
        
                        // Añadir el diámetro al conjunto para ordenarlo después
                        diameterKeysSet.add(formattedDiameter);
        
                        // Crear una clave única para cada diámetro formateado
                        const diameterKey = formattedDiameter;
        
                        if (!datasetsMap[diameterKey]) {
                            datasetsMap[diameterKey] = {
                                label: `Diámetro ${formattedDiameter} mm`,
                                data: new Array(pesosPorPiso.length).fill(0),
                                backgroundColor: '', // Se asignará más adelante
                                stack: 'Stack 0',
                            };
                        }
        
                        datasetsMap[diameterKey].data[pisoIndex] = diametro.pesoTotal;
                    });
                });

                // Ordenar los diámetros y asignar colores
                const diameterKeys = Array.from(diameterKeysSet).sort((a, b) => a - b); // Orden numérico ascendente

                // Definir la paleta de 12 colores desde colores fríos hasta cálidos
                const colorPalette = [
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

                // Asignar colores a los datasets en orden
                diameterKeys.forEach((diameterKey, index) => {
                    const colorIndex = index % colorPalette.length; // Asegura que no exceda el tamaño de la paleta
                    datasetsMap[diameterKey].backgroundColor = colorPalette[colorIndex];
                });

                const datasets = diameterKeys.map(diameterKey => datasetsMap[diameterKey]);

                setDatosGrafico({
                    labels,
                    datasets,
                });

                setSinDatos(false); // Hay datos disponibles
                setLoading(false); // Datos cargados, actualizar el estado de carga
            } catch (error) {
                console.error("Error al obtener los datos:", error);
                setSinDatos(true); // Indicar que no hay datos disponibles debido al error
                setLoading(false); // Asegurarse de ocultar el mensaje de carga incluso si hay error
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

    if (loading) {
        // Mostrar mensaje de carga mientras se obtienen los datos
        return (
            <Card style={cardStyle}>
                <CardContent>
                    <Typography variant="h5" component="h2" style={{ fontSize: 16, textAlign: 'center', marginTop: '100px' }}>
                        Cargando información...
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (sinDatos) {
        // Mostrar mensaje si no hay datos disponibles
        return (
            <Card style={cardStyle}>
                <CardContent>
                    <Typography variant="h5" component="h2" style={{ fontSize: 16, textAlign: 'center', marginTop: '100px' }}>
                        Sin datos disponibles
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // Una vez que los datos están disponibles, renderizar el gráfico
    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '10px' }}>
                    Distribución de Pesos por Diámetro en Cada Nivel
                </Typography>
                <div style={{ height: '310px' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default GraficoPesosPisoDiametroBarras;
