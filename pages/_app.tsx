import type { ReactElement, ReactNode } from 'react';

import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ToastProvider } from '@/contexts/ToastContext';
import createEmotionCache from '@/createEmotionCache';
import ThemeProvider from '@/theme/ThemeProvider';
import { CacheProvider, EmotionCache } from '@emotion/react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import CssBaseline from '@mui/material/CssBaseline';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';

const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  requireAuth?: boolean;
};

interface TokyoAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

function TokyoApp(props: TokyoAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const requireAuth = Component.requireAuth ?? true;

  Router.events.on('routeChangeStart', nProgress.start);
  Router.events.on('routeChangeError', nProgress.done);
  Router.events.on('routeChangeComplete', nProgress.done);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Wukong Backoffice Admin Dashboard</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content="Wukong backoffice admin dashboard for content and user management" />
      </Head>
      <ToastProvider>
        <AuthProvider>
          <SidebarProvider>
            <ThemeProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                {requireAuth ? (
                  <ProtectedRoute>
                    {getLayout(<Component {...pageProps} />)}
                  </ProtectedRoute>
                ) : (
                  getLayout(<Component {...pageProps} />)
                )}
              </LocalizationProvider>
            </ThemeProvider>
          </SidebarProvider>
        </AuthProvider>
      </ToastProvider>
    </CacheProvider>
  );
}

export default TokyoApp;
