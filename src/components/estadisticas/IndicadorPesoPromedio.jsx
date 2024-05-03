import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import API_BASE_URL from '../../config';

const IndicadorPesoPromedio = ({ urn }) => {
    const [pesoPromedioGeneral, setPesoPromedioGeneral] = useState(0);
    const [diametroPromedioGeneral, setDiametroPromedioGeneral] = useState(0);
    useEffect(() => {
        const fetchPesoPromedioGeneral = async () => {
            try {
                const url = `${API_BASE_URL}/api/pesoPromedioGeneral/${urn}`;
                const respuesta = await axios.get(url);
                const data = respuesta.data;
                setPesoPromedioGeneral(data.pesoPromedioGeneral);
            } catch (error) {
                console.error("Error al obtener el peso promedio general:", error);
            }
        };

        fetchPesoPromedioGeneral();
    }, [urn]);
    useEffect(() => {
        const fetchDiametroPromedioGeneral = async () => {
            try {
                const url = `${API_BASE_URL}/api/diametroPromedioGeneral/${urn}`;
                const respuesta = await axios.get(url);
                const data = respuesta.data;
                setDiametroPromedioGeneral(data.diametroPromedio);
            } catch (error) {
                console.error("Error al obtener el diámetro promedio general:", error);
            }
        };

        fetchDiametroPromedioGeneral();
    }, [urn]);
    const cardStyle = {
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '40px',
        borderRadius: '20px',
        padding: '20px',
        height: '280px' // Define una altura adecuada para el contenido
    };

    return (
        <Card style={cardStyle}>
            <CardContent>
                <Typography variant="h5" component="h2" style={{ fontSize: 14, marginBottom: '10px',textAlign: 'center' }}>
                    Peso Promedio General del Proyecto
                </Typography>
                <Typography variant="body2" style={{ fontSize: 14, marginBottom: '10px',textAlign: 'center', marginBottom:'50px' }}>
                 <b>  {pesoPromedioGeneral.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} kg  </b>
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
