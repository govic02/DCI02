import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import API_BASE_URL from '../../config';

const IndicadorPesoPromedio = ({ urn }) => {
    const [pesoPromedioGeneral, setPesoPromedioGeneral] = useState(0);
    const [diametroPromedioGeneral, setDiametroPromedioGeneral] = useState(0);
    const [pesoTotalProyecto, setPesoTotalProyecto] = useState(0);
    const [longitudPromedioProyecto, setLongitudPromedioProyecto] = useState(0); // Nuevo estado para LPB
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Función para obtener el peso promedio general
                const fetchPesoPromedioGeneral = async () => {
                    const url = `${API_BASE_URL}/api/pesoPromedioGeneral/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setPesoPromedioGeneral(data.pesoPromedioGeneral || 0); // Aseguramos un valor por defecto
                };

                // Función para obtener el diámetro promedio general
                const fetchDiametroPromedioGeneral = async () => {
                    const url = `${API_BASE_URL}/api/diametroPromedioGeneral/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setDiametroPromedioGeneral(data.diametroPromedio || 0); // Aseguramos un valor por defecto
                };

                // Función para obtener el peso total del proyecto
                const fetchPesoTotalProyecto = async () => {
                    const url = `${API_BASE_URL}/api/getPesovsPedidos/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setPesoTotalProyecto(data.pesoTotalProyecto || 0); // Aseguramos un valor por defecto
                };

                // Función para obtener la longitud promedio del proyecto (LPB)
                const fetchLongitudPromedioProyecto = async () => {
                    const url = `${API_BASE_URL}/api/getlongitudPromedioProyecto/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setLongitudPromedioProyecto(data.promedioLongitudProyecto || 0); // Aseguramos un valor por defecto
                };

                // Ejecutar todas las peticiones en paralelo
                await Promise.all([
                    fetchPesoPromedioGeneral(),
                    fetchDiametroPromedioGeneral(),
                    fetchPesoTotalProyecto(),
                    fetchLongitudPromedioProyecto() // Incluir la nueva llamada al endpoint para LPB
                ]);

                // Una vez que se hayan obtenido todos los datos, actualizar el estado de carga
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
                setLoading(false); // Asegurarse de ocultar el mensaje de carga incluso si hay error
            }
        };

        fetchData();
    }, [urn]);

    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
        padding: '20px',
        height: '320px' // Aumenta la altura para el nuevo indicador
    };

    // Formatear números con separación de miles y decimales
    const formatNumber = (number, minimumFractionDigits = 1, maximumFractionDigits = 1) => {
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: maximumFractionDigits
        }).format(number);
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

    // Una vez que los datos están disponibles, renderizar los elementos y gráficos
    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 16, textAlign: 'center', marginBottom: '10px' }}>
                    Peso Total del Proyecto
                </Typography>
                <Typography variant="body2" style={{ fontSize: 16, textAlign: 'center', marginBottom: '20px' }}>
                    <b>{formatNumber(pesoTotalProyecto, 1, 1)} kg</b>
                </Typography>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, textAlign: 'center', marginBottom: '10px' }}>
                    Peso Promedio General del Proyecto
                </Typography>
                <Typography variant="body2" style={{ fontSize: 14, marginBottom: '10px', textAlign: 'center', marginBottom: '20px' }}>
                    <b>{formatNumber(pesoPromedioGeneral, 2, 2)} kg</b>
                </Typography>

                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginBottom: '10px', textAlign: 'center' }}>
                    DPB
                </Typography>
                <Typography variant="body2" style={{ fontSize: 16, textAlign: 'center' }}>
                    <b>{formatNumber(diametroPromedioGeneral, 2, 2)} mm</b>
                </Typography>

                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginTop: '20px', textAlign: 'center' }}>
                    LPB (Longitud Promedio del Proyecto)
                </Typography>
                <Typography variant="body2" style={{ fontSize: 16, textAlign: 'center' }}>
                    <b>{formatNumber(longitudPromedioProyecto, 2, 2)} cm</b>
                </Typography>
            </CardContent>
        </Card>
    );
};

export default IndicadorPesoPromedio;
