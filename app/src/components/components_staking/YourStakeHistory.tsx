import React, { ComponentPropsWithRef, useEffect, useMemo } from "react";
import { PanelDiv } from "./PanelDiv";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import axios from "axios";
import moment from "moment";
import { useWalletStore } from "@/context/walletStore";
import { makeErrorToastProps, makeSuccessToastProps } from "../DoneToastContent";
import { useToast } from "@chakra-ui/react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import IdentityStakingAbi from "../../abi/IdentityStaking.json";
import { RestakeButton } from "./RestakeButton";

export type StakeData = {
  chain: string;
  staker: string;
  stakee: string;
  amount: string;
  unlock_time: string;
  lock_duration: string;
};

export const useStakeHistoryQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["stakeHistory", address || ""], [address]);
};

const useStakeHistoryQuery = (address: string | undefined) => {
  const queryKey = useStakeHistoryQueryKey(address);
  return useQuery({
    queryKey,
    queryFn: getStakeHistory,
    enabled: Boolean(address),
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
  const { isPending, isError, data, error } = useStakeHistoryQuery(address);
  const yourStakeHistory = data?.filter((stake: StakeData) => stake.staker === address);

  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  if (!isPending && !isError && address && yourStakeHistory && yourStakeHistory.length > 0) {
    return (
      <>
        {yourStakeHistory.map((stake, index) => (
          <StakeLine key={index} stake={stake} address={address} />
        ))}
      </>
    );
  } else {
    const status = isError ? "Error loading stakes" : isPending ? "Loading..." : "No stakes found";
    return (
      <tr>
        <Td colSpan={5} className="text-center">
          {status}
        </Td>
      </tr>
    );
  }
};

const DisplayAddressOrENS = ({ user }: { user: string }) => (
  <div title={user}>{`${user.length > 12 ? `${user.slice(0, 7)}...${user.slice(-5)}` : user}`}</div>
);

const getStakeHistory = async ({ queryKey }: { queryKey: string[] }): Promise<StakeData[]> => {
  // TODO filter by chain
  const address = queryKey[1];
  const response = await axios.get(`${process.env.NEXT_PUBLIC_SCORER_ENDPOINT}/registry/gtc-stake/${address}`);
  return response.data;
};

const formatDate = (date: Date): string =>
  Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(date);

const DisplayDuration = ({ seconds }: { seconds: number }) => {
  const [short, long] = useMemo(() => {
    const duration = moment.duration(seconds, "seconds");

    const weeks = Math.floor(duration.asWeeks());

    const years = Math.floor(duration.asYears());
    const durationWithoutYears = duration.subtract(years, "years");
    const months = Math.floor(durationWithoutYears.asMonths());
    const durationWithoutMonths = durationWithoutYears.subtract(months, "months");
    const days = Math.floor(durationWithoutMonths.asDays());

    const parts = {
      year: years,
      month: months,
      day: days,
    };

    let short = "";
    let long = "";

    Object.entries(parts).forEach(([key, part]) => {
      if (part > 0) {
        const formattedPart = part > 1 ? `${part} ${key}s` : `${part} ${key}`;

        if (!short) short = formattedPart;

        if (long) long += ", ";
        long += formattedPart;
      }
    });

    // Override short with weeks
    // where appropriate
    if (weeks > 2 && weeks < 13) {
      short = `${weeks} weeks`;
    }

    return [short, long];
  }, [seconds]);

  return <div title={long}>{short}</div>;
};

const StakeLine = ({ stake, address }: { stake: StakeData; address: string }) => {
  const unlockTime = new Date(stake.unlock_time);
  const unlockTimeStr = formatDate(unlockTime);

  const lockTime = new Date(unlockTime.getTime() - 1000 * parseInt(stake.lock_duration));
  const lockTimeStr = formatDate(lockTime);

  const unlocked = unlockTime < new Date();

  const amount = +parseFloat(ethers.formatEther(stake.amount)).toFixed(2);

  return (
    <tr>
      <Td>
        <DisplayAddressOrENS user={stake.staker} />
      </Td>
      <Td>{amount} GTC</Td>
      <Td className="hidden lg:table-cell">{unlocked ? "Unlocked" : "Locked"}</Td>
      <Td className="hidden lg:table-cell">
        <DisplayDuration seconds={parseInt(stake.lock_duration)} />
      </Td>
      <Td className="">
        {lockTimeStr}
        <br />
        <span className={unlocked ? "text-color-2" : "text-focus"}>{unlockTimeStr}</span>
      </Td>
      <Td className="pr-8 py-1">
        <RestakeButton stake={stake} address={address} />
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
