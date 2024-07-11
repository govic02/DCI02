import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoPesosPorValor = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: [],
  });
  const graficoRef = useRef(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const urlBarras = `${API_BASE_URL}/api/pesosTotales/${encodeURIComponent(urn)}`;
        const respuestaBarras = await axios.get(urlBarras);

      //console.log("barras pesos totales respuesta", respuestaBarras.data);

        // Ordenar los datos por valor numérico ascendente
        const pesosOrdenados = respuestaBarras.data.pesosPorValor.sort((a, b) => parseFloat(a.valor) - parseFloat(b.valor));

        setDatosGrafico({
          labels: pesosOrdenados.map(item => item.valor),
          datasets: [{
            label: respuestaBarras.data.nombreFiltro2,
            data: pesosOrdenados.map(item => item.sumaPeso),
            backgroundColor: ['#E04C41', '#737373', '#EE736A', '#41E0E0', '#E0E041'],
          }],
        });

      } catch (error) {
        console.error("Error al obtener los datos:", error.message);
      }
    };

    fetchDatos();
  }, [urn]);

  const options = {
    scales: { y: { beginAtZero: true } },
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
          Distribución de Pesos por Piso
        </Typography>
        <div ref={graficoRef}>
          <Bar data={datosGrafico} options={options} />
        </div>
       
      </CardContent>
    </Card>
  );
};

export default GraficoPesosPorValor;
