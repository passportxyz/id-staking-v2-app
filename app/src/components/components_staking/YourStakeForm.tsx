import React, { ButtonHTMLAttributes, useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/Button";
import { useWalletStore } from "@/context/walletStore";
import { useYourStakeHistoryQuery } from "@/utils/stakeHistory";
import { SelfStakeModal } from "./SelfStakeModal";
import { StakeFormInputSection } from "./StakeFormInputSection";

const TWELVE_MONTHS_IN_SECONDS = 12 * 30 * 24 * 60 * 60;
const SIX_MONTHS_IN_SECONDS = 6 * 30 * 24 * 60 * 60;

export const YourStakeForm: React.FC = ({}) => {
  const address = useWalletStore((state) => state.address);
  const { data, isLoading } = useYourStakeHistoryQuery(address);
  const [previousUnlockTime, setPreviousUnlockTime] = useState<Date | undefined>();
  const isUpdate = previousUnlockTime !== undefined;

  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriod] = useState<number>(3);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (data && BigInt(data[0].amount) > 0n) {
      const stake = data[0];
      const unlockTime = new Date(stake.unlock_time);
      const lockTime = new Date(stake.lock_time);
      const unlockPeriodSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

      if (unlockPeriodSeconds >= TWELVE_MONTHS_IN_SECONDS) {
        setLockedPeriod(12);
      } else if (unlockPeriodSeconds >= SIX_MONTHS_IN_SECONDS) {
        setLockedPeriod(6);
      } else {
        setLockedPeriod(3);
      }
      setPreviousUnlockTime(unlockTime);
    } else {
      setPreviousUnlockTime(undefined);
    }
  }, [data]);

  const onClose = useCallback(() => {
    setModalIsOpen(false);
  }, []);

  const selfStakeModal = address ? (
    <SelfStakeModal
      address={address}
      inputValue={inputValue}
      lockedPeriodMonths={lockedPeriod}
      isOpen={modalIsOpen}
      onClose={onClose}
      stakeToUpdate={isUpdate ? data?.[0] : undefined}
    />
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <StakeFormInputSection
        amount={inputValue}
        lockedMonths={lockedPeriod}
        handleAmountChange={setInputValue}
        handleLockedMonthsChange={setLockedPeriod}
        isLoading={isLoading}
        onlyAllowStakeAfterTime={previousUnlockTime}
        includePlusAmountPrefix={isUpdate}
      />
      {selfStakeModal}
      <Button
        className="w-full font-bold"
        onClick={() => setModalIsOpen(true)}
        disabled={isLoading || !(isUpdate || (inputValue && parseFloat(inputValue) > 0))}
      >
        {isUpdate && "Update "}Stake
      </Button>
    </div>
  );
};
