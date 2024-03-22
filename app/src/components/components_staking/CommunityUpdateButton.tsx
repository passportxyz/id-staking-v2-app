import React, { useState, useCallback, useMemo, ChangeEvent, useEffect, ComponentPropsWithRef } from "react";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { useStakeHistoryQueryKey } from "@/utils/stakeHistory";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, formatSeconds, useConnectedChain } from "@/utils/helpers";
import { FormButton } from "./StakeFormInputSection";
import { useStakeTxHandler } from "@/hooks/hooks_staking/useStakeTxHandler";
import { StakeModal } from "./StakeModal";
import { parseEther } from "viem";

const useExtendCommunityStake = ({ address }: { address: string }) => {
  const chain = useConnectedChain();
  const queryKey = useStakeHistoryQueryKey(address);

  const { isLoading, writeContract, isConfirmed } = useStakeTxHandler({ queryKey, txTitle: "Update stake" });

  const extendCommunityStake = useCallback(
    async (communityAddress: string, months: number, amount: number) => {
      const valueToStake = parseEther(amount.toString());
      const lockSeconds = months * 30 * 24 * 60 * 60;
      return writeContract({
        address: chain.stakingContractAddr,
        abi: IdentityStakingAbi,
        functionName: "communityStake",
        args: [communityAddress, valueToStake, BigInt(lockSeconds)],
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

const Th = ({ className, children, ...props }: ComponentPropsWithRef<"th"> & { children: React.ReactNode }) => (
  <th className={`${className} p-2 pb-4 text-color-6`} {...props}>
    {children}
  </th>
);

const Td = ({ className, ...props }: ComponentPropsWithRef<"td">) => (
  <td className={`${className} p-2 py-4`} {...props} />
);

const StakeLine = ({ address, amount, lockedMonths }: { address: string, amount: number, lockedMonths:number }) => {

  const lockSeconds = lockedMonths * 30 * 24 * 60 * 60;

  return (
    <tr>
      <Td className="text-start">
        <DisplayAddressOrENS className="justify-start" user={address} />
      </Td>
      <Td className="text-end">{amount} GTC</Td>
      <Td className="text-end">
        <div>{lockedMonths} months</div>
      </Td>
    </tr>
  );
};

const CommunityUpdateModal = ({
  address,
  amount,
  lockedMonths,
  isOpen,
  onClose,
}: {
  address: string;
  amount: number;
  lockedMonths: number;
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
    <StakeModal
      title="Update stake on others"
      buttonText="Update Stake"
      onButtonClick={() => extendCommunityStake(address, amount, lockedMonths)}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
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
              <StakeLine key={0} address={address} amount={amount} lockedMonths={lockedMonths}/>
          </tbody>
        </table>
      </div>
    </StakeModal>
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
  const [updatedLockedMonths, setUpdatedLockedMonths] = useState<number>(formatSeconds(lockSeconds).month);
  
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

  const handleLockedPeriod = (month: number) => {
    setUpdatedLockedMonths(month);
  };
 
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);

  const onCloseUpdate = useCallback(() => {
    setUpdateModalIsOpen(false);
  }, []);

  return (
    <>
      <CommunityUpdateModal
        address={address}
        amount={updatedAmount}
        lockedMonths={updatedLockedMonths}
        isOpen={updateModalIsOpen}
        onClose={onCloseUpdate}
      />

    <StakeModal
      title="Update stake on others"
      buttonText="Preview"
      onButtonClick={() => {onClose(); setUpdateModalIsOpen(true)}}
      buttonLoading={isLoading}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <div className="row-span-1 text-color-2">Address</div>
        <div className="pl-2 border rounded opacity-50 bg-gradient-to-r from-foreground-2 to-foreground-4 text-color-4">
          <input
            className="w-full bg-gradient-to-r from-foreground-2 to-foreground-4 "
            type="text"
            value={address}
            disabled
          />
        </div>
        <br />
        <div className="row-span-1 text-color-2">Amount</div>
        <div className="border rounded text-color-2 bg-background">
          <input className="pl-2 w-full bg-background" type="text" value={updatedAmount} onChange={handleInputChange} />
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
          {[3, 6, 12].map((months) => (
            <FormButton
              key={months}
              onClick={() => handleLockedPeriod(months)}
              className="text-sm w-full"
              variant={months === updatedLockedMonths ? "active" : "inactive"}
            >
              {months} months
            </FormButton>
          ))}
        </div>
        <br />
      </div>
    </StakeModal>
    </>
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
