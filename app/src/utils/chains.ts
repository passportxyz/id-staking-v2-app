
// TODO: this is  a steking specific file 
// RPC urls
const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_MAINNET_RPC_URL as string;

const OP_RPC_URL = process.env.NEXT_PUBLIC_PASSPORT_OP_RPC_URL as string; // 

const sepoliaChainId = "0xaa36a7";
const hardhatChainId = "0x7a69";
const baseGoerliChainId = "0x14a33";
const pgnChainId = "0x1a8";
const lineaChainId = "0xe708";
const lineaGoerliChainId = "0xe704";
const optimismChainId = "0xa";
const sepoliaOPChainId = "0xaa37dc";

type ChainConfig = {
  id: string;
  token: string;
  label: string;
  rpcUrl: string;
  icon: string;
};

export const chainConfigs: ChainConfig[] = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum",
    rpcUrl: MAINNET_RPC_URL,
    icon: "./assets/eth-network-logo.svg",
  },
  {
    id: optimismChainId,
    token: "ETH",
    label: "Optimism",
    rpcUrl: OP_RPC_URL,
    icon: "./assets/eth-network-logo.svg",
  },
];

