import React, { useCallback } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useReadContract } from "wagmi";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, formatDate, useConnectedChain } from "@/utils/helpers";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { StakeData } from "@/utils/stakeHistory";
import { parseEther } from "viem";

const useSelfStakeTx = ({
  address,
  inputValue,
  lockedPeriodSeconds,
  onConfirm,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriodSeconds: bigint;
  onConfirm: () => void;
}) => {
  const connectedChain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);
  const valueToStake = parseEther(inputValue);

  const allowanceCheck = useReadContract({
    abi: ERC20,
    address: connectedChain.gtcContractAddr,
    functionName: "allowance",
    chainId: connectedChain.id,
    args: [address, connectedChain.stakingContractAddr],
  });

  const stakingHandler = useStakeTxHandler({ queryKey, txTitle: "Stake", onConfirm });

  const submitStakeTx = () => {
    let functionName = "extendSelfStake";
    const args = [lockedPeriodSeconds];
    if (valueToStake > 0n) {
      functionName = "selfStake";
      args.unshift(valueToStake);
    }
    stakingHandler.writeContract({
      address: connectedChain.stakingContractAddr,
      abi: IdentityStakingAbi,
      chainId: connectedChain.id,
      functionName,
      args,
    });
  };

  // Automatically call stakeTx once confirmed
  const approvalHandler = useStakeTxHandler({ txTitle: "Spending approval", onConfirm: submitStakeTx });

  const submitApprovalTx = () => {
    approvalHandler.writeContract({
      address: connectedChain.gtcContractAddr,
      abi: ERC20,
      functionName: "approve",
      chainId: connectedChain.id,
      args: [connectedChain.stakingContractAddr, valueToStake],
    });
  };

  const selfStake = useCallback(() => {
    const isSpendingApproved = allowanceCheck.isSuccess && (allowanceCheck.data as bigint) >= valueToStake;

    if (!isSpendingApproved) {
      // The staking tx will automatically trigger once the approval tx is confirmed
      // due to the onConfirm callback in the approvalHandler
      submitApprovalTx();
    } else {
      submitStakeTx();
    }
  }, [submitApprovalTx, submitStakeTx, address, connectedChain, valueToStake]);

  const isLoading = approvalHandler.isLoading || stakingHandler.isLoading || allowanceCheck.isLoading;

  return { selfStake, isLoading };
};

const UpdateModalDataLine = ({
  label,
  children,
  emphasis,
}: {
  label: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) => (
  <div className={`flex justify-between py-2 ${emphasis ? "font-bold" : "text-color-2"}`}>
    <span className={emphasis ? "text-color-6" : "text-inherit"}>{label}</span>
    <div>{children}</div>
  </div>
);

const SelfStakeModalBody = ({
  address,
  inputValue,
  lockedPeriodMonths,
  lockedPeriodSeconds,
  stakeToUpdate,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriodMonths: number;
  lockedPeriodSeconds: number;
  stakeToUpdate?: StakeData;
}) => {
  if (stakeToUpdate) {
    const oldAmount = formatAmount(stakeToUpdate.amount);
    const newAmount = parseFloat(inputValue) >= 0 ? inputValue : "0";
    const total = formatAmount((parseEther(inputValue) + BigInt(stakeToUpdate.amount)).toString());

    const oldUnlockDate = new Date(stakeToUpdate.unlock_time);

    const newUnlockDate = new Date(Date.now() + lockedPeriodSeconds * 1000);

    return (
      <div>
        <UpdateModalDataLine label="Address">
          <DisplayAddressOrENS user={address} max={20} />
        </UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="Old amount">{oldAmount} GTC</UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="New amount" emphasis>
          +{newAmount} GTC
        </UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="Total" emphasis>
          {total} GTC
        </UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="Old unlock date">{formatDate(oldUnlockDate)}</UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="New lockup period" emphasis>
          <DisplayDuration seconds={lockedPeriodSeconds} />
        </UpdateModalDataLine>
        <hr className="border-foreground-4" />
        <UpdateModalDataLine label="New unlock date">{formatDate(newUnlockDate)}</UpdateModalDataLine>
      </div>
    );
  }
  return (
    <div>
      <DataLine label="Address" value={<DisplayAddressOrENS user={address} max={20} />} />
      <hr className="border-foreground-4" />
      <DataLine label="Amount" value={`${inputValue} GTC`} />
      <hr className="border-foreground-4" />
      <DataLine label="Lockup" value={<div>{lockedPeriodMonths} months</div>} />
    </div>
  );
};

export const SelfStakeModal = ({
  address,
  inputValue,
  lockedPeriodMonths,
  stakeToUpdate,
  isOpen,
  onClose,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriodMonths: number;
  isOpen: boolean;
  onClose: () => void;
  stakeToUpdate?: StakeData;
}) => {
  const lockedPeriodSeconds = BigInt(lockedPeriodMonths) * 30n * 24n * 60n * 60n;

  const { selfStake, isLoading } = useSelfStakeTx({
    address,
    inputValue,
    lockedPeriodSeconds,
    onConfirm: onClose,
  });

  return (
    <StakeModal
      title={stakeToUpdate ? "Update self stake" : "Stake on yourself"}
      buttonText={stakeToUpdate ? "Update stake" : "Stake"}
      onButtonClick={selfStake}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <SelfStakeModalBody
        address={address}
        inputValue={inputValue}
        lockedPeriodMonths={lockedPeriodMonths}
        lockedPeriodSeconds={Number(lockedPeriodSeconds)}
        stakeToUpdate={stakeToUpdate}
      />
    </StakeModal>
  );
};
