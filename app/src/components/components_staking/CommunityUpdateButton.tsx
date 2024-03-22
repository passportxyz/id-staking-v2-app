import React, { useState, useCallback, useMemo, ChangeEvent, useEffect } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { formatAmount, useConnectedChain } from "@/utils/helpers";
import { FormButton } from "./StakeFormInputSection";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { StakeModal } from "./StakeModal";

const useExtendCommunityStake = ({ address }: { address: string }) => {
  const chain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);

  const { isLoading, writeContract, isConfirmed } = useStakeTxHandler({ queryKey, txTitle: "Restake" });

  const extendCommunityStake = useCallback(
    async (communityAddress: string, lockSeconds: number) => {
      writeContract({
        address: chain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "extendCommunityStake",
        args: [communityAddress, BigInt(lockSeconds)],
      });
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
  const { isLoading, extendCommunityStake, isConfirmed } = useExtendCommunityStake({ address });
  const [updatedAmount, setUpdatedAmountValue] = useState<number>(formatAmount(amount));

  useEffect(() => {
    if (isConfirmed) {
      onClose();
    }
  }, [isConfirmed, onClose]);

  const handleAddValue = (added: number) => {
    setUpdatedAmountValue(updatedAmount + added);
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUpdatedAmountValue(Number(event.target.value));
  };

  return (
    <StakeModal
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
      </div>
    </StakeModal>
  );
};

export const CommunityUpdateButton = ({
  lockSeconds,
  address,
  amount,
}: {
  lockSeconds: number;
  address: string;
  amount: string;
}) => {
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setPreviewModalIsOpen(false);
  }, []);

  return (
    <>
      <CommunityUpdateModalPreview
        address={address}
        amount={amount}
        lockSeconds={lockSeconds}
        isOpen={previewModalIsOpen}
        onClose={onClose}
      />

      <button onClick={() => setPreviewModalIsOpen(true)} className="text-color-6 font-bold">
        Update stake
      </button>
    </>
  );
};
