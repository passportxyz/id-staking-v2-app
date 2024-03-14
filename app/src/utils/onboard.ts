import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule, { WalletConnectOptions } from "@web3-onboard/walletconnect";
import { chainConfigs } from "./chains";

// Injected wallet - shows all available injected wallets

const injected = injectedModule();

// web3Onboard modules
const walletConnectProjectId = (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string) || "default-project-id";

const walletConnectOptions: WalletConnectOptions = {
  projectId: walletConnectProjectId,
};

const onBoardExploreUrl =
  (process.env.NEXT_PUBLIC_WEB3_ONBOARD_EXPLORE_URL as string) || "https://passport.gitcoin.co/";

const walletConnect = walletConnectModule(walletConnectOptions);

// Exports onboard-core instance (https://github.com/blocknative/web3-onboard)
// TODO: onboard should be a function, and receive the list of chains as a parameter
console.log("initializing onboard with chains", chainConfigs);

export const onboard = init({
  connect: {
    autoConnectLastWallet: true,
  },
  wallets: [injected, walletConnect],
  chains: chainConfigs.map(({ id, token, label, rpcUrl, icon }) => ({
    id,
    token,
    label,
    rpcUrl,
    icon,
  })),
  appMetadata: {
    name: "Passport",
    icon: "/assets/gitcoinLogo.svg",
    logo: "/assets/gitcoinLogo.svg",
    description: "Decentralized Identity Verification",
    explore: onBoardExploreUrl,
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});
