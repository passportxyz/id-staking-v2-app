import React, { ComponentPropsWithRef, useEffect } from "react";
import { PanelDiv } from "./PanelDiv";
import { DisplayAddressOrENS, DisplayDuration, formatAmount, formatDate } from "@/utils/helpers";
import { StakeData, useStakeOnYouHistoryQuery } from "@/utils/stakeHistory";
import { useAccount } from "wagmi";

const Th = ({ className, children, ...props }: ComponentPropsWithRef<"th"> & { children: React.ReactNode }) => (
  <th className={`${className} p-2 pb-4 text-center`} {...props}>
    {children}
  </th>
);

const Td = ({ className, ...props }: ComponentPropsWithRef<"td">) => (
  <td className={`${className} p-2 py-4 text-center`} {...props} />
);

const StakeLine = ({ stake }: { stake: StakeData }) => {
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
        <DisplayAddressOrENS user={stake.staker} />
      </Td>
      <Td>{amount} GTC</Td>
      <Td className="hidden lg:table-cell">{unlocked ? "Unlocked" : "Locked"}</Td>
      <Td className="hidden md:table-cell">
        <DisplayDuration seconds={lockSeconds} />
      </Td>
      <Td>
        {lockTimeStr}
        <br />
        <span className={unlocked ? "text-color-2" : "text-focus"}>{unlockTimeStr}</span>
      </Td>
    </tr>
  );
};

const Tbody = () => {
  const { address } = useAccount();
  const { isPending, isError, data, error } = useStakeOnYouHistoryQuery(address);

  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  let tbody_contents;
  if (!isPending && !isError && address && data && data.length > 0) {
    tbody_contents = (
      <>
        {data.map((stake, index) => (
          <StakeLine key={index} stake={stake} />
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

export const TrustInYouHistory = () => {
  return (
    <PanelDiv className="flex flex-col">
      <table className="w-full mt-1">
        <thead>
          <tr className="border-b pb-6 border-foreground-4">
            <Th>Address</Th>
            <Th>Amount</Th>
            <Th className="hidden lg:table-cell">Status</Th>
            <Th className="hidden md:table-cell">Lockup</Th>
            <Th>Start/End</Th>
          </tr>
        </thead>
        <Tbody />
      </table>
    </PanelDiv>
  );
};
