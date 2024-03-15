import React, { ComponentPropsWithRef, useEffect, useState } from "react";
import { PanelDiv } from "./PanelDiv";
import { useWalletStore } from "@/context/walletStore";
import { SelfRestakeModal } from "./SelfRestakeModal";
import { useDatastoreConnectionContext } from "@/context/datastoreConnectionContext";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, useConnectedChain } from "@/utils/helpers";
import { StakeData, useStakeHistoryQuery } from "@/utils/stakeHistory";

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

const UnstakeButton = ({ stake, address, unlocked }: { stake: StakeData; address: string; unlocked: boolean }) => {
  return (
    <button
      onClick={() => {
        // TODO: ....
        console.log("Unstake:", stake);
      }}
      disabled={!unlocked}
      className="disabled:text-color-5 disabled:cursor-not-allowed"
    >
      Unstake
    </button>
  );
};

const Tbody = () => {
  const connectedChain = useConnectedChain();
  const address = useWalletStore((state) => state.address);
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();

  const { isPending, isError, data, error } = useStakeHistoryQuery(address);
  const stakeForOthersHistory = data?.filter(
    (stake: StakeData) => stake.staker === address && stake.stakee !== address && stake.chain === connectedChain.id
  );

  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  let tbody_contents;
  if (!isPending && !isError && address && stakeForOthersHistory && stakeForOthersHistory.length > 0) {
    tbody_contents = (
      <>
        {stakeForOthersHistory.map((stake, index) => (
          <StakeLine key={index} stake={stake} address={address} />
        ))}
      </>
    );
  } else {
    const status = isError ? "Error loading stakes" : isPending ? "Loading..." : "No stakes found";
    tbody_contents = (
      <tr>
        <Td colSpan={5} className="text-center">
          {status}
        </Td>
      </tr>
    );
  }
  return <tbody>{tbody_contents}</tbody>;
};

const formatDate = (date: Date): string =>
  Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(date);

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
      <Td>
        <DisplayAddressOrENS user={stake.stakee} />
      </Td>
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
        <SelfRestakeButton lockSeconds={lockSeconds} amount={stake.amount} address={stake.stakee} />
        <br />
        <UnstakeButton stake={stake} address={address} unlocked={unlocked} />
      </Td>
    </tr>
  );
};

export const StakeForOthersHistory = ({}: any) => {
  return (
    <PanelDiv className="flex flex-col">
      <div className="m-8 text-color-6 font-bold text-xl">Stake for Others</div>
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
