import { ThemeProvider } from '@mui/material';
import { render, RenderOptions } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { ToastProvider } from '@/contexts/ToastContext';
import { themeCreator } from '@/theme/base';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withToast?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { withToast = true, ...renderOptions }: CustomRenderOptions = {}
) {
  const theme = themeCreator();

  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <JotaiProvider>
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
          {children}
        </SWRConfig>
      </JotaiProvider>
    );

    return (
      <ThemeProvider theme={theme}>
        {withToast ? <ToastProvider>{content}</ToastProvider> : content}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
