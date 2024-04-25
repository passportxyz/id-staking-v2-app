import { wagmiChains, wagmiTransports } from "./chains";

import { createConnector, createConfig } from "@wagmi/core";
import { WalletState } from "@web3-onboard/core";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { onboard } from "./onboard";

// TODO copied from walletStore.tsx
const parseChainId = (chainId?: string) => {
  return chainId
    ? chainId.startsWith("0x")
      ? parseInt(chainId.substring(2), 16)
      : parseInt(chainId.substring(2), 10)
    : 1;
};

const parseWeb3OnboardWallet = (wallet: WalletState) => {
  const address = wallet?.accounts?.[0]?.address;
  const chainAsStr = wallet?.chains?.[0]?.id;
  const chain = parseChainId(chainAsStr);
  const provider = wallet?.provider;
  return { address, chain, provider };
};

const getPreviouslyUsedWalletLabel = () => window.localStorage.getItem("previouslyUsedWalletLabel") || "";

export type Web3OnboardWagmiConnectorParameters = {};

export function web3OnboardWagmiConnector(parameters: Web3OnboardWagmiConnectorParameters = {}) {
  console.log("w3o creating web3OnboardWagmiConnector");
  return createConnector((config) => ({
    icon: undefined,
    id: "web3Onboard",
    name: "Web3 Onboard",
    async connect(...props) {
      console.log("w3o connect", props);
      const previouslyUsedWalletLabel = getPreviouslyUsedWalletLabel();
      console.log("w3o previouslyUsedWalletLabel", previouslyUsedWalletLabel);
      const connectOptions = previouslyUsedWalletLabel
        ? {
            autoSelect: {
              label: previouslyUsedWalletLabel,
              disableModals: true,
            },
          }
        : undefined;
      let [primaryWallet] = await onboard.connectWallet(connectOptions);

      console.log("w3o primaryWallet", primaryWallet);

      if (!primaryWallet) {
        // This error can be caused if the user changed the wallet he is using in the mean time,
        // for example he switched from MM -> Rabby
        // So let's try first without the previouslyUsedWalletLabel
        console.debug(
          "No wallet selected when trying to connect with `previouslyUsedWalletLabel`. Retrying without it."
        );

        [primaryWallet] = await onboard.connectWallet();
      }

      if (!primaryWallet) {
        throw new Error("No wallet selected");
      }
      const walletData = parseWeb3OnboardWallet(primaryWallet);
      const address = walletData.address as `0x${string}`;
      const chainId = walletData.chain;
      const provider = walletData.provider;

      window.localStorage.setItem("previouslyUsedWalletLabel", primaryWallet.label);

      provider.on("accountsChanged", (...props) => {
        console.log("w3o event accountsChanged", props);
        this.onAccountsChanged.bind(this)(...props);
      });
      provider.on("chainChanged", (...props) => {
        console.log("w3o event chainChanged", props);
        this.onChainChanged.bind(this)(...props);
      });
      provider.on("disconnect", (...props) => {
        console.log("w3o event disconnect", props);
        this.onDisconnect.bind(this)(...props);
      });

      console.log("w3o connected", { address, chainId, provider });
      return { address, chainId, accounts: [address], provider };
    },
    async disconnect(...props) {
      console.log("w3o disconnect", props);
      await onboard.disconnectWallet({ label: "" });
    },
    async getAccounts(...props) {
      console.log("w3o getAccounts", props);
      return onboard.state.get().wallets[0].accounts.map((account) => account.address as `0x${string}`);
    },
    async getChainId(...props) {
      console.log("w3o getChainId", props);
      return parseChainId(onboard.state.get().wallets[0].chains[0].id);
    },
    async getProvider(...props) {
      console.log("w3o getProvider", props);
      try {
        return onboard.state.get().wallets[0].provider;
      } catch (e) {
        console.error("w3o getProvider error", e);
      }
    },
    async isAuthorized(...props) {
      console.log("w3o isAuthorized check", props);
      return false;
    },
    onAccountsChanged(...props) {
      console.log("w3o onAccountsChanged", props);
    },
    onMessage(...props) {
      console.log("w3o onMessage", props);
    },
    onChainChanged(...props) {
      console.log("w3o onChainChanged", props);
    },
    onDisconnect(...props) {
      console.log("w3o onDisconnect", props);
    },
    type: "web3Onboard",
  }));
}

export const wagmiConfig = createConfig({
  // If wagmiChains.length we have a misconfiguration (and we log above).
  // So we just set mainnet in wagmi to keep it happy
  chains: wagmiChains.length > 0 ? (wagmiChains as [Chain, ...Chain[]]) : [mainnet],
  connectors: [web3OnboardWagmiConnector()],
  transports: wagmiTransports,
});

console.log("wagmiConfig", wagmiConfig);
