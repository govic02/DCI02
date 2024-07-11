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
        const logo = '';
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
       var  pesosPorPisoOrd = pesosPorPiso.sort((a, b) => parseInt(a.piso, 10) - parseInt(b.piso, 10));
      //console.log("pesos por piso ordenados", pesosPorPisoOrd);
    
        // Preparar los datos para el gráfico de líneas
        const labels = pesosPorPisoOrd.map(item => item.piso);
        let datasetMap = {}; // Mapa para mantener los datasets organizados por diámetro

        pesosPorPisoOrd.forEach(piso => {
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
  //  <button onClick={descargarPDF} style={{color:'#fff' , borderRadius: '10px', margin: '0 5px',backgroundColor: '#DA291C',borderColor: '#DA291C' }}>Descargar Informe</button>
  
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
          </CardContent>
      
    </Card>
  );
};

export default GraficoLineasPesosPorDiametro;
