import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoDiametroPromedio = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true); // Estado de carga
  const [sinDatos, setSinDatos] = useState(false); // Estado para indicar si no hay datos

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        console.log("Llamando al gráfico de diámetros por niveles");

        // Primero, obtener los datos del diámetro promedio por piso
        const respuesta = await axios.get(`${API_BASE_URL}/api/diametroPromedio/${encodeURIComponent(urn)}`);
        console.log("URN enviada:", urn);
        const { diametros } = respuesta.data;
        console.log("Respuesta del servidor:", diametros);

        if (diametros && diametros.length > 0) {
          // Ordenar los datos por el nombre del filtro (piso)
          diametros.sort((a, b) => parseFloat(a.nombreFiltro2.replace(/\D/g, '')) - parseFloat(b.nombreFiltro2.replace(/\D/g, '')));

          // Preparar los datos para el gráfico
          const labels = diametros.map(item => item.nombreFiltro2);
          const data = diametros.map(item => item.promedioDiametro);

          setDatosGrafico({
            labels,
            datasets: [{
              label: 'Promedio de Diámetro por Nivel',
              data,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            }]
          });
          setSinDatos(false);
        } else {
          // No hay datos disponibles
          setSinDatos(true);
        }
        setLoading(false); // Finaliza la carga
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setSinDatos(true);
        setLoading(false); // Asegura que se oculte el mensaje de carga incluso si hay error
      }
    };

    fetchDatos();
  }, [urn]);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + ' mm';
          }
        },
        title: {
          display: true,
          text: 'Diámetro (mm)'
        }
      }
    },
  };

  const cardStyle = {
    marginLeft: '40px',
    marginRight: '40px',
    marginTop: '40px',
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
            Sin información disponible
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Una vez que los datos están disponibles, renderizar el gráfico
  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
          Promedio de Diámetro por Nivel
        </Typography>
        <div>
          <Bar data={datosGrafico} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoDiametroPromedio;
