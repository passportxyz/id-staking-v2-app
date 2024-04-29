import { wagmiChains, wagmiTransports } from "./chains";

import { createConnector, createConfig } from "@wagmi/core";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { onboard } from "./onboard";
import { WalletState } from "@web3-onboard/core";

const DEBUG_LOGS = true;
const debugLog = (...args: any[]) => {
  if (DEBUG_LOGS) {
    console.log(...args);
  }
};

// TODO copied from walletStore.tsx
const parseChainId = (chainIdStr?: string) => {
  return chainIdStr
    ? chainIdStr.startsWith("0x")
      ? parseInt(chainIdStr.substring(2), 16)
      : parseInt(chainIdStr.substring(2), 10)
    : 1;
};

const simpleArraysMatch = (a: any[], b: any[]) => a.length === b.length && a.every((val, idx) => val === b[idx]);

export function web3OnboardWagmiConnector() {
  debugLog("w3o creating web3OnboardWagmiConnector");
  let unsubscribeState: () => void | undefined;
  let previousChainIdStr: string | undefined;
  let previousAccounts: `0x${string}`[] | undefined;
  let connected = false;
  return createConnector(({ emitter }) => ({
    icon: undefined,
    id: "web3Onboard",
    name: "Web3 Onboard",
    type: "web3Onboard",
    async setup(...props) {
      debugLog("w3o setup", props, this);
      // Unsubscribe from previous state, if it is defined
      // (this happens in the dev environment when the module reloads)
      unsubscribeState?.();

      // Subscribe to the wallet state
      const { unsubscribe } = onboard.state.select("wallets").subscribe(this.onWalletsChange.bind(this));

      //  (re)define unsubscribeState
      unsubscribeState = unsubscribe.bind(this);
    },
    async connect(...props) {
      debugLog("w3o connect", props);
      throw new Error("Not implemented, use the web3onboard methods instead");
    },
    async disconnect(...props) {
      debugLog("w3o disconnect", props);
      throw new Error("Not implemented, use the web3onboard methods instead");
    },
    async getAccounts(...props) {
      debugLog("w3o getAccounts", props);
      return onboard.state.get().wallets[0].accounts.map((account) => account.address as `0x${string}`);
    },
    async getChainId(...props) {
      debugLog("w3o getChainId", props);
      return parseChainId(onboard.state.get().wallets[0].chains[0].id);
    },
    async getProvider(...props) {
      // Returns undefined if no provider is available, this
      // seems to be fine for the wagmi connector
      debugLog("w3o getProvider", props);
      return onboard.state.get().wallets[0]?.provider;
    },
    async isAuthorized(...props) {
      debugLog("w3o isAuthorized", props);
      return false;
    },
    onAccountsChanged(accounts) {
      debugLog("w3o onAccountsChanged", accounts);
      emitter.emit("change", { accounts } as { accounts: `0x${string}`[] });
    },
    onChainChanged(chainIdStr) {
      const chainId = parseChainId(chainIdStr);
      debugLog("w3o onChainChanged", chainId);
      emitter.emit("change", { chainId });
    },
    onDisconnect() {
      debugLog("w3o onDisconnect", this);
      debugLog("unsubscribeState", unsubscribeState);
      unsubscribeState?.();
      emitter.emit("disconnect");
      connected = false;
    },
    async switchChain({ chainId }) {
      debugLog("w3o switchChain", chainId);
      throw new Error("Not implemented, use the web3onboard methods instead");
      // const chainIdHex = `0x${chainId?.toString(16)}`;
      // await onboard.setChain({ chainId: chainIdHex });
      // const chainConfig = chainConfigs.find((chain) => chain.id === chainId);
      // if (!chainConfig) {
      //   throw new Error("Chain not configured");
      // }
      // if (chainConfig.token !== "ETH") {
      //   console.log("Chain token not supported, add it to utils/wagmi.ts");
      //   throw new Error("Chain token not supported");
      // }
      // return {
      //   id: chainId,
      //   name: chainConfig.label,
      //   nativeCurrency: {
      //     name: "Ether",
      //     symbol: "ETH",
      //     decimals: 18,
      //   },
      //   rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
      //   blockExplorerUrls: [chainConfig.explorer],
      // };
    },
    // *** Custom methods ***
    // The rest are custom methods that are not part of the connector interface
    // **********************
    //
    // The type definition for (optional) onConnect doesn't work here,
    // so defining _onConnect instead
    async _onConnect(accounts: `0x${string}`[], chainIdStr: string) {
      debugLog("w3o _onConnect", accounts, chainIdStr);
      const chainId = parseChainId(chainIdStr);
      emitter.emit("connect", { chainId, accounts });
      connected = true;
    },
    async onWalletsChange(wallets: WalletState[]) {
      debugLog("w3o wallet state changed", wallets, this);
      if (!wallets.length) {
        if (connected) {
          this.onDisconnect();
        }
      } else {
        const wallet = onboard.state.get().wallets[0];
        const chainIdStr = wallet.chains[0].id;
        const accounts = wallet.accounts.map((account) => account.address as `0x${string}`);
        if (!connected) {
          this._onConnect.call(this, accounts, chainIdStr);
        } else {
          if (previousChainIdStr !== chainIdStr) {
            this.onChainChanged.call(this, chainIdStr);
          }
          if ((!previousAccounts && accounts) || (previousAccounts && !simpleArraysMatch(accounts, previousAccounts))) {
            this.onAccountsChanged.call(this, accounts);
          }
        }
        previousChainIdStr = chainIdStr;
        previousAccounts = accounts;
      }
    },
  }));
}

export const wagmiConfig = createConfig({
  // If wagmiChains.length we have a misconfiguration (and we log in chains.ts).
  // So we just set mainnet in wagmi to keep it happy
  chains: wagmiChains.length > 0 ? (wagmiChains as [Chain, ...Chain[]]) : [mainnet],
  connectors: [web3OnboardWagmiConnector()],
  transports: wagmiTransports,
});
