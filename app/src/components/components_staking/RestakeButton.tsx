import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { StakeData, useStakeHistoryQueryKey } from "./YourStakeHistory";

// TODO get rid of hardcoded address and delay
export const RestakeButton = ({ stake, address }: { stake: StakeData; address: string }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = useStakeHistoryQueryKey(address);

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    (async () => {
      if (isConfirmed) {
        toast(makeSuccessToastProps("Success", "Restake transaction confirmed"));
        // delay for indexer
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await queryClient.invalidateQueries({ queryKey });
      }
    })();
  }, [isConfirmed, toast, queryClient, queryKey]);

  useEffect(() => {
    if (error) {
      console.error("Restake failed:", error);
      toast(makeErrorToastProps("Failed", "Restake transaction failed"));
    }
  }, [error, toast]);

  return (
    <button
      onClick={() =>
        writeContract({
          address: "0xc80e07d81828960F613baa57288192E56d417dA5",
          abi: IdentityStakingAbi,
          functionName: "extendSelfStake",
          args: [BigInt(stake.lock_duration)],
        })
      }
      disabled={isPending || isConfirming}
    >
      Restake
    </button>
  );
};
