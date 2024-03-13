import "@/styles/globals.css";

import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { themes, ThemeWrapper } from "../utils/theme";

import ManageAccountCenter from "../components/ManageAccountCenter";
import { DatastoreConnectionContextProvider } from "../context/datastoreConnectionContext";

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/utils/chains";

const RenderOnlyOnClient = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
};

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>Gitcoin Passport Identity Staking</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
        />
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DatastoreConnectionContextProvider>
            <ManageAccountCenter>
              <RenderOnlyOnClient>
                <ThemeWrapper
                  initChakra={true}
                  defaultTheme={themes.LUNARPUNK_DARK_MODE}
                >
                  <Component {...pageProps} />
                </ThemeWrapper>
              </RenderOnlyOnClient>
            </ManageAccountCenter>
          </DatastoreConnectionContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
