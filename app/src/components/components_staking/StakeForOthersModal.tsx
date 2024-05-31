import React, { useCallback, useEffect } from "react";
import { StakeModal } from "./StakeModal";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";
import { DisplayAddressOrENS, DisplayDuration, formatAmount } from "@/utils/helpers";
import { useCommunityStakesStore } from "./StakeForOthersForm";
import { useCommunityStakeTxStore } from "@/hooks/hooks_staking/useCommunityStakeTxStore";
import { useChainId } from "wagmi";

const useCommunityStakeTx = ({ staker }: { staker: `0x${string}` }) => {
  const { blockNumber, stake, isLoading, isConfirmed } = useStakeTxWithApprovalCheck({
    address: staker,
  });
  const chainId = useChainId();
  const { updateCommunityStakeTxInfo } = useCommunityStakeTxStore();

  const communityStake = useCallback(
    ({
      stakees,
      amounts,
      lockedPeriodsSeconds,
    }: {
      stakees: `0x${string}`[];
      amounts: bigint[];
      lockedPeriodsSeconds: bigint[];
    }) => {
      let functionName: string;
      let functionArgs: any[];
      if (stakees.length === 1) {
        functionName = "communityStake";
        functionArgs = [stakees[0], amounts[0], lockedPeriodsSeconds[0]];
      } else {
        functionName = "multipleCommunityStakes";
        functionArgs = [stakees, amounts, lockedPeriodsSeconds];
      }

      const requiredApprovalAmount = amounts.reduce((a, b) => a + b, 0n);

      stake({
        functionName,
        functionArgs,
        requiredApprovalAmount,
      });
    },
    [stake]
  );

  useEffect(() => {
    if (blockNumber) {
      updateCommunityStakeTxInfo(chainId, staker, { blockNumber, timestamp: new Date() });
    }
  }, [chainId, staker, blockNumber, updateCommunityStakeTxInfo]);

  return {
    communityStake,
    isLoading,
    isConfirmed,
  };
};

export const StakeForOthersModal = ({
  address,
  stakees,
  amounts,
  lockedPeriodsSeconds,
  isOpen,
  onClose,
}: {
  address: `0x${string}`;
  stakees: `0x${string}`[];
  amounts: bigint[];
  lockedPeriodsSeconds: bigint[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const resetCommunityStakes = useCommunityStakesStore((state) => state.resetCommunityStakes);
  const { communityStake, isLoading, isConfirmed } = useCommunityStakeTx({
    staker: address,
  });

  useEffect(() => {
    if (isConfirmed) {
      resetCommunityStakes();
      onClose();
    }
  }, [isConfirmed, onClose, resetCommunityStakes]);

  return (
    <StakeModal
      title="Stake on others"
      buttonText="Stake"
      onButtonClick={() => communityStake({ stakees, amounts, lockedPeriodsSeconds })}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <table className="w-full mb-16 border-spacing-1">
        <thead>
          <tr className="text-color-6 text-lg border-b border-foreground-4">
            <th className="py-4">Address</th>
            <th className="text-center">Amount</th>
            <th className="text-right">Lockup</th>
          </tr>
        </thead>
        <tbody>
          {stakees.map((stakee, idx) => (
            <tr key={idx} className="border-b border-foreground-4">
              <td className="py-4">
                <DisplayAddressOrENS user={stakee} max={16} />
              </td>
              <td className="text-center">{formatAmount(amounts[idx].toString())} GTC</td>
              <td className="text-right">
                <DisplayDuration seconds={Number(lockedPeriodsSeconds[idx])} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </StakeModal>
  );
};
