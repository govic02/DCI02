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
    const [pesoTotalProyecto, setPesoTotalProyecto] = useState(0);
    const [pesoTotalPedidos, setPesoTotalPedidos] = useState(0);

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const url = `${API_BASE_URL}/api/getPesovsPedidos/${urn}`;
                const respuesta = await axios.get(url);
                const data = respuesta.data;
                setDatosGrafico({
                    labels: ['Peso Total del Proyecto', 'Peso Total de Pedidos'],
                    datasets: [{
                        label: 'Pesos',
                        data: [data.pesoTotalProyecto, data.pesoTotalPedidos],
                        backgroundColor: ['#41E0E0', '#E04C41'],
                    }]
                });
                setPesoTotalProyecto(data.pesoTotalProyecto);
                setPesoTotalPedidos(data.pesoTotalPedidos);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        fetchDatos();
    }, [urn]);

    const options = {
        indexAxis: 'y', // Esto convierte el gráfico de barras en horizontal
        scales: {
            x: {
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
        height: '280px' // Ajusta la altura para mejor visualización
    };

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '20px' }}>
                 Peso Total Proyecto vs Pedidos
                </Typography>
                <div style={{ height: '60%', width: '100%' }}>
                    <Bar data={datosGrafico} options={options} />
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Typography variant="body2">
                      <b>Peso Total Proyecto:</b>   {pesoTotalProyecto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                    </Typography>
                    <Typography variant="body2">
                        <b>Peso Total Pedidos:</b>  {pesoTotalPedidos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  kg
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};

export default IndicadorTotalPeso;
