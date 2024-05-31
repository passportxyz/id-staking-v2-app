import { create } from "zustand";

type SelfStakeTxInfo = {
  blockNumber: bigint | undefined;
  timestamp: Date | undefined;
};

/**
 * The purpose of this store is to hold information about the self-stake transactions.
 * So that it can be queried when needed form other components as well.
 * 
 * For now for each chain and connected address it will store a map like:
 * 
 *  chainId -> ( address -> SelfStakeTxInfo )
 */
export const useSelfStakeTxStore = create<{
  // map chainId -> ( address -> SelfStakeTxInfo )
  selfStakeTxInfoMap: Record<number, Record<string, SelfStakeTxInfo>>;
  updateSelfStakeTxInfo: (chainId: number, address: string, selfStakeTxInfo: Partial<SelfStakeTxInfo>) => void;
}>((set) => ({
  selfStakeTxInfoMap: {},
  updateSelfStakeTxInfo: (chainId: number, address: string, selfStakeTxInfo: Partial<SelfStakeTxInfo>) =>
    set((state) => {
      const chainRecord = state.selfStakeTxInfoMap[chainId] || {};
      const addressRecord = chainRecord[address] || {};
      const newStakeTxInfo = {
        ...(addressRecord || {}),
        ...selfStakeTxInfo,
      };
      return {
        ...state,
        selfStakeTxInfoMap: { ...state.selfStakeTxInfoMap, [chainId]: { ...chainRecord, [address]: newStakeTxInfo } },
      };
    }),
}));
