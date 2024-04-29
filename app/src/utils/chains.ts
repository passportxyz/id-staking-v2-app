import { http, Config } from "wagmi";
import { mainnet, optimism, optimismSepolia } from "wagmi/chains";
import { HttpTransport, Chain } from "viem";

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
export let wagmiChains: Chain[] = [];
export let wagmiTransports: Record<Config["chains"][number]["id"], HttpTransport> = {};

// Some wallets (e.g. Rainbow mobile) don't support some testnets in the required chain list
export let walletConnectRequiredChainIds: number[] = [];
export let walletConnectOptionalChainIds: number[] = [];

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
  walletConnectRequiredChainIds.push(ethChainId);
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
  walletConnectOptionalChainIds.push(optimismChainId);
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
  walletConnectOptionalChainIds.push(sepoliaOPChainId);
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
