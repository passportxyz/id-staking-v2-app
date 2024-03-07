import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { themes, ThemeWrapper } from "../utils/theme";

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
      <ThemeWrapper initChakra={true} defaultTheme={themes.LUNARPUNK_DARK_MODE}>
        <Component {...pageProps} />;
      </ThemeWrapper>
    </>
  );
}
