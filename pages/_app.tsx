import type { ReactElement, ReactNode } from 'react';

import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect, useState } from 'react';
import { AuthProvider } from 'src/contexts/AuthContext';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import createEmotionCache from 'src/createEmotionCache';
import ThemeProvider from 'src/theme/ThemeProvider';

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface TokyoAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

function TokyoApp(props: TokyoAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  Router.events.on('routeChangeStart', nProgress.start);
  Router.events.on('routeChangeError', nProgress.done);
  Router.events.on('routeChangeComplete', nProgress.done);

  if (!mounted) {
    return null;
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Tokyo Free White NextJS Typescript Admin Dashboard</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <AuthProvider>
        <SidebarProvider>
          <ThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CssBaseline />
              {getLayout(<Component {...pageProps} />)}
            </LocalizationProvider>
          </ThemeProvider>
        </SidebarProvider>
      </AuthProvider>
    </CacheProvider>
  );
}

export default TokyoApp;
