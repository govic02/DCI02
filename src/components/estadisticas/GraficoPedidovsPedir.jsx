import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2'; // Importar Bar para el gráfico de barras
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

// Registramos los componentes necesarios de ChartJS para un gráfico de barras
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoPedidovsPedir = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: ['Peso Total del Proyecto', 'Peso Total de Pedidos'],
        datasets: []
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {
              //console.log("URN QUE ESTOY SOLICITANDO",urn);
                const url = `${API_BASE_URL}/api/getPesovsPedidos/${urn}`;
                const respuesta = await axios.get(url);
                const data = respuesta.data;
              //console.log("datos recibidos",data);
                setDatosGrafico(prev => ({
                    ...prev,
                    datasets: [{
                        label: 'Pesos',
                        data: [data.pesoTotalProyecto, data.pesoTotalPedidos],
                        backgroundColor: ['#41E0E0', '#E04C41'],
                    }]
                }));
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchDatos();
    }, [urn]);

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
        height: '339px ' // Define una altura para que el gráfico se ajuste correctamente
    };

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '20px' }}>
                    Comparación del Peso Total del Proyecto vs Pedidos
                </Typography>
                <div style={{ height: '100%', width: '100%' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default GraficoPedidovsPedir;
