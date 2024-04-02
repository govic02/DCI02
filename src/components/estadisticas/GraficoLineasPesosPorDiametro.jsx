import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Line } from 'react-chartjs-2'; // Importa Line en lugar de Bar
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import API_BASE_URL from '../../config';
import { jsPDF } from 'jspdf';
import "jspdf-autotable";
import html2canvas from 'html2canvas';
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const GraficoLineasPesosPorDiametro = ({ urn }) => {
  const [datosGrafico, setDatosGrafico] = useState({
    labels: [],
    datasets: [],
  });
  const graficoRef = useRef(null);

  const descargarPDF = async () => {
    if (graficoRef.current) {
        const canvas = await html2canvas(graficoRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();

        // Logotipo en base64. Reemplaza esto con tu imagen convertida a base64.
        const logo = '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';
        // Calcula el nuevo tamaño para la imagen del gráfico
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // Ancho del PDF menos márgenes.
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Calculamos la altura para mantener la proporción.
       
        const head = [["Piso", ...datosGrafico.datasets.map(dataset => {
            // Extrae el diámetro del nombre del dataset, asumiendo que sigue el formato "Diametro X mm"
            const diametro = dataset.label.match(/Diametro (\d+(\.\d+)?) mm/);
            // Si se encuentra un diámetro, formatea a un decimal. Si no, usa el nombre original del dataset.
            const nombreFormateado = diametro ? `Diametro ${parseFloat(diametro[1]).toFixed(1)} mm` : dataset.label;
            return nombreFormateado;
        })]];
        const body = datosGrafico.labels.map((piso, index) => {
            const row = datosGrafico.datasets.map(dataset => dataset.data[index]);
            return [piso, ...row];
        });

       
        // Agrega el logotipo en la esquina superior derecha
        // Ajusta estas dimensiones según el tamaño de tu logotipo y el PDF
        pdf.addImage(imgData, 'PNG', 10, 40, pdfWidth, pdfHeight);
        const tableStartY = pdfHeight + 60;
        // Agrega la imagen del gráfico
        pdf.addImage(logo, 'PNG', pdf.internal.pageSize.getWidth() - 50, 10, 40, 20);
    
        pdf.autoTable({
            head: head,
            body: body,
            startY: tableStartY, // Ajusta esta línea según sea necesario
            styles: {
                // Estilos aplicados a todo el cuerpo de la tabla
                font: "arial", // Usa un tipo de letra legible
                fontSize: 10, // Ajusta el tamaño de la fuente según sea necesario
                textColor: 20, // Color del texto para el cuerpo de la tabla
            },
            headStyles: {
                fillColor: [218, 41, 28], // Color de fondo para la cabecera en formato RGB
                textColor: [255, 255, 255], // Color del texto para la cabecera, blanco
                fontSize: 11, // Puedes ajustar el tamaño de la fuente de la cabecera si es necesario
            },
            
        });
        pdf.save('informe.pdf');
    } else {
        console.error('No se pudo acceder al gráfico para generar el PDF');
    }
};



  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const url = `${API_BASE_URL}/api/respuestasDiametros/${urn}`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const { pesosPorPiso } = await respuesta.json();

        // Preparar los datos para el gráfico de líneas
        const labels = pesosPorPiso.map(item => item.piso);
        let datasetMap = {}; // Mapa para mantener los datasets organizados por diámetro

        pesosPorPiso.forEach(piso => {
          piso.diametros.forEach(({ diametro, pesoTotal }) => {
            if (!datasetMap[`Diametro ${diametro} mm`]) {
              datasetMap[`Diametro ${diametro} mm`] = {
                label: `Diametro ${diametro} mm`,
                data: new Array(labels.length).fill(0), // Inicializa un arreglo de ceros
                borderColor: getRandomColor(), // Usa un color diferente para cada línea
                fill: false,
              };
            }
            const index = labels.indexOf(piso.piso);
            datasetMap[`Diametro ${diametro} mm`].data[index] = pesoTotal;
          });
        });

        setDatosGrafico({
          labels,
          datasets: Object.values(datasetMap), // Convierte el mapa de datasets en un arreglo
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
      },
    },
  };

  const cardStyle = {
    marginLeft: '40px',
    marginRight: '40px',
    marginTop: '40px',
    borderRadius: '20px',
  };

  // Función para obtener colores aleatorios
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <Card style={cardStyle}>
      <CardContent>
        <Typography variant="h5" component="h2" style={{ fontSize: 14 }}>
          Distribución de Pesos por Diametro en Cada Piso
        </Typography>
        <div ref={graficoRef}>
          <Line data={datosGrafico} options={options} />
        </div>
        <button onClick={descargarPDF} style={{color:'#fff' , borderRadius: '10px', margin: '0 5px',backgroundColor: '#DA291C',borderColor: '#DA291C' }}>Descargar Informe</button>
      </CardContent>
      
    </Card>
  );
};

export default GraficoLineasPesosPorDiametro;
