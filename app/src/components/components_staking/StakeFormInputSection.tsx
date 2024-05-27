import React, { ButtonHTMLAttributes, ChangeEvent, useEffect, useMemo, useRef } from "react";
import { PanelDiv } from "./PanelDiv";
import { getUnlockTime } from "@/utils/helpers";
import { FormButton } from "../Button";

export const PresetAmountsSelection = ({
  amount,
  handleAmountChange,
  disabled,
  includePlusAmountPrefix,
}: {
  amount: string;
  handleAmountChange: (value: string) => void;
  disabled?: boolean;
  includePlusAmountPrefix?: boolean;
}) => {
  return ["5", "20", "125"].map((presetAmount) => (
    <FormButton
      key={presetAmount}
      onClick={() => handleAmountChange(presetAmount)}
      className="w-14"
      variant={presetAmount === amount ? "active" : "inactive"}
      disabled={disabled}
    >
      {includePlusAmountPrefix && "+"}
      {presetAmount}
    </FormButton>
  ));
};

export const PresetMonthsSelection = ({
  lockedMonths,
  handleLockedMonthsChange,
  disabled,
  onlyAllowStakeAfterTime,
}: {
  lockedMonths: number;
  handleLockedMonthsChange: (value: number) => void;
  disabled?: boolean;
  onlyAllowStakeAfterTime?: Date;
}) => {
  return [3, 6, 12].map((presetMonths) => (
    <FormButton
      key={presetMonths}
      onClick={() => handleLockedMonthsChange(presetMonths)}
      className={`text-sm w-full ${lockedMonths === presetMonths ? "font-bold" : ""}`}
      variant={lockedMonths === presetMonths ? "active" : "inactive"}
      disabled={
        disabled ||
        (onlyAllowStakeAfterTime &&
          getUnlockTime(new Date(), presetMonths).getTime() < onlyAllowStakeAfterTime.getTime())
      }
    >
      {presetMonths} months
    </FormButton>
  ));
};

export const StakeAmountInput = ({
  amount,
  onChange,
  disabled,
  includePlusAmountPrefix,
  autoFocus,
  className,
}: {
  amount: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  includePlusAmountPrefix?: boolean;
  autoFocus?: boolean;
  className?: string;
}) => (
  <div className={`grid items-center text-color-2 ${className}`}>
    <input
      className={`w-full rounded-lg bg-background ${
        includePlusAmountPrefix ? "pl-10" : "pl-4"
      } pr-4 py-1 col-start-1 row-start-1 transition ease-in-out duration-200 border border-foreground-4 hover:border-foreground-2 focus:border-foreground-2 h-12 outline-none`}
      type="number"
      value={amount}
      placeholder={`Input a custom amount or choose one from below`}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
    />
    {includePlusAmountPrefix && (
      <div className="col-start-1 row-start-1 flex items-center justify-center w-8 text-2xl leading-none font-light h-full rounded-l-lg pl-1 bg-gradient-to-r from-background-8 to-background-7 text-color-4 pointer-events-none">
        +
      </div>
    )}
  </div>
);

export const StakeFormInputSection = ({
  amount,
  lockedMonths,
  handleAmountChange,
  handleLockedMonthsChange,
  className,
  isLoading,
  includePlusAmountPrefix,
  onlyAllowStakeAfterTime,
  autoFocus,
}: {
  amount: string;
  lockedMonths: number;
  handleAmountChange: (value: string) => void;
  handleLockedMonthsChange: (value: number) => void;
  className?: string;
  isLoading?: boolean;
  includePlusAmountPrefix?: boolean;
  onlyAllowStakeAfterTime?: Date;
  autoFocus?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [autoFocus]);

  return (
    <PanelDiv
      ref={ref}
      className={`grid items-center gap-4 grid-cols-[72px_repeat(3,minmax(0,1fr))] lg:grid-cols-[72px_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14 ${className}`}
    >
      <div className="col-span-1 text-color-6 font-bold text-right">Amount</div>
      <StakeAmountInput
        className="col-end-[-1] col-start-2"
        amount={amount}
        onChange={(event) => handleAmountChange(event.target.value)}
        disabled={isLoading}
        includePlusAmountPrefix={includePlusAmountPrefix}
        autoFocus={autoFocus}
      />
      <div className="gap-2 col-start-2 hidden lg:flex col-span-2 text-color-4">
        <PresetAmountsSelection
          amount={amount}
          handleAmountChange={handleAmountChange}
          disabled={isLoading}
          includePlusAmountPrefix={includePlusAmountPrefix}
        />
      </div>
      <div className="mx-1 text-sm leading-none text-right font-bold text-color-6">
        Lockup
        <br />
        period
      </div>
      <div className="flex col-span-3 w-full col-end-[-1] text-sm gap-2 justify-self-end">
        <PresetMonthsSelection
          lockedMonths={lockedMonths}
          handleLockedMonthsChange={handleLockedMonthsChange}
          disabled={isLoading}
          onlyAllowStakeAfterTime={onlyAllowStakeAfterTime}
        />
      </div>
    </PanelDiv>
  );
};
