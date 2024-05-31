import React, { ComponentPropsWithRef, useCallback, useEffect, useState } from "react";
import { PanelDiv } from "./PanelDiv";
import { useLegacySelfStake } from "@/hooks/legacyStaking";
import { SelfRestakeModal } from "./SelfRestakeModal";
import { useSelfStakeTxStore } from "@/hooks/hooks_staking/useSelfStakeTxStore";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, useConnectedChain, formatDate } from "@/utils/helpers";

import { StakeData, useYourStakeHistoryQuery } from "@/utils/stakeHistory";
import { SelfUnstakeModal, LegacySelfUnstakeModal } from "./SelfUnstakeModal";
import { useAccount, useChainId } from "wagmi";

const Th = ({ className, ...props }: ComponentPropsWithRef<"th">) => (
  <th className={`${className} p-2 pb-4 text-center`} {...props} />
);

const Td = ({ className, ...props }: ComponentPropsWithRef<"td">) => (
  <td className={`${className} p-2 py-4 text-center`} {...props} />
);

const SelfRestakeButton = ({
  lockSeconds,
  address,
  amount,
  disabled,
}: {
  lockSeconds: number;
  address: string;
  amount: string;
  disabled: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const onClose = useCallback(() => setModalIsOpen(false), []);

  return (
    <>
      <SelfRestakeModal
        address={address}
        amount={amount}
        lockSeconds={lockSeconds}
        isOpen={modalIsOpen}
        onClose={onClose}
      />
      <button
        onClick={() => setModalIsOpen(true)}
        disabled={disabled}
        className="disabled:text-color-5 disabled:cursor-not-allowed"
      >
        Restake
      </button>
    </>
  );
};

const SelfUnstakeButton = ({ address, unlocked, stake }: { address: string; unlocked: boolean; stake: StakeData }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const onClose = useCallback(() => setModalIsOpen(false), []);
  const modal = stake.legacy?.round?.round_id ? (
    <LegacySelfUnstakeModal
      address={address}
      amount={stake.amount}
      roundId={stake.legacy.round.round_id}
      isOpen={modalIsOpen}
      onClose={onClose}
    />
  ) : (
    <SelfUnstakeModal address={address} amount={stake.amount} isOpen={modalIsOpen} onClose={onClose} />
  );

  return (
    <>
      {modal}

      <button
        onClick={() => setModalIsOpen(true)}
        disabled={!unlocked}
        className="disabled:text-color-5 disabled:cursor-not-allowed"
      >
        Unstake
      </button>
    </>
  );
};

// Combines current and legacy self stakes
export const useSelfStakes = () => {
  const { address } = useAccount();
  const chain = useConnectedChain();

  const { isPending, isError, data, error, isLoading } = useYourStakeHistoryQuery(address);
  const {
    data: legacyData,
    isPending: legacyIsPending,
    isLoading: legacyIsLoading,
    isError: legacyIsError,
    error: legacyError,
  } = useLegacySelfStake(address, chain);

  const aggregatedData = (data || []).concat(legacyData);

  return {
    data: aggregatedData,
    isLoading: isLoading || legacyIsLoading,
    isPending: isPending || legacyIsPending,
    isError: isError || legacyIsError,
    error: error || legacyError,
  };
};

const Tbody = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { isPending, isError, data, error } = useSelfStakes();
  const { selfStakeTxInfoMap } = useSelfStakeTxStore();
  const stakeTxInfo = address ? selfStakeTxInfoMap[chainId]?.[address] : null;
  const blockNumber = stakeTxInfo?.blockNumber;

  // Verify that the expected block has been indexed already
  const hasBlockBeenIndexed = blockNumber ? data?.some((stake) => stake.last_updated_in_block >= blockNumber) : true;

  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  let tbody_contents;
  if (!isPending && !isError && address && data && data.length > 0 && hasBlockBeenIndexed) {
    tbody_contents = (
      <>
        {data.map((stake, index) => (
          <StakeLine key={index} stake={stake} address={address} />
        ))}
      </>
    );
  } else {
    const status = isError
      ? "Error loading stakes"
      : isPending || !hasBlockBeenIndexed
      ? "Loading..."
      : "No stakes found";
    tbody_contents = (
      <>
        <tr>
          <Td colSpan={6} className="text-center">
            {status}
          </Td>
        </tr>
      </>
    );
  }
  return <tbody>{tbody_contents}</tbody>;
};

const StakeLine = ({ stake, address }: { stake: StakeData; address: string }) => {
  const unlockTime = new Date(stake.unlock_time);
  const unlockTimeStr = formatDate(unlockTime);

  const lockTime = new Date(stake.lock_time);
  const lockTimeStr = formatDate(lockTime);

  const lockSeconds = Math.floor((unlockTime.getTime() - lockTime.getTime()) / 1000);

  const unlocked = unlockTime < new Date();

  const amount = formatAmount(stake.amount);

  return (
    <tr>
      <Td>{stake.legacy ? stake.legacy.round?.name : <DisplayAddressOrENS user={stake.staker} />}</Td>
      <Td>{amount} GTC</Td>
      <Td className="hidden lg:table-cell">{unlocked ? "Unlocked" : "Locked"}</Td>
      <Td className="hidden lg:table-cell">
        <DisplayDuration seconds={lockSeconds} />
      </Td>
      <Td className="">
        {lockTimeStr}
        <br />
        <span className={unlocked ? "text-color-2" : "text-focus"}>{unlockTimeStr}</span>
      </Td>
      <Td className="pr-8 py-1">
        <SelfRestakeButton
          lockSeconds={lockSeconds}
          amount={stake.amount}
          address={address}
          disabled={Boolean(stake.legacy)}
        />
        <br />
        <SelfUnstakeButton address={address} unlocked={unlocked} stake={stake} />
      </Td>
    </tr>
  );
};

export const YourStakeHistory = ({}: any) => {
  return (
    <PanelDiv className="flex flex-col">
      <div className="m-8 text-color-6 font-bold text-xl">Your Stake</div>
      <table className="w-full">
        <thead>
          <tr className="border-b pb-6 border-foreground-4">
            <Th>Address</Th>
            <Th>Amount</Th>
            <Th className="hidden lg:table-cell">Status</Th>
            <Th className="hidden lg:table-cell">Lockup</Th>
            <Th>Start/End</Th>
            <Th> </Th>
          </tr>
        </thead>
        <Tbody />
      </table>
    </PanelDiv>
  );
};
