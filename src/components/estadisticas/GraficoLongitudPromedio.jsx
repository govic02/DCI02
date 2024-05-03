import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoLongitudPromedio = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const url = `${API_BASE_URL}/api/getLongitudPromedio/${urn}`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const { longitudes } = await respuesta.json();
         longitudes.sort((a, b) => parseInt(a.nombreFiltro2) - parseInt(b.nombreFiltro2));
        console.log("valores longitudes",longitudes);
        // Preparar los datos para el gráfico
        const labels = longitudes.map(item => item.nombreFiltro2);
        const data = longitudes.map(item => item.promedioLongitud/1000);

        setDatosGrafico({
          labels,
          datasets: [{
            label: 'Promedio de Longitud por Nivel',
            data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
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
  };

  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
          Promedio de Longitud por Nivel
        </Typography>
        <div>
          <Bar data={datosGrafico} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoLongitudPromedio;
