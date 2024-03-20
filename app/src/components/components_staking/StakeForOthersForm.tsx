import React, { ButtonHTMLAttributes, ChangeEvent, MouseEvent, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/Button";
import { PanelDiv } from "./PanelDiv";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import ERC20 from "../../abi/ERC20.json";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { switchChain } from "@wagmi/core";
import { wagmiConfig } from "@/utils/chains";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWalletStore } from "@/context/walletStore";
import { ethers } from "ethers";
import { StakeModal, DataLine } from "./StakeModal";
import { DisplayAddressOrENS, useConnectedChain } from "@/utils/helpers";
import { FormButton, StakeFormInputSection } from "./StakeFormInputSection";
import { useStakeTxWithApprovalCheck } from "@/hooks/hooks_staking/useStakeTxWithApprovalCheck";

const StakeForOthersFormSection = () => {
  const [stakeeAddress, setStakeeAddress] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [lockedPeriod, setLockedPeriod] = useState<number>(3);

  const handleStakeeInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStakeeAddress(event.target.value);
  }, []);

  return (
    <div className="w-full rounded-lg bg-gradient-to-b from-background to-background-5">
      <div className="w-full rounded-t-lg border-r border-l border-t items-center border-foreground-4 bg-background-6 flex gap-4  py-6 px-4 md:px-14">
        <div className="text-color-6 shrink-0 text-right font-bold w-[72px]">Address</div>
        <input
          className="px-4 py-1 w-full rounded-lg border border-foreground-4 bg-background text-color-2"
          type="text"
          value={stakeeAddress}
          placeholder="anotherperson.eth"
          onChange={handleStakeeInputChange}
        />
      </div>
      <StakeFormInputSection
        className="rounded-t-none"
        amount={inputValue}
        lockedMonths={lockedPeriod}
        handleAmountChange={setInputValue}
        handleLockedMonthsChange={setLockedPeriod}
      />
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

const useCommunityStakeTx = ({
  staker,
  stakees,
  amounts,
  lockedPeriodsSeconds,
  onConfirm,
}: {
  staker: `0x${string}`;
  stakees: `0x${string}`[];
  amounts: bigint[];
  lockedPeriodsSeconds: bigint[];
  onConfirm: () => void;
}) => {
  const requiredApprovalAmount = useMemo(() => amounts.reduce((a, b) => a + b, 0n), [amounts]);

  const [functionName, functionArgs] = useMemo(() => {
    if (stakees.length === 1) {
      return ["communityStake", [stakees[0], amounts[0], lockedPeriodsSeconds[0]]];
    } else {
      return ["communityStakeBatch", [stakees, amounts, lockedPeriodsSeconds]];
    }
  }, [stakees, amounts, lockedPeriodsSeconds]);

  return useStakeTxWithApprovalCheck({
    address: staker,
    requiredApprovalAmount,
    functionName,
    functionArgs,
    onConfirm,
  });
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
