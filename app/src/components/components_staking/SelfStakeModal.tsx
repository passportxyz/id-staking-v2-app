import React, { useCallback, useEffect, useMemo } from "react";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, formatDate, getLockSeconds } from "@/utils/helpers";
import { StakeData } from "@/utils/stakeHistory";
import { parseEther } from "viem";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";
import { useSelfStakeTxStore } from "@/hooks/hooks_staking/useSelfStakeTxStore";
import { useChainId } from "wagmi";

export const useSelfStakeTx = ({ address }: { address: `0x${string}` }) => {
  const { blockNumber, stake, isLoading, isConfirmed, approvalIsLoading } = useStakeTxWithApprovalCheck({
    address,
  });
  const chainId = useChainId();
  const { updateSelfStakeTxInfo } = useSelfStakeTxStore();

  const selfStake = useCallback(
    ({ inputValue, lockedPeriodSeconds }: { inputValue: string; lockedPeriodSeconds: number }) => {
      const valueToStake = parseEther(inputValue);
      let functionName = "extendSelfStake";
      let functionArgs: any[] = [BigInt(lockedPeriodSeconds)];
      if (valueToStake > 0n) {
        functionName = "selfStake";
        functionArgs.unshift(valueToStake);
      }

      stake({
        functionName,
        functionArgs,
        requiredApprovalAmount: valueToStake,
      });
    },
    [stake]
  );

  useEffect(() => {
    if (blockNumber) {
      updateSelfStakeTxInfo(chainId, address, { blockNumber, timestamp: new Date() });
    }
  }, [chainId, address, blockNumber, updateSelfStakeTxInfo]);

  return {
    selfStake,
    isLoading,
    isConfirmed,
    approvalIsLoading,
  };
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

export const UpdateStakeModalBody = ({
  address,
  inputValue,
  lockedPeriodSeconds,
  stakeToUpdate,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriodSeconds: number;
  stakeToUpdate: StakeData;
}) => {
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
};

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
    return (
      <UpdateStakeModalBody
        address={address}
        inputValue={inputValue}
        lockedPeriodSeconds={lockedPeriodSeconds}
        stakeToUpdate={stakeToUpdate}
      />
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
  const lockedPeriodSeconds = useMemo(() => getLockSeconds(new Date(), lockedPeriodMonths), [lockedPeriodMonths]);

  const { selfStake, isLoading, isConfirmed, approvalIsLoading } = useSelfStakeTx({
    address,
  });

  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  return (
    <StakeModal
      title={stakeToUpdate ? "Update self stake" : "Stake on yourself"}
      buttonText={approvalIsLoading ? "Requesting approval (1 of 2)..." : stakeToUpdate ? "Update stake" : "Stake"}
      onButtonClick={() => selfStake({ inputValue, lockedPeriodSeconds })}
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
