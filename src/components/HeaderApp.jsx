import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BandejaDeEntrada from './header/BandejaDeEntrada';
import { useAuth } from '../context/AuthContext';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Ícono de exclamación

const headerHeight = '60px';

const HeaderApp = ({ proyectoKey,urn }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { logout } = useAuth();
    const [bandejaVisible, setBandejaVisible] = useState(false);
    console.log("Proyecto seleccionado Header:", proyectoKey);

    const handleOpenBandeja = () => {
        setBandejaVisible(true);
    };

    const handleCloseBandeja = () => {
        setBandejaVisible(false);
    };
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose(); // Cierra el menú
        logout();
        window.location.reload();
        console.log("cerrando sesión");
    };

    return (
        <AppBar position="static" style={{ backgroundColor: 'white', color: '#222223', minHeight: headerHeight, zIndex: '1000' }}>
            <Toolbar>
                <img src="/images/proyectoIcn.svg" alt="Logo" style={{ width: '35px', alignSelf: 'flex-start', marginRight: '15px', marginTop: '15px' }} />
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                  {proyectoKey}
                </Typography>
                <Button  onClick={handleOpenBandeja} variant="text"  style={{
                    color: '#DA291C',
                    marginRight: '20px'
                }}>
                      <img src="/images/campana.svg" alt="Imagen" style={{ width: '30px', marginRight: '15px' }} />
                   <b> RDI</b>
                </Button>
              
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#DA291C',
                    color: 'white',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }} onClick={handleClick}>
                    DF
                </div>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
                <BandejaDeEntrada open={bandejaVisible} onClose={handleCloseBandeja} urn={urn} />
            </Toolbar>
        </AppBar>
    );
};

export default HeaderApp;
