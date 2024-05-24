import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/Button";
import { StakeData, useYourStakeHistoryQuery } from "@/utils/stakeHistory";
import { SelfStakeModal } from "./SelfStakeModal";
import { StakeFormInputSection } from "./StakeFormInputSection";
import { useAccount } from "wagmi";

const TWELVE_MONTHS_IN_SECONDS = 12 * 30 * 24 * 60 * 60;
const SIX_MONTHS_IN_SECONDS = 6 * 30 * 24 * 60 * 60;

export const useInitializeStakeForm = ({
  stake,
  setLockedPeriodMonths,
  setPreviousUnlockTime,
}: {
  stake: StakeData | undefined;
  setLockedPeriodMonths: React.Dispatch<React.SetStateAction<number>>;
  setPreviousUnlockTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) => {
  useEffect(() => {
    if (stake && BigInt(stake.amount) > 0n) {
      const unlockTime = new Date(stake.unlock_time);
      const lockTime = new Date(stake.lock_time);
      const unlockPeriodSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

      if (unlockPeriodSeconds >= TWELVE_MONTHS_IN_SECONDS) {
        setLockedPeriodMonths(12);
      } else if (unlockPeriodSeconds >= SIX_MONTHS_IN_SECONDS) {
        setLockedPeriodMonths(6);
      } else {
        setLockedPeriodMonths(3);
      }
      setPreviousUnlockTime(unlockTime);
    } else {
      setPreviousUnlockTime(undefined);
    }
  }, [stake, setLockedPeriodMonths, setPreviousUnlockTime]);
};

export const YourStakeForm: React.FC = ({}) => {
  const { address } = useAccount();
  const { data, isLoading } = useYourStakeHistoryQuery(address);
  const stake = useMemo<StakeData | undefined>(() => data?.[0], [data]);
  const [previousUnlockTime, setPreviousUnlockTime] = useState<Date | undefined>();
  const isUpdate = previousUnlockTime !== undefined;

  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriodMonths, setLockedPeriodMonths] = useState<number>(3);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useInitializeStakeForm({ stake, setLockedPeriodMonths, setPreviousUnlockTime });

  const onClose = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  const selfStakeModal = address ? (
    <SelfStakeModal
      address={address}
      inputValue={inputValue}
      lockedPeriodMonths={lockedPeriodMonths}
      isOpen={modalIsOpen}
      onClose={onClose}
      stakeToUpdate={isUpdate ? stake : undefined}
    />
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <StakeFormInputSection
        amount={inputValue}
        lockedMonths={lockedPeriodMonths}
        handleAmountChange={setInputValue}
        handleLockedMonthsChange={setLockedPeriodMonths}
        isLoading={isLoading}
        onlyAllowStakeAfterTime={previousUnlockTime}
        includePlusAmountPrefix={isUpdate}
      />
      {selfStakeModal}
      <Button
        className="w-full font-bold h-14"
        onClick={() => setModalIsOpen(true)}
        disabled={isLoading || !(isUpdate || (inputValue && parseFloat(inputValue) > 0))}
      >
        {isUpdate && "Update "}Stake
      </Button>
    </div>
  );
};
