import { useReadContracts } from "wagmi";
import LegacyStakingAbi from "../abi/LegacyIdentityStaking.json";
import { LegacyRoundMeta, StakeData, useYourStakeHistoryQuery } from "@/utils/stakeHistory";

const roundIds = [1, 2, 3, 4, 5, 6];

export const useRoundMetadata = (chainId: number | undefined): LegacyRoundMeta[] => {
  const roundIds = [1, 2, 3, 4, 5, 6];
  const readResult = useReadContracts({
    contracts: [
      // Calls to get the metadata for rounds
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [1],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [2],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [3],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [4],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [5],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "fetchRoundMeta",
        chainId: chainId,
        args: [6],
      },
    ],
  });
  const roundMeta: LegacyRoundMeta[] = readResult.data
    ? readResult.data?.slice(0, 6).map((d, index) => {
        const result: any[] = d.result as any[];
        return {
          lock_time: new Date(Number(result[0]) * 1000).toISOString(),
          unlock_time: new Date(Number(result[0] + result[1]) * 1000).toISOString(),
          round_id: roundIds[index],
        };
      })
    : [];

  return roundMeta;
};

export const useSelfStake = (address: `0x${string}` | undefined, chainId: number | undefined): StakeData[] => {
  const roundMeta = useRoundMetadata(chainId);

  const readResult = useReadContracts({
    contracts: [
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [1, address],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [2, address],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [3, address],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [4, address],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [5, address],
      },
      {
        address: "0x0E3efD5BE54CC0f4C64e0D186b0af4b7F2A0e95F",
        abi: LegacyStakingAbi,
        functionName: "getUserStakeForRound",
        args: [6, address],
      },
    ],
  });

  const legacyData: StakeData[] =
    readResult.data?.reduce((acc: StakeData[], d, index) => {
      const amount = d.result as bigint;
      if (d.status === "success" && amount > 0)
        acc.push({
          type: "v1",
          round_id: roundMeta[index]?.round_id,
          chain: chainId || 0,
          staker: address || "0x",
          stakee: address || "0x",
          amount: amount.toString(),
          unlock_time: roundMeta[index]?.unlock_time || "-",
          lock_time: roundMeta[index]?.lock_time || "-",
        });
      return acc;
    }, []) || [];

  return legacyData;
};
