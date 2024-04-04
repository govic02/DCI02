import React, { useEffect, useState, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../../config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
        const url = `${API_BASE_URL}/api/registro/${urn}`;
        const respuesta = await fetch(url);
       
        if (!respuesta.ok) throw new Error('Respuesta no satisfactoria del servidor');
        const data = await respuesta.json();
        console.log("datos Pesos Totales piso respuesta",data);
        setDatosGrafico({
          labels: data.pesosPorValor.map(item => item.valor),
          datasets: [{
            label: data.nombreFiltro2,
            data: data.pesosPorValor.map(item => item.sumaPeso),
            backgroundColor: ['#E04C41', '#737373', '#EE736A', '#41E0E0', '#E0E041'],
          }],
        });
      } catch (error) {
        console.error("Error al obtener los datos:", error);
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

  const descargarPDF = async () => {
    if (graficoRef.current) {
      const canvas = await html2canvas(graficoRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; // Ajustar al ancho del PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener proporción
      const logo = '';
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.addImage(logo, 'PNG', pdf.internal.pageSize.getWidth() - 50, 10, 40, 20);
      const tableColumn = ['Valor', 'Suma Peso'];
      const tableRows = [];
      const head = [
        [
          "Valores Pesos Piso",
          ...datosGrafico.datasets.map(dataset => {
            // Formatea el nombre del diámetro a un decimal, si aplica
            const match = dataset.label.match(/Diametro (\d+(\.\d+)?)/);
            return match ? `Diametro ${parseFloat(match[1]).toFixed(1)} mm` : dataset.label;
          }),
        ],
      ];
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // Ancho del PDF menos márgenes.
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Calculamos la altura para mantener la proporción.
      const body = datosGrafico.labels.map((label, index) => {
        const row = datosGrafico.datasets[0].data.map((data) => data[index]);
        return [label, ...row];
      });
      const tableStartY = pdfHeight +20;
      datosGrafico.labels.forEach((label, index) => {
        const peso = datosGrafico.datasets[0].data[index];
        const row = [label, peso];
        tableRows.push(row);
      });

      pdf.autoTable({
        head: head,
        body: tableRows,
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

    

      pdf.save('informe_pesos_por_valor.pdf');
    }
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
        <button onClick={descargarPDF} style={{color:'#fff' , borderRadius: '10px', margin: '0 5px',backgroundColor: '#DA291C',borderColor: '#DA291C' }}>
          Descargar Informe
        </button>
      </CardContent>
    </Card>
  );
};

export default GraficoPesosPorValor;
