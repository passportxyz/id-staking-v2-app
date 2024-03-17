import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useWriteContract, useReadContract } from "wagmi";
import { ChainConfig } from "@/utils/chains";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWalletStore } from "@/context/walletStore";
import { ethers } from "ethers";

interface YourStakeFormProps {
  selectedChain: ChainConfig;
}

export const YourStakeForm: React.FC<YourStakeFormProps> = ({ selectedChain }) => {
  const toast = useToast();
  const address = useWalletStore((state) => state.address);
  const walletChainId = useWalletStore((state) => state.chain);
  const setWalletChain = useWalletStore((state) => state.setChain);
  const [inputValue, setInputValue] = useState<string>();
  const valueToStake = ethers.parseUnits(inputValue || "0", 18);
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);
  const writeContract = useWriteContract();
  const allowanceCheck = useReadContract({
    abi: ERC20,
    address: selectedChain.gtcContractAddr,
    functionName: "allowance",
    chainId: selectedChain.id,
    args: [address, selectedChain.stakingContractAddr],
  });
  const isSpendingApproved = allowanceCheck.isSuccess && inputValue && (allowanceCheck.data as bigint) >= valueToStake;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddFixedValue = (value: string) => {
    setInputValue(value);
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value);
  };

  const stakeGtc = () => {
    const lockedPeriodSeconds: BigInt = BigInt(lockedPeriod) * 30n * 24n * 60n * 60n;
    writeContract.writeContract(
      {
        address: selectedChain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "selfStake",
        chainId: selectedChain.id,
        args: [valueToStake, lockedPeriodSeconds],
      },
      {
        onSuccess: () => {
          // on Success
          toast(makeSuccessToastProps("Success", "Stake transaction confirmed"));
        },
        onSettled: () => {
          // on Settled
        },
        onError: (error) => {
          console.log("staking error: ", error.name, error.message);
          toast(makeErrorToastProps(error.name, error.message));
          // on Error
        },
      }
    );
  };

  const handleStake = async () => {
    // https://docs.openzeppelin.com/contracts/4.x/erc20
    // https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20-approve-address-uint256-
    // https://sepolia-optimism.etherscan.io/address/0xc80e07d81828960F613baa57288192E56d417dA5#code

    if (walletChainId !== selectedChain.id) {
      await setWalletChain(selectedChain.id);
    }

    if (isSpendingApproved) {
      stakeGtc();
    } else {
      // Allow
      const approveSpending = writeContract.writeContract(
        {
          address: selectedChain.gtcContractAddr,
          abi: ERC20,
          functionName: "approve",
          chainId: selectedChain.id,
          args: [selectedChain.stakingContractAddr, valueToStake],
        },
        {
          onSuccess: () => {
            // on Success
            // spending is now approved, stake the GTC
            stakeGtc();
          },
          onError: (error) => {
            // on Error
            console.log("approving error: ", error.name, error.message);
            toast(makeErrorToastProps(error.name, error.message));
          },
        }
      );
    }
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
          {["5", "20", "125"].map((amount) => (
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
      <Button
        className="w-full font-bold"
        onClick={() => handleStake()}
        disabled={valueToStake === 0n || !allowanceCheck.isSuccess}
      >
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
