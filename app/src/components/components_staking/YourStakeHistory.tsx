import React, { ComponentPropsWithRef, useEffect, useMemo } from "react";
import { PanelDiv } from "./PanelDiv";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useWalletStore } from "@/context/walletStore";
import { SelfRestakeButton } from "./SelfRestakeButton";
import { useDatastoreConnectionContext } from "@/context/datastoreConnectionContext";
import { DisplayAddressOrENS, DisplayDuration, formatAmount } from "@/utils/helpers";

export type StakeData = {
  chain: string;
  staker: string;
  stakee: string;
  amount: string;
  unlock_time: string;
  lock_time: string;
};

export const useStakeHistoryQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["stakeHistory", address || ""], [address]);
};

const useStakeHistoryQuery = (address: string | undefined) => {
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();
  const queryKey = useStakeHistoryQueryKey(address);
  return useQuery({
    queryKey,
    queryFn: async (): Promise<StakeData[]> => {
      // TODO filter by chain here or somewhere else
      const address = queryKey[1];
      const response = await axios.get(`${process.env.NEXT_PUBLIC_CERAMIC_CACHE_ENDPOINT}/stake/gtc`, {
        headers: {
          Authorization: `Bearer ${dbAccessToken}`,
        },
      });
      return response.data;
    },
    enabled: Boolean(address) && dbAccessTokenStatus === "connected",
  });
};

const Th = ({ className, ...props }: ComponentPropsWithRef<"th">) => (
  <th className={`${className} p-2 pb-4 text-center`} {...props} />
);

const Td = ({ className, ...props }: ComponentPropsWithRef<"td">) => (
  <td className={`${className} p-2 py-4 text-center`} {...props} />
);

const UnstakeButton = ({ stake, address, unlocked }: { stake: StakeData; address: string; unlocked: boolean }) => {
  return (
    <button
      onClick={() => {
        // TODO
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
  const address = useWalletStore((state) => state.address);
  const { dbAccessToken, dbAccessTokenStatus } = useDatastoreConnectionContext();
  console.log("address", address, dbAccessToken, dbAccessTokenStatus);
  const { isPending, isError, data, error } = useStakeHistoryQuery(address);
  const yourStakeHistory = data?.filter((stake: StakeData) => stake.staker === address);

  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  let tbody_contents;
  if (!isPending && !isError && address && yourStakeHistory && yourStakeHistory.length > 0) {
    tbody_contents = (
      <>
        {yourStakeHistory.map((stake, index) => (
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
        <DisplayAddressOrENS user={stake.staker} />
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
        <SelfRestakeButton lockSeconds={lockSeconds} amount={stake.amount} address={address} />
        <br />
        <UnstakeButton stake={stake} address={address} unlocked={unlocked} />
      </Td>
    </tr>
  );
};

export const YourStakeHistory = ({}: any) => {
  return (
    <PanelDiv className="flex flex-col">
      <div className="m-8 text-color-6 font-bold text-xl">Your Stake History</div>
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
