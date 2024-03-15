import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ChainConfig } from "@/utils/chains";

interface YourStakeFormProps {
  selectedChain: ChainConfig;
}


export const YourStakeForm : React.FC<YourStakeFormProps> = ({ selectedChain }) => {

  const [inputValue, setInputValue] = useState<number>();
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);
  const { data: hash, error, isPending, writeContract } = useWriteContract();

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
    
    console.log("address", selectedChain.stakingContractAddr)
    console.log("amount", BigInt(inputValue || 0))
    console.log("amount", `${lockedPeriod} months`)
    
    // writeContract({
    //   address: selectedChain.stakingContractAddr,
    //   abi: IdentityStakingAbi,
    //   functionName: "selfStake",
    //   args: [
    //     BigInt(inputValue),
    //     `${lockedPeriod} months`
    //   ], 
    // })
  };

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
      <Button className="w-full font-bold" onClick={() => handleStake()}>
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
