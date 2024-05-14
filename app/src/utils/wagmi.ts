import { createWeb3Modal } from "@web3modal/wagmi/react";
import { createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Chain } from "viem";
import { wagmiChains, wagmiTransports } from "./chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

const projectId = (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string) || "default-project-id";

// If wagmiChains.length we have a misconfiguration (and we log in chains.ts).
// So we just set mainnet in wagmi to keep it happy
const chains = (wagmiChains.length > 0 ? wagmiChains : [mainnet]) as [Chain, ...Chain[]];
const transports = wagmiTransports;

const metadata = {
  name: "Passport Identity Staking",
  description: "Reinforce your identity and increase your unique humanity score by staking GTC.",
  url: "https://passport.gitcoin.co",
  icons: ["/assets/gitcoinLogo.svg"],
};

export const wagmiConfig = createConfig({
  chains,
  transports,
  // Prevent build warnings
  ssr: typeof window === "undefined",
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  themeMode: "dark",
  themeVariables: {
    "--w3m-font-family": "var(--font-body)",
    "--w3m-accent": "rgb(var(--color-foreground-4))",
  },
});
