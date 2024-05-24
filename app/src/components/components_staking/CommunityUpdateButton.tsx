import React, { useState, useCallback, useMemo, ChangeEvent, useEffect, ComponentPropsWithRef } from "react";
import { DisplayAddressOrENS, formatAmount, getLockSeconds } from "@/utils/helpers";
import { StakeModal } from "./StakeModal";
import { parseEther } from "viem";
import { StakeData } from "@/utils/stakeHistory";
import { PresetAmountsSelection, PresetMonthsSelection, StakeAmountInput } from "./StakeFormInputSection";
import { useInitializeStakeForm } from "./YourStakeForm";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";
import { UpdateStakeModalBody } from "./SelfStakeModal";

const useExtendCommunityStake = ({ staker }: { staker: `0x${string}` }) => {
  const { stake, isLoading, isConfirmed, approvalIsLoading } = useStakeTxWithApprovalCheck({
    address: staker,
  });

  const extendCommunityStake = useCallback(
    async (communityAddress: string, stakeValue: bigint, lockSeconds: number) => {
      let functionName: string;
      let functionArgs: any[];
      if (stakeValue > 0n) {
        functionName = "communityStake";
        functionArgs = [communityAddress, stakeValue, BigInt(lockSeconds)];
      } else {
        functionName = "extendCommunityStake";
        functionArgs = [communityAddress, BigInt(lockSeconds)];
      }
      stake({ functionName, functionArgs, requiredApprovalAmount: stakeValue });
    },
    [stake]
  );

  return useMemo(
    () => ({
      isLoading,
      extendCommunityStake,
      isConfirmed,
    }),
    [isLoading, extendCommunityStake, isConfirmed]
  );
};

const CommunityUpdateModal = ({
  stakeToUpdate,
  amount,
  lockedPeriodMonths,
  isOpen,
  onClose,
}: {
  stakeToUpdate: StakeData;
  amount: string;
  lockedPeriodMonths: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const lockedPeriodSeconds = useMemo(() => getLockSeconds(new Date(), lockedPeriodMonths), [lockedPeriodMonths]);
  const { isLoading, extendCommunityStake, isConfirmed } = useExtendCommunityStake({ staker: stakeToUpdate.staker });
  const stakeValue = parseEther(amount);

  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  return (
    <StakeModal
      title="Update stake on others"
      buttonText="Update Stake"
      onButtonClick={() => extendCommunityStake(stakeToUpdate.stakee, stakeValue, lockedPeriodSeconds)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <UpdateStakeModalBody
        address={stakeToUpdate.stakee}
        inputValue={amount}
        lockedPeriodSeconds={lockedPeriodSeconds}
        stakeToUpdate={stakeToUpdate}
      />
    </StakeModal>
  );
};

const CommunityUpdateModalPreview = ({
  stake,
  amount,
  setAmount,
  lockedPeriodMonths,
  setLockedPeriodMonths,
  isOpen,
  onClose,
  onContinue,
}: {
  stake: StakeData;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  lockedPeriodMonths: number;
  setLockedPeriodMonths: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}) => {
  const [previousUnlockTime, setPreviousUnlockTime] = useState<Date | undefined>();

  useInitializeStakeForm({ stake, setLockedPeriodMonths, setPreviousUnlockTime });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  return (
    <StakeModal
      title="Update stake on others"
      buttonText="Preview"
      onButtonClick={onContinue}
      buttonLoading={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col text-color-2">
        <div>Address</div>
        <input
          type="text"
          value={stake.stakee}
          disabled
          className="w-full px-4 py-1 bg-gradient-to-r text-color-3 opacity-50 from-background-8 to-background-7 mb-4 mt-1 rounded-lg outline-none"
        />
        <div className="flex justify-between w-full items-center">
          Amount
          <div className="flex gap-2 my-1 items-center text-color-1">
            Current Amount
            <div className="font-bold bg-gradient-to-r from-background-8 to-background-7 text-color-3 text-sm rounded-lg px-2 flex items-center">
              {formatAmount(stake.amount)}
            </div>
          </div>
        </div>
        <StakeAmountInput
          amount={amount}
          onChange={handleInputChange}
          disabled={false}
          includePlusAmountPrefix={true}
        />

        <div className="self-end flex gap-2 my-4">
          <PresetAmountsSelection
            amount={amount}
            handleAmountChange={setAmount}
            disabled={false}
            includePlusAmountPrefix={true}
          />
        </div>

        <div>Lockup period</div>
        <div className="flex w-full gap-4 mt-2 mb-8">
          <PresetMonthsSelection
            lockedMonths={lockedPeriodMonths}
            handleLockedMonthsChange={setLockedPeriodMonths}
            disabled={false}
            onlyAllowStakeAfterTime={previousUnlockTime}
          />
        </div>
      </div>
    </StakeModal>
  );
};

export const CommunityUpdateButton = ({
  stake,
  isOpenInitial,
  onClose,
}: {
  stake: StakeData;
  isOpenInitial: boolean;
  onClose: () => void;
}) => {
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(isOpenInitial);
  const [transactionModalIsOpen, setTransactionModalIsOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [lockedPeriodMonths, setLockedPeriodMonths] = useState<number>(3);

  useEffect(() => {
    if (isOpenInitial) {
      setPreviewModalIsOpen(true);
    }
  }, [isOpenInitial]);

  const onClosePreviewModal = useCallback(() => {
    setPreviewModalIsOpen(false);
    onClose();
  }, [onClose]);

  const onCloseTransactionModal = useCallback(() => {
    setTransactionModalIsOpen(false);
    onClose();
  }, [onClose]);

  const onContinue = useCallback(() => {
    setPreviewModalIsOpen(false);
    setTransactionModalIsOpen(true);
  }, []);

  return (
    <>
      <CommunityUpdateModalPreview
        stake={stake}
        isOpen={previewModalIsOpen}
        onClose={onClosePreviewModal}
        onContinue={onContinue}
        amount={amount}
        setAmount={setAmount}
        lockedPeriodMonths={lockedPeriodMonths}
        setLockedPeriodMonths={setLockedPeriodMonths}
      />
      <CommunityUpdateModal
        stakeToUpdate={stake}
        isOpen={transactionModalIsOpen}
        onClose={onCloseTransactionModal}
        amount={amount}
        lockedPeriodMonths={lockedPeriodMonths}
      />

      <button
        onClick={() => setPreviewModalIsOpen(true)}
        disabled={Boolean(stake.legacy)}
        className="text-color-6 font-bold disabled:text-color-5 disabled:cursor-not-allowed"
      >
        Update stake
      </button>
    </>
  );
};
