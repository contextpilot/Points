import '@rainbow-me/rainbowkit/styles.css';
import { ledgerWallet, metaMaskWallet, walletConnectWallet, trustWallet, coinbaseWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { Chain } from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js';

const binanceChainMainNet: Chain = {
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  rpcUrls: {
    public: 'https://bsc-dataseed.binance.org/',
    default: 'https://bsc-dataseed.binance.org/',
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [binanceChainMainNet],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider()
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains }),
      ledgerWallet({ chains }),
      trustWallet({ chains }),
    ],
  },
  {
    groupName: 'Others',
    wallets: [
      coinbaseWallet({ chains, appName: 'Presale Dapp' }),
      walletConnectWallet({ chains }),
      rainbowWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

import '../styles/globals.css'
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
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
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider coolMode chains={chains} theme={darkTheme(
          {
            accentColor: '#E02424',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
          }
        )}>
          <Component {...pageProps} />
          <Analytics />
        </RainbowKitProvider>
      </WagmiConfig>
    </Elements>
  );
}