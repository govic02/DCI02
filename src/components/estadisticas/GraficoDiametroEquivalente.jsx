import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const GraficoDiametroEquivalente = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const url = `${API_BASE_URL}/api/diametroequivalente/${urn}`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const { filtros2 } = await respuesta.json();

        // Preparar los datos para el gráfico
        const labels = filtros2.map(item => item.nombreFiltro2);
        const data = filtros2.map(item => ({
          x: item.nombreFiltro2,
          y: item.grupos.map(grupo => grupo.diametroEquivalente)
        }));

        setDatosGrafico({
          labels,
          datasets: [{
            label: 'Diametro Equivalente tendencia por Nivel',
            data: data.flatMap(item => item.y),
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
            tension: 0.4
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
           Diametros Equivalentes tendencia por Nivel
        </Typography>
        <div>
          <Line data={datosGrafico} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoDiametroEquivalente;
