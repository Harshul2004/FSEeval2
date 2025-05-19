import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../theme';

const ThemeModeContext = createContext();

export const useThemeMode = () => {
  return useContext(ThemeModeContext);
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};