import React, { useEffect, Fragment, useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { Dialog, Transition } from "@headlessui/react";
import { PanelDiv } from "./PanelDiv";
import { atom, useAtom } from "jotai";
import { DisplayAddressOrENS, DisplayDuration, formatAmount } from "@/utils/helpers";
import { Button } from "../Button";
import { LoadButton } from "../LoadButton";
import { BackdropEnabler, useBackdropControls } from "./Backdrop";

const DataLine = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-color-6 text-xl font-bold">{label}</span>
    <span>{value}</span>
  </div>
);

const useExtendSelfStake = ({ onConfirm, address }: { onConfirm: () => void; address: string }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = useStakeHistoryQueryKey(address);

  const { data: hash, error, isPending, isError, writeContract } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    (async () => {
      if (isConfirmed) {
        toast(makeSuccessToastProps("Success", "Restake transaction confirmed"));
        onConfirm();
        // delay for indexer
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await queryClient.invalidateQueries({ queryKey });
      }
    })();
  }, [isConfirmed, toast, queryClient, queryKey]);

  useEffect(() => {
    if (isError) {
      console.error("Restake failed:", error);
      toast(makeErrorToastProps("Failed", "Restake transaction failed"));
    }
  }, [error, toast]);

  useEffect(() => {
    if (isReceiptError) {
      console.error("Restake receipt failed:", receiptError);
      toast(makeErrorToastProps("Error", "Failed to confirm restake transaction"));
    }
  }, [isReceiptError, receiptError, toast]);

  const extendSelfStake = useCallback(
    async (lockSeconds: number) => {
      writeContract({
        address: "0xc80e07d81828960F613baa57288192E56d417dA5",
        abi: IdentityStakingAbi,
        functionName: "extendSelfStake",
        args: [BigInt(lockSeconds)],
      });
    },
    [writeContract]
  );

  const isLoading = isPending || isConfirming;

  return useMemo(
    () => ({
      isLoading,
      extendSelfStake,
    }),
    [isLoading, extendSelfStake]
  );
};

const SelfRestakeModal = ({
  address,
  amount,
  lockSeconds,
  isOpen,
  onClose,
}: {
  address: string;
  amount: string;
  lockSeconds: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isLoading, extendSelfStake } = useExtendSelfStake({ onConfirm: onClose, address });
  return (
    <Modal
      title="Restake on yourself"
      buttonText="Restake"
      onButtonClick={() => extendSelfStake(lockSeconds)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <DataLine label="Address" value={<DisplayAddressOrENS user={address} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${formatAmount(amount)} GTC`} />
        <hr className="border-foreground-4" />
        <DataLine label="Lockup" value={<DisplayDuration seconds={lockSeconds} />} />
      </div>
    </Modal>
  );
};

export default function Modal({
  title,
  buttonText,
  onButtonClick,
  buttonLoading,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  buttonText: string;
  onButtonClick: () => Promise<void>;
  buttonLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
                    <Dialog.Title className="text-3xl font-medium leading-6 text-color-6 my-12">{title}</Dialog.Title>
                    <div className="mt-2">{children}</div>

                    <div className="mt-4 flex flex-col items-center">
                      <LoadButton className="w-full" onClick={onButtonClick} isLoading={buttonLoading}>
                        {buttonText}
                      </LoadButton>
                      <Button
                        variant="custom"
                        className="mt-4 px-8"
                        onClick={() => {
                          onClose();
                        }}
                      >
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
}

// TODO get rid of hardcoded address and delay
export const SelfRestakeButton = ({
  lockSeconds,
  address,
  amount,
}: {
  lockSeconds: number;
  address: string;
  amount: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <>
      <SelfRestakeModal
        address={address}
        amount={amount}
        lockSeconds={lockSeconds}
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
      <button onClick={() => setModalIsOpen(true)}>Restake</button>
    </>
  );
};
