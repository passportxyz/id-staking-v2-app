import React, { useMemo } from "react";
import { useDatastoreConnectionContext } from "@/context/datastoreConnectionContext";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useChainId } from "wagmi";

export type StakeData = {
  chain: number;
  staker: `0x${string}`;
  stakee: `0x${string}`;
  amount: string;
  unlock_time: string;
  lock_time: string;
};

export const useStakeHistoryQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["stakeHistory", address || ""], [address]);
};

export const useStakeHistoryQuery = (address: string | undefined) => {
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();
  const queryKey = useStakeHistoryQueryKey(address);
  return useQuery({
    queryKey,
    queryFn: async (): Promise<StakeData[]> => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CERAMIC_CACHE_ENDPOINT}/stake/gtc`, {
        headers: {
          Authorization: `Bearer ${dbAccessToken}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(address) && dbAccessTokenStatus === "connected",
  });
};

export const useYourStakeHistoryQuery = (address: string | undefined) => {
  const { data, ...rest } = useStakeHistoryQuery(address);
  const chainId = useChainId();
  const filteredData = useMemo(
    () =>
      data?.filter(
        (stake) =>
          stake.staker.toLowerCase() === address?.toLowerCase() &&
          stake.stakee.toLowerCase() === address?.toLowerCase() &&
          stake.chain === chainId
      ),
    [data, address, chainId]
  );

  return {
    ...rest,
    data: filteredData,
  };
};

export const useCommunityStakeHistoryQuery = (address: string | undefined) => {
  const { data, ...rest } = useStakeHistoryQuery(address);
  const chainId = useChainId();
  const filteredData = useMemo(
    () =>
      data?.filter(
        (stake) =>
          stake.staker.toLowerCase() === address?.toLowerCase() &&
          stake.stakee.toLowerCase() !== address.toLowerCase() &&
          stake.chain === chainId
      ),
    [data, address, chainId]
  );

  return {
    ...rest,
    data: filteredData,
  };
};
