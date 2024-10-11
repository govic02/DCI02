import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoLongitudPromedio = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true); // Estado de carga
  const [sinDatos, setSinDatos] = useState(false); // Estado para indicar si no hay datos

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        console.log("Llamando al gráfico de longitudes por niveles");
        // Primero, intenta obtener el orden predefinido
        const ordenNivelesResponse = await axios.get(`${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(urn)}`);
        const ordenNivelesData = ordenNivelesResponse.data.listaNiveles;
        console.log("Órdenes de niveles:", ordenNivelesData);
        let predefinedOrderMap = {};
        let usePredefinedOrder = ordenNivelesData && ordenNivelesData.length > 0;

        if (usePredefinedOrder) {
          ordenNivelesData.forEach((item, index) => {
            predefinedOrderMap[item.nombre.trim()] = index;
          });
        }

        // Obtén los datos principales para el gráfico
        const respuesta = await fetch(`${API_BASE_URL}/api/getLongitudPromedio/${urn}`);
        console.log("URN enviada:", urn);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const { longitudes } = await respuesta.json();
        console.log("Respuesta del servidor:", longitudes);

        if (longitudes && longitudes.length > 0) {
          if (usePredefinedOrder) {
            longitudes.sort((a, b) => predefinedOrderMap[a.nombreFiltro2.trim()] - predefinedOrderMap[b.nombreFiltro2.trim()]);
          } else {
            longitudes.sort((a, b) => parseFloat(a.nombreFiltro2.replace(/\D/g, '')) - parseFloat(b.nombreFiltro2.replace(/\D/g, '')));
          }

          // Preparar los datos para el gráfico
          const labels = longitudes.map(item => item.nombreFiltro2);
          const data = longitudes.map(item => item.promedioLongitud);

          setDatosGrafico({
            labels,
            datasets: [{
              label: 'Promedio de Longitud por Nivel',
              data,
              backgroundColor: 'rgba(218, 41, 28, 1)', // Rojo con transparencia
              borderColor: '#DA291C', // Rojo sólido
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
            return value + ' mt';
          }
        },
        title: {
          display: true,
          text: 'Longitud (mt)'
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
