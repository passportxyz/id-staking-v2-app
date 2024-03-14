import React, { ChangeEvent, useState } from "react";
import { PanelDiv } from "./PanelDiv";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";

const address = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";

const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`${className} p-2 pb-4 text-center`}>{children}</th>
);

const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`${className} p-2 py-4 text-center`}>{children}</td>
);

const Tr = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={`${className}`}>{children}</tr>
);

const mockData = [
  {
    chain: "ETHEREUM",
    staker: address,
    stakee: address,
    amount: "100200000000001000000",
    unlock_time: "2025-09-01T00:00:00Z",
  },
  {
    chain: "ETHEREUM",
    staker: "short.ens",
    stakee: address,
    amount: "100000000000000000010",
    unlock_time: "2023-07-03T00:00:00Z",
  },
];

const formatUser = (user: string) => (user.length > 12 ? `${user.slice(0, 7)}...${user.slice(-5)}` : user);

const StakeLine = ({ stake }: { stake: any }) => {
  const unlockTime = new Date(stake.unlock_time);
  const unlockTimeStr = Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(
    new Date(stake.unlock_time)
  );
  const unlocked = unlockTime < new Date();

  const amount = +parseFloat(ethers.formatEther(stake.amount)).toFixed(2);

  const staker = formatUser(stake.staker);

  return (
    <Tr>
      <Td>{staker}</Td>
      <Td>{amount} GTC</Td>
      <Td className="hidden lg:table-cell">{unlocked ? "Unlocked" : "Locked"}</Td>
      <Td className={unlocked ? "text-color-2" : "text-focus"}>{unlockTimeStr}</Td>
      <Td className="pr-8 py-1">
        Restake
        <br />
        <span className={unlocked ? "text-inherit" : "text-color-5"}>Unstake</span>
      </Td>
    </Tr>
  );
};

export const YourStakeHistory = ({}: any) => {
  const queryClient = new QueryClient();

  return (
    <PanelDiv className="flex flex-col">
      <div className="m-8 text-color-6 font-bold text-xl">Your Stake History</div>
      <table className="w-full">
        <thead>
          <Tr className="border-b pb-6 border-foreground-4">
            <Th>Address</Th>
            <Th>Amount</Th>
            <Th className="hidden lg:table-cell">Status</Th>
            <Th>Unlock Date</Th>
            <Th> </Th>
          </Tr>
        </thead>
        <tbody>
          {mockData.map((stake, index) => (
            <StakeLine key={index} stake={stake} />
          ))}
        </tbody>
      </table>
    </PanelDiv>
  );
};
