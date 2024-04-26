import React, { useMemo } from "react";
import { useDatastoreConnectionContext } from "@/context/datastoreConnectionContext";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useChainId } from "wagmi";

export type LegacyRoundMeta = {
  unlock_time: string;
  lock_time: string;
  round_id: number;
};

export type StakeData = {
  type?: "v1Single" | "v1Community" | "v2"; // undefine dis to be considered v2 by default
  round_id?: number; // Only required for legacy (v1Single) staking
  chain: number;
  staker: `0x${string}`;
  stakee: `0x${string}`;
  stakees?: `0x${string}`[]; // Only required for legacy (v1Community) staking
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/ceramic-cache/stake/gtc`, {
        headers: {
          Authorization: `Bearer ${dbAccessToken}`,
        },
      });

      return response.data.items.map((item: StakeData) => {
        // NOTE: Modify the respose format
        // Remove the `.` symbol form the `amount` to not modify the current implementation at the moment
        // This fix is required because initially the API return the amount value like an big integer
        // The API returned data format was changed to match the data format returned by the `/registry/gtc-stake` API.
        return {
          ...item,
          amount: item.amount.replace(".", ""),
        };
      });
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

export const useStakeOnYouHistoryQuery = (address: string | undefined) => {
  const { data, ...rest } = useStakeHistoryQuery(address);
  const chainId = useChainId();
  const filteredData = useMemo(
    () =>
      data?.filter(
        (stake) =>
          stake.staker.toLowerCase() !== address?.toLowerCase() &&
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
