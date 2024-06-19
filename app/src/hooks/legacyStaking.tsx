import { useReadContracts } from "wagmi";
import LegacyStakingAbi from "../abi/LegacyIdentityStaking.json";
import { LegacyRoundMeta, StakeData } from "@/utils/stakeHistory";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { ChainConfig } from "@/utils/chains";
import { AbiFunction } from "viem";
import { useMemo } from "react";

// Default to 6, but provide a way to override it
const MAX_ROUND_ID = process.env.NEXT_PUBLIC_MAX_LEGACY_ROUND_ID
  ? parseInt(process.env.NEXT_PUBLIC_MAX_LEGACY_ROUND_ID)
  : 6;

const roundIds = Array.from({ length: MAX_ROUND_ID }, (_, i) => i + 1);

type LegacyStakeQuery = {
  data: StakeData[];
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error?: any;
};

const useRoundMetadata = (
  chain: ChainConfig | undefined
): {
  data: Record<number, LegacyRoundMeta>;
  isPending: boolean;
  isLoading: boolean;
} => {
  const { data, isPending, isLoading } = useReadContracts({
    query: {
      staleTime: Infinity,
    },
    contracts:
      chain && chain.legacyContractAddr
        ? // Calls to get the metadata for rounds
          roundIds.map((roundId) => ({
            address: chain.legacyContractAddr,
            abi: LegacyStakingAbi as AbiFunction[],
            functionName: "fetchRoundMeta",
            chainId: chain.id,
            args: [roundId],
          }))
        : [],
  });

  const processedData = useMemo(
    () =>
      data
        ? data.reduce((allRoundsMetadata, d, index) => {
            const result: any[] | undefined = d.result as any[];
            if (result && result.length > 0) {
              allRoundsMetadata[roundIds[index]] = {
                lock_time: new Date(Number(result[0]) * 1000).toISOString(),
                unlock_time: new Date(Number(result[0] + result[1]) * 1000).toISOString(),
                name: result[3],
                round_id: roundIds[index],
              };
            } else {
              allRoundsMetadata[roundIds[index]] = {
                lock_time: new Date(0).toISOString(),
                unlock_time: new Date(0).toISOString(),
                name: "",
                round_id: 0,
              };
            }
            return allRoundsMetadata;
          }, {} as Record<number, LegacyRoundMeta>)
        : {},
    [data]
  );

  return {
    data: processedData,
    isPending: Boolean(chain?.legacyContractAddr) && isPending,
    isLoading: Boolean(chain?.legacyContractAddr) && isLoading,
  };
};

const useLegacySelfStakeQuery = (address: `0x${string}` | undefined, chain: ChainConfig | undefined) => {
  return useReadContracts({
    query: {
      staleTime: Infinity,
    },
    contracts:
      chain && chain.legacyContractAddr
        ? roundIds.map((roundId) => ({
            address: chain.legacyContractAddr,
            abi: LegacyStakingAbi as AbiFunction[],
            functionName: "getUserStakeForRound",
            args: [roundId, address],
          }))
        : [],
  });
};

