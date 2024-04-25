import { http, createConfig, Config } from "wagmi";
import { createConnector } from "@wagmi/core";
import { mainnet, optimism, optimismSepolia } from "wagmi/chains";
import { HttpTransport, Chain } from "viem";
import { onboard } from "./onboard";
import { WalletState } from "@web3-onboard/core";

const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string;
const OP_RPC_URL = process.env.NEXT_PUBLIC_OP_RPC_URL as string;
const OP_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL as string;
const enableMainnet = process.env.NEXT_PUBLIC_ENABLE_MAINNET === "on";
const enableOpMainnet = process.env.NEXT_PUBLIC_ENABLE_OP_MAINNET === "on";
const enableOpSepolia = process.env.NEXT_PUBLIC_ENABLE_OP_SEPOLIA === "on";

const ethChainId = Number("0x1");
const sepoliaChainId = Number("0xaa36a7");
const hardhatChainId = Number("0x7a69");
const baseGoerliChainId = Number("0x14a33");
const pgnChainId = Number("0x1a8");
const lineaChainId = Number("0xe708");
const lineaGoerliChainId = Number("0xe704");
const optimismChainId = Number("0xa");
const sepoliaOPChainId = Number("0xaa37dc");

export type ChainConfig = {
  id: number;
  token: string;
  label: string;
  rpcUrl: string;
  gtcContractAddr: `0x${string}`;
  stakingContractAddr: `0x${string}`;
  icon: string;
  explorer: string;
};

let enabledChainConfigs: ChainConfig[] = [];
let wagmiChains: Chain[] = [];
let wagmiTransports: Record<Config["chains"][number]["id"], HttpTransport> = {};

if (enableMainnet) {
  enabledChainConfigs.push({
    id: ethChainId,
    token: "ETH",
    label: "Ethereum",
    rpcUrl: MAINNET_RPC_URL,
    gtcContractAddr: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
    stakingContractAddr: "0xCc90105D4A2aa067ee768120AdA19886021dF422",
    icon: "./assets/eth-network-logo-white.svg",
    explorer: "https://etherscan.io/",
  });
  wagmiChains.push(mainnet);
  wagmiTransports[mainnet.id] = http(MAINNET_RPC_URL);
}

if (enableOpMainnet) {
  enabledChainConfigs.push({
    id: optimismChainId,
    token: "ETH",
    label: "Optimism",
    rpcUrl: OP_RPC_URL,
    gtcContractAddr: "0x1EBA7a6a72c894026Cd654AC5CDCF83A46445B08",
    stakingContractAddr: "0xf58Bb56E6e6EA7834478b470615e037df825C442",
    icon: "./assets/eth-op-logo.svg",
    explorer: "https://optimistic.etherscan.io/",
  });
  wagmiChains.push(optimism);
  wagmiTransports[optimism.id] = http(OP_RPC_URL);
}

if (enableOpSepolia) {
  enabledChainConfigs.push({
    // test net chains
    id: sepoliaOPChainId,
    token: "ETH",
    label: "OP Sepolia",
    rpcUrl: OP_SEPOLIA_RPC_URL,
    gtcContractAddr: "0xA4a53A625Ba96CFdFE2d138BeA8D13a167A343E2",
    stakingContractAddr: "0xc80e07d81828960F613baa57288192E56d417dA5",
    icon: "./assets/eth-op-logo.svg",
    explorer: "https://sepolia-optimism.etherscan.io/",
  });
  wagmiChains.push(optimismSepolia);
  wagmiTransports[optimismSepolia.id] = http(OP_SEPOLIA_RPC_URL);
}

export const chainConfigs: ChainConfig[] = enabledChainConfigs;

if (enabledChainConfigs.length === 0) {
  console.error(
    "\
*********************************************************************************\n\
* No chains enabled. Please check your environment variables.                   *\n\
*********************************************************************************\n"
  );
}

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

export type Web3OnboardWagmiConnectorParameters = {};

export function web3OnboardWagmiConnector(parameters: Web3OnboardWagmiConnectorParameters = {}) {
  return createConnector((config) => ({
    icon: undefined,
    id: "web3Onboard",
    name: "Web3 Onboard",
    connect: async () => {
      const wallets = await onboard.connectWallet();
      const walletData = parseWeb3OnboardWallet(wallets[0]);
      const address = walletData.address as `0x${string}`;
      const chainId = walletData.chain;
      return { address, chainId, accounts: [address] };
    },
    setup: async () => {},
    disconnect: async () => {
      await onboard.disconnectWallet({ label: "" });
    },
    getAccounts: () =>
      Promise.resolve(onboard.state.get().wallets[0].accounts.map((account) => account.address as `0x${string}`)),
    getChainId: async () => parseChainId(onboard.state.get().wallets[0].chains[0].id),
    getProvider: async () => onboard.state.get().wallets[0].provider,
    isAuthorized: async () => {
      console.log("isAuthorized check");
      return false;
    },
    onAccountsChanged: (...props) => {
      console.log("onAccountsChanged", props);
    },
    onMessage: () => {},
    onChainChanged: (...props) => {
      console.log("onChainChanged", props);
    },
    onDisconnect: (...props) => {
      console.log("onDisconnect", props);
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
