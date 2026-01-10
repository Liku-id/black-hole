import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { SWRConfig } from 'swr';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import createEmotionCache from '@/createEmotionCache';
import { PostHogProvider } from '@/lib/posthog';
import ThemeProvider from '@/theme/ThemeProvider';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider>
        <CssBaseline />
        {/* Google Tag Manager */}
        {gtmId && (
          <>
            <Script
              id="google-tag-manager"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
        {/* End Google Tag Manager */}
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
