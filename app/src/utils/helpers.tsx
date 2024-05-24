// import React from "react";

// --- Types
import axios, { AxiosResponse } from "axios";
import { datadogRum } from "@datadog/browser-rum";
import { Cacao } from "@didtools/cacao";
import { DID } from "dids";
import { ethers } from "ethers";
import React, { useMemo } from "react";
import moment from "moment";
import { chainConfigs } from "./chains";
import { useChainId, useEnsName } from "wagmi";

export function generateUID(length: number) {
  return window
    .btoa(
      Array.from(window.crypto.getRandomValues(new Uint8Array(length * 2)))
        .map((b) => String.fromCharCode(b))
        .join("")
    )
    .replace(/[+/]/g, "")
    .substring(0, length);
}

export function checkShowOnboard(): boolean {
  const onboardTs = localStorage.getItem("onboardTS");
  if (!onboardTs) return true;
  // Get the current Unix timestamp in seconds.
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Calculate the timestamp for 3 months ago.
  // Note that this is an approximation because months have varying numbers of days.
  const threeMonthsInSeconds = 3 * 30 * 24 * 60 * 60;
  const threeMonthsAgoTimestamp = currentTimestamp - threeMonthsInSeconds;

  const onBoardOlderThanThreeMonths = parseInt(onboardTs) <= threeMonthsAgoTimestamp;

  // Check if the given timestamp is within the last 3 months.
  if (onBoardOlderThanThreeMonths) {
    localStorage.removeItem("onboardTS");
  }

  return onBoardOlderThanThreeMonths;
}

/**
 * Fetch data from a GraphQL endpoint
 *
 * @param endpoint - The graphql endpoint
 * @param query - The query to be executed
 * @param variables - The variables to be used in the query
 * @returns The result of the query
 */
export const graphql_fetch = async (endpoint: URL, query: string, variables: object = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const resp: AxiosResponse<any> = await axios.post(endpoint.toString(), JSON.stringify({ query, variables }), {
      headers,
    });
    return Promise.resolve(resp.data);
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data);
    } else if (error.request) {
      throw new Error(`No response received: ${error.request}`);
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Checks if the server is on maintenance mode.
 *
 * @returns True if the server is on maintenance mode, false otherwise.
 */
export const isServerOnMaintenance = () => {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON) {
    try {
      const maintenancePeriod = JSON.parse(process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON);
      const start = new Date(maintenancePeriod[0]);
      const end = new Date(maintenancePeriod[1]);
      const now = new Date();

      return now >= start && now <= end;
    } catch (error) {
      return false;
    }
  }

  return false;
};

export const createSignedPayload = async (did: DID, data: any) => {
  const { jws, cacaoBlock } = await did.createDagJWS(data);

  if (!cacaoBlock) {
    const msg = `Failed to create DagJWS for did: ${did.parent}`;
    datadogRum.addError(msg);
    throw msg;
  }

  // Get the JWS & serialize it (this is what we would send to the BE)
  const { link, payload, signatures } = jws;

  const cacao = await Cacao.fromBlockBytes(cacaoBlock);
  const issuer = cacao.p.iss;

  return {
    signatures: signatures,
    payload: payload,
    cid: Array.from(link ? link.bytes : []),
    cacao: Array.from(cacaoBlock ? cacaoBlock : []),
    issuer,
  };
};

export const formatAmount = (amount: string) => +parseFloat(ethers.formatEther(amount)).toFixed(2);

export const formatSeconds = (seconds: number) => {
  const duration = moment.duration(seconds, "seconds");
  const weeks = Math.floor(duration.asWeeks());

  const year = Math.floor(duration.asYears());
  duration.subtract(year, "years");
  const month = Math.floor(duration.asMonths());
  duration.subtract(month, "months");
  const day = Math.floor(duration.asDays());

  return {
    year,
    month,
    weeks,
    day,
  };
};

export const formatDate = (date: Date): string =>
  Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date);

const addPartToTimeDescriptions = (partName: string, part: number, short: string, long: string) => {
  let [tempShort, tempLong] = [short, long];
  if (part > 0) {
    const formattedPart = part > 1 ? `${part} ${partName}s` : `${part} ${partName}`;
    if (!tempShort) tempShort = formattedPart;
    if (tempLong) tempLong += ", ";
    tempLong += formattedPart;
  }
  return [tempShort, tempLong];
};

