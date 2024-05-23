import { http, Config } from "wagmi";
import { mainnet, optimism, optimismSepolia, arbitrum } from "wagmi/chains";
import { HttpTransport, Chain } from "viem";

const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string;
const OP_RPC_URL = process.env.NEXT_PUBLIC_OP_RPC_URL as string;
const OP_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL as string;

const ARBITRUM_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL as string;

const enableMainnet = process.env.NEXT_PUBLIC_ENABLE_MAINNET === "on";
const enableOpMainnet = process.env.NEXT_PUBLIC_ENABLE_OP_MAINNET === "on";
const enableOpSepolia = process.env.NEXT_PUBLIC_ENABLE_OP_SEPOLIA === "on";

const enableArbitrumMainnet = process.env.NEXT_PUBLIC_ENABLE_ARBITRUM_MAINNET === "on";

const ethChainId = Number("0x1");
const sepoliaChainId = Number("0xaa36a7");
const hardhatChainId = Number("0x7a69");
const baseGoerliChainId = Number("0x14a33");
const pgnChainId = Number("0x1a8");
const lineaChainId = Number("0xe708");
const lineaGoerliChainId = Number("0xe704");
const optimismChainId = Number("0xa");
const sepoliaOPChainId = Number("0xaa37dc");

const arbitrumChainId = Number("0xa4b1");

export type ChainConfig = {
  id: number;
  token: string;
  label: string;
  rpcUrl: string;
  gtcContractAddr: `0x${string}`;
  stakingContractAddr: `0x${string}`;
  legacyContractAddr: `0x${string}` | undefined;
  icon: string;
  explorer: string;
};

let enabledChainConfigs: ChainConfig[] = [];
export let wagmiChains: Chain[] = [];
export let wagmiTransports: Record<Config["chains"][number]["id"], HttpTransport> = {};

if (enableMainnet) {
  enabledChainConfigs.push({
    id: ethChainId,
    token: "ETH",
    label: "Ethereum",
    rpcUrl: MAINNET_RPC_URL,
    gtcContractAddr: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
    stakingContractAddr: "0xCc90105D4A2aa067ee768120AdA19886021dF422",
    legacyContractAddr: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
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
    legacyContractAddr: undefined,
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
    // legacyContractAddr: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
    legacyContractAddr: undefined,
    icon: "./assets/eth-op-logo.svg",
    explorer: "https://sepolia-optimism.etherscan.io/",
  });
  wagmiChains.push(optimismSepolia);
  wagmiTransports[optimismSepolia.id] = http(OP_SEPOLIA_RPC_URL);
}

if (enableArbitrumMainnet) {
  enabledChainConfigs.push({
    id: arbitrumChainId,
    token: "ETH",
    label: "Arbitrum",
    rpcUrl: ARBITRUM_RPC_URL,
    gtcContractAddr: "0x7f9a7DB853Ca816B9A138AEe3380Ef34c437dEe0",
    stakingContractAddr: "0xd2747B3e715483A870793a6Cfa04006C00Cd597D",
    legacyContractAddr: undefined,
    icon: "./assets/arbitrum-icon.svg",
    explorer: "https://arbiscan.io/",
  });
  wagmiChains.push(arbitrum);
  wagmiTransports[arbitrum.id] = http(ARBITRUM_RPC_URL);
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
