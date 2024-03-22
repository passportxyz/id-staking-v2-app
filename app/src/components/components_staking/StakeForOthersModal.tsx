import React, { useCallback, useMemo } from "react";
import { StakeModal } from "./StakeModal";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";
import { DisplayAddressOrENS, DisplayDuration, formatAmount } from "@/utils/helpers";

const useCommunityStakeTx = ({
  staker,
  stakees,
  amounts,
  lockedPeriodsSeconds,
  onConfirm,
}: {
  staker: `0x${string}`;
  stakees: `0x${string}`[];
  amounts: bigint[];
  lockedPeriodsSeconds: bigint[];
  onConfirm: () => void;
}) => {
  const requiredApprovalAmount = useMemo(() => amounts.reduce((a, b) => a + b, 0n), [amounts]);

  const { stake, isLoading, isConfirmed } = useStakeTxWithApprovalCheck({
    address: staker,
  });

  const communityStake = useCallback(
    async ({
      stakees,
      amounts,
      lockedPeriodsSeconds,
    }: {
      stakees: `0x${string}`[];
      amounts: bigint[];
      lockedPeriodsSeconds: bigint[];
    }) => {
      if (stakees.length === 1) {
        return ["communityStake", [stakees[0], amounts[0], lockedPeriodsSeconds[0]]];
      } else {
        return ["multipleCommunityStakes", [stakees, amounts, lockedPeriodsSeconds]];
      }
    },
    [stakees, amounts, lockedPeriodsSeconds]
  );
};

export const StakeForOthersModal = ({
  address,
  stakees,
  amounts,
  lockedPeriodsSeconds,
  isOpen,
  onClose,
  onConfirm,
}: {
  address: `0x${string}`;
  stakees: `0x${string}`[];
  amounts: bigint[];
  lockedPeriodsSeconds: bigint[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { stake, isLoading } = useCommunityStakeTx({
    staker: address,
    stakees,
    amounts,
    lockedPeriodsSeconds,
    onConfirm,
  });

  return (
    <StakeModal
      title="Stake on others"
      buttonText="Stake"
      onButtonClick={stake}
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
