import { createTheme, Theme } from '@mui/material/styles';

export function themeCreator(): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3C50E0',
        dark: '#1C2434',
        light: '#F1F5F9',
      },
      secondary: {
        main: 'rgba(60, 80, 224, 0.10)',
        dark: '#333A48',
      },
      text: {
        primary: '#1C2434',
        secondary: '#8694AA',
      },
      background: {
        default: '#F1F5F9',
        paper: '#FFFFFF',
      },
      error: {
        main: '#FF1943',
      },
      common: {
        black: '#000000',
        white: '#FFFFFF',
      },
      divider: '#E0E0E0',
    },
  });
}
