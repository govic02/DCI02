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

  
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        console.log("llamo grafico longitudes niveles");
        // Primero, intenta obtener el orden predefinido
        const ordenNivelesResponse = await axios.get(`${API_BASE_URL}/api/ordenNiveles/${encodeURIComponent(urn)}`);
        const ordenNivelesData = ordenNivelesResponse.data.listaNiveles;
        
        let predefinedOrderMap = {};
        let usePredefinedOrder = ordenNivelesData && ordenNivelesData.length > 0;
        console.log( ordenNivelesResponse);
        if (usePredefinedOrder) {
          ordenNivelesData.forEach((item, index) => {
            predefinedOrderMap[item.nombre.trim()] = index;
          });
        }

        // Obtén los datos principales para el gráfico
        const respuesta = await fetch(`${API_BASE_URL}/api/getLongitudPromedio/${urn}`);
      
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const { longitudes } = await respuesta.json();
        console.log("respuesta servidor "+longitudes);
        console.log(longitudes);
        if (usePredefinedOrder) {
          longitudes.sort((a, b) => predefinedOrderMap[a.nombreFiltro2.trim()] - predefinedOrderMap[b.nombreFiltro2.trim()]);
        } else {
          longitudes.sort((a, b) => parseFloat(a.nombreFiltro2.replace(/\D/g, '')) - parseFloat(b.nombreFiltro2.replace(/\D/g, '')));
        }

        // Preparar los datos para el gráfico
        const labels = longitudes.map(item => item.nombreFiltro2);
        const data = longitudes.map(item => item.promedioLongitud );

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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' cm';
          }
        },
        title: {
          display: true,
          text: 'Longitud (cm)'
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

  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
          Promedio de Longitud por Nivel
        </Typography>
        <div >
          <Bar data={datosGrafico} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoLongitudPromedio;
