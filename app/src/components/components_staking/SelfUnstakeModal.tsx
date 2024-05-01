import React, { useCallback, useEffect, useMemo } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import LegacyIdentityStaking from "../../abi/LegacyIdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { DisplayAddressOrENS, formatAmount, useConnectedChain } from "@/utils/helpers";
import { StakeModal, DataLine } from "./StakeModal";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { useLegacySelfStakeQueryKey } from "@/hooks/legacyStaking";

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

const useWithdrawLegacySelfStake = ({ address, roundId }: { address: string; roundId: number }) => {
  const chain = useConnectedChain();
  const queryKey = useLegacySelfStakeQueryKey(address as `0x{string}`, chain);

  const { isLoading, writeContract, isConfirmed } = useStakeTxHandler({ queryKey, txTitle: "Unstake" });

  const withdrawSelfStake = useCallback(
    async (amount: string) => {
      if (chain.legacyContractAddr) {
        writeContract({
          address: chain.legacyContractAddr,
          abi: LegacyIdentityStaking,
          functionName: "unstake",
          args: [roundId, BigInt(amount)],
        });
      } else {
        console.error("Legacy contract address not found (this is probably a misconfiguration)");
      }
    },
    [writeContract, chain.legacyContractAddr, roundId]
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

export const LegacySelfUnstakeModal = ({
  address,
  amount,
  isOpen,
  onClose,
  roundId,
}: {
  address: string;
  amount: string;
  isOpen: boolean;
  onClose: () => void;
  roundId: number;
}) => {
  const { isLoading, withdrawSelfStake, isConfirmed } = useWithdrawLegacySelfStake({ address, roundId });

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
