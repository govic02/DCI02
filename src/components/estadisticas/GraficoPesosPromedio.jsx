import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoPesosPromedio = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const url = `${API_BASE_URL}/api/getPesoPromedio/${urn}`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const data = await respuesta.json();
        const pesosOrdenados = data.pesos.sort((a, b) => parseInt(a.nombreFiltro2) - parseInt(b.nombreFiltro2));
        // Preparar los datos para el gráfico
        const labels = pesosOrdenados.map(item => item.nombreFiltro2);
        const pesos = pesosOrdenados.map(item => item.promedioPeso);

        setDatosGrafico({
          labels,
          datasets: [{
            label: 'Promedio de Peso por Nivel',
            data: pesos,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
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
        beginAtZero: true
      }
    },
  };

  const cardStyle = {
    marginLeft: '40px',
    marginRight: '40px',
    marginTop: '40px',
    borderRadius: '20px',
    height: '370px !important' 
  };

  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
          Promedio de Peso por Nivel
        </Typography>
        <div>
          <Bar data={datosGrafico} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoPesosPromedio;
