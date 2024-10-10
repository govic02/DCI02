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
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Función para obtener el peso promedio general
                const fetchPesoPromedioGeneral = async () => {
                    const url = `${API_BASE_URL}/api/pesoPromedioGeneral/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setPesoPromedioGeneral(data.pesoPromedioGeneral);
                };

                // Función para obtener el diámetro promedio general
                const fetchDiametroPromedioGeneral = async () => {
                    const url = `${API_BASE_URL}/api/diametroPromedioGeneral/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    setDiametroPromedioGeneral(data.diametroPromedio);
                };

                // Función para obtener el peso total del proyecto
                const fetchPesoTotalProyecto = async () => {
                    const url = `${API_BASE_URL}/api/getPesovsPedidos/${urn}`;
                    const respuesta = await axios.get(url);
                    const data = respuesta.data;
                    console.log("Peso Total Proyecto", data);
                    setPesoTotalProyecto(data.pesoTotalProyecto);
                };

                // Ejecutar todas las peticiones en paralelo
                await Promise.all([
                    fetchPesoPromedioGeneral(),
                    fetchDiametroPromedioGeneral(),
                    fetchPesoTotalProyecto()
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
        height: '280px' // Define una altura adecuada para el contenido
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
                    <b>{pesoTotalProyecto.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</b>
                </Typography>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, textAlign: 'center', marginBottom: '10px' }}>
                    Peso Promedio General del Proyecto
                </Typography>
                <Typography variant="body2" style={{ fontSize: 14, marginBottom: '10px', textAlign: 'center', marginBottom: '20px' }}>
                    <b>{pesoPromedioGeneral.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} kg</b>
                </Typography>

                <Typography variant="h5" component="h2" style={{ fontSize: 16, marginBottom: '10px', textAlign: 'center' }}>
                    DPB
                </Typography>
                <Typography variant="body2" style={{ fontSize: 16, textAlign: 'center' }}>
                    <b>{diametroPromedioGeneral.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} mm</b>
                </Typography>
            </CardContent>
        </Card>
    );
};

export default IndicadorPesoPromedio;
