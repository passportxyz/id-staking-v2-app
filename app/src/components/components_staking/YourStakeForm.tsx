import React, { ButtonHTMLAttributes, ChangeEvent, useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useReadContract } from "wagmi";
import { useWalletStore } from "@/context/walletStore";
import { ethers } from "ethers";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, useConnectedChain } from "@/utils/helpers";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { useStakeHistoryQueryKey, useYourStakeHistoryQuery } from "@/utils/stakeHistory";

const TWELVE_MONTHS_IN_SECONDS = 12 * 30 * 24 * 60 * 60;
const SIX_MONTHS_IN_SECONDS = 6 * 30 * 24 * 60 * 60;

export const YourStakeForm: React.FC = ({}) => {
  const address = useWalletStore((state) => state.address);
  const { data, isLoading } = useYourStakeHistoryQuery(address);
  const [isUpdate, setIsUpdate] = useState(false);

  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (data && BigInt(data[0].amount) > 0n) {
      const stake = data[0];
      const unlockTime = new Date(stake.unlock_time);
      const lockTime = new Date(stake.lock_time);
      const unlockPeriodSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

      if (unlockPeriodSeconds >= TWELVE_MONTHS_IN_SECONDS) {
        setLockedPeriodState(12);
      } else if (unlockPeriodSeconds >= SIX_MONTHS_IN_SECONDS) {
        setLockedPeriodState(6);
      } else {
        setLockedPeriodState(3);
      }
      setIsUpdate(true);
    } else {
      setIsUpdate(false);
    }
  }, [data]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddFixedValue = (value: string) => {
    setInputValue(value);
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value);
  };

  const selfStakeModal =
    address && inputValue ? (
      <SelfStakeModal
        address={address}
        inputValue={inputValue}
        lockedPeriodMonths={lockedPeriod}
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <PanelDiv className="grid gap-4 grid-cols-[min-content_repeat(3,minmax(0,1fr))] lg:grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <div className="col-end-[-1] grid items-center grow col-start-2 text-color-2">
          <input
            className={`w-full rounded-lg bg-background ${
              isUpdate ? "pl-8" : "pl-4"
            } pr-4 py-1 col-start-1 row-start-1 border border-foreground-4`}
            type="number"
            value={inputValue}
            placeholder={`Input a custom amount or choose one from below`}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {isUpdate && (
            <div className="col-start-1 row-start-1 flex items-center justify-center w-6 h-full rounded-l-lg pl-1 bg-background-8 border-r border-foreground-4 pointer-events-none">
              +
            </div>
          )}
        </div>
        <div className="gap-2 col-start-2 hidden lg:flex col-span-2 text-color-4">
          {["5", "20", "125"].map((amount) => (
            <FormButton
              key={amount}
              onClick={() => handleAddFixedValue(amount)}
              className="w-14"
              variant={amount === inputValue ? "active" : "inactive"}
              disabled={isLoading}
            >
              {isUpdate && "+"}
              {amount}
            </FormButton>
          ))}
        </div>
        <div className="mx-1 text-sm leading-none text-right font-bold text-color-6">
          Lockup
          <br />
          period
        </div>
        <div className="flex col-span-3 w-full col-end-[-1] text-sm gap-2 justify-self-end">
          {[3, 6, 12].map((months) => (
            <FormButton
              key={months}
              onClick={() => handleLockedPeriod(months)}
              className="text-sm w-full"
              variant={lockedPeriod === months ? "active" : "inactive"}
              disabled={isLoading}
            >
              {months} months
            </FormButton>
          ))}
        </div>
      </PanelDiv>
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

const useSelfStakeTx = ({
  address,
  valueToStake,
  lockedPeriodSeconds,
  onConfirm,
}: {
  address: `0x${string}`;
  valueToStake: bigint;
  lockedPeriodSeconds: bigint;
  onConfirm: () => void;
}) => {
  const connectedChain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);

  const allowanceCheck = useReadContract({
    abi: ERC20,
    address: connectedChain.gtcContractAddr,
    functionName: "allowance",
    chainId: connectedChain.id,
    args: [address, connectedChain.stakingContractAddr],
  });

  const stakingHandler = useStakeTxHandler({ queryKey, txTitle: "Stake", onConfirm });

  const submitStakeTx = () => {
    stakingHandler.writeContract({
      address: connectedChain.stakingContractAddr,
      abi: IdentityStakingAbi,
      functionName: "selfStake",
      chainId: connectedChain.id,
      args: [valueToStake, lockedPeriodSeconds],
    });
  };

  // Automatically call stakeTx once confirmed
  const approvalHandler = useStakeTxHandler({ txTitle: "Spending approval", onConfirm: submitStakeTx });

  const submitApprovalTx = () => {
    approvalHandler.writeContract({
      address: connectedChain.gtcContractAddr,
      abi: ERC20,
      functionName: "approve",
      chainId: connectedChain.id,
      args: [connectedChain.stakingContractAddr, valueToStake],
    });
  };

  const selfStake = useCallback(() => {
    const isSpendingApproved = allowanceCheck.isSuccess && (allowanceCheck.data as bigint) >= valueToStake;

    if (!isSpendingApproved) {
      // The staking tx will automatically trigger once the approval tx is confirmed
      // due to the onConfirm callback in the approvalHandler
      submitApprovalTx();
    } else {
      submitStakeTx();
    }
  }, [submitApprovalTx, submitStakeTx, address, connectedChain, valueToStake]);

  const isLoading = approvalHandler.isLoading || stakingHandler.isLoading || allowanceCheck.isLoading;

  return { selfStake, isLoading };
};

const SelfStakeModal = ({
  address,
  inputValue,
  lockedPeriodMonths,
  isOpen,
  onClose,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriodMonths: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const valueToStake = ethers.parseUnits(inputValue || "0", 18);
  const lockedPeriodSeconds = BigInt(lockedPeriodMonths) * 30n * 24n * 60n * 60n;

  const { selfStake, isLoading } = useSelfStakeTx({
    address,
    valueToStake,
    lockedPeriodSeconds,
    onConfirm: onClose,
  });

  return (
    <StakeModal
      title="Stake on yourself"
      buttonText="Stake"
      onButtonClick={selfStake}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <DataLine label="Address" value={<DisplayAddressOrENS user={address} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${inputValue} GTC`} />
        <hr className="border-foreground-4" />
        <DataLine label="Lockup" value={<div>{lockedPeriodMonths} months</div>} />
      </div>
    </StakeModal>
  );
};

export type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "active" | "inactive";
};

export const FormButton = ({ variant, className, ...props }: FormButtonProps) => {
  const variantClassName = useMemo(() => {
    if (variant === "active") {
      return "text-color-4 bg-gradient-to-r from-foreground-2 to-foreground-2 hover:to-foreground-4";
    } else {
      return "text-color-4 bg-gradient-to-r from-foreground-4 to-foreground-4 hover:to-foreground-2";
    }
  }, [variant]);

  return (
    <button
      className={`group flex items-center justify-center gap-4 py-2 text-base text-color-1
        disabled:cursor-not-allowed disabled:bg-foreground-3 disabled:brightness-75 
        !px-1 rounded-lg leading-none whitespace-nowrap
        ${variantClassName} focus:border-transparent focus:outline focus:outline-1 focus:outline-focus ${className}`}
      {...props}
    />
  );
};
