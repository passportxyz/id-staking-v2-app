import React, { ButtonHTMLAttributes, ChangeEvent, useState, useMemo } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useWriteContract, useReadContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/utils/chains";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWalletStore } from "@/context/walletStore";
import { ethers } from "ethers";
import Modal from "./StakeModal";
import { DisplayAddressOrENS, useConnectedChain } from "@/utils/helpers";

const DataLine = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-color-6 text-xl font-bold">{label}</span>
    <span>{value}</span>
  </div>
);

export const YourStakeForm: React.FC = ({}) => {
  const address = useWalletStore((state) => state.address);
  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
        lockedPeriod={lockedPeriod}
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <PanelDiv className="grid gap-4 grid-cols-[min-content_repeat(3,minmax(0,1fr))] lg:grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <input
          className="col-end-[-1] grow col-start-2 px-4 py-1 rounded-lg border border-foreground-4 bg-black text-s text-color-2"
          type="number"
          value={inputValue}
          placeholder={`Input a custom amount or choose one from below`}
          onChange={handleInputChange}
        />
        <div className="gap-2 col-start-2 hidden lg:flex col-span-2 text-color-4">
          {["5", "20", "125"].map((amount) => (
            <FormButton
              key={amount}
              onClick={() => handleAddFixedValue(amount)}
              className="w-12"
              variant={amount === inputValue ? "active" : "inactive"}
            >
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
        // disabled={valueToStake === 0n || !allowanceCheck.isSuccess}
      >
        Stake
      </Button>
    </div>
  );
};

const SelfStakeModal = ({
  address,
  inputValue,
  lockedPeriod,
  isOpen,
  onClose,
}: {
  address: `0x${string}`;
  inputValue: string;
  lockedPeriod: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const toast = useToast();
  const connectedChain = useConnectedChain();

  const [isLoading, setIsLoading] = useState(false);
  const writeContract = useWriteContract();
  const valueToStake = ethers.parseUnits(inputValue || "0", 18);

  const allowanceCheck = useReadContract({
    abi: ERC20,
    address: connectedChain.gtcContractAddr,
    functionName: "allowance",
    chainId: connectedChain.id,
    args: [address, connectedChain.stakingContractAddr],
  });
  const isSpendingApproved = allowanceCheck.isSuccess && inputValue && (allowanceCheck.data as bigint) >= valueToStake;

  const stakeGtc = () => {
    const lockedPeriodSeconds: BigInt = BigInt(lockedPeriod) * 30n * 24n * 60n * 60n;

    writeContract.writeContract(
      {
        address: connectedChain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "selfStake",
        chainId: connectedChain.id,
        args: [valueToStake, lockedPeriodSeconds],
      },
      {
        onSuccess: async (hash) => {
          // on Success

          const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: hash,
          });

          if (transactionReceipt.status === "success") {
            toast(makeSuccessToastProps("Success", "Stake transaction confirmed"));
            setIsLoading(false);
            onClose();
          } else {
            // toast error
            console.log(`Approving error. Transaction hash '${hash}'`);
            toast(
              makeErrorToastProps("Approving error", `Transaction details'${connectedChain.explorer + "/" + hash}'`)
            );
            setIsLoading(false);
          }
        },
        onError: (error) => {
          console.log("staking error: ", error.name, error.message);
          toast(makeErrorToastProps(error.name, error.message));
          // on Error
          setIsLoading(false);
          onClose();
        },
      }
    );
  };

  const handleStake = async () => {
    setIsLoading(true);

    if (isSpendingApproved) {
      stakeGtc();
    } else {
      // Allow
      const approveSpending = writeContract.writeContract(
        {
          address: connectedChain.gtcContractAddr,
          abi: ERC20,
          functionName: "approve",
          chainId: connectedChain.id,
          args: [connectedChain.stakingContractAddr, valueToStake],
        },
        {
          onSuccess: async (hash) => {
            // on Success
            // spending is now approved, stake the GTC
            const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
              hash: hash,
            });
            console.log("transactionReceipt.status - ", transactionReceipt.status);
            if (transactionReceipt.status === "success") {
              stakeGtc();
            } else {
              // toast error
              console.log(`Approving error. Transaction hash '${hash}'`);
              toast(
                makeErrorToastProps("Approving error", `Transaction details'${connectedChain.explorer + "/" + hash}'`)
              );
              setIsLoading(false);
            }
          },
          onError: (error) => {
            // on Error
            console.log("approving error: ", error.name, error.message);
            toast(makeErrorToastProps(error.name, error.message));
            setIsLoading(false);
          },
        }
      );
    }
  };

  // const lockedPeriodSeconds: BigInt = BigInt(lockedPeriod) * 30n * 24n * 60n * 60n;
  return (
    <Modal
      title="Stake on yourself"
      buttonText="Stake"
      onButtonClick={() => handleStake()}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={() => {
        setIsLoading(false);
        return onClose();
      }}
    >
      <div>
        <DataLine label="Address" value={<DisplayAddressOrENS user={address} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${inputValue} GTC`} />
        <hr className="border-foreground-4" />
        <DataLine label="Lockup" value={<div>{lockedPeriod} months</div>} />
      </div>
    </Modal>
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
