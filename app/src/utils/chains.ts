import { http, createConfig } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";

const MAINNET_RPC_URL = process.env
  .NEXT_PUBLIC_PASSPORT_MAINNET_RPC_URL as string;

const OP_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_OP_RPC_URL as string;

console.log("geri: MAINNET_RPC_URL", MAINNET_RPC_URL);
console.log("geri: OP_RPC_URL", OP_RPC_URL);

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
  icon: string;
};

export const chainConfigs: ChainConfig[] = [
  {
    id: ethChainId,
    token: "ETH",
    label: "Ethereum",
    rpcUrl: MAINNET_RPC_URL,
    gtcContractAddr: "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f",
    icon: "./assets/eth-network-logo-white.svg",
  },
  {
    id: optimismChainId,
    token: "ETH",
    label: "Optimism",
    rpcUrl: OP_RPC_URL,
    gtcContractAddr: "0x1EBA7a6a72c894026Cd654AC5CDCF83A46445B08",
    icon: "./assets/eth-op-logo.svg",
  },
];

export const wagmiConfig = createConfig({
  chains: [mainnet, optimism],
  transports: {
    [mainnet.id]: http(MAINNET_RPC_URL),
    [optimism.id]: http(OP_RPC_URL),
  },
});
