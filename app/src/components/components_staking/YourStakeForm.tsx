import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ChainConfig } from "@/utils/chains";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletStore } from "@/context/walletStore";

interface YourStakeFormProps {
  selectedChain: ChainConfig;
}

export const YourStakeForm: React.FC<YourStakeFormProps> = ({ selectedChain }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const address = useWalletStore((state) => state.address);

  const [inputValue, setInputValue] = useState<number>();
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(event.target.value));
  };

  const handleAddFixedValue = (value: number) => {
    setInputValue(value);
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value);
  };

  const handleStake = () => {
    console.log("address", selectedChain.stakingContractAddr);
    console.log("amount", BigInt(inputValue || 0));
    console.log("amount", `${lockedPeriod} months`);


    const lockedPeriodSeconds = lockedPeriod * 30 * 24 * 60 * 60;
    console.log("lockedPeriodSeconds", lockedPeriodSeconds);
    // https://docs.openzeppelin.com/contracts/4.x/erc20
    // https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20-approve-address-uint256-
    // https://sepolia-optimism.etherscan.io/address/0xc80e07d81828960F613baa57288192E56d417dA5#code

    // Check allowance

    const allowedAmount = writeContract({
      address: "0xc80e07d81828960F613baa57288192E56d417dA5", // TODO: double check this
      abi: ERC20,
      functionName: "allowance",
      args: [address, selectedChain.stakingContractAddr],
    });
    console.log("allowedAmount = ", allowedAmount)

    if (allowedAmount >= BigInt(inputValue)){
      writeContract({
        address: selectedChain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "selfStake",
        args: [BigInt(inputValue || 0), BigInt(lockedPeriodSeconds)],
      });
    } else {
      // Allow
      const approved = writeContract({
        address: address, // TODO: double check this
        abi: ERC20,
        functionName: "approve",
        args: [selectedChain.stakingContractAddr, BigInt(inputValue || 0)],
      });

      writeContract({
        address: selectedChain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "selfStake",
        args: [BigInt(inputValue || 0), BigInt(lockedPeriodSeconds)],
      });
    }
 
  };

  useEffect(() => {
    (async () => {
      if (isConfirmed) {
        toast(makeSuccessToastProps("Success", "Stake transaction confirmed"));
        // delay for indexer
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await queryClient.invalidateQueries();
      }
    })();
  }, [isConfirmed, toast, queryClient]);

  useEffect(() => {
    if (error) {
      console.error("Stake failed:", error);
      toast(makeErrorToastProps("Failed", "Stake transaction failed"));
    }
  }, [error, toast]);

  return (
    <div className="flex flex-col gap-4">
      <PanelDiv className="grid gap-4 grid-cols-[min-content_repeat(3,minmax(0,1fr))] lg:grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <input
          className="col-end-[-1] grow col-start-2  rounded-lg border border-foreground-4 bg-black text-s text-color-2"
          type="number"
          value={inputValue}
          placeholder={`Input a custom amount or choose one from below`}
          onChange={handleInputChange}
        />
        <div className="gap-2 col-start-2 hidden lg:flex col-span-2 text-color-4">
          {[5, 20, 125].map((amount) => (
            <FormButton key={amount} onClick={() => handleAddFixedValue(amount)} className="w-12">
              {amount}
            </FormButton>
          ))}
        </div>
        <div className="mx-1 text-right font-bold text-color-6">
          Lockup
          <br />
          period
        </div>
        <div className="flex col-span-3 w-full col-end-[-1] text-sm gap-2 justify-self-end">
          {[3, 6, 12].map((months) => (
            <FormButton key={months} onClick={() => handleLockedPeriod(months)} className="text-sm w-full">
              {months} months
            </FormButton>
          ))}
        </div>
      </PanelDiv>
      <Button className="w-full font-bold" onClick={() => handleStake()} disabled={isPending || isConfirming}>
        Stake
      </Button>
    </div>
  );
};

const FormButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) => (
  <Button className={`!px-1 rounded-lg leading-none whitespace-nowrap ${className}`} onClick={onClick}>
    {children}
  </Button>
);
