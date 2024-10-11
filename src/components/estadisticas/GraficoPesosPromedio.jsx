import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoPesosPromedio = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true); // Estado de carga
  const [sinDatos, setSinDatos] = useState(false); // Estado para indicar si no hay datos

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Intenta obtener el orden predefinido desde el servidor
        const ordenNivelesResponse = await axios.get(`${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(urn)}`);
        let ordenNivelesData = ordenNivelesResponse.data.listaNiveles;
        let predefinedOrderMap = {};
        let usePredefinedOrder = ordenNivelesData && ordenNivelesData.length > 0;

        if (usePredefinedOrder) {
          ordenNivelesData.forEach((item, index) => {
            predefinedOrderMap[item.nombre.trim()] = index;
          });
        }

        // Obtén los datos principales para el gráfico
        const respuesta = await fetch(`${API_BASE_URL}/api/getPesoPromedio/${urn}`);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const data = await respuesta.json();
        let pesos = data.pesos;

        // Verificar si hay datos
        if (!pesos || pesos.length === 0) {
          setSinDatos(true);
          setLoading(false);
          return;
        }

        // Si existe un orden predefinido, ordena usando ese orden
        if (usePredefinedOrder) {
          pesos.sort((a, b) => predefinedOrderMap[a.nombreFiltro2.trim()] - predefinedOrderMap[b.nombreFiltro2.trim()]);
        } else {
          // Lógica de ordenamiento predeterminada si no hay orden predefinido
          pesos.sort((a, b) => parseFloat(a.nombreFiltro2.replace(/\D/g, '')) - parseFloat(b.nombreFiltro2.replace(/\D/g, '')));
        }

        // Preparar los datos para el gráfico
        const labels = pesos.map(item => item.nombreFiltro2);
        const pesosData = pesos.map(item => item.promedioPeso);

        setDatosGrafico({
          labels,
          datasets: [{
            label: 'Promedio de Peso por Nivel',
            data: pesosData,
            backgroundColor: 'rgba(218, 41, 28, 1)', // Rojo con transparencia
               borderColor: '#DA291C', // Rojo sólidoackgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        });

        setSinDatos(false);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setSinDatos(true);
        setLoading(false);
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
            return value + ' kg';
          }
        },
        title: {
          display: true,
          text: 'Peso (kg)'
        }
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
