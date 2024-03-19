import React, { useCallback, useMemo } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, useConnectedChain } from "@/utils/helpers";
import { StakeModal, DataLine } from "./StakeModal";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";

const useExtendSelfStake = ({ onConfirm, address }: { onConfirm: () => void; address: string }) => {
  const chain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);
  const { isLoading, writeContract } = useStakeTxHandler({ queryKey, onConfirm, txTitle: "Restake" });

  const extendSelfStake = useCallback(
    async (lockSeconds: number) => {
      writeContract({
        address: chain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "extendSelfStake",
        args: [BigInt(lockSeconds)],
      });
    },
    [writeContract]
  );

  return useMemo(
    () => ({
      isLoading,
      extendSelfStake,
    }),
    [isLoading, extendSelfStake]
  );
};

export const SelfRestakeModal = ({
  address,
  amount,
  lockSeconds,
  isOpen,
  onClose,
}: {
  address: string;
  amount: string;
  lockSeconds: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isLoading, extendSelfStake } = useExtendSelfStake({ onConfirm: onClose, address });
  return (
    <StakeModal
      title="Restake on yourself"
      buttonText="Restake"
      onButtonClick={() => extendSelfStake(lockSeconds)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <DataLine label="Address" value={<DisplayAddressOrENS user={address} max={20} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${formatAmount(amount)} GTC`} />
        <hr className="border-foreground-4" />
        <DataLine label="Lockup" value={<DisplayDuration seconds={lockSeconds} />} />
      </div>
    </StakeModal>
  );
};
