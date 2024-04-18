import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] =useState(localStorage.getItem('token'));
    const isLoggedIn = !!token; // Determina si el usuario está logueado basado en la presencia del token
    
    const logout = () => {
        localStorage.removeItem('token'); // Elimina el token del almacenamiento local
        setToken(null); // Actualiza el estado del token a null
      };
    useEffect(() => {
        // Intenta recuperar el token del localStorage cuando el componente se monta
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken ,isLoggedIn, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
