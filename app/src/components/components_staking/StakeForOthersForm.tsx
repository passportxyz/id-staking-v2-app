import React, { ButtonHTMLAttributes, ChangeEvent, MouseEvent, useState, useMemo } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { switchChain } from "@wagmi/core";
import { ChainConfig, wagmiConfig } from "@/utils/chains";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWalletStore } from "@/context/walletStore";
import { ethers } from "ethers";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, useConnectedChain } from "@/utils/helpers";
import { YourStakeForm, FormButton } from "./YourStakeForm";

const StakeForOthersFormSection = () => {
  const [stakeeAddress, setStakeeAddress] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriodState] = useState<number>(3);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleStakeeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStakeeAddress(event.target.value);
  };

  const handleAddFixedValue = (value: string) => {
    setInputValue(value);
  };

  const handleLockedPeriod = (value: number) => {
    setLockedPeriodState(value);
  };

  return (
    <div className="w-full rounded-lg border border-foreground-4 bg-gradient-to-b from-background to-background-5">
      <div className="w-full rounded-t-lg bg-background-6 grid gap-4 grid-cols-[min-content_repeat(3,minmax(0,1fr))] lg:grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14">
        <div className="col-span-1 text-color-6 font-bold">Address</div>
        <input
          className="px-2 col-end-[-1] grow col-start-2 rounded-lg border border-foreground-4 bg-black text-s text-color-2"
          type="text"
          value={stakeeAddress}
          placeholder="anotherperson.eth"
          onChange={handleStakeeInputChange}
        />
      </div>
      <div className="w-full rounded-b-lg border-t border-foreground-4 bg-gradient-to-b from-background to-background-5  grid gap-4 grid-cols-[min-content_repeat(3,minmax(0,1fr))] lg:grid-cols-[min-content_repeat(6,minmax(0,1fr))] py-10 px-4 md:px-14">
        <div className="col-span-1 text-color-6 font-bold">Amount</div>
        <input
          className="px-2 col-end-[-1] grow col-start-2 rounded-lg border border-foreground-4 bg-black text-s text-color-2"
          type="number"
          value={inputValue}
          placeholder="Input a custom amount or choose one from below"
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
        <div className="mx-1 text-right font-bold text-color-6">
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
      </div>
    </div>
  );
};

export const StakeForOthersForm = () => {
  const [stakeSections, setStakeSections] = useState([<StakeForOthersFormSection key={0} />]);
  const { address } = useAccount();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const communityStakeModal = address ? (
    <CommunityStakeModal
      address={address}
      inputValue={"inputValue"}
      lockedPeriod={6}
      isOpen={modalIsOpen}
      onClose={() => setModalIsOpen(false)}
    />
  ) : null;

  const addStakeSelection = (event: MouseEvent<HTMLAnchorElement>) => {
    setStakeSections([...stakeSections, <StakeForOthersFormSection key={stakeSections.length} />]);
    event.preventDefault();
  };
  return (
    <div className="flex flex-col gap-4">
      {stakeSections}
      <div className="flex">
        <a href="#" className="flex-1 w-1/2 flex items-center" onClick={addStakeSelection}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15.5" stroke="#6CB6AD" />
            <path d="M16 8V24" stroke="#6CB6AD" />
            <path d="M24 16L8 16" stroke="#6CB6AD" />
          </svg>
          <span className="pl-4">Add another address</span>
        </a>
        <Button
          className="flex-1 w-1/2 font-bold"
          onClick={() => setModalIsOpen(true)}
          // disabled={valueToStake === 0n || !allowanceCheck.isSuccess}
        >
          Stake
        </Button>
      </div>

      {communityStakeModal}
    </div>
  );
};

const CommunityStakeModal = ({
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
  const [isLoading, setIsLoading] = useState(false);

  const connectedChain = useConnectedChain();

  return (
    <StakeModal
      title="Stake on yourself"
      buttonText="Stake"
      onButtonClick={async () => {
        setIsLoading(isLoading);
        return onClose();
      }}
      buttonLoading={false}
      isOpen={isOpen}
      onClose={() => {
        setIsLoading(isLoading);
        return onClose();
      }}
    >
      <div>
        <DataLine label="Stay tuned ..." value={"... comming soon"} />
      </div>
    </StakeModal>
  );

  const toast = useToast();
  const writeContract = useWriteContract();
  const walletChainId = useWalletStore((state) => state.chain);
  const valueToStake = ethers.parseUnits(inputValue || "0", 18);

  const setWalletChain = useWalletStore((state) => state.setChain);
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

    if (walletChainId !== connectedChain.id) {
      try {
        const switchResult = await switchChain(wagmiConfig, {
          chainId: connectedChain.id as (typeof wagmiConfig)["chains"][number]["id"],
        });
        console.log("geri switchResult", switchResult);
      } catch (error: any) {
        console.log("error switch chain", error);

        toast(makeErrorToastProps("Failed to switch chain:", error.message));
        return;
      }
    }

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
    <StakeModal
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
    </StakeModal>
  );
};
