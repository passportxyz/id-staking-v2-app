import { useReadContracts } from "wagmi";
import LegacyStakingAbi from "../abi/LegacyIdentityStaking.json";
import { LegacyRoundMeta, StakeData } from "@/utils/stakeHistory";
import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { ChainConfig } from "@/utils/chains";

const roundIds = [1, 2, 3, 4, 5, 6];

export const useRoundMetadata = (chain: ChainConfig | undefined): LegacyRoundMeta[] => {
  const readResult = useReadContracts({
    contracts:
      chain && chain.legacyContractAddr
        ? [
            // Calls to get the metadata for rounds
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [1],
            },
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [2],
            },
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [3],
            },
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [4],
            },
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [5],
            },
            {
              address: chain.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "fetchRoundMeta",
              chainId: chain.id,
              args: [6],
            },
          ]
        : [],
  });
  const roundMeta: LegacyRoundMeta[] = readResult.data
    ? readResult.data.map((d, index) => {
        const result: any[] | undefined = d.result as any[];
        if (result && result.length > 0) {
          return {
            lock_time: new Date(Number(result[0]) * 1000).toISOString(),
            unlock_time: new Date(Number(result[0] + result[1]) * 1000).toISOString(),
            round_id: roundIds[index],
          };
        } else {
          return {
            lock_time: new Date(0).toISOString(),
            unlock_time: new Date(0).toISOString(),
            round_id: 0,
          };
        }
      })
    : [];

  return roundMeta;
};

export const useSelfStake = (address: `0x${string}` | undefined, chain: ChainConfig | undefined): StakeData[] => {
  const roundMeta = useRoundMetadata(chain);

  const readResult = useReadContracts({
    contracts:
      chain && chain.legacyContractAddr
        ? [
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [1, address],
            },
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [2, address],
            },
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [3, address],
            },
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [4, address],
            },
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [5, address],
            },
            {
              address: chain?.legacyContractAddr,
              abi: LegacyStakingAbi,
              functionName: "getUserStakeForRound",
              args: [6, address],
            },
          ]
        : [],
  });

  const legacyData: StakeData[] =
    chain && chain.legacyContractAddr && address && readResult.data
      ? readResult.data.reduce((acc: StakeData[], d, index) => {
          const amount = d.result as bigint;
          if (d.status === "success" && amount > 0)
            acc.push({
              type: "v1Single",
              round_id: roundMeta[index]?.round_id,
              chain: chain.id,
              staker: address,
              stakee: address,
              amount: amount.toString(),
              unlock_time: roundMeta[index]?.unlock_time || "-",
              lock_time: roundMeta[index]?.lock_time || "-",
            });
          return acc;
        }, [])
      : [];

  return legacyData;
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

export const useCommunityStakes = (address: `0x${string}` | undefined, chain: ChainConfig | undefined): StakeData[] => {
  const roundMeta = useRoundMetadata(chain);
  const v1GtcStakeQueries = useQueries({
    queries:
      chain && chain.legacyContractAddr && address
        ? roundIds.map((roundId) => {
            return {
              queryKey: ["userv1_gtc_stakes", roundId, address],
              queryFn: async (): Promise<V1GtcStake[]> => {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_GET_GTC_STAKE_API}${address}/${roundId}`);
                return response.data?.results as V1GtcStake[];
              },
            };
          })
        : [],
  });

  // We have legacy stalkes only for mainnet
  if (chain && chain.legacyContractAddr && address) {
    const v1Stakes: StakeData[] = v1GtcStakeQueries.reduce((acc: StakeData[], query, index) => {
      const data = query.data;
      if (data) {
        const unstakedCommunityStakes = data.reduce((acc, stake: V1GtcStake) => {
          if (stake.event_type === "Xstake") {
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

        const round = roundMeta[index];
        if (round && totalAmountForRound && unstakedCommunityStakesAsList.length > 0) {
          acc.push({
            type: "v1Community",
            chain: chain.id,
            amount: totalAmountForRound.toString(),
            lock_time: round.lock_time,
            unlock_time: round.unlock_time,
            staker: address || "0x",
            stakee: "0x",
            stakees: Object.keys(unstakedCommunityStakes) as `0x${string}`[],
            round_id: round.round_id,
          });
        }
      }
      return acc;
    }, []);

    return v1Stakes;
  }

  return [];
};
