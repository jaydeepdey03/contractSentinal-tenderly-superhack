import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {PrivyProvider} from "@privy-io/react-auth";
import {useEffect, useState} from "react";
import GlobalContextProvider from "@/context/GlobalContext";

const queryClient = new QueryClient();
export default function App({Component, pageProps}: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PrivyProvider
      appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID!}`}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url",
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <GlobalContextProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </GlobalContextProvider>
    </PrivyProvider>
  );
}
