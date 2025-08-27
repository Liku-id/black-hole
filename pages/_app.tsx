import type { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ThemeProvider from '@/theme/ThemeProvider';
import createEmotionCache from '@/createEmotionCache';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider>
        <CssBaseline />
        <SWRConfig
          value={{
            fetcher: (url: string) => fetch(url).then((res) => res.json()),
            revalidateOnFocus: false,
          }}
        >
          <ToastProvider>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          </ToastProvider>
        </SWRConfig>
      </ThemeProvider>
    </CacheProvider>
  );
}
