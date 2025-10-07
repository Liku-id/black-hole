import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import { AuthProvider } from '@/contexts/AuthContext';
import { PostHogProvider } from '@/lib/posthog';
import { ToastProvider } from '@/contexts/ToastContext';
import createEmotionCache from '@/createEmotionCache';
import ThemeProvider from '@/theme/ThemeProvider';

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
            fetcher: (url: string) => axios.get(url).then((res) => res.data),
            revalidateOnFocus: false
          }}
        >
          <PostHogProvider>
            <ToastProvider>
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            </ToastProvider>
          </PostHogProvider>
        </SWRConfig>
      </ThemeProvider>
    </CacheProvider>
  );
}
