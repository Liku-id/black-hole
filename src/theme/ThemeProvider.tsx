import React, { FC, createContext } from 'react';
import { ThemeProvider } from '@mui/material';
import { themeCreator } from './base';

export const ThemeContext = createContext((_themeName: string): void => {});

const ThemeProviderWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = themeCreator();
  const setThemeName = (themeName: string): void => {
    window.localStorage.setItem('appTheme', themeName);
  };

  return (
    <ThemeContext.Provider value={setThemeName}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProviderWrapper;