// This is the only reliable way to get the query key for this query
export const useLegacySelfStakeQueryKey = (address: `0x${string}` | undefined, chain: ChainConfig | undefined) => {
  const query = useLegacySelfStakeQuery(address, chain);
  const queryKeyStringified = JSON.stringify(query.queryKey);
  return useMemo(() => {
    return query.queryKey;
    // The queryKey isn't properly memoized, so we use the stringified version
    // as our memo dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKeyStringified]);
};

export const useLegacySelfStake = (address: `0x${string}` | undefined, chain: ChainConfig): LegacyStakeQuery => {
  const {
    data: roundMeta,
    isPending: roundMetadataIsPending,
    isLoading: roundMetadataIsLoading,
  } = useRoundMetadata(chain);

  const { data, isPending, isLoading, ...rest } = useReadContracts({
    query: {
      staleTime: Infinity,
    },
    contracts:
      chain && chain.legacyContractAddr
        ? roundIds.map((roundId) => ({
            address: chain.legacyContractAddr,
            abi: LegacyStakingAbi as AbiFunction[],
            functionName: "getUserStakeForRound",
            args: [roundId, address],
          }))
        : [],
  });

  const legacyData: StakeData[] =
    chain && chain.legacyContractAddr && address && data
      ? data.reduce((acc: StakeData[], d, index) => {
          const amount = d.result as bigint;
          const round = roundMeta[roundIds[index]];
          if (d.status === "success" && amount > 0)
            acc.push({
              legacy: {
                type: "v1Single",
                round,
              },
              chain: chain.id,
              staker: address,
              stakee: address,
              amount: amount.toString(),
              unlock_time: round?.unlock_time || "",
              lock_time: round?.lock_time || "",
              last_updated_in_block: BigInt(0),
            });
          return acc;
        }, [])
      : [];

  return {
    data: legacyData,
    isPending: Boolean(chain?.legacyContractAddr) && (isPending || roundMetadataIsPending),
    isLoading: Boolean(chain?.legacyContractAddr) && (isLoading || roundMetadataIsLoading),
    ...rest,
  };
};

type V1GtcStake = {
  id: number;
  event_type: "SelfStake" | "Xstake";
  round_id: number;
  staker: `0x${string}`;
  address: `0x${string}`;
  amount: string;
  staked: boolean;
  block_number: number;
  tx_hash: `0x${string}`;
};

export const LEGACY_COMMUNITY_STAKE_BASE_KEY = "v1_gtc_stakes";

export const useLegacyCommunityStakes = (
  address: `0x${string}` | undefined,
  chain: ChainConfig | undefined
): LegacyStakeQuery => {
  let data: StakeData[] = [];
  let error: any = undefined;
  let isLoading = false;
  let isPending = false;
  let isError = false;

  const {
    data: roundMeta,
    isPending: roundMetadataIsPending,
    isLoading: roundMetadataIsLoading,
  } = useRoundMetadata(chain);

  const v1GtcStakeQueries = useQueries({
    queries:
      chain && chain.legacyContractAddr && address
        ? roundIds.map((roundId) => {
            return {
              staleTime: Infinity,
              queryKey: [LEGACY_COMMUNITY_STAKE_BASE_KEY, address, roundId],
              queryFn: async (): Promise<V1GtcStake[]> => {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_GET_GTC_STAKE_API}${address}/${roundId}`);
                return response.data?.results as V1GtcStake[];
              },
            };
          })
        : [],
  });

  if (chain && chain.legacyContractAddr && address) {
    isLoading = roundMetadataIsLoading || v1GtcStakeQueries.some((q) => q.isLoading);
    isPending = roundMetadataIsPending || v1GtcStakeQueries.some((q) => q.isPending);
    isError = v1GtcStakeQueries.some((q) => q.isError);

    if (isError) {
      error = v1GtcStakeQueries.find((q) => q.isError)?.error;
    } else if (!isPending) {
      data = v1GtcStakeQueries.reduce((acc: StakeData[], query, index) => {
        const data = query.data;
        if (data) {
          const unstakedCommunityStakes = data.reduce((acc, stake: V1GtcStake) => {
            if (stake.event_type === "Xstake" && stake.address.toLowerCase() !== address.toLowerCase()) {
              if (acc[stake.address] === undefined) {
                acc[stake.address] = BigInt(0);
              }
              if (stake.staked) {
                acc[stake.address] += BigInt(stake.amount.replace(".", ""));
              } else {
                acc[stake.address] -= BigInt(stake.amount.replace(".", ""));
              }

              if (acc[stake.address] === 0n) {
                delete acc[stake.address];
              }
            }
            return acc;
          }, {} as Record<`0x${string}`, bigint>);

          const unstakedCommunityStakesAsList = Object.values(unstakedCommunityStakes);

          const totalAmountForRound = unstakedCommunityStakesAsList.reduce((acc, cs) => {
            acc += cs;
            return acc;
          }, 0n);

          const round = roundMeta[roundIds[index]];
          if (round && totalAmountForRound && unstakedCommunityStakesAsList.length > 0) {
            acc.push({
              legacy: {
                type: "v1Community",
                stakees: Object.keys(unstakedCommunityStakes) as `0x${string}`[],
                amounts: unstakedCommunityStakesAsList.map((a) => a.toString()),
                round,
              },
              chain: chain.id,
              amount: totalAmountForRound.toString(),
              lock_time: round.lock_time,
              unlock_time: round.unlock_time,
              staker: address || "0x",
              stakee: "0x",
              last_updated_in_block: BigInt(0),
            });
          }
        }
        return acc;
      }, []);
    }
  }

  return { data, isLoading, isPending, isError, error };
};