// Example
//   <DisplayDuration seconds={123456789} />
//     =>  <div title="3 years, 10 months, 2 days">3 years</div>
export const DisplayDuration = ({ seconds }: { seconds: number }) => {
  const [short, long] = useMemo(() => {
    let [tempShort, tempLong] = ["", ""];
    const duration = moment.duration(seconds, "seconds");

    // Do this first because the "subtract" method mutates the duration
    const weeks = Math.floor(duration.asWeeks());

    const year = Math.floor(duration.asYears());
    duration.subtract(year, "years");
    const month = Math.floor(duration.asMonths());
    duration.subtract(month, "months");
    const day = Math.floor(duration.asDays());

    Object.entries({ year, month, day }).forEach(([key, part]) => {
      [tempShort, tempLong] = addPartToTimeDescriptions(key, part, tempShort, tempLong);
    });

    if (!year && !month) {
      duration.subtract(day, "days");
      const hour = Math.floor(duration.asHours());
      [tempShort, tempLong] = addPartToTimeDescriptions("hour", hour, tempShort, tempLong);
      if (!day) {
        duration.subtract(hour, "hours");
        const minute = Math.floor(duration.asMinutes());
        [tempShort, tempLong] = addPartToTimeDescriptions("minute", minute, tempShort, tempLong);
      }
    }

    // Override short with weeks
    // where appropriate
    if (weeks > 2 && weeks < 13) {
      tempShort = `${weeks} weeks`;
    }

    return [tempShort, tempLong];
  }, [seconds]);

  return <div title={long}>{short}</div>;
};

export const useEnsDisplay = (address: string) => {
  const ensResult = useEnsName({ address: address as `0x${string}`, blockTag: "latest", chainId: 1 });

  return {
    address,
    ens: ensResult.isSuccess ? ensResult.data : undefined,
  };
};

// Provide custom max, or use defaults which scale with the screen size
export const DisplayAddressOrENS = ({ user, max, className }: { user: string; max?: number; className?: string }) => {
  const ensResult = useEnsDisplay(user);
  const maxLen = max || 12;

  if (ensResult.ens) {
    return <div>{ensResult.ens}</div>;
  }

  if (user.length <= maxLen) {
    return <div>{user}</div>;
  }

  if (max) {
    const middle = Math.floor(max / 2);
    return (
      <div title={user}>
        {user.slice(0, middle)}...{user.slice(-middle)}
      </div>
    );
  }

  return (
    <div title={user} className={` ${className} justify-center flex flex-nowrap `}>
      {user.slice(0, 4)}
      <span className="hidden md:flex">{user.slice(4, 7)}</span>...
      <span className="hidden md:flex">{user.slice(-5, -3)}</span>
      {user.slice(-3)}
    </div>
  );
};

export const useOutsideClick = <T,>(ref: React.Ref<T>, callback: () => void) => {
  const isOutsideClick = (ref: any, event: any) => {
    return ref.current && !ref.current.contains?.(event.target);
  };

  React.useEffect(() => {
    const handleClick = (event: any) => {
      if (isOutsideClick(ref, event)) {
        callback();
      }
    };

    document.addEventListener("click", handleClick);

    // Remove event listener on dismount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, callback]);
};

export const useConnectedChain = () => {
  const chainId = useChainId();
  const chain = chainConfigs.find((chain) => chain.id === chainId);
  if (!chain) {
    // Chain not supported modal or something ?
    // throw new Error("Chain not supported");
    return chainConfigs[0];
  }
  return chain;
};

const MINIMUM_LOCK_MILLISECONDS = 3 * 30 * 24 * 60 * 60 * 1000;

export const getUnlockTime = (lockTime: Date, lockMonths: number): Date => {
  const unlockTime = moment(lockTime).add(lockMonths, "months");
  if (unlockTime.valueOf() - lockTime.getTime() < MINIMUM_LOCK_MILLISECONDS) {
    // This is in case the lock is started on e.g. Nov 30th,
    // because moment will consider Feb 28th as "3 months" later
    return new Date(lockTime.valueOf() + MINIMUM_LOCK_MILLISECONDS);
  }
  return unlockTime.toDate();
};

export const getLockSeconds = (lockTime: Date, lockMonths: number): number => {
  const unlockTime = getUnlockTime(lockTime, lockMonths);
  return Math.floor((unlockTime.valueOf() - lockTime.getTime()) / 1000);
};
