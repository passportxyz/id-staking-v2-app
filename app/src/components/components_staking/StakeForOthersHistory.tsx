import React, { ComponentPropsWithRef, useContext, useEffect, useMemo } from "react";
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
// import { RestakeButton } from "./RestakeButton";
import { formatDate } from "./utils";
// import { useStakingHistoryStore, StakeData, StakingHistoryContext } from "@/utils/stakingHistory";

export const useStakeHistoryQueryKey = (address: string | undefined): string[] => {
  return useMemo(() => ["stakeHistory", address || ""], [address]);
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
  // const { isPending, isError, data, error } = useStakeHistoryQuery(address);
  // const yourStakeHistory = data?.filter((stake: StakeData) => stake.staker === address);
  const { isPending, isError, error } = { isPending: false, isError: false, error: null };
  // const { stakeData, pullData } = useContext(StakingHistoryContext).getState();

  // pullData();
  
  useEffect(() => {
    isError && console.error("Error getting StakeHistory:", error);
  }, [error, isError]);

  return <></>
  if (!isPending && !isError && address && stakeData && stakeData.length > 0) {
    return (
      <>
        {stakeData.map((stake, index) => (
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

// export const RestakeAllButton = ({ stake, address }: { stake: StakeData; address: string }) => {
//   const toast = useToast();
//   const queryClient = useQueryClient();
//   const queryKey = useStakeHistoryQueryKey(address);

//   const { data: hash, error, isPending, writeContract } = useWriteContract();
//   const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
//     hash,
//   });

//   useEffect(() => {
//     (async () => {
//       if (isConfirmed) {
//         toast(makeSuccessToastProps("Success", "Restake transaction confirmed"));
//         // delay for indexer
//         await new Promise((resolve) => setTimeout(resolve, 5000));
//         await queryClient.invalidateQueries({ queryKey });
//       }
//     })();
//   }, [isConfirmed, toast, queryClient, queryKey]);

//   useEffect(() => {
//     if (error) {
//       console.error("Restake failed:", error);
//       toast(makeErrorToastProps("Failed", "Restake transaction failed"));
//     }
//   }, [error, toast]);

//   return (
//     <button
//       onClick={() =>
//         writeContract({
//           address: "0xc80e07d81828960F613baa57288192E56d417dA5",
//           abi: IdentityStakingAbi,
//           functionName: "extendSelfStake",
//           args: [BigInt(stake.lock_duration)],
//         })
//       }
//       disabled={isPending || isConfirming}
//     >
//       Restake All
//     </button>
//   );
// };

const StakeLine = ({ stake, address }: { stake: StakeData; address: string }) => {
  const unlockTime = new Date(stake.unlock_time);
  const unlockTimeStr = formatDate(unlockTime);
  console.log("geri stake.unlock_time", stake.unlock_time);
  console.log("geri unlockTime", unlockTime);
  console.log("geri unlockTimeStr", unlockTimeStr);

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
