import React, { createContext, useContext, useState } from 'react';

export const ProyectoContext = createContext(); // Asegúrate de exportar ProyectoContext

export const useActions = () => useContext(ProyectoContext);
export const useProyecto = () => useContext(ProyectoContext);

export const ProyectoProvider = ({ children }) => {
    const [actions, setActions] = useState({});
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [urnSelected, setUrnSelected] = useState('');
    const handleProyectoSeleccionado = (proyectoKey, urn) => {
        setProyectoSeleccionado({ proyectoKey, urn });
        setUrnSelected(urn);
    };
    const registerAction = (actionName, actionFunction) => {
        setActions((prevActions) => ({ ...prevActions, [actionName]: actionFunction }));
    };

    return (
        <ProyectoContext.Provider value={{ 
            proyectoSeleccionado, 
            urnSelected, 
            handleProyectoSeleccionado,
            ...actions,  // Extiende las acciones registradas para que estén disponibles en el contexto
            registerAction,  // Permite a los componentes registrar nuevas acciones
        }}>
            {children}
        </ProyectoContext.Provider>
    );
};
