import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';
import { WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js';

const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '1caa5aff046aaaed0ad0c902eadb8a50',
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient();

import '../styles/globals.css'
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core";
fontAwesomeConfig.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);

  useEffect(() => {
    const fetchStripe = async () => {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_fallback_stripe_public_key_here');
      setStripePromise(stripe);
    };

    fetchStripe();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: '#E02424',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          })}>
            <Component {...pageProps} />
            <Analytics />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Elements>
  );
}