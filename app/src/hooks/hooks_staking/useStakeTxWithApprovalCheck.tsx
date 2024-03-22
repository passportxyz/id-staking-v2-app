import { useCallback, useMemo } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useReadContract } from "wagmi";
import { useConnectedChain } from "@/utils/helpers";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";

export const useStakeTxWithApprovalCheck = ({
  address,
  requiredApprovalAmount,
  functionName,
  functionArgs,
  onConfirm,
}: {
  address: `0x${string}`;
  requiredApprovalAmount: bigint;
  functionName: string;
  functionArgs: any[];
  onConfirm: () => void;
}) => {
  const queryKey = useStakeHistoryQueryKey(address);
  const connectedChain = useConnectedChain();

  const {
    isLoading: allowanceCheckIsLoading,
    isSuccess: allowanceCheckIsSuccess,
    data: allowance,
  } = useReadContract({
    abi: ERC20,
    address: connectedChain.gtcContractAddr,
    functionName: "allowance",
    chainId: connectedChain.id,
    args: [address, connectedChain.stakingContractAddr],
  });

  const { isLoading: stakeIsLoading, writeContract: stakeWriteContract } = useStakeTxHandler({
    queryKey,
    txTitle: "Stake",
    onConfirm,
  });

  const submitStakeTx = useCallback(() => {
    stakeWriteContract({
      address: connectedChain.stakingContractAddr,
      abi: IdentityStakingAbi,
      chainId: connectedChain.id,
      functionName,
      args: functionArgs,
    });
  }, [stakeWriteContract, connectedChain, functionName, functionArgs]);

  // Automatically call stakeTx once confirmed
  const { isLoading: approvalIsLoading, writeContract: approvalWriteContract } = useStakeTxHandler({
    txTitle: "Spending approval",
    onConfirm: submitStakeTx,
  });

  const submitApprovalTx = useCallback(() => {
    approvalWriteContract({
      address: connectedChain.gtcContractAddr,
      abi: ERC20,
      functionName: "approve",
      chainId: connectedChain.id,
      args: [connectedChain.stakingContractAddr, requiredApprovalAmount],
    });
  }, [approvalWriteContract, connectedChain, requiredApprovalAmount]);

  const stake = useCallback(() => {
    const isSpendingApproved = allowanceCheckIsSuccess && (allowance as bigint) >= requiredApprovalAmount;

    if (!isSpendingApproved) {
      // The staking tx will automatically trigger once the approval tx is confirmed
      // due to the onConfirm callback in the approvalHandler
      submitApprovalTx();
    } else {
      submitStakeTx();
    }
  }, [submitApprovalTx, submitStakeTx, requiredApprovalAmount, allowanceCheckIsSuccess, allowance]);

  const isLoading = allowanceCheckIsLoading || approvalIsLoading || stakeIsLoading;

  return useMemo(() => ({ stake, isLoading }), [stake, isLoading]);
};
