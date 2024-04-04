import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Pie } from 'react-chartjs-2'; // Importar Pie para el gráfico de torta
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

// Registramos los componentes necesarios de ChartJS para un gráfico de torta
ChartJS.register(ArcElement, Tooltip, Legend);

const GraficoPedidosTotal = ({ urn }) => {
    const [datosGrafico, setDatosGrafico] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchDatos = async () => {
            try {

                
                // Obtener los pedidos asociados a la URN
                const urlPedidos = `${API_BASE_URL}/api/listPedidos?urn=${urn}`;
                const respuestaPedidos = await axios.get(urlPedidos);
                const pedidos = respuestaPedidos.data;
    
                // Calcular el peso total del proyecto sumando los pesos de todos los pedidos
                const pesoTotal = pedidos.reduce((acc, pedido) => acc + parseFloat(pedido.pesos), 0);
    
                // Calcular el porcentaje del peso total que representa cada pedido
                const datosParaGrafico = pedidos.map(pedido => ({
                    nombre: pedido.nombre_pedido,
                    porcentaje: (parseFloat(pedido.pesos) / pesoTotal) * 100
                }));
    
                setDatosGrafico({
                    labels: datosParaGrafico.map(dato => dato.nombre),
                    datasets: [{
                        data: datosParaGrafico.map(dato => dato.porcentaje),
                        backgroundColor: ['#E04C41', '#737373', '#EE736A', '#41E0E0', '#E0E041'],
                        hoverOffset: 4
                    }],
                });
    
            } catch (error) {
                console.error("Error al obtener los datos para pedidos:", error);
            }
        };
    
        fetchDatos();
    }, [urn]);
    
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
                    Distribución del Peso Total por Pedido
                </Typography>
                <div>
                    <Pie data={datosGrafico} />
                </div>
            </CardContent>
        </Card>
    );
};

export default GraficoPedidosTotal;
