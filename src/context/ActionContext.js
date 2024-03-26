import React, { createContext, useContext, useState } from 'react';

export const ActionsContext = createContext();

export const useActions = () => useContext(ActionsContext);

export const ActionsProvider = ({ children, viewerRef }) => {
    const [actions, setActions] = useState({});
    const [identificadoresActuales, setIdentificadoresActuales] = useState([]);
    const [datosFiltro1, setDatosFiltro1] = useState(null);
    const [datosFiltro2, setDatosFiltro2] = useState(null);

    const [pesoTotal, setPesoTotal] = useState(0);
    const [largoTotal, setLargoTotal] = useState(0);
    const [totalBarras, setTotalBarras] = useState(0);
    const [selectedObjectProps, setSelectedObjectProps] = useState([]);

    const [resultadoFierros, setResultadoFierros] = useState([]);
    const [seleccionActual, setSeleccionActual] = useState([]);


    const actualizarResultadoFierros = (nuevosFierros) => {
        setResultadoFierros(nuevosFierros);
    };

    const actualizarSeleccionActual = (nuevaSeleccion) => {
        setSeleccionActual(nuevaSeleccion);
    };


    const updateSelectedObjectProps = (props) => {
        setSelectedObjectProps(props);
    };

    const registerAction = (actionName, actionFunction) => {
        setActions((prevActions) => ({ ...prevActions, [actionName]: actionFunction }));
    };

    const updatePesoTotal = (nuevoPesoTotal) => {
        setPesoTotal(nuevoPesoTotal);
    };

    const updateLargoTotal = (nuevoLargoTotal) => {
        setLargoTotal(nuevoLargoTotal);
    };

    const updateTotalBarras = (nuevoTotalBarras) => {
        setTotalBarras(nuevoTotalBarras);
    };
    const updateIdentificadoresActuales = (nuevosIdentificadores) => {
        setIdentificadoresActuales(nuevosIdentificadores);
    };

    const updateDatosFiltro1 = (nuevosDatos) => {
        setDatosFiltro1(nuevosDatos);
    };
    const updateDatosFiltro2 = (nuevosDatos) => {
        
        setDatosFiltro2(nuevosDatos);
    };

    return (
        <ActionsContext.Provider 
              value={{ ...actions,  registerAction, 
                                    identificadoresActuales,
                                    updateIdentificadoresActuales,
                                    datosFiltro1,
                                    updateDatosFiltro1,
                                    datosFiltro2,
                                    updateDatosFiltro2,
                                    pesoTotal,
                                    updatePesoTotal,
                                    largoTotal,
                                    updateLargoTotal,
                                    totalBarras,
                                    updateTotalBarras,
                                    selectedObjectProps,
                                    updateSelectedObjectProps,
                                    resultadoFierros,
                                    actualizarResultadoFierros,
                                    seleccionActual,
                                    actualizarSeleccionActual 
                    }}>
            {children}
        </ActionsContext.Provider>
    );
};
