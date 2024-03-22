import React, { useCallback, useEffect, useMemo } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { DisplayAddressOrENS, formatAmount, useConnectedChain } from "@/utils/helpers";
import { StakeModal, DataLine } from "./StakeModal";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";

const useWithdrawSelfStake = ({ address }: { address: string }) => {
  const chain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);
  const { isLoading, writeContract, isConfirmed } = useStakeTxHandler({ queryKey, txTitle: "Unstake" });

  const withdrawSelfStake = useCallback(
    async (amount: string) => {
      writeContract({
        address: chain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "withdrawSelfStake",
        args: [BigInt(amount)],
      });
    },
    [writeContract, chain.stakingContractAddr]
  );

  return useMemo(
    () => ({
      isLoading,
      withdrawSelfStake,
      isConfirmed,
    }),
    [isLoading, withdrawSelfStake, isConfirmed]
  );
};

export const SelfUnstakeModal = ({
  address,
  amount,
  isOpen,
  onClose,
}: {
  address: string;
  amount: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isLoading, withdrawSelfStake, isConfirmed } = useWithdrawSelfStake({ address });

  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  return (
    <StakeModal
      title="Unstake self stake"
      buttonText="Unstake"
      onButtonClick={() => withdrawSelfStake(amount)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <DataLine label="Address" value={<DisplayAddressOrENS user={address} max={20} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${formatAmount(amount)} GTC`} />
      </div>
    </StakeModal>
  );
};
