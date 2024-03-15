import { http, createConfig } from "wagmi";
import { mainnet, optimism, optimismSepolia } from "wagmi/chains";

const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_MAINNET_RPC_URL as string;

const OP_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_OP_RPC_URL as string;
const OP_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_OP_SEPOLIA_RPC_URL as string;

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
};

export const chainConfigs: ChainConfig[] = [
  {
    id: ethChainId,
    token: "ETH",
    label: "Ethereum",
    rpcUrl: MAINNET_RPC_URL,
    gtcContractAddr: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
    stakingContractAddr: "0x0",
    icon: "./assets/eth-network-logo-white.svg",
  },
  {
    id: optimismChainId,
    token: "ETH",
    label: "Optimism",
    rpcUrl: OP_RPC_URL,
    gtcContractAddr: "0x1EBA7a6a72c894026Cd654AC5CDCF83A46445B08",
    stakingContractAddr: "0x0",
    icon: "./assets/eth-op-logo.svg",
  },
  {
    // test net chains
    id: sepoliaOPChainId,
    token: "ETH",
    label: "OP Sepolia",
    rpcUrl: OP_SEPOLIA_RPC_URL,
    gtcContractAddr: "0xB047Da70ACb1690101b165669419d6B8b7A38260", //
    stakingContractAddr: "0xc80e07d81828960F613baa57288192E56d417dA5", //
    icon: "./assets/eth-op-logo.svg",
  },
];

export const wagmiConfig = createConfig({
  chains: [mainnet, optimism, optimismSepolia],
  transports: {
    [mainnet.id]: http(MAINNET_RPC_URL),
    [optimism.id]: http(OP_RPC_URL),
    [optimismSepolia.id]: http(OP_SEPOLIA_RPC_URL),
  },
});
