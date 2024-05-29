import { create } from "zustand";

type SelfStakeTxInfo = {
  blockNumber: bigint | undefined;
  timestamp: Date | undefined;
};

/**
 * The purpose of this store is to hold information about the community-stake transactions.
 * So that it can be queried when needed form other components as well.
 * 
 * For now for each chain and connected address it will store a map like:
 * 
 *  chainId -> ( address -> SelfStakeTxInfo )
 */
export const useCommunityStakeTxStore = create<{
  // map chainId -> ( address -> SelfStakeTxInfo )
  communityStakeTxInfoMap: Record<number, Record<string, SelfStakeTxInfo>>;
  updateCommunityStakeTxInfo: (chainId: number, address: string, selfStakeTxInfo: Partial<SelfStakeTxInfo>) => void;
}>((set) => ({
  communityStakeTxInfoMap: {},
  updateCommunityStakeTxInfo: (chainId: number, address: string, selfStakeTxInfo: Partial<SelfStakeTxInfo>) =>
    set((state) => {
      const chainRecord = state.communityStakeTxInfoMap[chainId] || {};
      const addressRecord = chainRecord[address] || {};
      const newStakeTxInfo = {
        ...(addressRecord || {}),
        ...selfStakeTxInfo,
      };
      return {
        ...state,
        communityStakeTxInfoMap: { ...state.communityStakeTxInfoMap, [chainId]: { ...chainRecord, [address]: newStakeTxInfo } },
      };
    }),
}));
