import React, { useEffect, Fragment, useState, useCallback, useMemo, ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { Dialog, Transition } from "@headlessui/react";
import { PanelDiv } from "./PanelDiv";
import { DisplayAddressOrENS, DisplayDuration, formatAmount } from "@/utils/helpers";
import { Button } from "../Button";
import { LoadButton } from "../LoadButton";
import { BackdropEnabler } from "./Backdrop";
import { FormButton } from "./StakeFormInputSection";

const DataLine = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-color-6 text-xl font-bold">{label}</span>
    <span>{value}</span>
  </div>
);

const useExtendCommunityStake = ({ onConfirm, address }: { onConfirm: () => void; address: string }) => {
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
      console.error("Restake on others failed:", error);
      toast(makeErrorToastProps("Failed", "Restake transaction failed"));
    }
  }, [error, toast]);

  useEffect(() => {
    if (isReceiptError) {
      console.error("Restake receipt failed:", receiptError);
      toast(makeErrorToastProps("Error", "Failed to confirm restake transaction"));
    }
  }, [isReceiptError, receiptError, toast]);

  const extendCommunityStake = useCallback(
    async (comunityAddress: string, lockSeconds: number) => {
      writeContract({
        address: "0xc80e07d81828960F613baa57288192E56d417dA5",
        abi: IdentityStakingAbi,
        functionName: "extendCommunityStake",
        args: [comunityAddress, BigInt(lockSeconds)],
      });
    },
    [writeContract]
  );

  const isLoading = isPending || isConfirming;

  return useMemo(
    () => ({
      isLoading,
      extendCommunityStake,
    }),
    [isLoading, extendCommunityStake]
  );
};

const CommunityUpdateModalPreview = ({
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
  const { isLoading, extendCommunityStake } = useExtendCommunityStake({ onConfirm: onClose, address });
  const [updatedAmount, setUpdatedAmountValue] = useState<number>(formatAmount(amount));

  const handleAddValue = (added: number) => {
    setUpdatedAmountValue(updatedAmount + added);
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUpdatedAmountValue(Number(event.target.value));
  };

  return (
    <Modal
      title="Update stake on others"
      buttonText="Preview"
      onButtonClick={() => extendCommunityStake(address, lockSeconds)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <div className="row-span-1 text-color-2">Address</div>
        <div className="px-5 border rounded opacity-50 bg-gradient-to-r from-foreground-2 to-foreground-4 text-color-4">
          <input type="text" value={address} disabled />
        </div>
        <br />
        <div className="row-span-1 text-color-2">Amount</div>
        <div className="border rounded text-color-2 bg-background">
          <input className="pl-5 w-full bg-background" type="text" value={updatedAmount} onChange={handleInputChange} />
        </div>

        <br />
        <div className="gap-2 place-content-end hidden lg:flex col-span-2 text-color-4">
          {[5, 20, 125].map((amount) => (
            <FormButton key={amount} onClick={() => handleAddValue(amount)} className="w-12" variant="inactive">
              {`+${amount}`}
            </FormButton>
          ))}
        </div>

        <br />
        <div className="row-span-1 text-color-2">Lockup period</div>
        <div className="flex col-span-3 w-full col-end-[-1] text-sm gap-2 justify-self-end">
          {["3", "6", "12"].map((months) => (
            <FormButton
              key={months}
              // onClick={() => handleLockedPeriod(months)}
              className="text-sm w-full"
              variant={months === "..." ? "active" : "inactive"}
            >
              {months} months
            </FormButton>
          ))}
        </div>
        <br />

        {/* <DataLine label="Address" value={<DisplayAddressOrENS user={address} />} />
        <hr className="border-foreground-4" />
        <DataLine label="Amount" value={`${formatAmount(amount)} GTC`} />
        <hr className="border-foreground-4" />
        <DataLine label="Lockup" value={<DisplayDuration seconds={lockSeconds} />} /> */}
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

export const CommunityUpdateButton = ({
  lockSeconds,
  address,
  amount,
}: {
  lockSeconds: number;
  address: string;
  amount: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(false);

  return (
    <>
      <CommunityUpdateModalPreview
        address={address}
        amount={amount}
        lockSeconds={lockSeconds}
        isOpen={previewModalIsOpen}
        onClose={() => setPreviewModalIsOpen(false)}
      />

      <button onClick={() => setPreviewModalIsOpen(true)} className="text-color-6 font-bold">
        Update stake
      </button>
    </>
  );
};
