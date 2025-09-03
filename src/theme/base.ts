import { createTheme, Theme } from '@mui/material/styles';

export function themeCreator(): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3C50E0',
        dark: '#1C2434',
        light: '#F1F5F9'
      },
      secondary: {
        main: 'rgba(60, 80, 224, 0.10)',
        dark: '#333A48',
        light: '#FCF0FB',
        contrastText: '#DE69CE'
      },
      text: {
        primary: '#1C2434',
        secondary: '#8694AA'
      },
      grey: {
        100: '#E2E8F0'
      },
      background: {
        default: '#F1F5F9',
        paper: '#FFFFFF'
      },
      error: {
        main: '#FF1943',
        light: '#FCF0FB'
      },
      common: {
        black: '#000000',
        white: '#FFFFFF'
      },
      divider: '#E0E0E0',
      success: {
        main: '#38D200',
        light: '#ECFBE6'
      },
      warning: {
        main: '#F48042',
        light: '#FFE8DA'
      },
      info: {
        main: '#8A38F5',
        light: '#F4ECFE',
        dark: '#ECEEFC',
        contrastText: '#3C50E0'
      }
    }
  });
}
