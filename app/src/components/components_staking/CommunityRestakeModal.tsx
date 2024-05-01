import React, { ComponentPropsWithRef, Fragment, useCallback, useEffect, useMemo } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, useConnectedChain } from "@/utils/helpers";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { Dialog, Transition } from "@headlessui/react";
import { BackdropEnabler } from "./Backdrop";
import { PanelDiv } from "./PanelDiv";
import { LoadButton } from "../LoadButton";
import { Button } from "@chakra-ui/react";
import { StakeData } from "@/utils/stakeHistory";

const useExtendCommunityStake = ({ address }: { address: string }) => {
  const chain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);
  const { isLoading, writeContract, isConfirmed } = useStakeTxHandler({ queryKey, txTitle: "Restake" });

  const extendCommunityStake = useCallback(
    async (stakedData: StakeData[]) => {
      if (stakedData.length == 1) {
        const unlockTime = new Date(stakedData[0].unlock_time);
        const lockTime = new Date(stakedData[0].lock_time);

        const lockSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

        return writeContract({
          address: chain.stakingContractAddr,
          abi: IdentityStakingAbi,
          functionName: "extendCommunityStake",
          args: [stakedData[0].stakee, BigInt(lockSeconds)],
        });
      } else {
        const stakeeList = stakedData.map((stake) => stake.stakee);
        const lockedList = stakedData.map((stake) => {
          const unlockTime = new Date(stake.unlock_time);
          const lockTime = new Date(stake.lock_time);

          const lockSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);
          return lockSeconds;
        });

        return writeContract({
          address: chain.stakingContractAddr,
          abi: IdentityStakingAbi,
          functionName: "extendMultipleCommunityStake",
          args: [stakeeList, lockedList],
        });
      }
    },
    [writeContract, chain.stakingContractAddr]
  );

  return useMemo(
    () => ({
      isLoading,
      extendCommunityStake,
      isConfirmed,
    }),
    [isLoading, extendCommunityStake, isConfirmed]
  );
};

const Th = ({ className, children, ...props }: ComponentPropsWithRef<"th"> & { children: React.ReactNode }) => (
  <th className={`${className} p-2 pb-4 text-color-6`} {...props}>
    {children}
  </th>
);

const Td = ({ className, ...props }: ComponentPropsWithRef<"td">) => (
  <td className={`${className} p-2 py-4`} {...props} />
);

const StakeLine = ({ stake }: { stake: StakeData }) => {
  const unlockTime = new Date(stake.unlock_time);
  const lockTime = new Date(stake.lock_time);

  const lockSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

  const amount = formatAmount(stake.amount);

  return (
    <tr>
      <Td className="text-start">
        <div className="flex justify-start">
          <DisplayAddressOrENS user={stake.stakee} />
        </div>
      </Td>
      <Td className="text-end">{amount} GTC</Td>
      <Td className="text-end">
        <DisplayDuration seconds={lockSeconds} />
      </Td>
    </tr>
  );
};

export const CommunityRestakeModal = ({
  address,
  stakedData,
  isOpen,
  onClose,
}: {
  address: string;
  stakedData: StakeData[];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isLoading, extendCommunityStake, isConfirmed } = useExtendCommunityStake({ address });

  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg overflow-hidden transition-all">
                  <BackdropEnabler />
                  <PanelDiv className="p-6 text-left text-color-1 align-middle">
                    <Dialog.Title className="text-3xl font-medium leading-6 text-color-6 my-12">
                      Restake on others
                    </Dialog.Title>
                    <div className="mt-2">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b pb-6 border-foreground-4">
                            <Th className="text-start">Address</Th>
                            <Th className="text-end">Amount</Th>
                            <Th className="text-end">Lockup</Th>
                          </tr>
                        </thead>

                        <tbody>
                          {stakedData.map((stake, index) => (
                            <StakeLine key={index} stake={stake} />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex flex-col items-center">
                      <LoadButton
                        className="w-full"
                        onClick={() => extendCommunityStake(stakedData)}
                        isLoading={isLoading}
                      >
                        Stake
                      </LoadButton>
                      <Button variant="custom" className="mt-4 px-8" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </PanelDiv>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
